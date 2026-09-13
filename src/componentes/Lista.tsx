import { Pencil, Receipt, ShoppingBasket } from "lucide-react";
import { CATEGORIAS } from "../lib/catalogo";
import type { Item } from "../lib/tipos";

interface Props {
  items: Item[];
  onComprar: (item: Item) => void;
  onEditarNota: (item: Item) => void;
  onIrAlCatalogo: () => void;
  onLeerFactura: () => void;
}

export default function Lista({
  items,
  onComprar,
  onEditarNota,
  onIrAlCatalogo,
  onLeerFactura,
}: Props) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-8 py-20 text-center">
        <div className="mb-4 grid h-20 w-20 place-items-center rounded-full bg-verde-claro text-4xl">
          🧺
        </div>
        <h2 className="text-xl font-extrabold">No falta nada</h2>
        <p className="mt-1 max-w-xs text-sm text-tinta/55">
          La casa está completa. Cuando se acabe algo, agrégalo aquí y le aparece al otro
          al instante.
        </p>
        <button
          onClick={onIrAlCatalogo}
          className="toque mt-6 flex items-center gap-2 rounded-full bg-verde px-5 py-3 text-sm font-bold text-white"
        >
          <ShoppingBasket size={18} />
          Agregar algo
        </button>
      </div>
    );
  }

  const porCategoria = CATEGORIAS.map((cat) => ({
    cat,
    suyos: items.filter((i) => i.categoria === cat.id),
  })).filter((g) => g.suyos.length > 0);

  return (
    <div className="space-y-5 px-4 pb-4">
      {porCategoria.map(({ cat, suyos }) => (
        <section key={cat.id}>
          <div className="mb-2 flex items-baseline gap-2 px-1">
            <span className="text-base">{cat.emoji}</span>
            <h2 className="text-sm font-extrabold uppercase tracking-wide text-tinta/70">
              {cat.nombre}
            </h2>
            <span className="text-xs font-bold text-tinta/35">{suyos.length}</span>
          </div>

          <ul className="tarjeta divide-y divide-borde overflow-hidden">
            {suyos.map((item) => (
              <li key={item.id} className="flex items-stretch">
                {/* Tocar la fila es "ya lo compré": es el gesto de todos los días. */}
                <button
                  onClick={() => onComprar(item)}
                  className="flex flex-1 items-center gap-3 py-3 pl-4 pr-2 text-left transition-colors active:bg-verde-claro"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-crema text-xl">
                    {item.emoji}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate font-bold">{item.nombre}</span>
                      {item.nota && (
                        <span className="shrink-0 rounded-full bg-naranja-claro px-2 py-0.5 text-xs font-bold text-naranja">
                          {item.nota}
                        </span>
                      )}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-tinta/45">
                      {item.nombreDe && <span className="truncate italic">{item.nombreDe}</span>}
                      {item.agregadoPor && (
                        <>
                          {item.nombreDe && <span aria-hidden>·</span>}
                          <span className="shrink-0">{item.agregadoPor}</span>
                        </>
                      )}
                    </span>
                  </span>
                </button>

                <button
                  onClick={() => onEditarNota(item)}
                  aria-label={`Nota de ${item.nombre}`}
                  className="grid w-12 shrink-0 place-items-center text-tinta/30 transition-colors active:text-verde"
                >
                  <Pencil size={16} />
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <button
        onClick={onLeerFactura}
        className="toque flex w-full items-center justify-center gap-2 rounded-xl2 border border-dashed border-borde py-3.5 text-sm font-bold text-tinta/55"
      >
        <Receipt size={17} />
        Ya compré — leer la factura
      </button>
    </div>
  );
}
