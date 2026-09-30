// ==============================================================================
// GUARANIAPP - COLOR PALETTE: ORIENTE BOLIVIANO & GRAN CHACO
// ==============================================================================

// ☀️ MODO DÍA (Colores originales que ya tenías)
export const lightColors = {
  // Monte Chaqueño
  monteDark: '#1E5E3A',
  montePrimary: '#2D6A4F',
  monteMedium: '#40916C',
  monteLight: '#52B788',
  montePastel: '#D8F3DC',

  // Terracota
  terracotaDark: '#9E3D1B',
  terracotaPrimary: '#C85A32',
  terracotaMedium: '#D97736',
  terracotaLight: '#E07A5F',
  terracotaPastel: '#FCEFE9',

  // Sol
  solPrimary: '#F4A261',
  solGold: '#E9C46A',
  solLight: '#FFE8D6',

  // Arena
  sandBackground: '#FFF8F0',
  sandCard: '#FFFFFF',
  sandBorder: '#E6D7C3',
  sandMuted: '#B7A896',

  // Arete
  aretePurple: '#8E24AA',
  areteMagenta: '#D81B60',
  aretePastel: '#F3E5F5',

  // Estados
  successGreen: '#2ECC71',
  successGreenDark: '#27AE60',
  successPastel: '#EAFAF1',
  errorRed: '#E74C3C',
  errorRedDark: '#C0392B',
  errorPastel: '#FDEDEC',
  warningYellow: '#F39C12',
  infoBlue: '#3498DB',

  // Racha
  tataFire: '#FF5722',
  tataFlameYellow: '#FFC107',

  // Textos
  textPrimary: '#2B2118',
  textSecondary: '#635345',
  textMuted: '#968574',
  textLight: '#FFFFFF',

  // Bordes
  button3DBorder: 'rgba(0, 0, 0, 0.2)',
};

// 🌙 MODO NOCHE (Colores oscuros para descansar la vista)
export const darkColors = {
  // Monte - más brillante para contrastar con fondo oscuro
  monteDark: '#2D6A4F',
  montePrimary: '#52B788',
  monteMedium: '#74C69D',
  monteLight: '#95D5B2',
  montePastel: '#1B4332',  // Fondo verde oscuro

  // Terracota - tonos más cálidos y brillantes
  terracotaDark: '#E07A5F',
  terracotaPrimary: '#E9967A',
  terracotaMedium: '#F0A58E',
  terracotaLight: '#F5C6B4',
  terracotaPastel: '#3D1F14',

  // Sol - más luminoso
  solPrimary: '#FFB86B',
  solGold: '#FFD166',
  solLight: '#4A3A1F',

  // Arena - fondos oscuros
  sandBackground: '#121212',  // Fondo principal
  sandCard: '#1E1E1E',        // Tarjetas
  sandBorder: '#333333',      // Bordes
  sandMuted: '#888888',

  // Arete - púrpuras vibrantes
  aretePurple: '#BB86FC',
  areteMagenta: '#FF4081',
  aretePastel: '#2D1B33',

  // Estados
  successGreen: '#4CAF50',
  successGreenDark: '#388E3C',
  successPastel: '#1B3A1E',
  errorRed: '#EF5350',
  errorRedDark: '#C62828',
  errorPastel: '#3A1B1B',
  warningYellow: '#FFB74D',
  infoBlue: '#64B5F6',

  // Racha
  tataFire: '#FF7043',
  tataFlameYellow: '#FFD54F',

  // Textos
  textPrimary: '#F5F5F5',
  textSecondary: '#B0B0B0',
  textMuted: '#757575',
  textLight: '#FFFFFF',

  // Bordes
  button3DBorder: 'rgba(255, 255, 255, 0.1)',
};

// Export por defecto para no romper imports existentes (usa lightColors)
export const colors = lightColors;

export const typography = {
  fontFamilyRegular: 'System',
  fontFamilyBold: 'System',
};