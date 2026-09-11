-- ============================================================
-- MIGRACIÓN: Vincular profiles a Supabase Auth + activar RLS
-- Ejecutar en Supabase SQL Editor (una sola vez)
-- ============================================================

-- 1. Vincular profiles.id a auth.users.id (así el id del perfil
--    es el mismo id del usuario autenticado)
ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS profiles_id_fkey;

ALTER TABLE profiles
  ALTER COLUMN id DROP DEFAULT;

ALTER TABLE profiles
  ADD CONSTRAINT profiles_id_fkey
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Activar Row Level Security en profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 3. Políticas: cada usuario solo puede ver/editar su propio perfil.
--    (El backend usa la service_role key, que siempre se salta RLS,
--    así que estas políticas solo aplican a llamadas hechas con la anon key)
CREATE POLICY "Los usuarios pueden ver su propio perfil"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Los usuarios pueden actualizar su propio perfil"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- 4. Lo mismo para las tablas de progreso del usuario
ALTER TABLE user_lesson_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Ver propio historial" ON user_lesson_progress
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Insertar propio historial" ON user_lesson_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

ALTER TABLE user_story_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Ver propio progreso de historias" ON user_story_progress
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Insertar propio progreso de historias" ON user_story_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

ALTER TABLE user_inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Ver propio inventario" ON user_inventory
  FOR SELECT USING (auth.uid() = user_id);

ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Ver propios logros" ON user_achievements
  FOR SELECT USING (auth.uid() = user_id);

-- Nota: units, lessons, exercises, stories, shop_items, achievements,
-- dictionary_guarani quedan de lectura pública (contenido del curso),
-- así que no necesitan RLS restrictivo.
