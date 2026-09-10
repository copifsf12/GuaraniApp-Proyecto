import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';

export default function BottomNavBar() {
  const { activeTab, setActiveTab } = useApp();

  const tabs = [
    { key: 'learn', label: 'Aprender', icon: 'map', outlineIcon: 'map-outline' },
    { key: 'stories', label: 'Historias', icon: 'book', outlineIcon: 'book-outline' },
    { key: 'leagues', label: 'Ligas', icon: 'trophy', outlineIcon: 'trophy-outline' },
    { key: 'shop', label: 'Tienda', icon: 'cart', outlineIcon: 'cart-outline' },
    { key: 'profile', label: 'Perfil', icon: 'person', outlineIcon: 'person-outline' },
  ];

  return (
    <View style={styles.navBar}>
      {tabs.map(tab => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabButton, isActive && styles.tabButtonActive]}
            onPress={() => setActiveTab(tab.key)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrapper, isActive && styles.iconWrapperActive]}>
              <Ionicons
                name={isActive ? tab.icon : tab.outlineIcon}
                size={22}
                color={isActive ? colors.montePrimary : colors.textMuted}
              />
            </View>
            <Text
              style={[
                styles.tabLabel,
                { color: isActive ? colors.monteDark : colors.textMuted },
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
    backgroundColor: '#FFFFFF',
    borderTopWidth: 2,
    borderTopColor: colors.sandBorder,
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
    backgroundColor: colors.montePastel,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  tabLabelActive: {
    fontWeight: '800',
  },
});
