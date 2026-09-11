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
  return raw ? JSON.parse(raw) : null;
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
  return data;
}

export async function completeLessonRequest(token, lessonId, { accuracy, time_spent_seconds }) {
  return request(`/lessons/${lessonId}/complete`, {
    method: 'POST',
    body: { accuracy, time_spent_seconds },
    token
  });
}

// ---- Cuentos (Stories) ----
// Normaliza los campos de Supabase (title_guarani, dialect_variant, xp_reward,
// dialogues[].text_guarani...) a la forma que ya usaba StoriesScreen.js
// (dialect, difficulty, xp, dialogues[].guarani/spanish), para no reescribir la pantalla.
export async function fetchStories(token) {
  const data = await request('/stories', { token });
  return data.stories.map(story => ({
    ...story,
    dialect: story.dialect_variant,
    difficulty: story.difficulty_level,
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
const SHOP_TAGS = {
  hat: 'Accesorio Típico',
  costume: 'Ropa Típica',
  powerup: 'Potenciador',
  theme: 'Personalización'
};

// Normaliza item_key -> key, price_mbae -> price (forma que ya usaba ShopScreen.js)
export async function fetchShop(token) {
  const data = await request('/shop', { token });
  return {
    items: data.items.map(item => ({
      ...item,
      key: item.item_key,
      price: item.price_mbae,
      tag: SHOP_TAGS[item.category] || ''
    })),
    balance: data.user_balance
  };
}

export async function purchaseShopItemRequest(token, itemKey) {
  return request('/shop/purchase', { method: 'POST', body: { item_key: itemKey }, token });
}

export const sessionStorage = { saveSession, loadSession, clearSession };