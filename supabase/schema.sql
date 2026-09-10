-- ==============================================================================
-- GUARANIAPP - SUPABASE & POSTGRESQL SCHEMA
-- Base de Datos para Aprendizaje de Guaraní Oriental Boliviano (Ava, Izoceño, Simba)
-- ==============================================================================

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA DE PERFILES DE USUARIO
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE,
    username TEXT NOT NULL,
    avatar_url TEXT DEFAULT 'aguara_default',
    dialect_variant TEXT NOT NULL DEFAULT 'ava' CHECK (dialect_variant IN ('ava', 'izoceño', 'simba')),
    age_group TEXT NOT NULL DEFAULT 'adulto' CHECK (age_group IN ('nino', 'joven', 'adulto', 'mayor')),
    daily_goal_minutes INT NOT NULL DEFAULT 10,
    current_level INT NOT NULL DEFAULT 1,
    hearts INT NOT NULL DEFAULT 5,
    max_hearts INT NOT NULL DEFAULT 5,
    coins_mbae INT NOT NULL DEFAULT 50, -- Monedas Mba'e
    xp_total INT NOT NULL DEFAULT 0,
    streak_days INT NOT NULL DEFAULT 1,
    last_streak_date DATE DEFAULT CURRENT_DATE,
    streak_freeze_count INT NOT NULL DEFAULT 0, -- Vasijas protectoras
    current_rank TEXT NOT NULL DEFAULT 'Aprendiz' CHECK (current_rank IN ('Aprendiz', 'Cazador de Palabras', 'Guerrero Guaraní', 'Mburuvicha')),
    equipped_hat TEXT DEFAULT 'ninguno',
    equipped_outfit TEXT DEFAULT 'tradicional',
    equipped_theme TEXT DEFAULT 'chaco_verde',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. UNIDADES DE APRENDIZAJE
CREATE TABLE IF NOT EXISTS units (
    id SERIAL PRIMARY KEY,
    unit_number INT NOT NULL,
    title_guarani TEXT NOT NULL,
    title_spanish TEXT NOT NULL,
    description TEXT,
    icon TEXT NOT NULL,
    theme_color TEXT NOT NULL DEFAULT '#2D6A4F',
    cultural_notes TEXT
);

-- 4. LECCIONES
CREATE TABLE IF NOT EXISTS lessons (
    id SERIAL PRIMARY KEY,
    unit_id INT REFERENCES units(id) ON DELETE CASCADE,
    lesson_order INT NOT NULL,
    title TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'normal' CHECK (type IN ('normal', 'chest', 'checkpoint_teta')),
    xp_reward INT NOT NULL DEFAULT 15,
    coins_reward INT NOT NULL DEFAULT 10,
    cultural_capsule_title TEXT,
    cultural_capsule_content TEXT
);

-- 5. EJERCICIOS
CREATE TABLE IF NOT EXISTS exercises (
    id SERIAL PRIMARY KEY,
    lesson_id INT REFERENCES lessons(id) ON DELETE CASCADE,
    exercise_type TEXT NOT NULL CHECK (exercise_type IN (
        'card_selection',       -- Selección por tarjetas gráficas
        'sentence_builder',     -- Fichas flotantes en orden
        'special_keyboard',     -- Escritura con caracteres especiales guaraníes
        'audio_listening',      -- Onda sonora y escucha
        'nasal_discrimination'  -- Distinción vocal nasal vs oral
    )),
    prompt_spanish TEXT NOT NULL,
    prompt_guarani TEXT,
    audio_sample_text TEXT,
    correct_answer TEXT NOT NULL,
    options JSONB,              -- Opciones de tarjetas o palabras
    explanation TEXT,           -- Explicación en caso de error
    cultural_fact TEXT          -- Dato cultural emergente
);

-- 6. PROGRESO DE USUARIOS EN LECCIONES
CREATE TABLE IF NOT EXISTS user_lesson_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    lesson_id INT REFERENCES lessons(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT FALSE,
    score_percentage INT DEFAULT 0,
    stars_earned INT DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, lesson_id)
);

-- 7. CUENTOS TRADICIONALES (KASSUKUAA STORIES)
CREATE TABLE IF NOT EXISTS stories (
    id SERIAL PRIMARY KEY,
    title_guarani TEXT NOT NULL,
    title_spanish TEXT NOT NULL,
    synopsis TEXT NOT NULL,
    dialect_variant TEXT NOT NULL DEFAULT 'ava',
    difficulty_level TEXT NOT NULL DEFAULT 'facil',
    cover_image TEXT,
    xp_reward INT NOT NULL DEFAULT 30,
    dialogues JSONB NOT NULL -- Array de frases con audio, traducción e interactividad
);

-- 8. PROGRESO DE CUENTOS
CREATE TABLE IF NOT EXISTS user_story_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    story_id INT REFERENCES stories(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT FALSE,
    read_count INT DEFAULT 1,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, story_id)
);

-- 9. LIGAS COMUNALES Y RANKING
CREATE TABLE IF NOT EXISTS league_leaderboard (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    league_name TEXT NOT NULL CHECK (league_name IN ('Liga Semilla', 'Liga Vasija', 'Liga Mburuvicha')),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    weekly_xp INT NOT NULL DEFAULT 0,
    week_start_date DATE DEFAULT DATE_TRUNC('week', CURRENT_DATE),
    UNIQUE(league_name, user_id, week_start_date)
);

-- 10. RETO COMUNITARIO GLOBAL
CREATE TABLE IF NOT EXISTS community_challenge (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    target_lessons INT NOT NULL DEFAULT 10000,
    current_lessons INT NOT NULL DEFAULT 3420,
    month_year TEXT NOT NULL DEFAULT 'Septiembre 2026',
    reward_description TEXT NOT NULL
);

-- 11. CATÁLOGO DE LA TIENDA
CREATE TABLE IF NOT EXISTS shop_items (
    id SERIAL PRIMARY KEY,
    item_key TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('costume', 'hat', 'powerup', 'theme')),
    description TEXT NOT NULL,
    price_mbae INT NOT NULL,
    icon TEXT NOT NULL
);

-- 12. INVENTARIO DEL USUARIO
CREATE TABLE IF NOT EXISTS user_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    item_id INT REFERENCES shop_items(id) ON DELETE CASCADE,
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, item_id)
);

-- 13. INSIGNIAS Y LOGROS CULTURALES
CREATE TABLE IF NOT EXISTS achievements (
    id SERIAL PRIMARY KEY,
    badge_key TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    name_guarani TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    requirement_type TEXT NOT NULL,
    target_value INT NOT NULL
);

CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    achievement_id INT REFERENCES achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- Índices de consulta rápida
CREATE INDEX IF NOT EXISTS idx_lessons_unit_id ON lessons(unit_id);
CREATE INDEX IF NOT EXISTS idx_exercises_lesson_id ON exercises(lesson_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user ON user_lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_xp ON league_leaderboard(weekly_xp DESC);
