import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ListChecks, Plus, Settings } from "lucide-react";
import Ajustes from "./componentes/Ajustes";
import Aviso, { type Mensaje } from "./componentes/Aviso";
import Catalogo from "./componentes/Catalogo";
import HojaNota from "./componentes/HojaNota";
import HojaProductoNuevo from "./componentes/HojaProductoNuevo";
import Lista from "./componentes/Lista";
import { crearAlmacen } from "./lib/almacen";
import { CATALOGO } from "./lib/catalogo";
import { codigoCasa, leerNombre } from "./lib/casa";
import type { Item, Producto } from "./lib/tipos";

type Vista = "lista" | "catalogo";

/** Lo que la hoja de nota está editando: un item ya en la lista, o uno por agregar. */
type Edicion =
  | { tipo: "item"; item: Item }
  | { tipo: "nuevo"; producto: Producto }
  | null;

export default function App() {
  const casa = useMemo(codigoCasa, []);
  const almacen = useMemo(() => crearAlmacen(casa), [casa]);

  const [items, setItems] = useState<Item[]>([]);
  const [propios, setPropios] = useState<Producto[]>([]);
  const [vista, setVista] = useState<Vista>("lista");
  const [nombre, setNombre] = useState(leerNombre);
  const [edicion, setEdicion] = useState<Edicion>(null);
  const [productoNuevo, setProductoNuevo] = useState<string | null>(null);
  const [ajustes, setAjustes] = useState(false);
  const [mensaje, setMensaje] = useState<Mensaje | null>(null);

  const siguienteAviso = useRef(0);

  useEffect(
    () =>
      almacen.suscribir(({ items, propios }) => {
        setItems(items);
        setPropios(propios);
      }),
    [almacen],
  );

  const avisar = useCallback((texto: string, deshacer?: () => void) => {
    setMensaje({ id: ++siguienteAviso.current, texto, deshacer });
  }, []);

  const productos = useMemo(() => {
    const vistos = new Set<string>();
    return [...propios, ...CATALOGO].filter((p) => {
      const clave = `${p.categoria}|${p.nombre.toLowerCase()}`;
      if (vistos.has(clave)) return false;
      vistos.add(clave);
      return true;
    });
  }, [propios]);

  const enLista = useMemo(() => new Set(items.map((i) => i.nombre)), [items]);

  const agregar = useCallback(
    async (producto: Producto, nota: string | null = null) => {
      await almacen.agregar(producto, nota, nombre.trim() || null);
      navigator.vibrate?.(8);
      avisar(`${producto.emoji} ${producto.nombre} a la lista`);
    },
    [almacen, nombre, avisar],
  );

  const comprar = useCallback(
    async (item: Item) => {
      await almacen.quitar(item.id);
      navigator.vibrate?.(8);
      avisar(`${item.emoji} ${item.nombre} listo`, () =>
        almacen.agregar(item, item.nota, item.agregadoPor),
      );
    },
    [almacen, avisar],
  );

  const guardarNota = useCallback(
    async (nota: string) => {
      if (!edicion) return;
      if (edicion.tipo === "item") {
        await almacen.editarNota(edicion.item.id, nota || null);
      } else {
        await agregar(edicion.producto, nota || null);
      }
      setEdicion(null);
    },
    [edicion, almacen, agregar],
  );

  const crearProducto = useCallback(
    async (producto: Producto) => {
      await almacen.agregarPropio(producto);
      await agregar(producto);
      setProductoNuevo(null);
      setVista("lista");
    },
    [almacen, agregar],
  );

  const vaciar = useCallback(async () => {
    const anteriores = items;
    await almacen.vaciar();
    setAjustes(false);
    avisar("Lista vaciada", () => {
      anteriores.forEach((i) => void almacen.agregar(i, i.nota, i.agregadoPor));
    });
  }, [items, almacen, avisar]);

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col">
      <header className="a-salvo-arriba sticky top-0 z-30 flex items-center justify-between gap-3 bg-crema/95 px-4 pb-2 backdrop-blur">
        <div className="flex items-baseline gap-2">
          <h1 className="text-2xl font-extrabold tracking-tight">Mercar</h1>
          <span className="text-sm font-bold text-tinta/40">
            {items.length > 0 ? `${items.length} ${items.length === 1 ? "cosa" : "cosas"}` : "al día"}
          </span>
        </div>
        <button
          onClick={() => setAjustes(true)}
          aria-label="Ajustes"
          className="toque grid h-10 w-10 place-items-center rounded-full bg-papel text-tinta/55 shadow-sm ring-1 ring-borde"
        >
          <Settings size={18} />
        </button>
      </header>

      <main className="flex-1 pb-28">
        {vista === "lista" ? (
          <Lista
            items={items}
            onComprar={comprar}
            onEditarNota={(item) => setEdicion({ tipo: "item", item })}
            onIrAlCatalogo={() => setVista("catalogo")}
          />
        ) : (
          <Catalogo
            productos={productos}
            enLista={enLista}
            onAgregar={(p) => void agregar(p)}
            onAgregarConNota={(producto) => setEdicion({ tipo: "nuevo", producto })}
            onProductoNuevo={setProductoNuevo}
          />
        )}
      </main>

      <nav className="a-salvo-abajo fixed inset-x-0 bottom-0 z-30 mx-auto flex max-w-md gap-2 bg-gradient-to-t from-crema via-crema to-transparent px-4 pt-6">
        <Pestana activa={vista === "lista"} onClick={() => setVista("lista")}>
          <ListChecks size={18} />
          Falta
          {items.length > 0 && (
            <span
              className={`ml-0.5 rounded-full px-1.5 py-px text-xs font-extrabold ${
                vista === "lista" ? "bg-white/25" : "bg-verde text-white"
              }`}
            >
              {items.length}
            </span>
          )}
        </Pestana>
        <Pestana activa={vista === "catalogo"} onClick={() => setVista("catalogo")}>
          <Plus size={18} />
          Agregar
        </Pestana>
      </nav>

      <Aviso mensaje={mensaje} onCerrar={() => setMensaje(null)} />

      <HojaNota
        abierta={edicion !== null}
        titulo={edicion?.tipo === "item" ? edicion.item.nombre : edicion?.producto.nombre ?? ""}
        emoji={edicion?.tipo === "item" ? edicion.item.emoji : edicion?.producto.emoji ?? "🛒"}
        notaInicial={edicion?.tipo === "item" ? edicion.item.nota ?? "" : ""}
        onGuardar={(nota) => void guardarNota(nota)}
        onCerrar={() => setEdicion(null)}
      />

      <HojaProductoNuevo
        abierta={productoNuevo !== null}
        nombreInicial={productoNuevo ?? ""}
        onCrear={(p) => void crearProducto(p)}
        onCerrar={() => setProductoNuevo(null)}
      />

      <Ajustes
        abierta={ajustes}
        casa={casa}
        nombre={nombre}
        compartido={almacen.compartido}
        cuantos={items.length}
        onNombre={setNombre}
        onVaciar={() => void vaciar()}
        onCerrar={() => setAjustes(false)}
      />
    </div>
  );
}

function Pestana({
  activa,
  onClick,
  children,
}: {
  activa: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`toque flex flex-1 items-center justify-center gap-1.5 rounded-full py-3.5 text-sm font-extrabold shadow-sm ${
        activa ? "bg-verde text-white" : "bg-papel text-tinta/55 ring-1 ring-borde"
      }`}
    >
      {children}
    </button>
  );
}
