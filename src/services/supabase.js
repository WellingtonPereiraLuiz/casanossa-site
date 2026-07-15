import { createClient } from '@supabase/supabase-js';

// Usamos import.meta.env para acessar variáveis no Vite
// Colocamos um fallback (placeholder) para evitar que o site "quebre" (crash)
// enquanto o usuário não insere as chaves reais no arquivo .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://sua-url-do-supabase.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sua-anon-key-aqui';

// Inicializa e exporta o cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseKey);
