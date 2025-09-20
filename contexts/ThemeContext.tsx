
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  colors: typeof darkColors;
}

const lightColors = {
  primary: '#ffffff',
  secondary: '#f1f5f9',
  accent: '#6366f1',
  accentLight: '#8b5cf6',
  background: '#ffffff',
  backgroundAlt: '#f8fafc',
  text: '#0f172a',
  textSecondary: '#475569',
  grey: '#94a3b8',
  card: '#ffffff',
  cardElevated: '#f8fafc',
  border: '#e2e8f0',
  borderLight: '#cbd5e0',
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
  gradientStart: '#6366f1',
  gradientEnd: '#8b5cf6',
  professional: {
    blue: '#3b82f6',
    purple: '#8b5cf6',
    teal: '#06b6d4',
    orange: '#f97316',
    pink: '#ec4899',
    emerald: '#10b981',
    violet: '#7c3aed',
    rose: '#f43f5e',
  }
};

const darkColors = {
  primary: '#1a1d29',
  secondary: '#2d3748',
  accent: '#6366f1',
  accentLight: '#8b5cf6',
  background: '#0a0b0f',
  backgroundAlt: '#1a1d29',
  text: '#f8fafc',
  textSecondary: '#94a3b8',
  grey: '#475569',
  card: '#1e293b',
  cardElevated: '#334155',
  border: '#334155',
  borderLight: '#475569',
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
  gradientStart: '#6366f1',
  gradientEnd: '#8b5cf6',
  professional: {
    blue: '#3b82f6',
    purple: '#8b5cf6',
    teal: '#06b6d4',
    orange: '#f97316',
    pink: '#ec4899',
    emerald: '#10b981',
    violet: '#7c3aed',
    rose: '#f43f5e',
  }
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark'); // Default to dark theme

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setTheme(savedTheme);
        console.log('Loaded theme:', savedTheme);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    try {
      await AsyncStorage.setItem('theme', newTheme);
      console.log('Theme changed to:', newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const colors = theme === 'light' ? lightColors : darkColors;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
