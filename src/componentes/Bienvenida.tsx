import { useState } from "react";
import { ArrowRight, Home, Users } from "lucide-react";
import { crearCasa, entrarACasa } from "../lib/casa";

interface Props {
  onListo: (casa: string) => void;
}

/**
 * Primera apertura. Preguntar en vez de asignar un código a escondidas es lo
 * que evita que los dos teléfonos acaben en listas distintas creyendo que
 * están en la misma.
 */
export default function Bienvenida({ onListo }: Props) {
  const [uniendose, setUniendose] = useState(false);
  const [codigo, setCodigo] = useState("");

  const puedeEntrar = codigo.trim().length >= 4;

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 py-10">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-[1.5rem] bg-verde text-4xl">
          🧺
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">Mercar</h1>
        <p className="mt-2 text-sm text-tinta/55">
          La lista del mercado, la misma en los dos teléfonos.
        </p>
      </div>

      {!uniendose ? (
        <div className="space-y-3">
          <button
            onClick={() => onListo(crearCasa())}
            className="toque flex w-full items-center gap-3 rounded-xl2 bg-verde px-5 py-4 text-left text-white"
          >
            <Home size={22} className="shrink-0" />
            <span className="flex-1">
              <span className="block font-extrabold">Empezar una casa</span>
              <span className="block text-xs text-white/70">
                Creo la lista y después invitas a la otra persona
              </span>
            </span>
            <ArrowRight size={18} className="shrink-0 opacity-70" />
          </button>

          <button
            onClick={() => setUniendose(true)}
            className="toque flex w-full items-center gap-3 rounded-xl2 border border-borde bg-papel px-5 py-4 text-left"
          >
            <Users size={22} className="shrink-0 text-tinta/45" />
            <span className="flex-1">
              <span className="block font-extrabold">Entrar a una casa</span>
              <span className="block text-xs text-tinta/50">
                Ya tienes el código de 6 caracteres
              </span>
            </span>
            <ArrowRight size={18} className="shrink-0 text-tinta/30" />
          </button>
        </div>
      ) : (
        <div>
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-tinta/50">
              Código de la casa
            </span>
            <input
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && puedeEntrar && onListo(entrarACasa(codigo))}
              autoFocus
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
              placeholder="ABC123"
              className="tarjeta w-full px-4 py-4 text-center font-mono text-2xl font-extrabold tracking-[0.3em] outline-none placeholder:text-tinta/20 focus:border-verde"
            />
          </label>
          <p className="mt-2 text-center text-xs text-tinta/50">
            Sale en el otro teléfono, en Ajustes → Compartir.
          </p>

          <button
            disabled={!puedeEntrar}
            onClick={() => onListo(entrarACasa(codigo))}
            className="toque mt-5 w-full rounded-full bg-verde py-3.5 text-sm font-bold text-white disabled:opacity-40"
          >
            Entrar
          </button>
          <button
            onClick={() => setUniendose(false)}
            className="toque mt-2 w-full py-3 text-sm font-bold text-tinta/50"
          >
            Volver
          </button>
        </div>
      )}
    </div>
  );
}
