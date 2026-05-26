// frontend/src/api/supabase.ts
import { createClient } from '@supabase/supabase-js';

// Puxa as chaves do seu arquivo .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Aviso de segurança para facilitar o debug caso esqueça o .env
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("⚠️ Atenção: Variáveis do Supabase ausentes. Verifique o seu arquivo .env.local");
}

// Cria a instância única do Supabase e exporta para o projeto usar
export const supabase = createClient(supabaseUrl, supabaseAnonKey);