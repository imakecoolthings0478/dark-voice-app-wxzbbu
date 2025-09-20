
import React, { useState, useEffect } from 'react';
import { DiscordService } from '../services/discordService';
import { supabaseService } from '../services/supabaseService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, TouchableOpacity, Modal, ScrollView, TextInput, Alert } from 'react-native';
import Icon from './Icon';
import PasscodeAuth from './PasscodeAuth';
import { shadows } from '../styles/commonStyles';
import AdminRequestsPanel from './AdminRequestsPanel';
import { useTheme } from '../contexts/ThemeContext';

interface SettingsBottomSheetProps {
  visible: boolean;
  onClose: () => void;
}

export default function SettingsBottomSheet({ visible, onClose }: SettingsBottomSheetProps) {
  const { theme, toggleTheme, colors } = useTheme();
  const [showAdminAuth, setShowAdminAuth] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);



  const handleAdminAccess = () => {
    setShowAdminAuth(true);
  };

  const handleAdminAuthSuccess = () => {
    setShowAdminAuth(false);
    setShowAdminPanel(true);
  };

  const handleAdminAuthCancel = () => {
    setShowAdminAuth(false);
  };



  const handleLogout = () => {
    setShowAdminPanel(false);
  };

  if (showAdminPanel) {
    return (
      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 24,
            paddingTop: 60,
            paddingBottom: 24,
            backgroundColor: colors.background,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}>
            <TouchableOpacity
              onPress={handleLogout}
              style={{
                backgroundColor: colors.card,
                padding: 14,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: colors.border,
                ...shadows.medium,
              }}
            >
              <Icon name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            
            <Text style={{
              fontSize: 24,
              fontWeight: '800',
              color: colors.text,
              textAlign: 'center',
              flex: 1,
              letterSpacing: -0.5,
            }}>
              Admin Panel
            </Text>
            
            <TouchableOpacity
              onPress={onClose}
              style={{
                backgroundColor: colors.card,
                padding: 14,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: colors.border,
                ...shadows.medium,
              }}
            >
              <Icon name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <AdminRequestsPanel />
        </View>
      </Modal>
    );
  }

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={onClose}
      >
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          {/* Header */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 24,
            paddingTop: 60,
            paddingBottom: 24,
            backgroundColor: colors.background,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}>
            <Text style={{
              fontSize: 28,
              fontWeight: '900',
              color: colors.text,
              letterSpacing: -0.8,
            }}>
              Settings
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={{
                backgroundColor: colors.card,
                padding: 14,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: colors.border,
                ...shadows.medium,
              }}
            >
              <Icon name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            <View style={{ paddingHorizontal: 24, paddingTop: 20 }}>
              
              {/* Theme Section */}
              <View style={{
                backgroundColor: colors.card,
                borderRadius: 20,
                padding: 24,
                marginBottom: 20,
                borderWidth: 1,
                borderColor: colors.border,
                ...shadows.medium,
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                  <Icon name="color-palette" size={24} color={colors.accent} style={{ marginRight: 12 }} />
                  <Text style={{
                    fontSize: 20,
                    fontWeight: '800',
                    color: colors.text,
                    letterSpacing: -0.3,
                  }}>
                    Appearance
                  </Text>
                </View>
                
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <TouchableOpacity
                    onPress={toggleTheme}
                    style={{
                      backgroundColor: theme === 'dark' ? colors.accent : colors.backgroundAlt,
                      paddingHorizontal: 20,
                      paddingVertical: 12,
                      borderRadius: 16,
                      flexDirection: 'row',
                      alignItems: 'center',
                      flex: 1,
                      marginRight: 8,
                      borderWidth: 1,
                      borderColor: theme === 'dark' ? colors.accent : colors.border,
                      ...shadows.small,
                    }}
                  >
                    <Icon 
                      name="moon" 
                      size={20} 
                      color={theme === 'dark' ? 'white' : colors.text} 
                      style={{ marginRight: 8 }} 
                    />
                    <Text style={{
                      color: theme === 'dark' ? 'white' : colors.text,
                      fontWeight: '700',
                      fontSize: 14,
                    }}>
                      Dark
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={toggleTheme}
                    style={{
                      backgroundColor: theme === 'light' ? colors.accent : colors.backgroundAlt,
                      paddingHorizontal: 20,
                      paddingVertical: 12,
                      borderRadius: 16,
                      flexDirection: 'row',
                      alignItems: 'center',
                      flex: 1,
                      marginLeft: 8,
                      borderWidth: 1,
                      borderColor: theme === 'light' ? colors.accent : colors.border,
                      ...shadows.small,
                    }}
                  >
                    <Icon 
                      name="sunny" 
                      size={20} 
                      color={theme === 'light' ? 'white' : colors.text} 
                      style={{ marginRight: 8 }} 
                    />
                    <Text style={{
                      color: theme === 'light' ? 'white' : colors.text,
                      fontWeight: '700',
                      fontSize: 14,
                    }}>
                      Light
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>



              {/* Admin Section */}
              <View style={{
                backgroundColor: colors.card,
                borderRadius: 20,
                padding: 24,
                marginBottom: 20,
                borderWidth: 1,
                borderColor: colors.border,
                ...shadows.medium,
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                  <Icon name="shield-checkmark" size={24} color={colors.accent} style={{ marginRight: 12 }} />
                  <Text style={{
                    fontSize: 20,
                    fontWeight: '800',
                    color: colors.text,
                    letterSpacing: -0.3,
                  }}>
                    Administration
                  </Text>
                </View>
                
                <TouchableOpacity
                  onPress={handleAdminAccess}
                  style={{
                    backgroundColor: colors.accent,
                    paddingHorizontal: 20,
                    paddingVertical: 14,
                    borderRadius: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    ...shadows.medium,
                  }}
                >
                  <Icon name="key" size={20} color="white" style={{ marginRight: 8 }} />
                  <Text style={{
                    color: 'white',
                    fontWeight: '700',
                    fontSize: 16,
                  }}>
                    Access Admin Panel
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Cloud Status Info Section */}
              <View style={{
                backgroundColor: colors.card,
                borderRadius: 20,
                padding: 24,
                marginBottom: 20,
                borderWidth: 1,
                borderColor: colors.border,
                ...shadows.medium,
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                  <Icon name="cloud" size={24} color={colors.accent} style={{ marginRight: 12 }} />
                  <Text style={{
                    fontSize: 20,
                    fontWeight: '800',
                    color: colors.text,
                    letterSpacing: -0.3,
                  }}>
                    Cloud Status
                  </Text>
                </View>
                
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                  <View style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: supabaseService.isReady() ? colors.success : colors.warning,
                    marginRight: 12,
                  }} />
                  <Text style={{
                    fontSize: 16,
                    color: colors.text,
                    fontWeight: '600',
                  }}>
                    Database: {supabaseService.isReady() ? 'Connected' : 'Not Configured'}
                  </Text>
                </View>
                
                <Text style={{
                  fontSize: 14,
                  color: colors.textSecondary,
                  lineHeight: 20,
                  fontWeight: '500',
                }}>
                  {supabaseService.isReady() 
                    ? 'Your app is fully cloud-based with global data access and real-time synchronization.'
                    : 'Cloud database and Discord integration can be configured in the Admin Panel for full online functionality.'
                  }
                </Text>
              </View>

              {/* App Info */}
              <View style={{
                backgroundColor: colors.backgroundAlt,
                borderRadius: 20,
                padding: 24,
                marginBottom: 40,
                borderWidth: 1,
                borderColor: colors.border,
                alignItems: 'center',
              }}>
                <Text style={{
                  fontSize: 16,
                  color: colors.textSecondary,
                  textAlign: 'center',
                  marginBottom: 8,
                  fontWeight: '600',
                }}>
                  Logify Makers v1.0.0
                </Text>
                <Text style={{
                  fontSize: 12,
                  color: colors.textSecondary,
                  textAlign: 'center',
                  opacity: 0.7,
                  fontWeight: '500',
                }}>
                  Professional Design Services • Fully Online-Based
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Admin Auth Modal */}
      {showAdminAuth && (
        <Modal visible={true} transparent animationType="fade">
          <View style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.8)',
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 24,
          }}>
            <View style={{
              backgroundColor: colors.card,
              borderRadius: 24,
              padding: 32,
              width: '100%',
              maxWidth: 400,
              borderWidth: 1,
              borderColor: colors.border,
              ...shadows.xl,
            }}>
              <PasscodeAuth
                onSuccess={handleAdminAuthSuccess}
                onCancel={handleAdminAuthCancel}
              />
            </View>
          </View>
        </Modal>
      )}


    </>
  );
}
