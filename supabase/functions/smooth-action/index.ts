import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "https://esm.sh/stripe@14.14.0?target=denonext";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16",
});

// ═══ SERVER-SIDE PRICE MAP — GUADALAJARA ═══
const PRICE_MAP_GDL: Record<string, number> = {
  "Aguachile Mitotero": 230,
  "Tuna Macha": 160,
  "Aguachile de Picaña": 245,
  "Diva": 185,
  "Camarones Roca": 175,
  "Aguachile Mixto": 230,
  "Aguachile Tropical": 230,
  "Aguachile de Papada": 220,
  "Ceviche Mixto": 190,
  "Ceviche Speak": 210,
  "Vaquita": 150,
  "Volvancito": 150,
  "Don Arturo": 145,
  "Tío Juanito": 145,
  "Fresa": 155,
  "La de Ceviche": 160,
  "Chava": 160,
  "Tataki": 175,
  "Doña Julia": 175,
  "Las Costillonas": 890,
  "Las Costillonas ½": 490,
  "Papas Salseadas": 70,
  "Crujiente": 65,
  "Cacahuatadas": 60,
  "Orden de Papas": 80,
  "Mini Pizza": 120,
  "Alitas / Boneless": 190,
  "Hamburguesa": 140,
  "Quesito": 135,
  "Pollitos": 120,
  "Postre del Día": 120,
  "Mezcalita": 150,
  "Tacho Sour": 160,
  "Ballenita": 150,
  "Batanga Anastacio": 150,
  "Osito Rojo": 140,
  "Pica Flor": 195,
  "Macktail": 120,
  "Carajillo Difunto": 170,
  "Carajo": 170,
  "Pacífico Clara": 50,
  "Pacífico Suave": 50,
  "Corona": 45,
  "Modelo Especial": 55,
  "Modelo Negra": 55,
  "Caguama Familiar": 120,
  "Bichola Lata": 70,
  "Bichola Barril": 80,
  "Misil Bichola": 200,
  "Artesanal · IPA/Lager/Porter/Blonde": 90,
  "Limonada": 65,
  "Agua Natural": 45,
  "Topochico": 50,
  "Perrier": 75,
  "Refresco": 45,
  "Rusa": 65,
  "Vaso Escarchado": 40,
  "Vaso Michelado": 70,
  "Bacardi (copa)": 70,
  "Havana 7 años (copa)": 90,
  "Cascahuin (copa)": 110,
  "Herradura (copa)": 130,
  "Maestro Dobel (copa)": 150,
  "400 Conejos (copa)": 110,
  "Montelobos (copa)": 120,
  "Buchanans 12 (copa)": 200,
  "Etiqueta Negra (copa)": 220,
  "Macallan 12 (copa)": 340,
  "Bacardi (botella)": 700,
  "Havana 7 años (botella)": 960,
  "Cascahuin (botella)": 1100,
  "Herradura (botella)": 1400,
  "Maestro Dobel (botella)": 1700,
  "400 Conejos (botella)": 1100,
  "Montelobos (botella)": 1300,
  "Buchanans 12 (botella)": 2200,
  "Etiqueta Negra (botella)": 2600,
  "Macallan 12 (botella)": 3600,
};

// ═══ SERVER-SIDE PRICE MAP — CULIACÁN ═══
// Precios iguales a GDL. CLN solo agrega tragos renombrados (a precio del
// producto original GDL) y productos exclusivos que no existen en GDL.
const PRICE_MAP_CLN: Record<string, number> = {
  ...PRICE_MAP_GDL,
  // Tragos renombrados en CLN (el frontend manda el nombre nuevo, precio = original GDL)
  "Frutos Rojos Smash": 140,   // = Osito Rojo
  "Cantarito Anastacio": 150,   // = Ballenita
  // Productos exclusivos de CLN
  "Taco Zarandeado": 130,
  "Aguachile Tostadita": 150,
  "Sashimi Tuna": 170,
  "Doña Cuca": 140,
  "Coctel de Camarón": 180,
  "Carne Seca": 150,
};

const DELIVERY_FEE = 50;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { items, customer_name, customer_phone, order_type, delivery_address, table_number, pickup_time, order_id, branch } = await req.json();

    // ═══ VALIDATION ═══
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error("No items provided");
    }
    if (items.length > 50) {
      throw new Error("Too many items");
    }
    if (!["domicilio", "recoger", "mesa"].includes(order_type)) {
      throw new Error("Invalid order type");
    }

    // ═══ SUCURSAL ÚNICA: CULIACÁN (Guadalajara cerró) ═══
    // Cualquier valor entrante (incl. cachés viejos con "gdl") se normaliza a CLN.
    const branchSlug = "cln";
    const PRICE_MAP = PRICE_MAP_CLN;

    // ═══ BUILD LINE ITEMS WITH SERVER PRICES ═══
    const line_items = [];

    for (const item of items) {
      if (!item.name || typeof item.name !== "string") throw new Error("Invalid item name");
      if (!item.qty || item.qty <= 0 || item.qty > 100) throw new Error("Invalid qty: " + item.name);

      // Skip delivery fee from client — server handles it
      if (item.name === "Envío a domicilio") continue;

      // Look up REAL price from server map (branch-aware)
      const serverPrice = PRICE_MAP[item.name];
      if (serverPrice === undefined) {
        throw new Error("Unknown item: " + item.name);
      }

      line_items.push({
        price_data: {
          currency: "mxn",
          product_data: { name: item.name.substring(0, 100) },
          unit_amount: Math.round(serverPrice * 100),
        },
        quantity: item.qty,
      });
    }

    // Server decides delivery fee
    if (order_type === "domicilio") {
      line_items.push({
        price_data: {
          currency: "mxn",
          product_data: { name: "Envío a domicilio" },
          unit_amount: DELIVERY_FEE * 100,
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: `https://anastaciomarisqueria.com/${branchSlug}?payment=success&order_id=${order_id || ""}`,
      cancel_url: `https://anastaciomarisqueria.com/${branchSlug}?payment=cancelled`,
      metadata: {
        customer_name: (customer_name || "").substring(0, 100),
        customer_phone: (customer_phone || "").substring(0, 20),
        order_type,
        delivery_address: (delivery_address || "").substring(0, 200),
        table_number: (table_number || "").substring(0, 10),
        pickup_time: (pickup_time || "").substring(0, 10),
        order_id: (order_id || "").substring(0, 50),
        sucursal: branchSlug,
      },
    });

    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
