
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
  secondary: '#f8f9fa',
  accent: '#667eea',
  accentLight: '#764ba2',
  background: '#ffffff',
  backgroundAlt: '#f8f9fa',
  text: '#1a202c',
  textSecondary: '#4a5568',
  grey: '#a0aec0',
  card: '#ffffff',
  cardElevated: '#f8f9fa',
  border: '#e2e8f0',
  borderLight: '#cbd5e0',
  success: '#48bb78',
  error: '#f56565',
  warning: '#ed8936',
  info: '#4299e1',
  gradientStart: '#667eea',
  gradientEnd: '#764ba2',
  professional: {
    blue: '#3182ce',
    purple: '#805ad5',
    teal: '#319795',
    orange: '#dd6b20',
    pink: '#d53f8c',
  }
};

const darkColors = {
  primary: '#1a1d29',
  secondary: '#2d3748',
  accent: '#667eea',
  accentLight: '#764ba2',
  background: '#0f1419',
  backgroundAlt: '#1a202c',
  text: '#f7fafc',
  textSecondary: '#a0aec0',
  grey: '#4a5568',
  card: '#1a202c',
  cardElevated: '#2d3748',
  border: '#2d3748',
  borderLight: '#4a5568',
  success: '#48bb78',
  error: '#f56565',
  warning: '#ed8936',
  info: '#4299e1',
  gradientStart: '#667eea',
  gradientEnd: '#764ba2',
  professional: {
    blue: '#3182ce',
    purple: '#805ad5',
    teal: '#319795',
    orange: '#dd6b20',
    pink: '#d53f8c',
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
