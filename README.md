# Mercar

La lista del mercado de la casa, compartida entre los dos teléfonos. Se abre de un
toque desde un tag NFC pegado en la cocina: uno agrega lo que se acabó y al otro le
aparece al instante, sin mandar mensajes.

Los productos vienen con el nombre en **español y en alemán** — se piden en español
y se encuentran en el pasillo en alemán.

## Cómo funciona

- **Falta** — lo que hay que comprar, agrupado por categoría. Tocar una fila es
  "ya lo compré" (con Deshacer por si fue sin querer).
- **Agregar** — catálogo de ~200 productos de REWE / Edeka / Aldi / Lidl / dm.
  Un toque lo manda a la lista; mantener presionado abre la cantidad ("2 kg").
  La búsqueda entiende español, alemán y funciona sin tildes.
- **Casa** — un código de 6 caracteres une los dos teléfonos a la misma lista.
  Viaja en el enlace del tag NFC (`#casa=ABC123`).

## Desarrollo

```bash
npm install
npm run dev
```

Sin `.env` la app corre igual, guardando solo en ese navegador. Es el modo con el
que se prueba antes de conectar la base.

## Conectar Supabase (para que sea compartida)

1. En Supabase → **SQL Editor** → correr [`supabase/migrations/0001_mercar.sql`](supabase/migrations/0001_mercar.sql).
2. Copiar `.env.example` a `.env` y pegar la *Project URL* y la *anon key*
   (Project Settings → API).
3. En GitHub: **Settings → Secrets and variables → Actions**, crear
   `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` con esos mismos valores.

### Sobre la privacidad

La app no tiene login a propósito: tiene que abrirse de un toque desde el tag NFC.
Eso significa que las tablas quedan abiertas a la llave anónima, que es pública
porque viaja en el JavaScript. Lo que separa una casa de otra es el código de
6 caracteres, no la base de datos. Para una lista de mercado es un intercambio
razonable; si algún día hace falta cerrarlo, el camino es Supabase Anonymous
Sign-in con una tabla de miembros por casa.

## Despliegue

Push a `main` → GitHub Actions hace el build y publica en GitHub Pages
(`.github/workflows/deploy.yml`). Hay que habilitar Pages una vez en
**Settings → Pages → Source: GitHub Actions**.

## El tag NFC

1. Comprar tags NTAG213 (unos 8 € por 10).
2. Instalar **NFC Tools** en el celular.
3. Write → Add a record → URL → pegar el enlace con el código de la casa
   (sale en Ajustes → Compartir) → Write.
4. Pegar el tag en la cocina.

## Etapa 2

Recetas: guardar una receta con sus ingredientes y mandar de un toque a la lista
los que falten.
