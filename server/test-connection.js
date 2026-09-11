require('dotenv').config();
const supabase = require('./src/supabaseClient');

(async () => {
  if (!supabase) {
    console.log('❌ Cliente no inicializado. Revisa tu archivo .env');
    return;
  }
  const { data, error, count } = await supabase
    .from('units')
    .select('*', { count: 'exact' })
    .limit(3);

  if (error) {
    console.log('❌ ERROR conectando a Supabase:', error.message);
    return;
  }
  console.log('✅ Conexión exitosa. Filas encontradas en "units":', count);
  console.log(data);
})();