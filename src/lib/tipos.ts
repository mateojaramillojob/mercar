export type CategoriaId =
  | "frutas"
  | "carnes"
  | "lacteos"
  | "panaderia"
  | "despensa"
  | "congelados"
  | "bebidas"
  | "snacks"
  | "limpieza"
  | "cuidado"
  | "mascotas"
  | "otros";

export interface Categoria {
  id: CategoriaId;
  nombre: string;
  /** El nombre del pasillo como aparece en REWE / Edeka / Aldi. */
  nombreDe: string;
  emoji: string;
}

export interface Producto {
  nombre: string;
  nombreDe: string;
  emoji: string;
  categoria: CategoriaId;
}

export interface Item extends Producto {
  id: string;
  /** Cantidad o detalle libre: "2 kg", "el grande", "la marca verde". */
  nota: string | null;
  agregadoPor: string | null;
  creadoEn: string;
}
