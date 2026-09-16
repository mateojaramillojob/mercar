import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// El service worker nuevo toma el control solo, pero la pestaña abierta se queda
// con los archivos viejos hasta recargar: cada despliegue se veía una apertura
// tarde. Recargar al cambiar de controlador hace que el cambio llegue de una.
if ("serviceWorker" in navigator) {
  let recargando = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (recargando) return;
    recargando = true;
    location.reload();
  });
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
