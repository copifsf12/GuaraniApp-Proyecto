# Supabase & PostgreSQL - GuaraniApp

Este directorio contiene la arquitectura de base de datos para **GuaraniApp**, diseñada específicamente para almacenar el progreso de aprendizaje, perfiles, lecciones, variantes dialectales (Ava, Izoceño, Simba) y cuentos tradicionales del Guaraní Oriental Boliviano.

## Archivos Incluidos

1. `schema.sql`: Estructura completa de tablas relacionales:
   - `profiles`: Datos de usuario, vidas, monedas *Mba'e*, racha *Tatá*, nivel y variante seleccionada.
   - `units` & `lessons`: Camino del aprendizaje (*The Path*) a través del monte chaqueño.
   - `exercises`: Preguntas con 5 tipos de visualización (tarjetas gráficas, constructor de oraciones, teclado especial guaraní, discriminación nasal y onda sonora).
   - `stories`: Cuentos interactivos tradicionales (*Kassukuaa Stories*).
   - `league_leaderboard`: Clasificación semanal por ligas comunales.
   - `shop_items` & `user_inventory`: Ropas tradicionales para Aguará y potenciadores.
   - `achievements`: Insignias talladas.

2. `seed.sql`: Datos auténticos de vocabulario guaraní boliviano, saludos (*Puama*, *Kaaruma*), animales chaqueños (*Aguará*, *Yagua*, *Tatú*) y relatos ancestrales.

## ¿Cómo vincularlo a tu proyecto de Supabase?

1. Ve a tu panel de control en [https://supabase.com](https://supabase.com) y crea un nuevo proyecto.
2. Abre la sección **SQL Editor**.
3. Copia y pega primero el contenido de `schema.sql` y dale a **Run**.
4. Luego copia y pega el contenido de `seed.sql` y dale a **Run**.
5. En la configuración del proyecto (**Project Settings > API**), obtén tu `Project URL` y tu clave pública `anon key`.
6. Agrégalas en el archivo `.env` tanto en `server/` como en `client/`:
   ```env
   SUPABASE_URL=https://tu-proyecto.supabase.co
   SUPABASE_ANON_KEY=tu-anon-key-aqui
   ```

*Nota: La aplicación cuenta con un motor inteligente de persistencia local / fallback automático. Si aún no has conectado Supabase, la app funciona de forma inmediata al 100% en modo autónomo sin bloquearse.*
