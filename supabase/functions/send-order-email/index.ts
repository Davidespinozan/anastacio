import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const FORMSPREE_ID = Deno.env.get("FORMSPREE_ID") || "xvzwzwey";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, content-type, apikey, x-client-info",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();

    // Supabase Database Webhook sends { type, table, record, schema, old_record }
    const record = body.record || body;

    const {
      order_type: orderType,
      customer_name: customerName,
      customer_phone: customerPhone,
      delivery_address: deliveryAddress,
      table_number: tableNumber,
      pickup_time: pickupTime,
      items,
      total,
      status,
      sucursal,
    } = record;

    const branchLabel: Record<string, string> = {
      gdl: "GUADALAJARA",
      cln: "CULIACÁN",
    };
    const branchName = branchLabel[sucursal] || (sucursal ? sucursal.toUpperCase() : "");

    // Build plain text version for Formspree
    const itemsList = items
      .map((i: { qty: number; name: string; price: number }) =>
        `${i.qty}x ${i.name} — $${(i.price * i.qty).toLocaleString("es-MX")}`
      )
      .join("\n");

    const modeLabel: Record<string, string> = {
      domicilio: "🛵 Domicilio",
      recoger: "🥡 Para recoger",
      mesa: "🍽 En mesa",
    };

    let message = `✅ PEDIDO PAGADO CON TARJETA\n\n`;
    if (branchName) message += `🏠 Sucursal: ${branchName}\n`;
    message += `📋 Tipo: ${modeLabel[orderType] || orderType}\n`;
    if (customerName) message += `👤 Cliente: ${customerName}\n`;
    if (customerPhone) message += `📞 Tel: ${customerPhone}\n`;
    if (deliveryAddress) message += `📍 Dirección: ${deliveryAddress}\n`;
    if (tableNumber) message += `🍽 Mesa: ${tableNumber}\n`;
    if (pickupTime) message += `⏱ Hora: ${pickupTime}\n`;
    if (status) message += `Estado: ${status}\n`;
    message += `\n🛒 Pedido:\n${itemsList}\n`;
    message += `\n💰 Total: $${total.toLocaleString("es-MX")} MXN ✅ PAGADO`;

    const subjectPrefix = branchName ? `[${branchName}] ` : "";

    const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        _subject: `${subjectPrefix}✅ Pedido Pagado — ${customerName || "Mesa " + tableNumber} — $${total} MXN`,
        pedido: message,
        sucursal: branchName,
        tipo: orderType,
        cliente: customerName || "",
        telefono: customerPhone || "",
        total: `$${total} MXN`,
      }),
    });

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
