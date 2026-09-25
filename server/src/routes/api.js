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

const HEART_REGEN_MINUTES = 5;

// Mapeo de íconos válidos para Ionicons
const ICON_MAP = {
  tree: 'leaf',
  jar: 'cube',
  crown: 'ribbon',
  flame: 'flame',
  sparkles: 'sparkles',
  trophy: 'trophy',
  medal: 'medal',
  star: 'star'
};

function getValidIcon(icon) {
  return ICON_MAP[icon] || icon || 'help-circle';
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
      .from('profiles').select('xp_total, coins_mbae, streak_days').eq('id', userId).single();

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
      let shouldUnlock = false;
      switch (ach.requirement_type) {
        case 'words_learned': shouldUnlock = wordsCount >= ach.target_value; break;
        case 'streak': shouldUnlock = (profile?.streak_days || 0) >= ach.target_value; break;
        case 'coins': shouldUnlock = (profile?.coins_mbae || 0) >= ach.target_value; break;
        case 'unit_completed': {
          const has100Percent = (progress || []).some(p => p.score_percentage >= 100);
          shouldUnlock = unitsCompleted.size >= ach.target_value && has100Percent;
          break;
        }
        default: shouldUnlock = false;
      }
      if (shouldUnlock) {
        const { error } = await supabaseAdmin
          .from('user_achievements').insert({ user_id: userId, achievement_id: ach.id });
        if (!error) {
          unlocked.push(ach);
          console.log(`🏆 Desbloqueado: ${ach.name} para ${userId}`);
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
      daily_goal_minutes: daily_goal_minutes || 10
    }).select().single();

  if (profileError) return res.status(400).json({ success: false, message: 'Error creando perfil: ' + profileError.message });

  res.json({
    success: true, user: profile, session: signUpData.session,
    message: signUpData.session ? '¡Bienvenido!' : 'Cuenta creada. Confirma tu correo.'
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
  const { data: profileNow } = await supabaseAdmin
    .from('profiles').select('hearts, max_hearts, heart_regen_at, last_heart_update')
    .eq('id', req.user.id).single();

  if (profileNow) {
    const now = new Date();
    const maxHearts = profileNow.max_hearts || 5;
    let hearts = profileNow.hearts;
    let regenAt = profileNow.heart_regen_at;

    if (hearts < maxHearts) {
      const lastRegen = regenAt ? new Date(regenAt) : new Date(profileNow.last_heart_update || now);
      const minutesPassed = Math.floor((now - lastRegen) / 60000);
      const heartsToAdd = Math.floor(minutesPassed / HEART_REGEN_MINUTES);
      if (heartsToAdd > 0) {
        hearts = Math.min(maxHearts, hearts + heartsToAdd);
        if (hearts >= maxHearts) regenAt = null;
        else {
          const remainingMinutes = HEART_REGEN_MINUTES - (minutesPassed % HEART_REGEN_MINUTES);
          regenAt = new Date(now.getTime() + remainingMinutes * 60000).toISOString();
        }
        await supabaseAdmin.from('profiles').update({
          hearts, heart_regen_at: regenAt, last_heart_update: now.toISOString()
        }).eq('id', req.user.id);
      }
    } else if (regenAt) {
      await supabaseAdmin.from('profiles').update({ heart_regen_at: null }).eq('id', req.user.id);
      regenAt = null;
    }
  }

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
    .select('hearts, max_hearts, heart_regen_at, coins_mbae, streak_days, xp_total, dialect_variant')
    .eq('id', req.user.id).single();
  if (profileError) return res.status(400).json({ success: false, message: profileError.message });

  res.json({ success: true, units: unitsWithLessons, user_stats: profile });
});

// ==============================================================================
// 4. LESSONS
// ==============================================================================
router.get('/lessons/:id/exercises', async (req, res) => {
  const lessonId = parseInt(req.params.id);
  const { data: lesson, error: lessonError } = await supabaseAdmin
    .from('lessons').select('*').eq('id', lessonId).single();
  if (lessonError || !lesson) return res.status(404).json({ success: false, message: 'Lección no encontrada' });

  const { data: exercises, error: exercisesError } = await supabaseAdmin
    .from('exercises').select('*').eq('lesson_id', lessonId);
  if (exercisesError) return res.status(400).json({ success: false, message: exercisesError.message });

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
    .select('xp_total, coins_mbae, streak_days, last_streak_date, hearts, max_hearts, heart_regen_at')
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

  if (updatedProfile.hearts < updatedProfile.max_hearts && !updatedProfile.heart_regen_at) {
    const regenAt = new Date(Date.now() + HEART_REGEN_MINUTES * 60000).toISOString();
    const { data: refreshed } = await supabaseAdmin
      .from('profiles').update({ heart_regen_at: regenAt })
      .eq('id', req.user.id).select().single();
    if (refreshed) updatedProfile.heart_regen_at = refreshed.heart_regen_at;
  }

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
    .from('profiles').select('coins_mbae, equipped_hat, equipped_outfit, equipped_theme')
    .eq('id', req.user.id).single();
  if (profileError) return res.status(400).json({ success: false, message: profileError.message });

  const ownedItemIds = new Set((inventoryRows || []).map(r => r.item_id));

  const itemsWithOwnership = items.map(item => ({
    ...item,
    is_purchased: ownedItemIds.has(item.id),
    is_equipped: profile.equipped_hat === item.item_key || profile.equipped_outfit === item.item_key || profile.equipped_theme === item.item_key
  }));

  res.json({ success: true, items: itemsWithOwnership, user_balance: profile.coins_mbae });
});

router.post('/shop/purchase', requireAuth, async (req, res) => {
  const { item_key } = req.body;
  const { data: item, error: itemError } = await supabaseAdmin
    .from('shop_items').select('*').eq('item_key', item_key).single();
  if (itemError || !item) return res.status(404).json({ success: false, message: 'Artículo no encontrado' });

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles').select('coins_mbae, hearts, max_hearts, equipped_hat, equipped_outfit, equipped_theme')
    .eq('id', req.user.id).single();
  if (profileError) return res.status(400).json({ success: false, message: profileError.message });

  if (profile.coins_mbae < item.price_mbae) return res.status(400).json({ success: false, message: 'Monedas insuficientes' });

  const { data: alreadyOwned } = await supabaseAdmin
    .from('user_inventory').select('id').eq('user_id', req.user.id).eq('item_id', item.id).maybeSingle();

  if (!alreadyOwned) {
    const { error: invInsertError } = await supabaseAdmin
      .from('user_inventory').insert({ user_id: req.user.id, item_id: item.id });
    if (invInsertError) return res.status(400).json({ success: false, message: invInsertError.message });
  }

  const updates = {
    coins_mbae: alreadyOwned ? profile.coins_mbae : profile.coins_mbae - item.price_mbae
  };
  if (item.category === 'hat') updates.equipped_hat = item.item_key;
  if (item.category === 'costume') updates.equipped_outfit = item.item_key;
  if (item.category === 'theme') updates.equipped_theme = item.item_key;
  if (item.item_key === 'refill_hearts') updates.hearts = profile.max_hearts;

  const { data: updatedProfile, error: updateError } = await supabaseAdmin
    .from('profiles').update(updates).eq('id', req.user.id).select().single();
  if (updateError) return res.status(400).json({ success: false, message: updateError.message });

  res.json({
    success: true, message: `¡Has adquirido: ${item.name}!`,
    new_balance: updatedProfile.coins_mbae, user: updatedProfile
  });
});

// ==============================================================================
// 8. USER PROFILE & ACHIEVEMENTS  ⭐ CON words_learned
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

  // 🔢 Calcular palabras aprendidas
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

  const achievementsWithState = achievements.map(a => {
    const currentValue = metrics[a.requirement_type] || 0;
    const progress = Math.min(100, Math.round((currentValue / a.target_value) * 100));
    return {
      ...a,
      icon: getValidIcon(a.icon),
      is_unlocked: unlockedMap.has(a.id),
      unlocked_at: unlockedMap.get(a.id) || null,
      current_value: currentValue,
      progress_percent: progress,
      progress_label: `${currentValue}/${a.target_value}`
    };
  });

  res.json({
    success: true,
    profile: {
      ...profile,
      completed_lessons,
      inventory,
      words_learned: metrics.words_learned  // 👈 AQUÍ
    },
    achievements: achievementsWithState
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
    console.log('✅ Caché HIT:', cleanText);
    return res.json({
      success: true, cached: true,
      translation: {
        id: cached.id, source_text: cached.source_text,
        translated_text: cached.translated_text, confidence: cached.confidence_score,
        notes: '', is_favorite: cached.is_favorite
      }
    });
  }

  const searchColumn = source_lang === 'es' ? 'word_spanish' : 'word_guarani';
  const { data: glossaryMatches } = await supabaseAdmin
    .from('dictionary_guarani').select('word_spanish, word_guarani')
    .ilike(searchColumn, `%${cleanText.slice(0, 40)}%`).limit(5);

  let translationResult;
  try {
    console.log('🤖 Gemini:', cleanText);
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
    success: true, cached: false,
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