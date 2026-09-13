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
- **Factura** — foto a la factura del súper y saca de la lista lo que ya se
  compró. Un modelo con visión lee el papel térmico y casa "H-MILCH 3,5%" con
  "Leche"; lo dudoso queda sin marcar para que uno confirme. Requiere Supabase.
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

## Desplegar el lector de facturas

La función vive en [`supabase/functions/leer-factura`](supabase/functions/leer-factura/index.ts)
y usa el mismo gateway de IA que `iron-stack-gainz`.

1. Supabase → **Edge Functions** → *Deploy a new function* → nombre `leer-factura`
   → pegar el contenido de `index.ts`.
2. Desmarcar **Verify JWT** (la app no tiene login).
3. Confirmar que el secret `LOVABLE_API_KEY` existe en ese proyecto
   (**Project Settings → Edge Functions → Secrets**). Es el mismo que usa el gym.

El botón de la cámara solo aparece cuando hay Supabase configurado.

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

El tag no sincroniza nada: solo guarda una URL. Quien sincroniza es Supabase.
Lo que hace el tag es abrir la lista de un toque, ya apuntando a la casa correcta.

**Primero hay que fijar el código de casa.** Cada teléfono que abre la app por
primera vez se inventa el suyo, así que hay que elegir uno y que los dos usen ese:
abrir la app, **Ajustes → Compartir**, y ese enlace
(`https://mateojaramillojob.github.io/mercar/#casa=ABC123`) es el que va al tag.

1. Comprar tags **NTAG213** (unos 8 € por 10 en Amazon.de). Si va sobre metal —la
   nevera— tienen que ser **"on-metal"**, con blindaje de ferrita: el metal desafina
   la antena y un tag normal no se lee. Sobre azulejo, madera o vidrio sirve el normal.
2. Instalar **NFC Tools** (gratis, iOS y Android).
3. Write → Add a record → **URL/URI** → pegar el enlace → Write, y acercar el tag.
4. No usar *Lock tag* todavía: lo deja de solo lectura para siempre y el enlace
   puede cambiar.
5. Pegarlo en la cocina y tocarlo con cada teléfono una vez.

En iPhone XS o más nuevo el tag se lee sin abrir nada. En iPhone 7/8/X toca usar el
lector NFC del Centro de Control. En Android hay que tener NFC activado.

**Si se instala en la pantalla de inicio:** en iOS la app instalada guarda sus datos
aparte de Safari, y el tag siempre abre Safari. Después de instalarla hay que
abrirla y meter el código con **Ajustes → Entrar a otra casa**.

## Etapa 2

Recetas: guardar una receta con sus ingredientes y mandar de un toque a la lista
los que falten.
