
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

export const colors = {
  primary: '#1a1d29',        // Deep dark blue
  secondary: '#2d3748',      // Slate gray
  accent: '#667eea',         // Modern purple-blue
  accentLight: '#764ba2',    // Light purple
  background: '#0f1419',     // Very dark background
  backgroundAlt: '#1a202c',  // Alternative dark background
  text: '#f7fafc',           // Almost white text
  textSecondary: '#a0aec0',  // Secondary text
  grey: '#4a5568',           // Medium gray
  card: '#1a202c',           // Dark card background
  cardElevated: '#2d3748',   // Elevated card background
  border: '#2d3748',         // Border color
  borderLight: '#4a5568',    // Light border
  success: '#48bb78',        // Success green
  error: '#f56565',          // Error red
  warning: '#ed8936',        // Warning orange
  info: '#4299e1',           // Info blue
  
  // Gradient colors
  gradientStart: '#667eea',
  gradientEnd: '#764ba2',
  
  // Professional accent colors
  professional: {
    blue: '#3182ce',
    purple: '#805ad5',
    teal: '#319795',
    orange: '#dd6b20',
    pink: '#d53f8c',
  }
};

export const shadows = {
  small: {
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  medium: {
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)',
    elevation: 4,
  },
  large: {
    boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.2)',
    elevation: 8,
  },
  xl: {
    boxShadow: '0px 12px 24px rgba(0, 0, 0, 0.25)',
    elevation: 12,
  },
};

export const buttonStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.accent,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...shadows.medium,
  },
  secondary: {
    backgroundColor: colors.secondary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...shadows.small,
  },
  success: {
    backgroundColor: colors.success,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...shadows.medium,
  },
  error: {
    backgroundColor: colors.error,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
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
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  ghost: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
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
  
  // Typography
  title: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    color: colors.text,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    color: colors.text,
    marginBottom: 8,
    letterSpacing: -0.3,
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
  
  // Cards
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 24,
    marginVertical: 8,
    width: '100%',
    ...shadows.medium,
  },
  cardElevated: {
    backgroundColor: colors.cardElevated,
    borderColor: colors.borderLight,
    borderWidth: 1,
    borderRadius: 16,
    padding: 24,
    marginVertical: 8,
    width: '100%',
    ...shadows.large,
  },
  cardCompact: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    width: '100%',
    ...shadows.small,
  },
  
  // Form Elements
  textInput: {
    backgroundColor: colors.backgroundAlt,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    color: colors.text,
    fontSize: 16,
    minHeight: 50,
    textAlignVertical: 'top',
    ...shadows.small,
  },
  textInputFocused: {
    borderColor: colors.accent,
    borderWidth: 2,
    ...shadows.medium,
  },
  textInputError: {
    borderColor: colors.error,
    borderWidth: 2,
  },
  
  // Status Indicators
  statusIndicator: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    ...shadows.medium,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'white',
    marginRight: 12,
    opacity: 0.9,
  },
  
  // Chips and Tags
  chip: {
    backgroundColor: colors.backgroundAlt,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  chipTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  
  // Professional Elements
  professionalCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 28,
    marginVertical: 12,
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.large,
  },
  gradientCard: {
    borderRadius: 20,
    padding: 28,
    marginVertical: 12,
    width: '100%',
    ...shadows.xl,
  },
  glassCard: {
    backgroundColor: 'rgba(26, 32, 44, 0.8)',
    borderRadius: 20,
    padding: 28,
    marginVertical: 12,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Animations and Interactions
  pressable: {
    opacity: 1,
  },
  pressablePressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  
  // Professional Spacing
  marginXS: { margin: 4 },
  marginSM: { margin: 8 },
  marginMD: { margin: 16 },
  marginLG: { margin: 24 },
  marginXL: { margin: 32 },
  
  paddingXS: { padding: 4 },
  paddingSM: { padding: 8 },
  paddingMD: { padding: 16 },
  paddingLG: { padding: 24 },
  paddingXL: { padding: 32 },
  
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
});
