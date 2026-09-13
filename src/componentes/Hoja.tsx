import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

interface Props {
  titulo: string;
  abierta: boolean;
  onCerrar: () => void;
  children: ReactNode;
}

/** Panel que sube desde abajo: se alcanza con el pulgar sin cambiar de pantalla. */
export default function Hoja({ titulo, abierta, onCerrar, children }: Props) {
  useEffect(() => {
    if (!abierta) return;
    const alTeclear = (e: KeyboardEvent) => e.key === "Escape" && onCerrar();
    window.addEventListener("keydown", alTeclear);
    return () => window.removeEventListener("keydown", alTeclear);
  }, [abierta, onCerrar]);

  if (!abierta) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        aria-label="Cerrar"
        onClick={onCerrar}
        className="absolute inset-0 bg-tinta/40 backdrop-blur-[2px]"
      />
      <div className="animate-entra relative w-full max-w-md rounded-t-[1.75rem] bg-papel p-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-extrabold">{titulo}</h2>
          <button
            onClick={onCerrar}
            aria-label="Cerrar"
            className="toque grid h-9 w-9 place-items-center rounded-full bg-crema text-tinta/60"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
