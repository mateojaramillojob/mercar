-- Mercar: la lista del mercado compartida entre los dos teléfonos.
-- Se puede correr entero las veces que haga falta, esté como esté la base.

create table if not exists public.mercar_items (
  id           uuid primary key default gen_random_uuid(),
  casa         text        not null,
  nombre       text        not null,
  nombre_de    text,
  emoji        text,
  categoria    text        not null,
  nota         text,
  agregado_por text,
  creado_en    timestamptz not null default now()
);

-- Los productos que ustedes crean y que no venían en el catálogo de la app.
create table if not exists public.mercar_propios (
  id        uuid primary key default gen_random_uuid(),
  casa      text        not null,
  nombre    text        not null,
  nombre_de text,
  emoji     text,
  categoria text        not null,
  creado_en timestamptz not null default now()
);

create index if not exists mercar_items_casa_idx   on public.mercar_items (casa, creado_en);
create index if not exists mercar_propios_casa_idx on public.mercar_propios (casa, creado_en);

alter table public.mercar_items   enable row level security;
alter table public.mercar_propios enable row level security;

-- La app no tiene login (tiene que abrirse de un toque desde el tag NFC), así que
-- estas tablas quedan abiertas a la llave anónima. Lo que separa una casa de otra
-- es el código de 6 caracteres, no la base de datos: cualquiera con la llave
-- pública puede leer las filas. Para una lista de mercado es un intercambio
-- aceptable; si algún día se quiere cerrar, el camino es Supabase Anonymous
-- Sign-in + una tabla de miembros por casa.
drop policy if exists mercar_items_abierta   on public.mercar_items;
drop policy if exists mercar_propios_abierta on public.mercar_propios;

create policy mercar_items_abierta on public.mercar_items
  for all to anon, authenticated using (true) with check (true);

create policy mercar_propios_abierta on public.mercar_propios
  for all to anon, authenticated using (true) with check (true);

-- Al borrar, Postgres apunta solo la clave primaria en el registro de cambios.
-- Realtime necesita la fila entera para evaluar la política RLS, y sin esto
-- descarta el evento: el otro teléfono nunca ve desaparecer lo ya comprado, que
-- es justo el gesto principal de la app.
alter table public.mercar_items   replica identity full;
alter table public.mercar_propios replica identity full;

-- Sin la publicación no hay sincronización en vivo. Agregar una tabla que ya
-- está dentro revienta, así que se comprueba antes y el script queda re-corrible.
do $$
declare t text;
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;

  foreach t in array array['mercar_items', 'mercar_propios']
  loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;
