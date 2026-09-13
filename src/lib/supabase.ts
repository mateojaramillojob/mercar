import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const llave = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

/** Sin credenciales la app corre igual, pero guardando solo en este teléfono. */
export const haySupabase = Boolean(url && llave);

export const supabase: SupabaseClient | null = haySupabase
  ? createClient(url as string, llave as string, {
      auth: { persistSession: false },
      realtime: { params: { eventsPerSecond: 5 } },
    })
  : null;
