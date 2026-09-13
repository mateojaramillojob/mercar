import { supabase } from "./supabase";
import type { Item } from "./tipos";

export interface Coincidencia {
  id: string;
  /** La línea tal como se lee en el papel, para poder verificarla de un vistazo. */
  linea: string;
  confianza: "alta" | "baja";
}

export interface LecturaFactura {
  tienda: string | null;
  comprados: Coincidencia[];
}

/**
 * Las fotos del celular llegan de 3-4 MB y no hace falta tanto para leer un
 * papel térmico. Bajarlas antes de subirlas ahorra datos y tiempo de espera.
 */
export async function comprimir(archivo: File, maxLado = 1800, calidad = 0.72): Promise<string> {
  const bitmap = await createImageBitmap(archivo, { imageOrientation: "from-image" });
  const escala = Math.min(1, maxLado / Math.max(bitmap.width, bitmap.height));
  const ancho = Math.round(bitmap.width * escala);
  const alto = Math.round(bitmap.height * escala);

  const lienzo = document.createElement("canvas");
  lienzo.width = ancho;
  lienzo.height = alto;
  const ctx = lienzo.getContext("2d");
  if (!ctx) throw new Error("No pude procesar la foto.");
  ctx.drawImage(bitmap, 0, 0, ancho, alto);
  bitmap.close();

  return lienzo.toDataURL("image/jpeg", calidad);
}

export async function leerFactura(imagen: string, items: Item[]): Promise<LecturaFactura> {
  if (!supabase) {
    throw new Error("Falta conectar Supabase para poder leer facturas.");
  }

  const { data, error } = await supabase.functions.invoke<LecturaFactura & { error?: string }>(
    "leer-factura",
    {
      body: {
        imagen,
        items: items.map((i) => ({ id: i.id, nombre: i.nombre, nombreDe: i.nombreDe })),
      },
    },
  );

  // `invoke` mete el cuerpo del error dentro de un FunctionsHttpError, así que
  // el mensaje bueno hay que sacarlo de ahí y no del `error.message` genérico.
  if (error) {
    const respuesta = (error as { context?: Response }).context;
    if (respuesta && typeof respuesta.json === "function") {
      try {
        const cuerpo = await respuesta.json();
        if (cuerpo?.error) throw new Error(cuerpo.error);
      } catch (e) {
        if (e instanceof Error && e.message) throw e;
      }
    }
    throw new Error("No pude leer la factura. Revisa la conexión e intenta otra vez.");
  }

  if (!data || data.error) throw new Error(data?.error ?? "Respuesta vacía del lector.");

  return { tienda: data.tienda ?? null, comprados: data.comprados ?? [] };
}
