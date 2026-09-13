// Lee la foto de una factura del supermercado y dice cuáles de las cosas que
// están pendientes en la lista ya se compraron.
//
// Un modelo con visión hace las dos cosas de una: leer el papel térmico y casar
// "H-MILCH 3,5% 1L" con "Leche". Separarlo en OCR + comparar texto no funciona:
// las facturas alemanas abrevian y truncan los nombres.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (cuerpo: unknown, status = 200) =>
  new Response(JSON.stringify(cuerpo), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

interface Pendiente {
  id: string;
  nombre: string;
  nombreDe?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { imagen, items } = (await req.json()) as {
      imagen?: string;
      items?: Pendiente[];
    };

    if (!imagen?.startsWith("data:image/")) {
      return json({ error: "Falta la foto de la factura." }, 400);
    }
    if (!items?.length) {
      return json({ comprados: [] });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return json({ error: "LOVABLE_API_KEY no está configurada." }, 500);
    }

    const catalogo = items
      .map((i) => `- id=${i.id} | ${i.nombre}${i.nombreDe ? ` (alemán: ${i.nombreDe})` : ""}`)
      .join("\n");

    const instrucciones = `Eres un lector de facturas de supermercados alemanes (REWE, Edeka, Aldi, Lidl, Netto, dm).

Te doy la foto de una factura y una lista de compras pendiente. Tu trabajo es decir cuáles de esos productos pendientes aparecen comprados en la factura.

Reglas:
- Las facturas abrevian y truncan en alemán: "H-MILCH 3,5%" es leche, "GURKE STK" es pepino, "HACKFL. GEM." es carne molida, "TOM. RISPE" son tomates. Usa ese criterio.
- Casa por lo que ES el producto, no por cómo se escribe. Una marca cuenta: "LANDLIEBE QUARK" es requesón.
- Ignora las líneas que no son productos: PFAND, LEERGUT, SUMME, TOTAL, MWST, EC-CARTE, KUNDENNR, descuentos, fechas y horas.
- Si una línea está borrosa o dudosa, inclúyela con confianza "baja" en vez de descartarla; la persona confirma al final.
- No inventes coincidencias. Si algo pendiente no está en la factura, simplemente no lo incluyas.
- Usa únicamente los id que te di, tal cual.

Responde SOLO con este JSON, sin markdown ni explicación:
{
  "tienda": "REWE" | null,
  "comprados": [
    { "id": "<el id que te di>", "linea": "<el texto tal como se lee en la factura>", "confianza": "alta" | "baja" }
  ]
}`;

    const respuesta = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: instrucciones },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Lista pendiente:\n${catalogo}\n\n¿Cuáles de estos aparecen en la factura?`,
              },
              { type: "image_url", image_url: { url: imagen } },
            ],
          },
        ],
      }),
    });

    if (!respuesta.ok) {
      if (respuesta.status === 429) {
        return json({ error: "Muchas peticiones seguidas. Intenta en un momento." }, 429);
      }
      if (respuesta.status === 402) {
        return json({ error: "Se acabaron los créditos de la IA." }, 402);
      }
      const detalle = await respuesta.text();
      console.error("gateway", respuesta.status, detalle);
      return json({ error: "El lector de facturas no respondió." }, 502);
    }

    const datos = await respuesta.json();
    const crudo: string = datos.choices?.[0]?.message?.content ?? "";
    const limpio = crudo.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    let leido: { tienda?: string | null; comprados?: unknown[] };
    try {
      leido = JSON.parse(limpio);
    } catch {
      console.error("respuesta no era JSON:", crudo.slice(0, 500));
      return json({ error: "No pude entender la factura. Intenta con otra foto." }, 502);
    }

    // El modelo puede devolver ids que no existen; nos quedamos solo con los reales.
    const validos = new Set(items.map((i) => i.id));
    const comprados = (leido.comprados ?? [])
      .filter((c): c is { id: string; linea?: string; confianza?: string } =>
        typeof c === "object" && c !== null && validos.has((c as { id?: string }).id ?? ""),
      )
      .map((c) => ({
        id: c.id,
        linea: typeof c.linea === "string" ? c.linea.slice(0, 80) : "",
        confianza: c.confianza === "baja" ? "baja" : "alta",
      }));

    return json({ tienda: leido.tienda ?? null, comprados });
  } catch (e) {
    console.error("leer-factura", e);
    return json({ error: e instanceof Error ? e.message : "Error desconocido" }, 500);
  }
});
