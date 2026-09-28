const express = require('express');
const router = express.Router();
const {
  UNITS, LESSONS, EXERCISES_BY_LESSON, STORIES, LEAGUES_DATA, SHOP_ITEMS, ACHIEVEMENTS
} = require('../data/culturalData');
const supabaseAdmin = require('../supabaseClient');
const supabaseAuth = require('../authClient');
const requireAuth = require('../middleware/auth');

let currentUser = {
  id: 'user-default-1', username: 'ChacoLearner', email: 'estudiante@guaraniapp.bo',
  dialect_variant: 'ava', age_group: 'adulto', daily_goal_minutes: 10,
  hearts: 5, max_hearts: 5, coins_mbae: 120, xp_total: 285, streak_days: 3,
  last_active_date: new Date().toISOString().split('T')[0], current_rank: 'Aprendiz',
  equipped_hat: 'ninguno', equipped_outfit: 'tradicional', equipped_theme: 'chaco_verde',
  completed_lessons: [1], inventory: ['sombrero_sao']
};

const ICON_MAP = {
  tree: 'leaf', jar: 'cube', crown: 'ribbon',
  flame: 'flame', sparkles: 'sparkles', trophy: 'trophy',
  medal: 'medal', star: 'star'
};

function getValidIcon(icon) {
  return ICON_MAP[icon] || icon || 'help-circle';
}

function getAvatarForUser(username) {
  const name = (username || '').toLowerCase();
  if (name.includes('joel')) return 'person';
  if (name.includes('navia')) return 'leaf';
  if (name.includes('niño') || name.includes('nino')) return 'happy';
  if (name.includes('jairo')) return 'football';
  if (name.includes('prueba')) return 'flask';
  const avatars = ['paw', 'moon', 'walk', 'shield', 'sunny', 'flower', 'leaf', 'bonfire', 'water', 'fitness'];
  return avatars[name.length % avatars.length];
}

function getTargetValue(achievement, ageGroup) {
  if (achievement.target_values && typeof achievement.target_values === 'object') {
    return achievement.target_values[ageGroup] ?? achievement.target_value;
  }
  return achievement.target_value;
}

// ==============================================================================
// 🏆 Desbloquear logros automáticamente
// ==============================================================================
async function checkAndUnlockAchievements(userId) {
  const unlocked = [];
  try {
    const { data: allAchievements } = await supabaseAdmin.from('achievements').select('*');
    if (!allAchievements || allAchievements.length === 0) return unlocked;

    const { data: userAch } = await supabaseAdmin
      .from('user_achievements').select('achievement_id').eq('user_id', userId);
    const unlockedIds = new Set((userAch || []).map(r => r.achievement_id));

    const { data: profile } = await supabaseAdmin
      .from('profiles').select('age_group, xp_total, coins_mbae, streak_days')
      .eq('id', userId).single();

    const userAgeGroup = profile?.age_group || 'adulto';

    const { data: progress } = await supabaseAdmin
      .from('user_lesson_progress').select('lesson_id, score_percentage')
      .eq('user_id', userId).eq('is_completed', true);

    const { data: lessons } = await supabaseAdmin.from('lessons').select('id, unit_id');
    const { data: exercises } = await supabaseAdmin.from('exercises').select('lesson_id, correct_answer');

    const completedLessonIds = (progress || []).map(p => p.lesson_id);
    const wordsLearned = new Set();
    (exercises || [])
      .filter(ex => completedLessonIds.includes(ex.lesson_id))
      .forEach(ex => { if (ex.correct_answer) wordsLearned.add(ex.correct_answer.toLowerCase().trim()); });
    const wordsCount = wordsLearned.size;

    const unitsCompleted = new Set();
    (lessons || [])
      .filter(l => completedLessonIds.includes(l.id))
      .forEach(l => unitsCompleted.add(l.unit_id));

    for (const ach of allAchievements) {
      if (unlockedIds.has(ach.id)) continue;
      const targetValue = getTargetValue(ach, userAgeGroup);

      let shouldUnlock = false;
      switch (ach.requirement_type) {
        case 'words_learned': shouldUnlock = wordsCount >= targetValue; break;
        case 'streak':        shouldUnlock = (profile?.streak_days || 0) >= targetValue; break;
        case 'coins':         shouldUnlock = (profile?.coins_mbae || 0) >= targetValue; break;
        case 'unit_completed': {
          const has100Percent = (progress || []).some(p => p.score_percentage >= 100);
          shouldUnlock = unitsCompleted.size >= targetValue && has100Percent;
          break;
        }
        default: shouldUnlock = false;
      }
      if (shouldUnlock) {
        const { error } = await supabaseAdmin
          .from('user_achievements').insert({ user_id: userId, achievement_id: ach.id });
        if (!error) {
          unlocked.push({ ...ach, target_value: targetValue });
          console.log(`🏆 Desbloqueado: ${ach.name} (${userAgeGroup}, meta ${targetValue}) para ${userId}`);
        }
      }
    }
  } catch (e) {
    console.error('❌ [achievements] Error:', e.message);
  }
  return unlocked;
}

// ==============================================================================
// 1. HEALTH
// ==============================================================================
router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'GuaraniApp API funcionando', timestamp: new Date().toISOString() });
});

// ==============================================================================
// 2. AUTH
// ==============================================================================

// 🎯 REGISTRO CON AUTO-LOGIN
router.post('/auth/register', async (req, res) => {
  const { email, password, username, dialect_variant, age_group, daily_goal_minutes } = req.body;
  if (!supabaseAuth || !supabaseAdmin) return res.status(500).json({ success: false, message: 'Supabase no configurado' });
  if (!email || !password) return res.status(400).json({ success: false, message: 'Email y contraseña obligatorios' });

  const { data: signUpData, error: signUpError } = await supabaseAuth.auth.signUp({ email, password });
  if (signUpError) return res.status(400).json({ success: false, message: signUpError.message });

  const newUser = signUpData.user;
  if (!newUser) return res.status(400).json({ success: false, message: 'No se pudo crear el usuario.' });

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .insert({
      id: newUser.id, email,
      username: username || 'Estudiante Guaraní',
      dialect_variant: dialect_variant || 'ava',
      age_group: age_group || 'adulto',
      daily_goal_minutes: daily_goal_minutes || 10,
      coins_mbae: 100
    }).select().single();

  if (profileError) return res.status(400).json({ success: false, message: 'Error creando perfil: ' + profileError.message });

  // 🎯 Si Supabase devuelve sesión (email confirmation DESACTIVADO) → auto-login
  if (signUpData.session && signUpData.session.access_token) {
    console.log(`✅ Registro con auto-login: ${email}`);
    return res.json({
      success: true,
      user: profile,
      session: signUpData.session,
      autoLoggedIn: true,
      message: '¡Bienvenido a GuaraniApp!'
    });
  }

  // ⚠️ Si NO hay sesión (email confirmation ACTIVADO) → mensaje
  console.log(`⚠️ Registro sin auto-login (confirmar email): ${email}`);
  res.json({
    success: true,
    user: profile,
    session: null,
    autoLoggedIn: false,
    message: 'Cuenta creada. Revisa tu correo para confirmar tu cuenta.'
  });
});

router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!supabaseAuth || !supabaseAdmin) return res.status(500).json({ success: false, message: 'Supabase no configurado' });
  if (!email || !password) return res.status(400).json({ success: false, message: 'Email y contraseña obligatorios' });

  const { data, error } = await supabaseAuth.auth.signInWithPassword({ email, password });
  if (error) return res.status(401).json({ success: false, message: 'Email o contraseña incorrectos' });

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles').select('*').eq('id', data.user.id).single();
  if (profileError) return res.status(400).json({ success: false, message: 'Perfil no encontrado' });

  res.json({ success: true, user: profile, session: data.session, message: 'Sesión iniciada' });
});

// ==============================================================================
// 3. UNITS
// ==============================================================================
router.get('/units', requireAuth, async (req, res) => {
  const { data: units, error: unitsError } = await supabaseAdmin
    .from('units').select('*, lessons(*)').order('unit_number', { ascending: true });
  if (unitsError) return res.status(400).json({ success: false, message: unitsError.message });

  const { data: progressRows, error: progressError } = await supabaseAdmin
    .from('user_lesson_progress').select('lesson_id, is_completed')
    .eq('user_id', req.user.id).eq('is_completed', true);
  if (progressError) return res.status(400).json({ success: false, message: progressError.message });

  const completedLessonIds = new Set((progressRows || []).map(r => r.lesson_id));

  const unitsWithLessons = units.map(unit => {
    const sortedLessons = [...(unit.lessons || [])].sort((a, b) => a.lesson_order - b.lesson_order);
    const lessonsWithState = sortedLessons.map((lesson, idx) => {
      const previousLesson = sortedLessons[idx - 1];
      const isLocked = idx > 0 && previousLesson && !completedLessonIds.has(previousLesson.id) && !completedLessonIds.has(lesson.id);
      return { ...lesson, is_completed: completedLessonIds.has(lesson.id), is_locked: isLocked };
    });
    const { lessons, ...unitFields } = unit;
    return { ...unitFields, lessons: lessonsWithState };
  });

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('hearts, max_hearts, heart_regen_at, coins_mbae, streak_days, xp_total, dialect_variant, age_group')
    .eq('id', req.user.id).single();
  if (profileError) return res.status(400).json({ success: false, message: profileError.message });

  res.json({ success: true, units: unitsWithLessons, user_stats: profile });
});

// ==============================================================================
// 4. LESSONS
// ==============================================================================
router.get('/lessons/:id/exercises', async (req, res) => {
  const lessonId = parseInt(req.params.id);
  const ageGroup = req.query.age_group || 'adulto';

  const { data: lesson, error: lessonError } = await supabaseAdmin
    .from('lessons').select('*').eq('id', lessonId).single();
  if (lessonError || !lesson) return res.status(404).json({ success: false, message: 'Lección no encontrada' });

  const { data: exercises, error: exercisesError } = await supabaseAdmin
    .from('exercises')
    .select('*')
    .eq('lesson_id', lessonId)
    .eq('age_group', ageGroup);
  if (exercisesError) return res.status(400).json({ success: false, message: exercisesError.message });

  if (!exercises || exercises.length === 0) {
    const { data: fallback } = await supabaseAdmin
      .from('exercises')
      .select('*')
      .eq('lesson_id', lessonId)
      .eq('age_group', 'adulto');
    return res.json({ success: true, lesson, exercises: fallback || [], fallback: true });
  }

  res.json({ success: true, lesson, exercises });
});

router.post('/lessons/:id/complete', requireAuth, async (req, res) => {
  const lessonId = parseInt(req.params.id);
  const { accuracy, time_spent_seconds } = req.body;

  const { data: lesson, error: lessonError } = await supabaseAdmin
    .from('lessons')
    .select('xp_reward, coins_reward, cultural_capsule_title, cultural_capsule_content')
    .eq('id', lessonId).single();
  if (lessonError || !lesson) return res.status(404).json({ success: false, message: 'Lección no encontrada' });

  const earnedXp = lesson.xp_reward || 15;
  const earnedCoins = lesson.coins_reward || 10;

  const { error: progressError } = await supabaseAdmin
    .from('user_lesson_progress')
    .upsert({
      user_id: req.user.id, lesson_id: lessonId, is_completed: true,
      score_percentage: accuracy || 95, completed_at: new Date().toISOString()
    }, { onConflict: 'user_id,lesson_id' });
  if (progressError) return res.status(400).json({ success: false, message: progressError.message });

  const { data: profile, error: profileFetchError } = await supabaseAdmin
    .from('profiles')
    .select('xp_total, coins_mbae, streak_days, last_streak_date')
    .eq('id', req.user.id).single();
  if (profileFetchError) return res.status(400).json({ success: false, message: profileFetchError.message });

  const today = new Date().toISOString().split('T')[0];
  const isNewDay = profile.last_streak_date !== today;

  const { data: updatedProfile, error: updateError } = await supabaseAdmin
    .from('profiles')
    .update({
      xp_total: profile.xp_total + earnedXp,
      coins_mbae: profile.coins_mbae + earnedCoins,
      streak_days: isNewDay ? profile.streak_days + 1 : profile.streak_days,
      last_streak_date: today
    }).eq('id', req.user.id).select().single();
  if (updateError) return res.status(400).json({ success: false, message: updateError.message });

  const newlyUnlocked = await checkAndUnlockAchievements(req.user.id);

  res.json({
    success: true, message: '¡Iporãiterei!',
    rewards: {
      xp: earnedXp, coins: earnedCoins,
      accuracy: accuracy || 95, streak_days: updatedProfile.streak_days
    },
    cultural_capsule: {
      title: lesson.cultural_capsule_title || 'Sabiduría del Monte Chaqueño',
      content: lesson.cultural_capsule_content || 'Cada paso fortalece la memoria de nuestros abuelos.'
    },
    user: updatedProfile,
    newly_unlocked_achievements: newlyUnlocked
  });
});

// ==============================================================================
// 4.1. GAMES
// ==============================================================================
router.post('/games/:id/complete', requireAuth, async (req, res) => {
  const gameId = parseInt(req.params.id);
  const { xp_earned, coins_earned } = req.body;

  const earnedXp = xp_earned || 20;
  const earnedCoins = coins_earned || 15;

  const { error: progressError } = await supabaseAdmin
    .from('user_lesson_progress')
    .upsert({
      user_id: req.user.id, lesson_id: gameId, is_completed: true,
      score_percentage: 100, completed_at: new Date().toISOString()
    }, { onConflict: 'user_id,lesson_id' });
  if (progressError) return res.status(400).json({ success: false, message: progressError.message });

  const { data: profile, error: profileFetchError } = await supabaseAdmin
    .from('profiles')
    .select('xp_total, coins_mbae, streak_days, last_streak_date')
    .eq('id', req.user.id).single();
  if (profileFetchError) return res.status(400).json({ success: false, message: profileFetchError.message });

  const today = new Date().toISOString().split('T')[0];
  const isNewDay = profile.last_streak_date !== today;

  const { data: updatedProfile, error: updateError } = await supabaseAdmin
    .from('profiles')
    .update({
      xp_total: profile.xp_total + earnedXp,
      coins_mbae: profile.coins_mbae + earnedCoins,
      streak_days: isNewDay ? profile.streak_days + 1 : profile.streak_days,
      last_streak_date: today
    }).eq('id', req.user.id).select().single();
  if (updateError) return res.status(400).json({ success: false, message: updateError.message });

  const newlyUnlocked = await checkAndUnlockAchievements(req.user.id);

  res.json({
    success: true,
    message: '¡Iporãiterei! Ganaste el juego',
    rewards: {
      xp: earnedXp,
      coins: earnedCoins,
      streak_days: updatedProfile.streak_days
    },
    user: updatedProfile,
    newly_unlocked_achievements: newlyUnlocked
  });
});

// ==============================================================================
// 5. STORIES
// ==============================================================================
router.get('/stories', async (req, res) => {
  const { data: stories, error } = await supabaseAdmin
    .from('stories').select('*').order('id', { ascending: true });
  if (error) return res.status(400).json({ success: false, message: error.message });
  res.json({ success: true, stories });
});

router.get('/stories/:id', async (req, res) => {
  const storyId = parseInt(req.params.id);
  const { data: story, error } = await supabaseAdmin
    .from('stories').select('*').eq('id', storyId).single();
  if (error || !story) return res.status(404).json({ success: false, message: 'Cuento no encontrado' });
  res.json({ success: true, story });
});

router.post('/stories/:id/complete', requireAuth, async (req, res) => {
  const storyId = parseInt(req.params.id);
  const { data: story, error: storyError } = await supabaseAdmin
    .from('stories').select('xp_reward').eq('id', storyId).single();
  if (storyError || !story) return res.status(404).json({ success: false, message: 'Cuento no encontrado' });

  const { data: existing } = await supabaseAdmin
    .from('user_story_progress').select('read_count')
    .eq('user_id', req.user.id).eq('story_id', storyId).maybeSingle();

  const { error: progressError } = await supabaseAdmin
    .from('user_story_progress')
    .upsert({
      user_id: req.user.id, story_id: storyId, is_completed: true,
      read_count: (existing?.read_count || 0) + 1, completed_at: new Date().toISOString()
    }, { onConflict: 'user_id,story_id' });
  if (progressError) return res.status(400).json({ success: false, message: progressError.message });

  let updatedProfile = null;
  if (!existing) {
    const { data: profile } = await supabaseAdmin
      .from('profiles').select('xp_total').eq('id', req.user.id).single();
    const { data: newProfile, error: updateError } = await supabaseAdmin
      .from('profiles').update({ xp_total: profile.xp_total + story.xp_reward })
      .eq('id', req.user.id).select().single();
    if (updateError) return res.status(400).json({ success: false, message: updateError.message });
    updatedProfile = newProfile;
  }

  const newlyUnlocked = await checkAndUnlockAchievements(req.user.id);

  res.json({
    success: true, message: '¡Cuento completado!',
    xp_earned: existing ? 0 : story.xp_reward,
    user: updatedProfile,
    newly_unlocked_achievements: newlyUnlocked
  });
});

// ==============================================================================
// 6. LEAGUES
// ==============================================================================
router.get('/leagues', (req, res) => {
  res.json({ success: true, data: LEAGUES_DATA, user_league: LEAGUES_DATA.current_user_league });
});

router.get('/leagues/leaderboard', requireAuth, async (req, res) => {
  try {
    const { data: users, error } = await supabaseAdmin
      .from('profiles')
      .select('id, username, xp_total, current_rank, coins_mbae, streak_days')
      .order('xp_total', { ascending: false })
      .limit(30);

    if (error) return res.status(400).json({ success: false, message: error.message });

    const leaderboard = (users || []).map((u, idx) => ({
      rank: idx + 1,
      id: u.id,
      name: u.username || 'Estudiante',
      xp: u.xp_total || 0,
      coins: u.coins_mbae || 0,
      streak: u.streak_days || 0,
      rank_title: u.current_rank || 'Aprendiz',
      isUser: u.id === req.user.id,
      avatar: getAvatarForUser(u.username),
    }));

    const userIndex = leaderboard.findIndex(u => u.isUser);
    const userRank = userIndex >= 0 ? userIndex + 1 : null;

    const { count: totalLessons } = await supabaseAdmin
      .from('user_lesson_progress')
      .select('*', { count: 'exact', head: true })
      .eq('is_completed', true);

    const { count: totalUsers } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    res.json({
      success: true,
      leaderboard,
      user_rank: userRank,
      total_users: totalUsers || 0,
      total_visible: leaderboard.length,
      community_progress: {
        lessons: totalLessons || 0,
        target: 10000,
        users: totalUsers || 0,
      }
    });
  } catch (e) {
    console.error('❌ [leaderboard]', e.message);
    res.status(500).json({ success: false, message: e.message });
  }
});

// ==============================================================================
// 7. SHOP
// ==============================================================================
router.get('/shop', requireAuth, async (req, res) => {
  const { data: items, error: itemsError } = await supabaseAdmin
    .from('shop_items').select('*').order('id', { ascending: true });
  if (itemsError) return res.status(400).json({ success: false, message: itemsError.message });

  const { data: inventoryRows, error: invError } = await supabaseAdmin
    .from('user_inventory').select('item_id').eq('user_id', req.user.id);
  if (invError) return res.status(400).json({ success: false, message: invError.message });

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles').select('coins_mbae, hearts, max_hearts')
    .eq('id', req.user.id).single();
  if (profileError) return res.status(400).json({ success: false, message: profileError.message });

  const ownedItemIds = new Set((inventoryRows || []).map(r => r.item_id));

  const itemsWithOwnership = items.map(item => ({
    ...item,
    is_purchased: ownedItemIds.has(item.id)
  }));

  res.json({
    success: true,
    items: itemsWithOwnership,
    user_balance: profile.coins_mbae,
    user_hearts: profile.hearts,
    user_max_hearts: profile.max_hearts
  });
});

router.post('/shop/purchase', requireAuth, async (req, res) => {
  const { item_key, quantity } = req.body;
  const qty = parseInt(quantity, 10) || 1;

  const { data: item, error: itemError } = await supabaseAdmin
    .from('shop_items').select('*').eq('item_key', item_key).single();
  if (itemError || !item) return res.status(404).json({ success: false, message: 'Artículo no encontrado' });

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('coins_mbae, hearts, max_hearts, hints_available, streak_freeze_count')
    .eq('id', req.user.id).single();
  if (profileError) return res.status(400).json({ success: false, message: profileError.message });

  // 🎯 COMPRA DE CORAZONES
  if (item.item_key === 'refill_hearts') {
    const missing = profile.max_hearts - profile.hearts;
    if (missing <= 0) {
      return res.status(400).json({ success: false, message: 'Tus corazones ya están llenos' });
    }

    const finalQty = Math.min(qty, missing);
    const pricePerHeart = item.price_mbae || 6;
    const totalCost = pricePerHeart * finalQty;

    if (profile.coins_mbae < totalCost) {
      return res.status(400).json({ success: false, message: 'Mbae insuficientes' });
    }

    const { data: updatedProfile, error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        coins_mbae: profile.coins_mbae - totalCost,
        hearts: profile.hearts + finalQty
      })
      .eq('id', req.user.id).select().single();
    if (updateError) return res.status(400).json({ success: false, message: updateError.message });

    return res.json({
      success: true,
      message: `¡Recuperaste ${finalQty} corazón${finalQty > 1 ? 'es' : ''}!`,
      new_balance: updatedProfile.coins_mbae,
      user: updatedProfile,
      item_key: item.item_key,
      hearts_added: finalQty,
      cost: totalCost
    });
  }

  // ─── Otros items ───
  if (profile.coins_mbae < item.price_mbae) {
    return res.status(400).json({ success: false, message: 'Monedas insuficientes' });
  }

  const isPowerup = item.category === 'powerup';
  let alreadyOwned = null;

  if (!isPowerup) {
    const { data: owned } = await supabaseAdmin
      .from('user_inventory').select('id').eq('user_id', req.user.id).eq('item_id', item.id).maybeSingle();
    alreadyOwned = owned;
  }

  if (!isPowerup && !alreadyOwned) {
    const { error: invInsertError } = await supabaseAdmin
      .from('user_inventory').insert({ user_id: req.user.id, item_id: item.id });
    if (invInsertError) return res.status(400).json({ success: false, message: invInsertError.message });
  }

  const updates = {
    coins_mbae: profile.coins_mbae - item.price_mbae
  };

  if (item.item_key === 'streak_freeze') {
    updates.streak_freeze_count = (profile.streak_freeze_count || 0) + 1;
  }
  if (item.item_key === 'hint_magic') {
    updates.hints_available = (profile.hints_available || 0) + 1;
  }

  const { data: updatedProfile, error: updateError } = await supabaseAdmin
    .from('profiles').update(updates).eq('id', req.user.id).select().single();
  if (updateError) return res.status(400).json({ success: false, message: updateError.message });

  res.json({
    success: true,
    message: `¡Has adquirido: ${item.name}!`,
    new_balance: updatedProfile.coins_mbae,
    user: updatedProfile,
    item_key: item.item_key
  });
});

// ==============================================================================
// 7.1. USER PAY
// ==============================================================================
router.post('/user/pay', requireAuth, async (req, res) => {
  console.log('💰 [PAY] Petición recibida:', req.body);

  const { cost, reason } = req.body;
  const costNum = parseInt(cost, 10);

  if (!costNum || costNum <= 0) {
    console.log('❌ [PAY] Costo inválido:', cost);
    return res.status(400).json({ success: false, message: 'Costo inválido' });
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles').select('coins_mbae').eq('id', req.user.id).single();
  if (profileError) return res.status(400).json({ success: false, message: profileError.message });

  console.log(`💰 [PAY] Usuario tiene ${profile.coins_mbae} Mbae. Se restan ${costNum}`);

  if (profile.coins_mbae < costNum) {
    return res.status(400).json({ success: false, message: 'Mbae insuficientes' });
  }

  const { data: updatedProfile, error: updateError } = await supabaseAdmin
    .from('profiles')
    .update({ coins_mbae: profile.coins_mbae - costNum })
    .eq('id', req.user.id).select().single();
  if (updateError) return res.status(400).json({ success: false, message: updateError.message });

  console.log(`✅ [PAY] Nuevo balance: ${updatedProfile.coins_mbae}`);

  res.json({
    success: true,
    message: `-${costNum} Mbae (${reason || 'pago'})`,
    new_balance: updatedProfile.coins_mbae,
    user: updatedProfile
  });
});

// ==============================================================================
// 7.2. USER LOSE HEART
// ==============================================================================
router.post('/user/lose-heart', requireAuth, async (req, res) => {
  try {
    const { data: profile, error: fetchError } = await supabaseAdmin
      .from('profiles')
      .select('hearts, max_hearts')
      .eq('id', req.user.id)
      .single();

    if (fetchError) return res.status(400).json({ success: false, message: fetchError.message });

    if (profile.hearts <= 0) {
      return res.status(400).json({ success: false, message: 'No tienes corazones' });
    }

    const { data: updated, error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ hearts: profile.hearts - 1 })
      .eq('id', req.user.id)
      .select()
      .single();

    if (updateError) return res.status(400).json({ success: false, message: updateError.message });

    console.log(`💔 [lose-heart] Usuario ${req.user.id}: ${profile.hearts} → ${updated.hearts}`);

    res.json({
      success: true,
      hearts: updated.hearts,
      max_hearts: updated.max_hearts,
      user: updated
    });
  } catch (e) {
    console.error('❌ [lose-heart]', e.message);
    res.status(500).json({ success: false, message: e.message });
  }
});

// ==============================================================================
// 8. USER PROFILE & ACHIEVEMENTS
// ==============================================================================
router.get('/user/profile', requireAuth, async (req, res) => {
  const { data: profile, error } = await supabaseAdmin
    .from('profiles').select('*').eq('id', req.user.id).single();
  if (error) return res.status(404).json({ success: false, message: 'Perfil no encontrado' });

  const { data: progressRows } = await supabaseAdmin
    .from('user_lesson_progress').select('lesson_id, score_percentage')
    .eq('user_id', req.user.id).eq('is_completed', true);

  const completed_lessons = (progressRows || []).map(r => r.lesson_id);

  const { data: inventoryRows } = await supabaseAdmin
    .from('user_inventory').select('shop_items(item_key)').eq('user_id', req.user.id);

  const inventory = (inventoryRows || []).map(i => i.shop_items?.item_key).filter(Boolean);

  const { data: achievements, error: achError } = await supabaseAdmin
    .from('achievements').select('*').order('id', { ascending: true });
  if (achError) return res.status(400).json({ success: false, message: achError.message });

  const { data: unlockedRows, error: unlockedError } = await supabaseAdmin
    .from('user_achievements').select('achievement_id, unlocked_at').eq('user_id', req.user.id);
  if (unlockedError) return res.status(400).json({ success: false, message: unlockedError.message });

  const { data: allLessons } = await supabaseAdmin.from('lessons').select('id, unit_id');
  const { data: allExercises } = await supabaseAdmin.from('exercises').select('lesson_id, correct_answer');

  const completedIds = (progressRows || []).map(p => p.lesson_id);
  const uniqueWords = new Set();
  (allExercises || [])
    .filter(ex => completedIds.includes(ex.lesson_id))
    .forEach(ex => { if (ex.correct_answer) uniqueWords.add(ex.correct_answer.toLowerCase().trim()); });

  const unitsDone = new Set();
  (allLessons || [])
    .filter(l => completedIds.includes(l.id))
    .forEach(l => unitsDone.add(l.unit_id));

  const has100 = (progressRows || []).some(p => p.score_percentage >= 100);

  const metrics = {
    words_learned: uniqueWords.size,
    streak: profile.streak_days || 0,
    coins: profile.coins_mbae || 0,
    unit_completed: has100 ? unitsDone.size : 0
  };

  const unlockedMap = new Map((unlockedRows || []).map(r => [r.achievement_id, r.unlocked_at]));

  const userAgeGroup = profile.age_group || 'adulto';

  const achievementsWithState = achievements.map(a => {
    const targetValue = getTargetValue(a, userAgeGroup);
    const currentValue = metrics[a.requirement_type] || 0;
    const progress = Math.min(100, Math.round((currentValue / targetValue) * 100));
    return {
      ...a,
      target_value: targetValue,
      icon: getValidIcon(a.icon),
      is_unlocked: unlockedMap.has(a.id),
      unlocked_at: unlockedMap.get(a.id) || null,
      current_value: currentValue,
      progress_percent: progress,
      progress_label: `${currentValue}/${targetValue}`
    };
  });

  res.json({
    success: true,
    profile: {
      ...profile,
      completed_lessons,
      inventory,
      words_learned: metrics.words_learned
    },
    achievements: achievementsWithState
  });
});

router.post('/user/settings', requireAuth, async (req, res) => {
  const {
    dialect_variant, age_group, daily_goal_minutes, hearts
  } = req.body;

  const updates = {};
  if (dialect_variant) updates.dialect_variant = dialect_variant;
  if (age_group) updates.age_group = age_group;
  if (daily_goal_minutes) updates.daily_goal_minutes = daily_goal_minutes;

  if (hearts !== undefined) {
    updates.hearts = hearts;
    updates.last_heart_update = new Date().toISOString();
  }

  const { data: updatedUser, error } = await supabaseAdmin
    .from('profiles').update(updates).eq('id', req.user.id).select().single();
  if (error) return res.status(400).json({ success: false, message: error.message });

  res.json({ success: true, message: 'Preferencias guardadas', user: updatedUser });
});

// ==============================================================================
// 9. TRANSLATOR
// ==============================================================================
const { translateWithGemini } = require('../geminiClient');

router.post('/translate', requireAuth, async (req, res) => {
  const { text, source_lang, target_lang, dialect_variant } = req.body;
  if (!text || !text.trim()) return res.status(400).json({ success: false, message: 'Escribe algo' });
  if (!['es', 'gn'].includes(source_lang) || !['es', 'gn'].includes(target_lang))
    return res.status(400).json({ success: false, message: 'Idioma inválido' });

  const dialect = dialect_variant || 'ava';
  const cleanText = text.trim().toLowerCase();

  const { data: cached } = await supabaseAdmin
    .from('user_translations').select('*')
    .eq('user_id', req.user.id).eq('source_lang', source_lang)
    .eq('target_lang', target_lang).eq('dialect_variant', dialect)
    .ilike('source_text', cleanText).order('created_at', { ascending: false }).limit(1).maybeSingle();

  if (cached) {
    console.log('✅ CACHÉ HIT:', cleanText);
    return res.json({
      success: true, cached: true, source: 'cache',
      translation: {
        id: cached.id, source_text: cached.source_text,
        translated_text: cached.translated_text, confidence: cached.confidence_score,
        notes: '', is_favorite: cached.is_favorite
      }
    });
  }

  const searchColumn = source_lang === 'es' ? 'word_spanish' : 'word_guarani';
  const resultColumn = source_lang === 'es' ? 'word_guarani' : 'word_spanish';

  const { data: exactMatch } = await supabaseAdmin
    .from('dictionary_guarani')
    .select(`${resultColumn}, ${searchColumn}`)
    .ilike(searchColumn, cleanText)
    .limit(1)
    .maybeSingle();

  if (exactMatch && exactMatch[resultColumn]) {
    console.log('📖 DICCIONARIO HIT (exacto):', cleanText, '→', exactMatch[resultColumn]);

    const { data: saved } = await supabaseAdmin
      .from('user_translations')
      .insert({
        user_id: req.user.id,
        source_text: text.trim(),
        source_lang,
        translated_text: exactMatch[resultColumn],
        target_lang,
        dialect_variant: dialect,
        ai_model: 'dictionary-local',
        confidence_score: 100
      }).select().single();

    return res.json({
      success: true, cached: false, source: 'dictionary',
      translation: {
        id: saved?.id, source_text: text.trim(),
        translated_text: exactMatch[resultColumn],
        confidence: 100,
        notes: '📖 Traducción del diccionario local',
        is_favorite: false
      }
    });
  }

  const words = cleanText.split(/\s+/).filter(w => w.length > 1);
  if (words.length >= 2 && words.length <= 4 && source_lang === 'es') {
    const { data: allWords } = await supabaseAdmin
      .from('dictionary_guarani')
      .select('word_spanish, word_guarani')
      .in('word_spanish', words);

    if (allWords && allWords.length === words.length) {
      const translatedWords = words.map(w => {
        const match = allWords.find(a => a.word_spanish.toLowerCase() === w);
        return match?.word_guarani || w;
      });
      const composedTranslation = translatedWords.join(' ');

      console.log('📖 FRASE COMPUESTA:', cleanText, '→', composedTranslation);

      const { data: saved } = await supabaseAdmin
        .from('user_translations')
        .insert({
          user_id: req.user.id,
          source_text: text.trim(),
          source_lang,
          translated_text: composedTranslation,
          target_lang,
          dialect_variant: dialect,
          ai_model: 'dictionary-composed',
          confidence_score: 85
        }).select().single();

      return res.json({
        success: true, cached: false, source: 'dictionary-composed',
        translation: {
          id: saved?.id, source_text: text.trim(),
          translated_text: composedTranslation,
          confidence: 85,
          notes: '📖 Traducción compuesta del diccionario',
          is_favorite: false
        }
      });
    }
  }

  const { data: glossaryMatches } = await supabaseAdmin
    .from('dictionary_guarani').select('word_spanish, word_guarani')
    .ilike(searchColumn, `%${cleanText.slice(0, 40)}%`).limit(5);

  let translationResult;
  try {
    console.log('🤖 Gemini (fallback):', cleanText);
    translationResult = await translateWithGemini({
      text: text.trim(), sourceLang: source_lang, targetLang: target_lang,
      dialect, glossaryEntries: glossaryMatches || []
    });
  } catch (e) {
    console.error('❌ Gemini error:', e.message);
    return res.status(500).json({ success: false, message: 'Error: ' + e.message });
  }

  const { data: saved, error: saveError } = await supabaseAdmin
    .from('user_translations')
    .insert({
      user_id: req.user.id, source_text: text.trim(), source_lang,
      translated_text: translationResult.translation, target_lang,
      dialect_variant: dialect, ai_model: translationResult.model,
      confidence_score: translationResult.confidence
    }).select().single();

  if (saveError) console.warn('⚠️ No se pudo guardar:', saveError.message);

  res.json({
    success: true, cached: false, source: 'gemini',
    translation: {
      id: saved?.id, source_text: text.trim(),
      translated_text: translationResult.translation,
      confidence: translationResult.confidence,
      notes: translationResult.notes, is_favorite: false
    }
  });
});

router.get('/translations/history', requireAuth, async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('user_translations').select('*').eq('user_id', req.user.id)
    .order('created_at', { ascending: false }).limit(50);
  if (error) return res.status(400).json({ success: false, message: error.message });
  res.json({ success: true, translations: data });
});

router.post('/translations/:id/favorite', requireAuth, async (req, res) => {
  const { data: current, error: fetchError } = await supabaseAdmin
    .from('user_translations').select('is_favorite')
    .eq('id', req.params.id).eq('user_id', req.user.id).single();
  if (fetchError || !current) return res.status(404).json({ success: false, message: 'No encontrada' });

  const { data: updated, error: updateError } = await supabaseAdmin
    .from('user_translations').update({ is_favorite: !current.is_favorite })
    .eq('id', req.params.id).eq('user_id', req.user.id).select().single();
  if (updateError) return res.status(400).json({ success: false, message: updateError.message });

  res.json({ success: true, translation: updated });
});

router.post('/translations/:id/feedback', requireAuth, async (req, res) => {
  const { rating, suggested_correction } = req.body;
  const { error } = await supabaseAdmin
    .from('translation_feedback')
    .insert({ translation_id: req.params.id, user_id: req.user.id, rating, suggested_correction });
  if (error) return res.status(400).json({ success: false, message: error.message });
  res.json({ success: true, message: '¡Gracias por tu feedback!' });
});

module.exports = router;