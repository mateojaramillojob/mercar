import { useEffect, useState } from "react";
import Hoja from "./Hoja";

interface Props {
  abierta: boolean;
  titulo: string;
  emoji: string;
  notaInicial: string;
  onGuardar: (nota: string) => void;
  onCerrar: () => void;
}

const RAPIDAS = ["1", "2", "3", "500 g", "1 kg", "2 kg", "1 paquete", "2 paquetes", "El grande"];

export default function HojaNota({
  abierta,
  titulo,
  emoji,
  notaInicial,
  onGuardar,
  onCerrar,
}: Props) {
  const [nota, setNota] = useState(notaInicial);

  useEffect(() => setNota(notaInicial), [notaInicial, abierta]);

  return (
    <Hoja abierta={abierta} onCerrar={onCerrar} titulo="Cantidad o detalle">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-crema text-2xl">
          {emoji}
        </span>
        <span className="text-base font-extrabold">{titulo}</span>
      </div>

      <input
        value={nota}
        onChange={(e) => setNota(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onGuardar(nota.trim())}
        autoFocus
        placeholder="2 kg, la marca verde, el grande…"
        className="tarjeta w-full px-4 py-3 font-semibold outline-none placeholder:font-normal placeholder:text-tinta/35 focus:border-verde"
      />

      <div className="mt-3 flex flex-wrap gap-2">
        {RAPIDAS.map((r) => (
          <button
            key={r}
            onClick={() => setNota(r)}
            className={`toque rounded-full border px-3 py-1.5 text-sm font-bold ${
              nota === r ? "border-verde bg-verde text-white" : "border-borde bg-papel text-tinta/65"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="mt-5 flex gap-2">
        {notaInicial && (
          <button
            onClick={() => onGuardar("")}
            className="toque rounded-full border border-borde px-4 py-3 text-sm font-bold text-tinta/60"
          >
            Quitar
          </button>
        )}
        <button
          onClick={() => onGuardar(nota.trim())}
          className="toque flex-1 rounded-full bg-verde py-3 text-sm font-bold text-white"
        >
          Listo
        </button>
      </div>
    </Hoja>
  );
}
