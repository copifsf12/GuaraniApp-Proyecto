const express = require('express');
const router = express.Router();
const {
  UNITS,
  LESSONS,
  EXERCISES_BY_LESSON,
  LEAGUES_DATA
} = require('../data/culturalData');
const supabaseAdmin = require('../supabaseClient');
const supabaseAuth = require('../authClient');
const requireAuth = require('../middleware/auth');

// Fallback en memoria: solo se usa si Supabase no está configurado
// (por ejemplo, corriendo el server sin .env), para que la app no se rompa.
let currentUser = {
  id: 'user-default-1',
  username: 'ChacoLearner',
  email: 'estudiante@guaraniapp.bo',
  dialect_variant: 'ava',
  age_group: 'adulto',
  daily_goal_minutes: 10,
  hearts: 5,
  max_hearts: 5,
  coins_mbae: 120,
  xp_total: 285,
  streak_days: 3,
  last_active_date: new Date().toISOString().split('T')[0],
  current_rank: 'Aprendiz',
  equipped_hat: 'ninguno',
  equipped_outfit: 'tradicional',
  equipped_theme: 'chaco_verde',
  completed_lessons: [1],
  inventory: ['sombrero_sao']
};

// ==============================================================================
// 1. HEALTH & WELCOME
// ==============================================================================
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'GuaraniApp API funcionando correctamente',
    mascot: 'Aguará (Zorro Chaqueño)',
    cultural_context: 'Guaraní Oriental Boliviano (Santa Cruz, Tarija, Chuquisaca)',
    timestamp: new Date().toISOString()
  });
});

// ==============================================================================
// 2. AUTHENTICATION & ONBOARDING (Supabase Auth real)
// ==============================================================================

// Registro: crea el usuario en Supabase Auth + su fila en profiles
router.post('/auth/register', async (req, res) => {
  const { email, password, username, dialect_variant, age_group, daily_goal_minutes } = req.body;

  if (!supabaseAuth || !supabaseAdmin) {
    return res.status(500).json({ success: false, message: 'Supabase no está configurado en el servidor' });
  }
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email y contraseña son obligatorios' });
  }

  // 1. Crear el usuario en Supabase Auth
  const { data: signUpData, error: signUpError } = await supabaseAuth.auth.signUp({ email, password });

  if (signUpError) {
    return res.status(400).json({ success: false, message: signUpError.message });
  }

  const newUser = signUpData.user;
  if (!newUser) {
    return res.status(400).json({
      success: false,
      message: 'No se pudo crear el usuario. Revisa si tu proyecto exige confirmación de email.'
    });
  }

  // 2. Crear su fila en profiles (usa service_role, se salta RLS)
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .insert({
      id: newUser.id,
      email,
      username: username || 'Estudiante Guaraní',
      dialect_variant: dialect_variant || 'ava',
      age_group: age_group || 'adulto',
      daily_goal_minutes: daily_goal_minutes || 10
    })
    .select()
    .single();

  if (profileError) {
    return res.status(400).json({ success: false, message: 'Error creando el perfil: ' + profileError.message });
  }

  res.json({
    success: true,
    user: profile,
    session: signUpData.session, // puede venir null si el proyecto exige confirmar email
    message: signUpData.session
      ? '¡Bienvenido a GuaraniApp!'
      : 'Cuenta creada. Revisa tu correo para confirmar antes de iniciar sesión.'
  });
});

// Login: valida email/contraseña contra Supabase Auth y trae el perfil
router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!supabaseAuth || !supabaseAdmin) {
    return res.status(500).json({ success: false, message: 'Supabase no está configurado en el servidor' });
  }
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email y contraseña son obligatorios' });
  }

  const { data, error } = await supabaseAuth.auth.signInWithPassword({ email, password });

  if (error) {
    return res.status(401).json({ success: false, message: 'Email o contraseña incorrectos' });
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();

  if (profileError) {
    return res.status(400).json({ success: false, message: 'No se encontró el perfil de este usuario' });
  }

  res.json({
    success: true,
    user: profile,
    session: data.session, // guarda session.access_token en el cliente para futuras peticiones
    message: 'Sesión iniciada con éxito'
  });
});

// ==============================================================================
// 3. LEARNING UNITS & PATH (datos reales de Supabase)
// ==============================================================================
router.get('/units', requireAuth, async (req, res) => {
  // Trae unidades con sus lecciones anidadas (usa la FK lessons.unit_id -> units.id)
  const { data: units, error: unitsError } = await supabaseAdmin
    .from('units')
    .select('*, lessons(*)')
    .order('unit_number', { ascending: true });

  if (unitsError) {
    return res.status(400).json({ success: false, message: 'Error cargando unidades: ' + unitsError.message });
  }

  // Progreso del usuario: qué lecciones ya completó
  const { data: progressRows, error: progressError } = await supabaseAdmin
    .from('user_lesson_progress')
    .select('lesson_id, is_completed')
    .eq('user_id', req.user.id)
    .eq('is_completed', true);

  if (progressError) {
    return res.status(400).json({ success: false, message: 'Error cargando progreso: ' + progressError.message });
  }

  const completedLessonIds = new Set((progressRows || []).map(r => r.lesson_id));

  const unitsWithLessons = units.map(unit => {
    const sortedLessons = [...(unit.lessons || [])].sort((a, b) => a.lesson_order - b.lesson_order);
    const lessonsWithState = sortedLessons.map((lesson, idx) => {
      const previousLesson = sortedLessons[idx - 1];
      const isLocked = idx > 0 && previousLesson && !completedLessonIds.has(previousLesson.id) && !completedLessonIds.has(lesson.id);
      return {
        ...lesson,
        is_completed: completedLessonIds.has(lesson.id),
        is_locked: isLocked
      };
    });
    const { lessons, ...unitFields } = unit;
    return { ...unitFields, lessons: lessonsWithState };
  });

  // Estadísticas del usuario, desde su perfil real
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('hearts, coins_mbae, streak_days, xp_total, dialect_variant')
    .eq('id', req.user.id)
    .single();

  if (profileError) {
    return res.status(400).json({ success: false, message: 'Error cargando el perfil: ' + profileError.message });
  }

  res.json({
    success: true,
    units: unitsWithLessons,
    user_stats: profile
  });
});

// ==============================================================================
// 4. LESSON EXERCISES & COMPLETION (datos reales de Supabase)
// ==============================================================================
router.get('/lessons/:id/exercises', async (req, res) => {
  const lessonId = parseInt(req.params.id);

  const { data: lesson, error: lessonError } = await supabaseAdmin
    .from('lessons')
    .select('*')
    .eq('id', lessonId)
    .single();

  if (lessonError || !lesson) {
    return res.status(404).json({ success: false, message: 'Lección no encontrada' });
  }

  const { data: exercises, error: exercisesError } = await supabaseAdmin
    .from('exercises')
    .select('*')
    .eq('lesson_id', lessonId);

  if (exercisesError) {
    return res.status(400).json({ success: false, message: 'Error cargando ejercicios: ' + exercisesError.message });
  }

  res.json({
    success: true,
    lesson,
    exercises
  });
});

router.post('/lessons/:id/complete', requireAuth, async (req, res) => {
  const lessonId = parseInt(req.params.id);
  const { accuracy, time_spent_seconds } = req.body;

  const { data: lesson, error: lessonError } = await supabaseAdmin
    .from('lessons')
    .select('xp_reward, coins_reward, cultural_capsule_title, cultural_capsule_content')
    .eq('id', lessonId)
    .single();

  if (lessonError || !lesson) {
    return res.status(404).json({ success: false, message: 'Lección no encontrada' });
  }

  const earnedXp = lesson.xp_reward || 15;
  const earnedCoins = lesson.coins_reward || 10;

  // Registra/actualiza el progreso de esta lección para este usuario
  const { error: progressError } = await supabaseAdmin
    .from('user_lesson_progress')
    .upsert({
      user_id: req.user.id,
      lesson_id: lessonId,
      is_completed: true,
      score_percentage: accuracy || 95,
      completed_at: new Date().toISOString()
    }, { onConflict: 'user_id,lesson_id' });

  if (progressError) {
    return res.status(400).json({ success: false, message: 'Error guardando progreso: ' + progressError.message });
  }

  // Trae el perfil actual para calcular racha y sumar xp/monedas
  const { data: profile, error: profileFetchError } = await supabaseAdmin
    .from('profiles')
    .select('xp_total, coins_mbae, streak_days, last_streak_date')
    .eq('id', req.user.id)
    .single();

  if (profileFetchError) {
    return res.status(400).json({ success: false, message: 'Error leyendo el perfil: ' + profileFetchError.message });
  }

  const today = new Date().toISOString().split('T')[0];
  const isNewDay = profile.last_streak_date !== today;

  const { data: updatedProfile, error: updateError } = await supabaseAdmin
    .from('profiles')
    .update({
      xp_total: profile.xp_total + earnedXp,
      coins_mbae: profile.coins_mbae + earnedCoins,
      streak_days: isNewDay ? profile.streak_days + 1 : profile.streak_days,
      last_streak_date: today
    })
    .eq('id', req.user.id)
    .select()
    .single();

  if (updateError) {
    return res.status(400).json({ success: false, message: 'Error actualizando el perfil: ' + updateError.message });
  }

  res.json({
    success: true,
    message: '¡Iporãiterei! Lección completada con éxito',
    rewards: {
      xp: earnedXp,
      coins: earnedCoins,
      accuracy: accuracy || 95,
      streak_days: updatedProfile.streak_days
    },
    cultural_capsule: {
      title: lesson.cultural_capsule_title || 'Sabiduría del Monte Chaqueño',
      content: lesson.cultural_capsule_content || 'En la cosmovisión guaraní, cada paso en el conocimiento fortalece la memoria de nuestros abuelos.'
    },
    user: updatedProfile
  });
});

// ==============================================================================
// 5. STORIES (KASSUKUAA) - datos reales de Supabase
// ==============================================================================
router.get('/stories', requireAuth, async (req, res) => {
  const { data: stories, error } = await supabaseAdmin
    .from('stories')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    return res.status(400).json({ success: false, message: 'Error cargando cuentos: ' + error.message });
  }

  const { data: progressRows, error: progressError } = await supabaseAdmin
    .from('user_story_progress')
    .select('story_id, is_completed')
    .eq('user_id', req.user.id);

  if (progressError) {
    return res.status(400).json({ success: false, message: 'Error cargando progreso de cuentos: ' + progressError.message });
  }

  const completedIds = new Set((progressRows || []).filter(r => r.is_completed).map(r => r.story_id));

  res.json({
    success: true,
    stories: stories.map(s => ({ ...s, is_completed: completedIds.has(s.id) }))
  });
});

router.get('/stories/:id', requireAuth, async (req, res) => {
  const storyId = parseInt(req.params.id);
  const { data: story, error } = await supabaseAdmin
    .from('stories')
    .select('*')
    .eq('id', storyId)
    .single();

  if (error || !story) {
    return res.status(404).json({ success: false, message: 'Cuento no encontrado' });
  }
  res.json({ success: true, story });
});

router.post('/stories/:id/complete', requireAuth, async (req, res) => {
  const storyId = parseInt(req.params.id);

  const { data: story, error: storyError } = await supabaseAdmin
    .from('stories')
    .select('xp_reward')
    .eq('id', storyId)
    .single();

  if (storyError || !story) {
    return res.status(404).json({ success: false, message: 'Cuento no encontrado' });
  }

  const { data: existing } = await supabaseAdmin
    .from('user_story_progress')
    .select('id, read_count')
    .eq('user_id', req.user.id)
    .eq('story_id', storyId)
    .maybeSingle();

  const alreadyCompleted = !!existing;

  const { error: progressError } = await supabaseAdmin
    .from('user_story_progress')
    .upsert({
      user_id: req.user.id,
      story_id: storyId,
      is_completed: true,
      read_count: (existing?.read_count || 0) + 1,
      completed_at: new Date().toISOString()
    }, { onConflict: 'user_id,story_id' });

  if (progressError) {
    return res.status(400).json({ success: false, message: 'Error guardando progreso del cuento: ' + progressError.message });
  }

  // El XP solo se otorga la primera vez que se completa el cuento
  let updatedProfile = null;
  if (!alreadyCompleted) {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('xp_total')
      .eq('id', req.user.id)
      .single();

    const { data: updated, error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ xp_total: (profile?.xp_total || 0) + story.xp_reward })
      .eq('id', req.user.id)
      .select()
      .single();

    if (updateError) {
      return res.status(400).json({ success: false, message: 'Error actualizando XP: ' + updateError.message });
    }
    updatedProfile = updated;
  }

  res.json({
    success: true,
    message: alreadyCompleted ? 'Cuento releído' : `¡Ganaste ${story.xp_reward} XP!`,
    xp_gained: alreadyCompleted ? 0 : story.xp_reward,
    user: updatedProfile
  });
});

// ==============================================================================
// 6. LEAGUES & COMMUNITY CHALLENGE
// ==============================================================================
router.get('/leagues', (req, res) => {
  res.json({
    success: true,
    data: LEAGUES_DATA,
    user_league: LEAGUES_DATA.current_user_league
  });
});

// ==============================================================================
// 7. SHOP & CUSTOMIZATION - datos reales de Supabase
// ==============================================================================
router.get('/shop', requireAuth, async (req, res) => {
  const { data: items, error } = await supabaseAdmin
    .from('shop_items')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    return res.status(400).json({ success: false, message: 'Error cargando la tienda: ' + error.message });
  }

  const { data: inventoryRows, error: invError } = await supabaseAdmin
    .from('user_inventory')
    .select('item_id')
    .eq('user_id', req.user.id);

  if (invError) {
    return res.status(400).json({ success: false, message: 'Error cargando inventario: ' + invError.message });
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('coins_mbae, equipped_hat, equipped_outfit, equipped_theme')
    .eq('id', req.user.id)
    .single();

  if (profileError) {
    return res.status(400).json({ success: false, message: 'Error cargando el perfil: ' + profileError.message });
  }

  const ownedIds = new Set((inventoryRows || []).map(r => r.item_id));

  const itemsWithOwnership = items.map(item => ({
    ...item,
    is_purchased: ownedIds.has(item.id),
    is_equipped: profile.equipped_hat === item.item_key || profile.equipped_outfit === item.item_key || profile.equipped_theme === item.item_key
  }));

  res.json({
    success: true,
    items: itemsWithOwnership,
    user_balance: profile.coins_mbae
  });
});

router.post('/shop/purchase', requireAuth, async (req, res) => {
  const { item_key } = req.body;

  const { data: item, error: itemError } = await supabaseAdmin
    .from('shop_items')
    .select('*')
    .eq('item_key', item_key)
    .single();

  if (itemError || !item) {
    return res.status(404).json({ success: false, message: 'Artículo no encontrado' });
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('coins_mbae, max_hearts')
    .eq('id', req.user.id)
    .single();

  if (profileError) {
    return res.status(400).json({ success: false, message: 'Error leyendo el perfil: ' + profileError.message });
  }

  const { data: existingOwned } = await supabaseAdmin
    .from('user_inventory')
    .select('id')
    .eq('user_id', req.user.id)
    .eq('item_id', item.id)
    .maybeSingle();

  // Las recargas de vida son consumibles: se pueden comprar varias veces
  const isConsumable = item.item_key === 'refill_hearts';

  if (existingOwned && !isConsumable) {
    return res.status(400).json({ success: false, message: 'Ya tienes este artículo.' });
  }

  if (profile.coins_mbae < item.price_mbae) {
    return res.status(400).json({
      success: false,
      message: 'No tienes suficientes monedas Mba\'e para este artículo.'
    });
  }

  const profileUpdates = { coins_mbae: profile.coins_mbae - item.price_mbae };
  if (item.category === 'hat') profileUpdates.equipped_hat = item.item_key;
  if (item.category === 'costume') profileUpdates.equipped_outfit = item.item_key;
  if (item.category === 'theme') profileUpdates.equipped_theme = item.item_key;
  if (item.item_key === 'refill_hearts') profileUpdates.hearts = profile.max_hearts;

  if (!existingOwned) {
    const { error: invInsertError } = await supabaseAdmin
      .from('user_inventory')
      .insert({ user_id: req.user.id, item_id: item.id });

    if (invInsertError) {
      return res.status(400).json({ success: false, message: 'Error guardando la compra: ' + invInsertError.message });
    }
  }

  const { data: updatedProfile, error: updateError } = await supabaseAdmin
    .from('profiles')
    .update(profileUpdates)
    .eq('id', req.user.id)
    .select()
    .single();

  if (updateError) {
    return res.status(400).json({ success: false, message: 'Error actualizando el perfil: ' + updateError.message });
  }

  res.json({
    success: true,
    message: `¡Has adquirido: ${item.name}!`,
    new_balance: updatedProfile.coins_mbae,
    user: updatedProfile
  });
});

// ==============================================================================
// 8. USER PROFILE, STATS & ACHIEVEMENTS
// ==============================================================================
// Requiere Authorization: Bearer <access_token> (viene del login/registro)
router.get('/user/profile', requireAuth, async (req, res) => {
  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', req.user.id)
    .single();

  if (error) {
    return res.status(404).json({ success: false, message: 'Perfil no encontrado' });
  }

  const { data: achievements, error: achError } = await supabaseAdmin
    .from('achievements')
    .select('*')
    .order('id', { ascending: true });

  if (achError) {
    return res.status(400).json({ success: false, message: 'Error cargando logros: ' + achError.message });
  }

  const { count: completedLessonsCount, error: countError } = await supabaseAdmin
    .from('user_lesson_progress')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', req.user.id)
    .eq('is_completed', true);

  if (countError) {
    return res.status(400).json({ success: false, message: 'Error calculando progreso: ' + countError.message });
  }

  // Aproximación: cada lección completada enseña ~5 palabras nuevas
  // (no hay una tabla de vocabulario aprendido palabra por palabra todavía)
  const progressByRequirement = {
    words_learned: (completedLessonsCount || 0) * 5,
    streak: profile.streak_days,
    coins: profile.coins_mbae
  };

  const achievementsWithProgress = achievements.map(a => {
    const current = progressByRequirement[a.requirement_type] ?? 0;
    const capped = Math.min(current, a.target_value);
    return {
      ...a,
      unlocked: current >= a.target_value,
      progress: `${capped}/${a.target_value}`
    };
  });

  res.json({
    success: true,
    profile,
    achievements: achievementsWithProgress
  });
});

router.post('/user/settings', requireAuth, async (req, res) => {
  const { dialect_variant, age_group, daily_goal_minutes, equipped_hat, equipped_outfit } = req.body;

  const updates = {};
  if (dialect_variant) updates.dialect_variant = dialect_variant;
  if (age_group) updates.age_group = age_group;
  if (daily_goal_minutes) updates.daily_goal_minutes = daily_goal_minutes;
  if (equipped_hat !== undefined) updates.equipped_hat = equipped_hat;
  if (equipped_outfit !== undefined) updates.equipped_outfit = equipped_outfit;

  const { data: updatedUser, error } = await supabaseAdmin
    .from('profiles')
    .update(updates)
    .eq('id', req.user.id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ success: false, message: 'Error guardando preferencias: ' + error.message });
  }

  res.json({
    success: true,
    message: 'Preferencias guardadas correctamente',
    user: updatedUser
  });
});

module.exports = router;