// src/supabase.ts
import { createClient } from '@supabase/supabase-js';

// İsimleri değiştirdik: VITE_EDITION_...
const supabaseUrl = import.meta.env.VITE_EDITION_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_EDITION_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase URL veya Key eksik. Lütfen ENV ayarlarını kontrol edin.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);