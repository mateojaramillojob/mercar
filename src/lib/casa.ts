const CLAVE = "mercar.casa";
const ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sin I/O/0/1, para dictarlo por teléfono

function generar(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return Array.from(bytes, (b) => ALFABETO[b % ALFABETO.length]).join("");
}

/** El código que trae el enlace del tag NFC (`#casa=ABC123`), si trae alguno. */
export function casaEnElEnlace(): string | null {
  const crudo = new URLSearchParams(location.hash.slice(1)).get("casa");
  return crudo ? crudo.toUpperCase().slice(0, 12) : null;
}

/** Deja la barra de direcciones limpia una vez leído el código. */
export function limpiarEnlace(): void {
  history.replaceState(null, "", location.pathname + location.search);
}

/**
 * El código que une los dos teléfonos a la misma lista: el del enlace del tag
 * NFC, o el que ya estuviera guardado. `null` la primera vez.
 *
 * Antes se inventaba uno solo, y eso rompía la instalación en iPhone: el
 * manifest arranca en /mercar/ sin el #casa=, así que la app instalada nacía
 * con un código distinto al de Safari y quedaban dos listas separadas sin que
 * nadie viera un error. Ahora la primera vez se pregunta.
 */
export function codigoCasa(): string | null {
  const enElEnlace = casaEnElEnlace();
  if (enElEnlace) {
    localStorage.setItem(CLAVE, enElEnlace);
    limpiarEnlace();
    return enElEnlace;
  }
  return localStorage.getItem(CLAVE);
}

export function crearCasa(): string {
  const nuevo = generar();
  localStorage.setItem(CLAVE, nuevo);
  return nuevo;
}

export function entrarACasa(codigo: string): string {
  const limpio = codigo.trim().toUpperCase();
  localStorage.setItem(CLAVE, limpio);
  return limpio;
}

export function cambiarCasa(codigo: string): void {
  localStorage.setItem(CLAVE, codigo.trim().toUpperCase());
  location.reload();
}

export function enlaceParaCompartir(codigo: string): string {
  return `${location.origin}${location.pathname}#casa=${codigo}`;
}

const CLAVE_NOMBRE = "mercar.nombre";
export const leerNombre = (): string => localStorage.getItem(CLAVE_NOMBRE) ?? "";
export const guardarNombre = (n: string): void => {
  localStorage.setItem(CLAVE_NOMBRE, n.trim());
};
