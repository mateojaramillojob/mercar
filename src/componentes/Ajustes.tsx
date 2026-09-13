import { useState } from "react";
import { Check, Copy, Share2, Trash2, Wifi, WifiOff } from "lucide-react";
import Hoja from "./Hoja";
import { cambiarCasa, enlaceParaCompartir, guardarNombre } from "../lib/casa";

interface Props {
  abierta: boolean;
  casa: string;
  nombre: string;
  compartido: boolean;
  cuantos: number;
  onNombre: (n: string) => void;
  onVaciar: () => void;
  onCerrar: () => void;
}

export default function Ajustes({
  abierta,
  casa,
  nombre,
  compartido,
  cuantos,
  onNombre,
  onVaciar,
  onCerrar,
}: Props) {
  const [copiado, setCopiado] = useState(false);
  const [unirse, setUnirse] = useState("");

  const enlace = enlaceParaCompartir(casa);
  // Safari en iOS y Chrome en Android lo tienen; un navegador de escritorio no.
  const puedeCompartir = "share" in navigator;

  const compartir = async () => {
    const datos = {
      title: "Mercar",
      text: `Nuestra lista del mercado. Código de la casa: ${casa}`,
      url: enlace,
    };
    if (puedeCompartir) {
      try {
        await navigator.share(datos);
        return;
      } catch {
        // Si cancela el menú de compartir, caemos a copiar el enlace.
      }
    }
    await navigator.clipboard.writeText(enlace);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1800);
  };

  return (
    <Hoja abierta={abierta} onCerrar={onCerrar} titulo="Ajustes">
      <div className="space-y-5">
        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-tinta/50">
            Tu nombre
          </span>
          <input
            value={nombre}
            onChange={(e) => {
              onNombre(e.target.value);
              guardarNombre(e.target.value);
            }}
            placeholder="Mateo"
            className="tarjeta w-full px-4 py-3 font-semibold outline-none focus:border-verde"
          />
          <span className="mt-1 block text-xs text-tinta/45">
            Para saber quién pidió cada cosa.
          </span>
        </label>

        <div>
          <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-tinta/50">
            Casa
          </span>
          <div className="tarjeta flex items-center justify-between px-4 py-3">
            <span className="font-mono text-lg font-extrabold tracking-widest">{casa}</span>
            <button
              onClick={compartir}
              className="toque flex items-center gap-1.5 rounded-full bg-verde px-3.5 py-2 text-sm font-bold text-white"
            >
              {copiado ? <Check size={15} /> : puedeCompartir ? <Share2 size={15} /> : <Copy size={15} />}
              {copiado ? "Copiado" : "Compartir"}
            </button>
          </div>
          <span className="mt-1 block text-xs text-tinta/45">
            Manda este enlace a tu esposa para que vea la misma lista.
          </span>
        </div>

        <div>
          <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-tinta/50">
            Entrar a otra casa
          </span>
          <div className="flex gap-2">
            <input
              value={unirse}
              onChange={(e) => setUnirse(e.target.value.toUpperCase())}
              placeholder="ABC123"
              className="tarjeta w-full px-4 py-3 font-mono font-bold tracking-widest outline-none focus:border-verde"
            />
            <button
              disabled={unirse.trim().length < 4}
              onClick={() => cambiarCasa(unirse)}
              className="toque shrink-0 rounded-full border border-borde px-4 text-sm font-bold text-tinta/70 disabled:opacity-40"
            >
              Entrar
            </button>
          </div>
        </div>

        <div
          className={`flex items-start gap-2.5 rounded-xl2 px-4 py-3 text-xs font-semibold ${
            compartido ? "bg-verde-claro text-verde-oscuro" : "bg-naranja-claro text-naranja"
          }`}
        >
          {compartido ? <Wifi size={16} className="mt-px shrink-0" /> : <WifiOff size={16} className="mt-px shrink-0" />}
          <span>
            {compartido
              ? "Sincronizada. Lo que agregues le aparece al otro al instante."
              : "Solo en este teléfono todavía. Falta conectar Supabase para que los dos vean la misma lista."}
          </span>
        </div>

        {cuantos > 0 && (
          <button
            onClick={onVaciar}
            className="toque flex w-full items-center justify-center gap-2 rounded-full border border-borde py-3 text-sm font-bold text-tinta/60"
          >
            <Trash2 size={16} />
            Vaciar la lista ({cuantos})
          </button>
        )}
      </div>
    </Hoja>
  );
}
