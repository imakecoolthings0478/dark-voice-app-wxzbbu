
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

export const colors = {
  primary: '#1a1d29',        // Deep dark blue
  secondary: '#2d3748',      // Slate gray
  accent: '#6366f1',         // Modern indigo
  accentLight: '#8b5cf6',    // Light purple
  background: '#0a0b0f',     // Very dark background
  backgroundAlt: '#1a1d29',  // Alternative dark background
  text: '#f8fafc',           // Almost white text
  textSecondary: '#94a3b8',  // Secondary text
  grey: '#475569',           // Medium gray
  card: '#1e293b',           // Dark card background
  cardElevated: '#334155',   // Elevated card background
  border: '#334155',         // Border color
  borderLight: '#475569',    // Light border
  success: '#10b981',        // Success green
  error: '#ef4444',          // Error red
  warning: '#f59e0b',        // Warning orange
  info: '#3b82f6',           // Info blue
  
  // Gradient colors
  gradientStart: '#6366f1',
  gradientEnd: '#8b5cf6',
  
  // Professional accent colors
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

export const shadows = {
  small: {
    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.12), 0px 1px 2px rgba(0, 0, 0, 0.24)',
    elevation: 2,
  },
  medium: {
    boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.16), 0px 3px 6px rgba(0, 0, 0, 0.23)',
    elevation: 4,
  },
  large: {
    boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.19), 0px 6px 6px rgba(0, 0, 0, 0.23)',
    elevation: 8,
  },
  xl: {
    boxShadow: '0px 14px 28px rgba(0, 0, 0, 0.25), 0px 10px 10px rgba(0, 0, 0, 0.22)',
    elevation: 12,
  },
  glow: {
    boxShadow: '0px 0px 20px rgba(99, 102, 241, 0.3)',
    elevation: 8,
  },
};

export const buttonStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.accent,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...shadows.medium,
  },
  secondary: {
    backgroundColor: colors.secondary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...shadows.small,
  },
  success: {
    backgroundColor: colors.success,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...shadows.medium,
  },
  error: {
    backgroundColor: colors.error,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...shadows.medium,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.accent,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  ghost: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  modern: {
    backgroundColor: colors.accent,
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...shadows.glow,
  },
});

export const commonStyles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.background,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    maxWidth: 800,
    width: '100%',
    paddingTop: 20,
  },
  
  // Modern Typography
  title: {
    fontSize: 32,
    fontWeight: '900',
    textAlign: 'center',
    color: colors.text,
    marginBottom: 12,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    color: colors.text,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
    lineHeight: 24,
    textAlign: 'left',
  },
  textSecondary: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textSecondary,
    marginBottom: 6,
    lineHeight: 20,
    textAlign: 'left',
  },
  textSmall: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.textSecondary,
    marginBottom: 4,
    lineHeight: 16,
    textAlign: 'left',
  },
  
  // Layout
  section: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  column: {
    flexDirection: 'column',
    width: '100%',
  },
  spaceBetween: {
    justifyContent: 'space-between',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Modern Cards
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 20,
    padding: 24,
    marginVertical: 8,
    width: '100%',
    ...shadows.medium,
  },
  cardElevated: {
    backgroundColor: colors.cardElevated,
    borderColor: colors.borderLight,
    borderWidth: 1,
    borderRadius: 20,
    padding: 24,
    marginVertical: 8,
    width: '100%',
    ...shadows.large,
  },
  cardCompact: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginVertical: 6,
    width: '100%',
    ...shadows.small,
  },
  cardGlass: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderColor: 'rgba(148, 163, 184, 0.2)',
    borderWidth: 1,
    borderRadius: 20,
    padding: 24,
    marginVertical: 8,
    width: '100%',
    backdropFilter: 'blur(10px)',
    ...shadows.large,
  },
  
  // Form Elements
  textInput: {
    backgroundColor: colors.backgroundAlt,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
    color: colors.text,
    fontSize: 16,
    minHeight: 56,
    textAlignVertical: 'top',
    ...shadows.small,
  },
  textInputFocused: {
    borderColor: colors.accent,
    borderWidth: 2,
    ...shadows.glow,
  },
  textInputError: {
    borderColor: colors.error,
    borderWidth: 2,
  },
  
  // Status Indicators
  statusIndicator: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    ...shadows.medium,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'white',
    marginRight: 12,
    opacity: 0.9,
  },
  
  // Modern Chips and Tags
  chip: {
    backgroundColor: colors.backgroundAlt,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.small,
  },
  chipSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
    ...shadows.glow,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  chipTextSelected: {
    color: 'white',
    fontWeight: '700',
  },
  
  // Professional Elements
  professionalCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 32,
    marginVertical: 12,
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.large,
  },
  gradientCard: {
    borderRadius: 24,
    padding: 32,
    marginVertical: 12,
    width: '100%',
    ...shadows.xl,
  },
  glassCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 24,
    padding: 32,
    marginVertical: 12,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
    backdropFilter: 'blur(20px)',
    ...shadows.large,
  },
  
  // Icons and Images
  icon: {
    width: 24,
    height: 24,
    tintColor: colors.text,
  },
  iconLarge: {
    width: 48,
    height: 48,
    tintColor: colors.text,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.medium,
  },
  avatarLarge: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.large,
  },
  
  // Animations and Interactions
  pressable: {
    opacity: 1,
  },
  pressablePressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  
  // Modern Spacing
  marginXS: { margin: 6 },
  marginSM: { margin: 12 },
  marginMD: { margin: 20 },
  marginLG: { margin: 28 },
  marginXL: { margin: 36 },
  
  paddingXS: { padding: 6 },
  paddingSM: { padding: 12 },
  paddingMD: { padding: 20 },
  paddingLG: { padding: 28 },
  paddingXL: { padding: 36 },
  
  // Borders
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  borderLeft: {
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
  },
  borderRight: {
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  
  // Modern Effects
  neonGlow: {
    ...shadows.glow,
  },
  modernShadow: {
    boxShadow: '0px 20px 40px rgba(0, 0, 0, 0.1), 0px 1px 3px rgba(0, 0, 0, 0.08)',
    elevation: 10,
  },
  floatingCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 28,
    marginVertical: 12,
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: '0px 25px 50px rgba(0, 0, 0, 0.15), 0px 0px 0px 1px rgba(255, 255, 255, 0.05)',
    elevation: 12,
  },
});
