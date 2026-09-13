import { useEffect, useState } from "react";
import Hoja from "./Hoja";
import { CATEGORIAS } from "../lib/catalogo";
import type { CategoriaId, Producto } from "../lib/tipos";

interface Props {
  abierta: boolean;
  nombreInicial: string;
  onCrear: (producto: Producto) => void;
  onCerrar: () => void;
}

const EMOJIS = ["🛒", "🥬", "🥩", "🥛", "🥖", "🥫", "🧊", "🥤", "🍪", "🧽", "🧴", "🐕", "📦", "🌿", "🧀", "🍫"];

export default function HojaProductoNuevo({ abierta, nombreInicial, onCrear, onCerrar }: Props) {
  const [nombre, setNombre] = useState(nombreInicial);
  const [nombreDe, setNombreDe] = useState("");
  const [categoria, setCategoria] = useState<CategoriaId>("otros");
  const [emoji, setEmoji] = useState("🛒");

  useEffect(() => {
    if (!abierta) return;
    setNombre(nombreInicial);
    setNombreDe("");
    setCategoria("otros");
    setEmoji("🛒");
  }, [abierta, nombreInicial]);

  const puedeCrear = nombre.trim().length > 0;

  return (
    <Hoja abierta={abierta} onCerrar={onCerrar} titulo="Producto nuevo">
      <div className="space-y-3">
        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-tinta/50">
            Nombre
          </span>
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            autoFocus
            placeholder="Panela"
            className="tarjeta w-full px-4 py-3 font-semibold outline-none focus:border-verde"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-tinta/50">
            En alemán <span className="font-normal normal-case">(opcional, para el pasillo)</span>
          </span>
          <input
            value={nombreDe}
            onChange={(e) => setNombreDe(e.target.value)}
            placeholder="Rohrzucker"
            className="tarjeta w-full px-4 py-3 font-semibold italic outline-none focus:border-verde"
          />
        </label>

        <div>
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-tinta/50">
            Categoría
          </span>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIAS.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setCategoria(c.id);
                  setEmoji(c.emoji);
                }}
                className={`toque rounded-full border px-3 py-1.5 text-sm font-bold ${
                  categoria === c.id
                    ? "border-verde bg-verde text-white"
                    : "border-borde bg-papel text-tinta/65"
                }`}
              >
                <span className="mr-1">{c.emoji}</span>
                {c.nombre}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-tinta/50">
            Ícono
          </span>
          <div className="flex flex-wrap gap-1.5">
            {EMOJIS.map((e) => (
              <button
                key={e}
                onClick={() => setEmoji(e)}
                className={`toque grid h-10 w-10 place-items-center rounded-full border text-xl ${
                  emoji === e ? "border-verde bg-verde-claro" : "border-borde bg-papel"
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        disabled={!puedeCrear}
        onClick={() =>
          onCrear({
            nombre: nombre.trim(),
            nombreDe: nombreDe.trim(),
            emoji,
            categoria,
          })
        }
        className="toque mt-5 w-full rounded-full bg-verde py-3 text-sm font-bold text-white disabled:opacity-40"
      >
        Crear y agregar a la lista
      </button>
    </Hoja>
  );
}
