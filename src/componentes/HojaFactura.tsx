import { useEffect, useRef, useState } from "react";
import { Camera, Check, Loader2, Receipt, RotateCcw } from "lucide-react";
import Hoja from "./Hoja";
import { comprimir, leerFactura, type Coincidencia } from "../lib/factura";
import type { Item } from "../lib/tipos";

interface Props {
  abierta: boolean;
  items: Item[];
  onConfirmar: (ids: string[]) => void;
  onCerrar: () => void;
}

type Paso =
  | { fase: "elegir" }
  | { fase: "leyendo" }
  | { fase: "resultados"; tienda: string | null; comprados: Coincidencia[] }
  | { fase: "error"; mensaje: string };

export default function HojaFactura({ abierta, items, onConfirmar, onCerrar }: Props) {
  const [paso, setPaso] = useState<Paso>({ fase: "elegir" });
  const [marcados, setMarcados] = useState<Set<string>>(new Set());
  const entrada = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!abierta) return;
    setPaso({ fase: "elegir" });
    setMarcados(new Set());
  }, [abierta]);

  const porId = new Map(items.map((i) => [i.id, i]));

  const procesar = async (archivo: File) => {
    setPaso({ fase: "leyendo" });
    try {
      const imagen = await comprimir(archivo);
      const { tienda, comprados } = await leerFactura(imagen, items);
      setPaso({ fase: "resultados", tienda, comprados });
      // Lo dudoso queda sin marcar a propósito: es más barato marcar de más que
      // borrar de la lista algo que en realidad falta.
      setMarcados(new Set(comprados.filter((c) => c.confianza === "alta").map((c) => c.id)));
    } catch (e) {
      setPaso({ fase: "error", mensaje: e instanceof Error ? e.message : "Algo salió mal." });
    }
  };

  const alternar = (id: string) => {
    setMarcados((antes) => {
      const nuevo = new Set(antes);
      if (nuevo.has(id)) nuevo.delete(id);
      else nuevo.add(id);
      return nuevo;
    });
  };

  return (
    <Hoja abierta={abierta} onCerrar={onCerrar} titulo="Foto de la factura">
      <input
        ref={entrada}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const archivo = e.target.files?.[0];
          e.target.value = "";
          if (archivo) void procesar(archivo);
        }}
      />

      {paso.fase === "elegir" && (
        <div className="text-center">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-verde-claro">
            <Receipt size={28} className="text-verde" />
          </div>
          <p className="mx-auto max-w-xs text-sm text-tinta/60">
            Tómale una foto a la factura y saco de la lista lo que ya compraste. Entiende
            los nombres abreviados en alemán.
          </p>
          <button
            onClick={() => entrada.current?.click()}
            className="toque mx-auto mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-verde py-3.5 text-sm font-bold text-white"
          >
            <Camera size={18} />
            Tomar foto
          </button>
        </div>
      )}

      {paso.fase === "leyendo" && (
        <div className="py-10 text-center">
          <Loader2 size={30} className="mx-auto animate-spin text-verde" />
          <p className="mt-4 text-sm font-semibold text-tinta/60">Leyendo la factura…</p>
          <p className="mt-1 text-xs text-tinta/40">Se demora unos segundos.</p>
        </div>
      )}

      {paso.fase === "error" && (
        <div className="py-6 text-center">
          <p className="text-sm font-semibold text-naranja">{paso.mensaje}</p>
          <button
            onClick={() => setPaso({ fase: "elegir" })}
            className="toque mx-auto mt-5 flex items-center gap-2 rounded-full border border-borde px-5 py-3 text-sm font-bold text-tinta/60"
          >
            <RotateCcw size={16} />
            Intentar de nuevo
          </button>
        </div>
      )}

      {paso.fase === "resultados" && (
        <div>
          {paso.comprados.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-sm text-tinta/60">
                No reconocí en la factura nada de lo que falta. Puede ser la foto: que se
                vean los nombres de los productos y que no esté muy inclinada.
              </p>
              <button
                onClick={() => setPaso({ fase: "elegir" })}
                className="toque mx-auto mt-5 flex items-center gap-2 rounded-full border border-borde px-5 py-3 text-sm font-bold text-tinta/60"
              >
                <RotateCcw size={16} />
                Otra foto
              </button>
            </div>
          ) : (
            <>
              <p className="mb-3 text-sm text-tinta/60">
                {paso.tienda && <span className="font-bold text-tinta">{paso.tienda}. </span>}
                Encontré {paso.comprados.length}{" "}
                {paso.comprados.length === 1 ? "cosa comprada" : "cosas compradas"}. Revisa y
                confirma.
              </p>

              <ul className="tarjeta divide-y divide-borde overflow-hidden">
                {paso.comprados.map((c) => {
                  const item = porId.get(c.id);
                  if (!item) return null;
                  const marcado = marcados.has(c.id);
                  return (
                    <li key={c.id}>
                      <button
                        onClick={() => alternar(c.id)}
                        className="flex w-full items-center gap-3 px-3 py-3 text-left"
                      >
                        <span
                          className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 ${
                            marcado ? "border-verde bg-verde text-white" : "border-borde"
                          }`}
                        >
                          {marcado && <Check size={13} strokeWidth={3} />}
                        </span>
                        <span className="text-xl">{item.emoji}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-bold">{item.nombre}</span>
                          {c.linea && (
                            <span className="block truncate font-mono text-xs text-tinta/45">
                              {c.linea}
                            </span>
                          )}
                        </span>
                        {c.confianza === "baja" && (
                          <span className="shrink-0 rounded-full bg-naranja-claro px-2 py-0.5 text-xs font-bold text-naranja">
                            dudoso
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-5 flex gap-2">
                <button
                  onClick={() => setPaso({ fase: "elegir" })}
                  className="toque rounded-full border border-borde px-4 py-3 text-sm font-bold text-tinta/60"
                >
                  Otra foto
                </button>
                <button
                  disabled={marcados.size === 0}
                  onClick={() => onConfirmar([...marcados])}
                  className="toque flex-1 rounded-full bg-verde py-3 text-sm font-bold text-white disabled:opacity-40"
                >
                  Sacar {marcados.size} de la lista
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </Hoja>
  );
}
