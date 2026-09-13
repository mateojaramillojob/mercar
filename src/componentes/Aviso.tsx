import { useEffect } from "react";
import { Undo2 } from "lucide-react";

export interface Mensaje {
  id: number;
  texto: string;
  deshacer?: () => void;
}

interface Props {
  mensaje: Mensaje | null;
  onCerrar: () => void;
}

export default function Aviso({ mensaje, onCerrar }: Props) {
  useEffect(() => {
    if (!mensaje) return;
    const t = setTimeout(onCerrar, mensaje.deshacer ? 4500 : 2200);
    return () => clearTimeout(t);
  }, [mensaje, onCerrar]);

  if (!mensaje) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+5.5rem)] z-40 flex justify-center px-4">
      <div className="animate-entra pointer-events-auto flex max-w-md items-center gap-3 rounded-full bg-tinta px-4 py-2.5 text-sm font-semibold text-crema shadow-lg">
        <span className="truncate">{mensaje.texto}</span>
        {mensaje.deshacer && (
          <button
            onClick={() => {
              mensaje.deshacer?.();
              onCerrar();
            }}
            className="toque flex shrink-0 items-center gap-1 rounded-full bg-crema/15 px-3 py-1 text-crema"
          >
            <Undo2 size={14} />
            Deshacer
          </button>
        )}
      </div>
    </div>
  );
}
