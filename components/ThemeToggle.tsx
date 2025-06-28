import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Sun, Moon, Smartphone } from 'lucide-react-native';
import { useTheme, ThemeMode } from '@/contexts/ThemeContext';

export default function ThemeToggle() {
  const { theme, themeMode, setThemeMode } = useTheme();

  const modes: { key: ThemeMode; label: string; icon: React.ComponentType<any> }[] = [
    { key: 'light', label: 'Light', icon: Sun },
    { key: 'dark', label: 'Dark', icon: Moon },
    { key: 'system', label: 'System', icon: Smartphone },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.card }]}>
      <Text style={[styles.title, { color: theme.text }]}>Appearance</Text>
      <View style={styles.toggleContainer}>
        {modes.map((mode) => {
          const Icon = mode.icon;
          const isSelected = themeMode === mode.key;
          
          return (
            <TouchableOpacity
              key={mode.key}
              style={[
                styles.toggleButton,
                {
                  backgroundColor: isSelected ? theme.primary : theme.background,
                  borderColor: theme.border,
                }
              ]}
              onPress={() => setThemeMode(mode.key)}
            >
              <Icon 
                size={20} 
                color={isSelected ? '#FFFFFF' : theme.textSecondary} 
              />
              <Text style={[
                styles.toggleText,
                { color: isSelected ? '#FFFFFF' : theme.textSecondary }
              ]}>
                {mode.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  toggleText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
});