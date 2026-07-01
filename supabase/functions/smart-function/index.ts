import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "https://esm.sh/stripe@14.14.0?target=denonext";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16",
});

const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const FORMSPREE_ID = Deno.env.get("FORMSPREE_ID") || "xvzwzwey";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ═══ NOTIFICAR PEDIDO A FORMSPREE (correo al restaurante) ═══
async function sendToFormspree(order: any, items: any[]): Promise<void> {
  const branchLabel: Record<string, string> = {
    gdl: "GUADALAJARA",
    cln: "CULIACÁN",
  };
  const branchName = branchLabel[order.sucursal] ||
    (order.sucursal ? String(order.sucursal).toUpperCase() : "");

  const modeLabel: Record<string, string> = {
    domicilio: "🛵 Domicilio",
    recoger: "🥡 Para recoger",
    mesa: "🍽 En mesa",
  };

  const itemsList = items
    .map((i) => `${i.qty}x ${i.name} — $${(i.price * i.qty).toLocaleString("es-MX")}`)
    .join("\n");

  let message = `✅ PEDIDO PAGADO CON TARJETA\n\n`;
  if (branchName) message += `🏠 Sucursal: ${branchName}\n`;
  message += `📋 Tipo: ${modeLabel[order.order_type] || order.order_type}\n`;
  if (order.customer_name) message += `👤 Cliente: ${order.customer_name}\n`;
  if (order.customer_phone) message += `📞 Tel: ${order.customer_phone}\n`;
  if (order.delivery_address) message += `📍 Dirección: ${order.delivery_address}\n`;
  if (order.table_number) message += `🍽 Mesa: ${order.table_number}\n`;
  if (order.pickup_time) message += `⏱ Hora: ${order.pickup_time}\n`;
  message += `\n🛒 Pedido:\n${itemsList}\n`;
  message += `\n💰 Total: $${order.total.toLocaleString("es-MX")} MXN ✅ PAGADO`;

  const subjectPrefix = branchName ? `[${branchName}] ` : "";
  const who = order.customer_name || (order.table_number ? "Mesa " + order.table_number : "Cliente");

  const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      _subject: `${subjectPrefix}✅ Pedido Pagado — ${who} — $${order.total} MXN`,
      pedido: message,
      sucursal: branchName,
      tipo: order.order_type,
      cliente: order.customer_name || "",
      telefono: order.customer_phone || "",
      total: `$${order.total} MXN`,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Formspree HTTP ${res.status}: ${text}`);
  }
}

Deno.serve(async (req: Request) => {
  // Solo aceptar POST de Stripe
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  // ═══ 1. VERIFICAR FIRMA DE STRIPE (rechaza POSTs falsos) ═══
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    console.error("❌ Webhook llegó sin firma");
    return new Response("Missing signature", { status: 400 });
  }

  const body = await req.text();
  let event: Stripe.Event;

  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Firma inválida:", err.message);
    return new Response(`Webhook signature failed: ${err.message}`, { status: 400 });
  }

  console.log(`✅ Evento recibido: ${event.type} (id: ${event.id})`);

  // ═══ 2. SOLO PROCESAR checkout.session.completed ═══
  if (event.type !== "checkout.session.completed") {
    console.log(`ℹ️ Evento ignorado: ${event.type}`);
    return new Response(JSON.stringify({ received: true, ignored: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const metadata = session.metadata || {};

  console.log(`💳 Procesando checkout.session.completed: ${session.id}`);

  // ═══ 3. IDEMPOTENCY — evitar doble INSERT si Stripe reintenta ═══
  const { data: existing, error: checkError } = await supabase
    .from("orders")
    .select("id")
    .eq("stripe_session_id", session.id)
    .maybeSingle();

  if (checkError) {
    console.error("❌ Error checking existing order:", checkError.message);
    return new Response("DB error", { status: 500 });
  }

  if (existing) {
    console.log(`ℹ️ Orden ya existe (${existing.id}), ignorando duplicado`);
    return new Response(JSON.stringify({ received: true, duplicate: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  // ═══ 4. OBTENER PRODUCTOS Y TOTAL DIRECTO DE STRIPE ═══
  // Fuente de verdad: los line items de la sesión (sin depender de metadata,
  // que tiene límite de 500 chars por campo y no incluía items/total).
  let items: any[] = [];
  try {
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
      limit: 100,
    });
    items = lineItems.data.map((li) => ({
      name: li.description || "",
      qty: li.quantity || 1,
      price: li.price?.unit_amount ? li.price.unit_amount / 100 : 0,
    }));
  } catch (err) {
    console.error("❌ Error obteniendo line items:", err.message);
    return new Response(`Stripe line items error: ${err.message}`, { status: 500 });
  }

  if (items.length === 0) {
    console.error("❌ No line items en la sesión");
    return new Response("No items", { status: 400 });
  }

  const totalNumber = (session.amount_total ?? 0) / 100;
  if (totalNumber <= 0) {
    console.error("❌ Total inválido:", session.amount_total);
    return new Response("Invalid total", { status: 400 });
  }

  // ═══ 5. INSERT A LA TABLA orders ═══
  const orderPayload = {
    order_type: metadata.order_type || "recoger",
    customer_name: metadata.customer_name || null,
    customer_phone: metadata.customer_phone || null,
    delivery_address: metadata.delivery_address || null,
    table_number: metadata.table_number || null,
    pickup_time: metadata.pickup_time || null,
    items: items, // jsonb
    total: totalNumber,
    status: "pending",
    sucursal: metadata.sucursal || null,
    stripe_session_id: session.id, // para idempotency
  };

  const { data: inserted, error: insertError } = await supabase
    .from("orders")
    .insert(orderPayload)
    .select("id")
    .single();

  if (insertError) {
    console.error("❌ Error INSERT orders:", insertError.message);
    return new Response(`DB insert error: ${insertError.message}`, { status: 500 });
  }

  console.log(`✅ Orden creada: ${inserted.id}`);

  // ═══ 6. NOTIFICAR A FORMSPREE (correo al restaurante) ═══
  // No bloquea el webhook: si Formspree falla, la orden YA quedó guardada.
  try {
    await sendToFormspree(orderPayload, items);
    console.log(`✉️ Formspree notificado para orden ${inserted.id}`);
  } catch (err) {
    console.error(`⚠️ Formspree falló (orden ${inserted.id} ya guardada):`, err.message);
  }

  return new Response(
    JSON.stringify({ received: true, order_id: inserted.id }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
});
