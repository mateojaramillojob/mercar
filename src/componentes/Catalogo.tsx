import { useMemo, useRef, useState } from "react";
import { Check, Plus, Search, X } from "lucide-react";
import { CATEGORIAS } from "../lib/catalogo";
import type { CategoriaId, Producto } from "../lib/tipos";

interface Props {
  productos: Producto[];
  /** Nombres que ya están en la lista, para marcarlos y no repetirlos. */
  enLista: Set<string>;
  onAgregar: (producto: Producto) => void;
  onAgregarConNota: (producto: Producto) => void;
  onProductoNuevo: (nombre: string) => void;
}

const sinTildes = (s: string) =>
  s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

export default function Catalogo({
  productos,
  enLista,
  onAgregar,
  onAgregarConNota,
  onProductoNuevo,
}: Props) {
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<CategoriaId | null>(null);

  const encontrados = useMemo(() => {
    const q = sinTildes(busqueda.trim());
    return productos.filter((p) => {
      if (filtro && p.categoria !== filtro) return false;
      if (!q) return true;
      return sinTildes(p.nombre).includes(q) || sinTildes(p.nombreDe).includes(q);
    });
  }, [productos, busqueda, filtro]);

  const grupos = CATEGORIAS.map((cat) => ({
    cat,
    suyos: encontrados.filter((p) => p.categoria === cat.id),
  })).filter((g) => g.suyos.length > 0);

  return (
    <div className="pb-4">
      <div className="sticky top-0 z-20 space-y-3 bg-crema/95 px-4 pb-3 pt-1 backdrop-blur">
        <div className="relative">
          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-tinta/35"
          />
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar en español o alemán…"
            className="tarjeta w-full py-3 pl-11 pr-10 font-semibold outline-none placeholder:font-normal placeholder:text-tinta/35 focus:border-verde"
          />
          {busqueda && (
            <button
              onClick={() => setBusqueda("")}
              aria-label="Borrar búsqueda"
              className="absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full bg-crema text-tinta/50"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Chip activo={filtro === null} onClick={() => setFiltro(null)}>
            Todo
          </Chip>
          {CATEGORIAS.map((c) => (
            <Chip key={c.id} activo={filtro === c.id} onClick={() => setFiltro(filtro === c.id ? null : c.id)}>
              <span className="mr-1">{c.emoji}</span>
              {c.nombre}
            </Chip>
          ))}
        </div>
      </div>

      {encontrados.length === 0 ? (
        <div className="px-8 py-14 text-center">
          <p className="text-sm text-tinta/55">
            Nada con «<span className="font-bold text-tinta">{busqueda}</span>» en el catálogo.
          </p>
          <button
            onClick={() => onProductoNuevo(busqueda.trim())}
            className="toque mx-auto mt-5 flex items-center gap-2 rounded-full bg-verde px-5 py-3 text-sm font-bold text-white"
          >
            <Plus size={18} />
            Crear «{busqueda.trim()}»
          </button>
        </div>
      ) : (
        <div className="space-y-5 px-4">
          {grupos.map(({ cat, suyos }) => (
            <section key={cat.id}>
              <h2 className="mb-2 flex items-baseline gap-2 px-1 text-sm font-extrabold uppercase tracking-wide text-tinta/70">
                <span className="text-base">{cat.emoji}</span>
                {cat.nombre}
                <span className="text-xs font-semibold normal-case italic text-tinta/35">
                  {cat.nombreDe}
                </span>
              </h2>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {suyos.map((p) => (
                  <Ficha
                    key={`${p.categoria}-${p.nombre}`}
                    producto={p}
                    yaEsta={enLista.has(p.nombre)}
                    onAgregar={onAgregar}
                    onAgregarConNota={onAgregarConNota}
                  />
                ))}
              </div>
            </section>
          ))}

          {busqueda.trim() && (
            <button
              onClick={() => onProductoNuevo(busqueda.trim())}
              className="toque mx-auto flex items-center gap-2 rounded-full border border-borde px-4 py-2.5 text-sm font-bold text-tinta/60"
            >
              <Plus size={16} />
              Crear «{busqueda.trim()}»
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function Chip({
  activo,
  onClick,
  children,
}: {
  activo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`toque shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm font-bold ${
        activo
          ? "border-verde bg-verde text-white"
          : "border-borde bg-papel text-tinta/65"
      }`}
    >
      {children}
    </button>
  );
}

function Ficha({
  producto,
  yaEsta,
  onAgregar,
  onAgregarConNota,
}: {
  producto: Producto;
  yaEsta: boolean;
  onAgregar: (p: Producto) => void;
  onAgregarConNota: (p: Producto) => void;
}) {
  // Toque corto agrega de una; mantener presionado abre la nota ("2 kg").
  const temporizador = useRef<number | null>(null);
  const fueLargo = useRef(false);

  const empezar = () => {
    fueLargo.current = false;
    temporizador.current = window.setTimeout(() => {
      fueLargo.current = true;
      navigator.vibrate?.(12);
      onAgregarConNota(producto);
    }, 450);
  };

  const terminar = (agregar: boolean) => {
    if (temporizador.current) window.clearTimeout(temporizador.current);
    temporizador.current = null;
    if (agregar && !fueLargo.current) onAgregar(producto);
  };

  return (
    <button
      onPointerDown={empezar}
      onPointerUp={() => terminar(true)}
      onPointerLeave={() => terminar(false)}
      onPointerCancel={() => terminar(false)}
      onContextMenu={(e) => e.preventDefault()}
      className={`toque relative flex select-none items-center gap-2.5 rounded-xl2 border p-2.5 text-left ${
        yaEsta ? "border-verde bg-verde-claro" : "border-borde bg-papel"
      }`}
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-crema text-lg">
        {producto.emoji}
      </span>
      <span className="min-w-0 flex-1 leading-tight">
        <span className="block truncate text-sm font-bold">{producto.nombre}</span>
        {producto.nombreDe && (
          <span className="block truncate text-xs italic text-tinta/45">{producto.nombreDe}</span>
        )}
      </span>
      {yaEsta && (
        <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-verde text-white">
          <Check size={12} strokeWidth={3} />
        </span>
      )}
    </button>
  );
}
