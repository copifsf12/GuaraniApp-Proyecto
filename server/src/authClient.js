const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('⚠️  Faltan SUPABASE_URL / SUPABASE_ANON_KEY para el cliente de autenticación.');
}

// Este cliente usa la anon/publishable key: es el que se usa para signUp,
// signIn y verificar tokens de sesión. SÍ respeta Row Level Security.
const supabaseAuth = (SUPABASE_URL && SUPABASE_ANON_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
  : null;

module.exports = supabaseAuth;