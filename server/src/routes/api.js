const express = require('express');
const router = express.Router();
const {
  UNITS,
  LESSONS,
  EXERCISES_BY_LESSON,
  STORIES,
  LEAGUES_DATA,
  SHOP_ITEMS,
  ACHIEVEMENTS
} = require('../data/culturalData');

// In-Memory state for the active session / local user
let currentUser = {
  id: 'user-default-1',
  username: 'ChacoLearner',
  email: 'estudiante@guaraniapp.bo',
  dialect_variant: 'ava', // 'ava', 'izoceño', 'simba'
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
// 2. AUTHENTICATION & ONBOARDING
// ==============================================================================
router.post('/auth/register', (req, res) => {
  const { username, email, dialect_variant, age_group, daily_goal_minutes } = req.body;
  currentUser = {
    ...currentUser,
    id: 'user-' + Date.now(),
    username: username || 'Estudiante Guaraní',
    email: email || 'nuevo@guaraniapp.bo',
    dialect_variant: dialect_variant || 'ava',
    age_group: age_group || 'adulto',
    daily_goal_minutes: daily_goal_minutes || 10,
    coins_mbae: 80,
    xp_total: 0,
    streak_days: 1
  };
  res.json({ success: true, user: currentUser, message: '¡Bienvenido a GuaraniApp!' });
});

router.post('/auth/login', (req, res) => {
  const { email } = req.body;
  currentUser.email = email || currentUser.email;
  res.json({ success: true, user: currentUser, message: 'Sesión iniciada con éxito' });
});

router.post('/auth/guest', (req, res) => {
  currentUser = {
    ...currentUser,
    id: 'guest-' + Date.now(),
    username: 'Invitado Chaqueño',
    email: 'invitado@guaraniapp.bo',
    dialect_variant: req.body.dialect_variant || 'ava',
    age_group: req.body.age_group || 'adulto',
    daily_goal_minutes: req.body.daily_goal_minutes || 10,
    coins_mbae: 50,
    xp_total: 0,
    streak_days: 1
  };
  res.json({ success: true, user: currentUser, message: 'Ingreso rápido como invitado' });
});

// ==============================================================================
// 3. LEARNING UNITS & PATH
// ==============================================================================
router.get('/units', (req, res) => {
  const unitsWithLessons = UNITS.map(unit => {
    const unitLessons = LESSONS.filter(l => l.unit_id === unit.id).map(lesson => ({
      ...lesson,
      is_completed: currentUser.completed_lessons.includes(lesson.id),
      is_locked: lesson.lesson_order > 1 && !currentUser.completed_lessons.includes(lesson.id - 1) && !currentUser.completed_lessons.includes(lesson.id)
    }));
    return {
      ...unit,
      lessons: unitLessons
    };
  });

  res.json({
    success: true,
    units: unitsWithLessons,
    user_stats: {
      hearts: currentUser.hearts,
      coins_mbae: currentUser.coins_mbae,
      streak_days: currentUser.streak_days,
      xp_total: currentUser.xp_total,
      dialect_variant: currentUser.dialect_variant
    }
  });
});

// ==============================================================================
// 4. LESSON EXERCISES & COMPLETION
// ==============================================================================
router.get('/lessons/:id/exercises', (req, res) => {
  const lessonId = parseInt(req.params.id);
  const lesson = LESSONS.find(l => l.id === lessonId);
  const exercises = EXERCISES_BY_LESSON[lessonId] || EXERCISES_BY_LESSON[1];

  if (!lesson) {
    return res.status(404).json({ success: false, message: 'Lección no encontrada' });
  }

  res.json({
    success: true,
    lesson,
    exercises
  });
});

router.post('/lessons/:id/complete', (req, res) => {
  const lessonId = parseInt(req.params.id);
  const { accuracy, time_spent_seconds } = req.body;
  const lesson = LESSONS.find(l => l.id === lessonId) || { xp_reward: 15, coins_reward: 10 };

  // Calculate rewards
  const earnedXp = lesson.xp_reward || 15;
  const earnedCoins = lesson.coins_reward || 10;

  if (!currentUser.completed_lessons.includes(lessonId)) {
    currentUser.completed_lessons.push(lessonId);
  }

  currentUser.xp_total += earnedXp;
  currentUser.coins_mbae += earnedCoins;

  // Streak logic
  const today = new Date().toISOString().split('T')[0];
  if (currentUser.last_active_date !== today) {
    currentUser.streak_days += 1;
    currentUser.last_active_date = today;
  }

  res.json({
    success: true,
    message: '¡Iporãiterei! Lección completada con éxito',
    rewards: {
      xp: earnedXp,
      coins: earnedCoins,
      accuracy: accuracy || 95,
      streak_days: currentUser.streak_days
    },
    cultural_capsule: {
      title: lesson.cultural_capsule_title || 'Sabiduría del Monte Chaqueño',
      content: lesson.cultural_capsule_content || 'En la cosmovisión guaraní, cada paso en el conocimiento fortalece la memoria de nuestros abuelos.'
    },
    user: currentUser
  });
});

// ==============================================================================
// 5. STORIES (KASSUKUAA)
// ==============================================================================
router.get('/stories', (req, res) => {
  res.json({ success: true, stories: STORIES });
});

router.get('/stories/:id', (req, res) => {
  const storyId = parseInt(req.params.id);
  const story = STORIES.find(s => s.id === storyId);
  if (!story) {
    return res.status(404).json({ success: false, message: 'Cuento no encontrado' });
  }
  res.json({ success: true, story });
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
// 7. SHOP & CUSTOMIZATION
// ==============================================================================
router.get('/shop', (req, res) => {
  const itemsWithOwnership = SHOP_ITEMS.map(item => ({
    ...item,
    is_purchased: currentUser.inventory.includes(item.key),
    is_equipped: currentUser.equipped_hat === item.key || currentUser.equipped_outfit === item.key || currentUser.equipped_theme === item.key
  }));

  res.json({
    success: true,
    items: itemsWithOwnership,
    user_balance: currentUser.coins_mbae
  });
});

router.post('/shop/purchase', (req, res) => {
  const { item_key } = req.body;
  const item = SHOP_ITEMS.find(i => i.key === item_key);

  if (!item) {
    return res.status(404).json({ success: false, message: 'Artículo no encontrado' });
  }

  if (currentUser.coins_mbae < item.price_mbae) {
    return res.status(400).json({
      success: false,
      message: 'No tienes suficientes monedas Mba\'e para este artículo.'
    });
  }

  // Deduct coins & add to inventory
  currentUser.coins_mbae -= item.price_mbae;
  if (!currentUser.inventory.includes(item.key)) {
    currentUser.inventory.push(item.key);
  }

  // Handle powerups or equip immediately
  if (item.category === 'hat') currentUser.equipped_hat = item.key;
  if (item.category === 'costume') currentUser.equipped_outfit = item.key;
  if (item.category === 'theme') currentUser.equipped_theme = item.key;
  if (item.key === 'refill_hearts') currentUser.hearts = 5;

  res.json({
    success: true,
    message: `¡Has adquirido: ${item.name}!`,
    new_balance: currentUser.coins_mbae,
    user: currentUser
  });
});

// ==============================================================================
// 8. USER PROFILE, STATS & ACHIEVEMENTS
// ==============================================================================
router.get('/user/profile', (req, res) => {
  res.json({
    success: true,
    profile: currentUser,
    achievements: ACHIEVEMENTS
  });
});

router.post('/user/settings', (req, res) => {
  const { dialect_variant, age_group, daily_goal_minutes, equipped_hat, equipped_outfit } = req.body;
  if (dialect_variant) currentUser.dialect_variant = dialect_variant;
  if (age_group) currentUser.age_group = age_group;
  if (daily_goal_minutes) currentUser.daily_goal_minutes = daily_goal_minutes;
  if (equipped_hat !== undefined) currentUser.equipped_hat = equipped_hat;
  if (equipped_outfit !== undefined) currentUser.equipped_outfit = equipped_outfit;

  res.json({
    success: true,
    message: 'Preferencias guardadas correctamente',
    user: currentUser
  });
});

module.exports = router;
