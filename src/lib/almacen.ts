import { supabase } from "./supabase";
import type { Item, Producto } from "./tipos";

export interface Almacen {
  /** true cuando los dos teléfonos ven la misma lista. */
  readonly compartido: boolean;
  suscribir(cb: (estado: { items: Item[]; propios: Producto[] }) => void): () => void;
  agregar(producto: Producto, nota: string | null, quien: string | null): Promise<void>;
  editarNota(id: string, nota: string | null): Promise<void>;
  quitar(id: string): Promise<void>;
  vaciar(): Promise<void>;
  agregarPropio(producto: Producto): Promise<void>;
}

const nuevoId = () => crypto.randomUUID();

// ---------------------------------------------------------------- local

const CLAVE_ITEMS = "mercar.items";
const CLAVE_PROPIOS = "mercar.propios";

function leer<T>(clave: string): T[] {
  try {
    const crudo = localStorage.getItem(clave);
    return crudo ? (JSON.parse(crudo) as T[]) : [];
  } catch {
    return [];
  }
}

function almacenLocal(): Almacen {
  const oyentes = new Set<() => void>();

  // `storage` avisa a las otras pestañas; el aviso local lo damos a mano.
  const avisar = () => oyentes.forEach((o) => o());
  window.addEventListener("storage", avisar);

  const escribir = <T,>(clave: string, valor: T[]) => {
    localStorage.setItem(clave, JSON.stringify(valor));
    avisar();
  };

  return {
    compartido: false,
    suscribir(cb) {
      const emitir = () =>
        cb({ items: leer<Item>(CLAVE_ITEMS), propios: leer<Producto>(CLAVE_PROPIOS) });
      oyentes.add(emitir);
      emitir();
      return () => oyentes.delete(emitir);
    },
    async agregar(producto, nota, quien) {
      const item: Item = {
        ...producto,
        id: nuevoId(),
        nota,
        agregadoPor: quien,
        creadoEn: new Date().toISOString(),
      };
      escribir(CLAVE_ITEMS, [...leer<Item>(CLAVE_ITEMS), item]);
    },
    async editarNota(id, nota) {
      escribir(
        CLAVE_ITEMS,
        leer<Item>(CLAVE_ITEMS).map((i) => (i.id === id ? { ...i, nota } : i)),
      );
    },
    async quitar(id) {
      escribir(
        CLAVE_ITEMS,
        leer<Item>(CLAVE_ITEMS).filter((i) => i.id !== id),
      );
    },
    async vaciar() {
      escribir<Item>(CLAVE_ITEMS, []);
    },
    async agregarPropio(producto) {
      escribir(CLAVE_PROPIOS, [...leer<Producto>(CLAVE_PROPIOS), producto]);
    },
  };
}

// ------------------------------------------------------------- supabase

interface FilaItem {
  id: string;
  nombre: string;
  nombre_de: string | null;
  emoji: string | null;
  categoria: Item["categoria"];
  nota: string | null;
  agregado_por: string | null;
  creado_en: string;
}

const aItem = (f: FilaItem): Item => ({
  id: f.id,
  nombre: f.nombre,
  nombreDe: f.nombre_de ?? "",
  emoji: f.emoji ?? "🛒",
  categoria: f.categoria,
  nota: f.nota,
  agregadoPor: f.agregado_por,
  creadoEn: f.creado_en,
});

function almacenSupabase(casa: string): Almacen {
  const sb = supabase!;

  return {
    compartido: true,
    suscribir(cb) {
      let vivo = true;

      const cargar = async () => {
        const [items, propios] = await Promise.all([
          sb.from("mercar_items").select("*").eq("casa", casa).order("creado_en"),
          sb.from("mercar_propios").select("*").eq("casa", casa).order("creado_en"),
        ]);
        if (!vivo) return;
        cb({
          items: (items.data ?? []).map((f) => aItem(f as FilaItem)),
          propios: (propios.data ?? []).map((f) => {
            const p = f as FilaItem;
            return {
              nombre: p.nombre,
              nombreDe: p.nombre_de ?? "",
              emoji: p.emoji ?? "🛒",
              categoria: p.categoria,
            };
          }),
        });
      };

      void cargar();

      // Cualquier cambio en la casa recarga: la lista es de decenas de filas,
      // no vale la pena aplicar los deltas a mano.
      const canal = sb
        .channel(`mercar:${casa}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "mercar_items", filter: `casa=eq.${casa}` },
          () => void cargar(),
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "mercar_propios", filter: `casa=eq.${casa}` },
          () => void cargar(),
        )
        .subscribe();

      // Al volver a la app después de un rato el socket puede venir frío.
      const alVolver = () => {
        if (document.visibilityState === "visible") void cargar();
      };
      document.addEventListener("visibilitychange", alVolver);

      return () => {
        vivo = false;
        document.removeEventListener("visibilitychange", alVolver);
        void sb.removeChannel(canal);
      };
    },
    async agregar(producto, nota, quien) {
      await sb.from("mercar_items").insert({
        casa,
        nombre: producto.nombre,
        nombre_de: producto.nombreDe,
        emoji: producto.emoji,
        categoria: producto.categoria,
        nota,
        agregado_por: quien,
      });
    },
    async editarNota(id, nota) {
      await sb.from("mercar_items").update({ nota }).eq("id", id);
    },
    async quitar(id) {
      await sb.from("mercar_items").delete().eq("id", id);
    },
    async vaciar() {
      await sb.from("mercar_items").delete().eq("casa", casa);
    },
    async agregarPropio(producto) {
      await sb.from("mercar_propios").insert({
        casa,
        nombre: producto.nombre,
        nombre_de: producto.nombreDe,
        emoji: producto.emoji,
        categoria: producto.categoria,
      });
    },
  };
}

export function crearAlmacen(casa: string): Almacen {
  return supabase ? almacenSupabase(casa) : almacenLocal();
}
