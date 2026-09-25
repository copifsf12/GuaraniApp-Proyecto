import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// En web usamos localhost. En un celular físico con Expo Go, localhost
// apunta al propio celular, así que hay que usar la IP de tu compu en la
// misma red WiFi (ej: http://192.168.1.5:5000). Puedes definirla en
// client/.env como EXPO_PUBLIC_API_URL=http://TU_IP:5000
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

const SESSION_KEY = 'guaraniapp_session';

async function saveSession(session) {
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

async function loadSession() {
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  // CORRECCIÓN: Evita el colapso si la memoria guardó la palabra "undefined" por error
  return (raw && raw !== "undefined") ? JSON.parse(raw) : null;
}

async function clearSession() {
  await AsyncStorage.removeItem(SESSION_KEY);
}

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_URL}/api${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });
  } catch (networkError) {
    throw new Error(
      `No se pudo conectar con el servidor (${API_URL}). ¿Está corriendo "npm start" en la carpeta server?`
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.success === false) {
    throw new Error(data.message || 'Ocurrió un error inesperado');
  }

  return data;
}

// ---- Auth ----
export async function registerRequest({ email, password, username, dialect_variant, age_group, daily_goal_minutes }) {
  return request('/auth/register', {
    method: 'POST',
    body: { email, password, username, dialect_variant, age_group, daily_goal_minutes }
  });
}

export async function loginRequest({ email, password }) {
  return request('/auth/login', { method: 'POST', body: { email, password } });
}

// ---- Perfil ----
export async function fetchProfile(token) {
  return request('/user/profile', { token });
}

export async function saveSettings(token, settings) {
  return request('/user/settings', { method: 'POST', body: settings, token });
}

// ---- Unidades y lecciones ----
// Normaliza la forma de datos del backend a la misma forma que ya usaban
// las pantallas (LOCAL_UNITS en initialData.js), para no tener que reescribir
// todas las pantallas de una sola vez.
export async function fetchUnits(token) {
  const data = await request('/units', { token });
  const units = data.units.map(unit => ({
    ...unit,
    lessons: (unit.lessons || []).map(lesson => ({
      ...lesson,
      xp: lesson.xp_reward,
      coins: lesson.coins_reward,
      cultural_capsule: {
        title: lesson.cultural_capsule_title,
        content: lesson.cultural_capsule_content
      }
    }))
  }));
  return { units, userStats: data.user_stats };
}

export async function fetchLessonExercises(token, lessonId) {
  const data = await request(`/lessons/${lessonId}/exercises`, { token });

  // Normaliza los nombres de campo de Supabase a los que ya usan las pantallas
  // (type, audio_text, chips, special_keys), igual que hicimos con units/lessons.
  const exercises = (data.exercises || []).map(ex => {
    const base = {
      id: ex.id,
      type: ex.exercise_type,
      prompt_spanish: ex.prompt_spanish,
      prompt_guarani: ex.prompt_guarani,
      audio_text: ex.audio_sample_text,
      correct_answer: ex.correct_answer,
      explanation: ex.explanation,
      cultural_fact: ex.cultural_fact
    };

    if (ex.exercise_type === 'sentence_builder') {
      return { ...base, chips: ex.options || [] };
    }
    if (ex.exercise_type === 'special_keyboard') {
      return { ...base, special_keys: ex.options || [] };
    }
    // card_selection, nasal_discrimination, audio_listening
    return { ...base, options: ex.options || [] };
  });

  return { lesson: data.lesson, exercises };
}

export async function completeLessonRequest(token, lessonId, { accuracy, time_spent_seconds }) {
  return request(`/lessons/${lessonId}/complete`, {
    method: 'POST',
    body: { accuracy, time_spent_seconds },
    token
  });
}

// ---- Cuentos (Kassukuaa Stories) ----
export async function fetchStories(token) {
  const data = await request('/stories', { token });
  // Normaliza a la forma que ya usaba StoriesScreen (LOCAL_STORIES)
  return data.stories.map(story => ({
    ...story,
    xp: story.xp_reward,
    dialogues: (story.dialogues || []).map(line => ({
      ...line,
      guarani: line.text_guarani,
      spanish: line.text_spanish
    }))
  }));
}

export async function completeStoryRequest(token, storyId) {
  return request(`/stories/${storyId}/complete`, { method: 'POST', token });
}

// ---- Tienda ----
export async function fetchShop(token) {
  const data = await request('/shop', { token });
  return {
    items: data.items.map(item => ({
      ...item,
      key: item.item_key,
      price: item.price_mbae
    })),
    balance: data.user_balance
  };
}

export async function purchaseItemRequest(token, itemKey) {
  return request('/shop/purchase', { method: 'POST', body: { item_key: itemKey }, token });
}

// ---- Traductor con IA ----
export async function translateRequest(token, { text, source_lang, target_lang, dialect_variant }) {
  return request('/translate', {
    method: 'POST',
    body: { text, source_lang, target_lang, dialect_variant },
    token
  });
}

export async function fetchTranslationHistory(token) {
  const data = await request('/translations/history', { token });
  return data.translations;
}

export async function toggleFavoriteTranslation(token, translationId) {
  return request(`/translations/${translationId}/favorite`, { method: 'POST', token });
}

export const sessionStorage = { saveSession, loadSession, clearSession };