import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';

export default function BottomNavBar() {
  const { activeTab, setActiveTab } = useApp();
  const { theme, isDark } = useTheme();

  const tabs = [
    { key: 'learn', label: 'Aprender', icon: 'map', outlineIcon: 'map-outline' },
    { key: 'translator', label: 'Traducir', icon: 'language', outlineIcon: 'language-outline' },
    { key: 'stories', label: 'Historias', icon: 'book', outlineIcon: 'book-outline' },
    { key: 'leagues', label: 'Ligas', icon: 'trophy', outlineIcon: 'trophy-outline' },
    { key: 'shop', label: 'Tienda', icon: 'cart', outlineIcon: 'cart-outline' },
    { key: 'profile', label: 'Perfil', icon: 'person', outlineIcon: 'person-outline' },
  ];

  return (
    <View style={[
      styles.navBar,
      {
        backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
        borderTopColor: isDark ? '#333333' : theme.sandBorder,
      }
    ]}>
      {tabs.map(tab => {
        const isActive = activeTab === tab.key;

        // Colores dinámicos según el tema
        const activeIconColor = isDark ? '#95D5B2' : theme.montePrimary;
        const activeLabelColor = isDark ? '#95D5B2' : theme.monteDark;
        const inactiveColor = isDark ? '#757575' : theme.textMuted;
        const activeWrapperBg = isDark ? '#1B4332' : theme.montePastel;

        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabButton, isActive && styles.tabButtonActive]}
            onPress={() => setActiveTab(tab.key)}
            activeOpacity={0.7}
          >
            <View style={[
              styles.iconWrapper,
              isActive && { backgroundColor: activeWrapperBg, ...styles.iconWrapperActive }
            ]}>
              <Ionicons
                name={isActive ? tab.icon : tab.outlineIcon}
                size={22}
                color={isActive ? activeIconColor : inactiveColor}
              />
            </View>
            <Text
              style={[
                styles.tabLabel,
                { color: isActive ? activeLabelColor : inactiveColor },
                isActive && styles.tabLabelActive
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  navBar: {
    flexDirection: 'row',
    borderTopWidth: 2,
    paddingVertical: 8,
    paddingHorizontal: 12,
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 8,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 4,
  },
  tabButtonActive: {
    transform: [{ scale: 1.05 }],
  },
  iconWrapper: {
    padding: 4,
    borderRadius: 12,
  },
  iconWrapperActive: {
    // El backgroundColor se aplica dinámicamente
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  tabLabelActive: {
    fontWeight: '800',
  },
});