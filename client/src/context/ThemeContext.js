import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors } from '../theme/colors';

const ThemeContext = createContext();

const THEME_STORAGE_KEY = '@guarani_theme_mode';

export function ThemeProvider({ children }) {
  const [themeMode, setThemeMode] = useState('light'); // 'light' | 'dark'
  const [isLoading, setIsLoading] = useState(true);

  // Cargar el tema guardado al iniciar la app
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme === 'dark' || savedTheme === 'light') {
          setThemeMode(savedTheme);
        }
      } catch (e) {
        console.warn('Error cargando tema:', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadTheme();
  }, []);

  // Cambiar entre modo día y noche
  const toggleTheme = async () => {
    const newMode = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newMode);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newMode);
    } catch (e) {
      console.warn('Error guardando tema:', e);
    }
  };

  // Colores activos según el modo
  const theme = themeMode === 'light' ? lightColors : darkColors;

  const value = {
    themeMode,
    theme,          // Objeto con los colores activos
    isDark: themeMode === 'dark',
    toggleTheme,
    isLoading,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook personalizado para usar el tema en cualquier componente
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe usarse dentro de un ThemeProvider');
  }
  return context;
}