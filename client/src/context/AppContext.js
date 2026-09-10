import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import {
  DIALECT_VARIANTS,
  LOCAL_UNITS,
  LOCAL_EXERCISES,
  LOCAL_STORIES,
  LOCAL_SHOP_ITEMS
} from '../data/initialData';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Navigation State
  const [currentScreen, setCurrentScreen] = useState('splash'); // 'splash' | 'onboarding' | 'auth' | 'main' | 'lesson' | 'lesson_complete' | 'story_reader'
  const [activeTab, setActiveTab] = useState('learn'); // 'learn' | 'stories' | 'leagues' | 'shop' | 'profile'

  // User Profile & Gamification
  const [user, setUser] = useState({
    id: 'user-chaco-1',
    username: 'Estudiante del Chaco',
    email: 'estudiante@guaraniapp.bo',
    dialectVariant: 'ava', // 'ava' | 'izoceño' | 'simba'
    ageGroup: 'adulto',
    dailyGoalMinutes: 10,
    hearts: 5,
    maxHearts: 5,
    coinsMbae: 140,
    xpTotal: 285,
    streakDays: 3,
    lastActiveDate: new Date().toISOString().split('T')[0],
    currentRank: 'Aprendiz',
    equippedHat: 'sombrero_sao',
    equippedOutfit: 'poncho_chiquitano',
    equippedTheme: 'chaco_verde',
    completedLessons: [1],
    inventory: ['sombrero_sao', 'poncho_chiquitano']
  });

  // Current Active Lesson & Story state
  const [activeLesson, setActiveLesson] = useState(null);
  const [activeStory, setActiveStory] = useState(null);
  const [lastLessonResult, setLastLessonResult] = useState(null);

  // Accessibility / Easy Mode
  const [accessibilityMode, setAccessibilityMode] = useState({
    largeText: false,
    autoAudio: true,
    simplifiedUI: false
  });

  // Speech Pronunciation Function (cross-platform, works on Web and Mobile)
  const speakText = (text) => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.85; // Slightly slower for clear learning
        utterance.pitch = 1.0;
        // Search for Spanish or Portuguese voice as approximation for Guaraní phonetics
        const voices = window.speechSynthesis.getVoices();
        const esVoice = voices.find(v => v.lang.includes('es')) || voices[0];
        if (esVoice) utterance.voice = esVoice;
        window.speechSynthesis.speak(utterance);
      } else {
        console.log('[Audio Guaraní Pronunciación]:', text);
      }
    } catch (e) {
      console.warn('Audio no disponible:', e);
    }
  };

  // Lesson Completion Action with Exact Telemetry
  const completeLesson = (lessonId, metrics) => {
    const lesson = LOCAL_UNITS[0].lessons.find(l => l.id === lessonId) || { xp: 15, coins: 10, title: 'Lección' };
    const xpGained = metrics?.xpEarned || lesson.xp || 15;
    const coinsGained = metrics?.coinsEarned || lesson.coins || 10;

    const newCompleted = user.completedLessons.includes(lessonId)
      ? user.completedLessons
      : [...user.completedLessons, lessonId];

    setUser(prev => ({
      ...prev,
      xpTotal: prev.xpTotal + xpGained,
      coinsMbae: prev.coinsMbae + coinsGained,
      completedLessons: newCompleted
    }));

    setLastLessonResult({
      lessonId,
      title: lesson.title,
      xpGained,
      coinsGained,
      accuracy: metrics?.accuracy ?? 100,
      correctCount: metrics?.correctCount ?? 0,
      incorrectCount: metrics?.incorrectCount ?? 0,
      formattedTime: metrics?.formattedTime ?? '0:45',
      culturalCapsule: lesson.cultural_capsule || {
        title: 'Sabiduría Chaqueña',
        content: 'Cada palabra que aprendes mantiene vivas las voces de los abuelos del Chaco boliviano.'
      }
    });

    setCurrentScreen('lesson_complete');
  };

  // Lose a heart on mistake
  const loseHeart = () => {
    setUser(prev => ({
      ...prev,
      hearts: Math.max(0, prev.hearts - 1)
    }));
  };

  // Shop purchase
  const buyShopItem = (itemKey) => {
    const item = LOCAL_SHOP_ITEMS.find(i => i.key === itemKey);
    if (!item) return { success: false, message: 'Artículo no encontrado' };

    if (user.coinsMbae < item.price) {
      return { success: false, message: 'No tienes suficientes monedas Mba\'e' };
    }

    setUser(prev => {
      const newInventory = prev.inventory.includes(itemKey)
        ? prev.inventory
        : [...prev.inventory, itemKey];

      let updatedState = {
        ...prev,
        coinsMbae: prev.coinsMbae - item.price,
        inventory: newInventory
      };

      if (item.category === 'hat') updatedState.equippedHat = itemKey;
      if (item.category === 'costume') updatedState.equippedOutfit = itemKey;
      if (itemKey === 'refill_hearts') updatedState.hearts = 5;

      return updatedState;
    });

    return { success: true, message: `¡Has equipado ${item.name}!` };
  };

  // Equip already purchased item
  const equipItem = (category, itemKey) => {
    setUser(prev => {
      let update = { ...prev };
      if (category === 'hat') update.equippedHat = prev.equippedHat === itemKey ? 'ninguno' : itemKey;
      if (category === 'costume') update.equippedOutfit = prev.equippedOutfit === itemKey ? 'tradicional' : itemKey;
      return update;
    });
  };

  // Navigate helper
  const navigateTo = (screen, params = {}) => {
    if (params.lessonId) {
      const allLessons = LOCAL_UNITS.flatMap(u => u.lessons);
      const targetLesson = allLessons.find(l => l.id === params.lessonId) || allLessons[0];
      setActiveLesson(targetLesson);
    }
    if (params.storyId) {
      const targetStory = LOCAL_STORIES.find(s => s.id === params.storyId) || LOCAL_STORIES[0];
      setActiveStory(targetStory);
    }
    setCurrentScreen(screen);
  };

  return (
    <AppContext.Provider
      value={{
        currentScreen,
        setCurrentScreen,
        activeTab,
        setActiveTab,
        user,
        setUser,
        activeLesson,
        setActiveLesson,
        activeStory,
        setActiveStory,
        lastLessonResult,
        completeLesson,
        loseHeart,
        buyShopItem,
        equipItem,
        speakText,
        navigateTo,
        accessibilityMode,
        setAccessibilityMode,
        variants: DIALECT_VARIANTS
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
