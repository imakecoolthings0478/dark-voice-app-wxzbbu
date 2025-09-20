
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
  const [webhookUrl, setWebhookUrl] = useState('');
  const [showWebhookConfig, setShowWebhookConfig] = useState(false);
  const [showSupabaseConfig, setShowSupabaseConfig] = useState(false);
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');

  useEffect(() => {
    if (visible) {
      loadCurrentWebhook();
      loadSupabaseConfig();
    }
  }, [visible]);

  const loadCurrentWebhook = async () => {
    try {
      const url = await AsyncStorage.getItem('discord_webhook_url');
      if (url) {
        setWebhookUrl(url);
      }
    } catch (error) {
      console.error('Error loading webhook URL:', error);
    }
  };

  const loadSupabaseConfig = async () => {
    try {
      const url = await AsyncStorage.getItem('supabase_url');
      const key = await AsyncStorage.getItem('supabase_anon_key');
      if (url && url !== 'YOUR_SUPABASE_URL') {
        setSupabaseUrl(url);
      }
      if (key && key !== 'YOUR_SUPABASE_ANON_KEY') {
        setSupabaseKey(key);
      }
    } catch (error) {
      console.error('Error loading Supabase config:', error);
    }
  };

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

  const handleWebhookSave = async () => {
    try {
      if (webhookUrl.trim()) {
        await AsyncStorage.setItem('discord_webhook_url', webhookUrl.trim());
        Alert.alert('Success', 'Discord webhook URL saved successfully!');
        console.log('✅ Webhook URL saved');
      } else {
        await AsyncStorage.removeItem('discord_webhook_url');
        Alert.alert('Success', 'Discord webhook URL removed!');
        console.log('✅ Webhook URL removed');
      }
      setShowWebhookConfig(false);
    } catch (error) {
      console.error('Error saving webhook URL:', error);
      Alert.alert('Error', 'Failed to save webhook URL');
    }
  };

  const handleSupabaseSave = async () => {
    try {
      if (!supabaseUrl.trim() || !supabaseKey.trim()) {
        Alert.alert('Error', 'Please enter both Supabase URL and Anonymous Key');
        return;
      }

      const success = await supabaseService.configure(supabaseUrl.trim(), supabaseKey.trim());
      
      if (success) {
        Alert.alert(
          'Success! 🎉', 
          'Supabase configured successfully! Your app is now fully online-based with cloud storage.',
          [{ text: 'OK', onPress: () => setShowSupabaseConfig(false) }]
        );
        console.log('✅ Supabase configured successfully');
      } else {
        Alert.alert('Error', 'Failed to configure Supabase. Please check your URL and key.');
      }
    } catch (error) {
      console.error('Error configuring Supabase:', error);
      Alert.alert('Error', 'Failed to configure Supabase');
    }
  };

  const handleWebhookTest = async () => {
    if (!webhookUrl.trim()) {
      Alert.alert('Error', 'Please enter a webhook URL first');
      return;
    }

    const testMessage = {
      content: '🧪 **Test Message from Logify Makers App**',
      embeds: [{
        title: '✅ Webhook Test Successful',
        description: 'Your Discord webhook is working correctly!',
        color: 0x00ff00,
        timestamp: new Date().toISOString(),
        footer: {
          text: 'Logify Makers - Professional Design Services'
        }
      }]
    };

    const success = await DiscordService.sendWebhookMessage(webhookUrl.trim(), testMessage);
    
    if (success) {
      Alert.alert('Success! 🎉', 'Test message sent to Discord successfully!');
    } else {
      Alert.alert('Error ❌', 'Failed to send test message. Please check your webhook URL.');
    }
  };

  const handleWebhookRemove = async () => {
    Alert.alert(
      'Remove Webhook',
      'Are you sure you want to remove the Discord webhook URL?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('discord_webhook_url');
              setWebhookUrl('');
              Alert.alert('Success', 'Discord webhook URL removed!');
              console.log('✅ Webhook URL removed');
            } catch (error) {
              console.error('Error removing webhook URL:', error);
              Alert.alert('Error', 'Failed to remove webhook URL');
            }
          }
        }
      ]
    );
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

              {/* Cloud Configuration Section */}
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
                    Cloud Database
                  </Text>
                </View>
                
                <Text style={{
                  fontSize: 14,
                  color: colors.textSecondary,
                  marginBottom: 16,
                  lineHeight: 20,
                  fontWeight: '500',
                }}>
                  Configure Supabase for full online functionality with global data access.
                </Text>
                
                <TouchableOpacity
                  onPress={() => setShowSupabaseConfig(true)}
                  style={{
                    backgroundColor: supabaseService.isReady() ? colors.success : colors.accent,
                    paddingHorizontal: 20,
                    paddingVertical: 14,
                    borderRadius: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    ...shadows.medium,
                  }}
                >
                  <Icon 
                    name={supabaseService.isReady() ? "checkmark-circle" : "settings"} 
                    size={20} 
                    color="white" 
                    style={{ marginRight: 8 }} 
                  />
                  <Text style={{
                    color: 'white',
                    fontWeight: '700',
                    fontSize: 16,
                  }}>
                    {supabaseService.isReady() ? 'Reconfigure Supabase' : 'Configure Supabase'}
                  </Text>
                </TouchableOpacity>
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

              {/* Discord Integration Section */}
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
                  <Icon name="logo-discord" size={24} color="#5865F2" style={{ marginRight: 12 }} />
                  <Text style={{
                    fontSize: 20,
                    fontWeight: '800',
                    color: colors.text,
                    letterSpacing: -0.3,
                  }}>
                    Discord Integration
                  </Text>
                </View>
                
                <Text style={{
                  fontSize: 14,
                  color: colors.textSecondary,
                  marginBottom: 16,
                  lineHeight: 20,
                  fontWeight: '500',
                }}>
                  Configure Discord webhook for instant notifications when new requests are submitted.
                </Text>
                
                <TouchableOpacity
                  onPress={() => setShowWebhookConfig(true)}
                  style={{
                    backgroundColor: '#5865F2',
                    paddingHorizontal: 20,
                    paddingVertical: 14,
                    borderRadius: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    ...shadows.medium,
                  }}
                >
                  <Icon name="settings" size={20} color="white" style={{ marginRight: 8 }} />
                  <Text style={{
                    color: 'white',
                    fontWeight: '700',
                    fontSize: 16,
                  }}>
                    Configure Webhook
                  </Text>
                </TouchableOpacity>
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

      {/* Supabase Config Modal */}
      {showSupabaseConfig && (
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
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
                <Icon name="cloud" size={28} color={colors.accent} style={{ marginRight: 12 }} />
                <Text style={{
                  fontSize: 22,
                  fontWeight: '800',
                  color: colors.text,
                  letterSpacing: -0.3,
                }}>
                  Configure Supabase
                </Text>
              </View>

              <Text style={{
                fontSize: 14,
                color: colors.textSecondary,
                marginBottom: 20,
                lineHeight: 20,
                fontWeight: '500',
              }}>
                Enter your Supabase project URL and anonymous key to enable full cloud functionality.
              </Text>

              <Text style={{
                fontSize: 16,
                color: colors.text,
                marginBottom: 8,
                fontWeight: '700',
              }}>
                Supabase URL *
              </Text>
              <TextInput
                style={{
                  backgroundColor: colors.backgroundAlt,
                  borderColor: colors.border,
                  borderWidth: 1,
                  borderRadius: 12,
                  padding: 16,
                  color: colors.text,
                  fontSize: 14,
                  marginBottom: 16,
                  ...shadows.small,
                }}
                placeholder="https://your-project.supabase.co"
                placeholderTextColor={colors.textSecondary}
                value={supabaseUrl}
                onChangeText={setSupabaseUrl}
                autoCapitalize="none"
                autoCorrect={false}
              />

              <Text style={{
                fontSize: 16,
                color: colors.text,
                marginBottom: 8,
                fontWeight: '700',
              }}>
                Anonymous Key *
              </Text>
              <TextInput
                style={{
                  backgroundColor: colors.backgroundAlt,
                  borderColor: colors.border,
                  borderWidth: 1,
                  borderRadius: 12,
                  padding: 16,
                  color: colors.text,
                  fontSize: 14,
                  marginBottom: 24,
                  ...shadows.small,
                }}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                placeholderTextColor={colors.textSecondary}
                value={supabaseKey}
                onChangeText={setSupabaseKey}
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry
              />

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <TouchableOpacity
                  onPress={() => setShowSupabaseConfig(false)}
                  style={{
                    backgroundColor: colors.grey,
                    paddingHorizontal: 24,
                    paddingVertical: 14,
                    borderRadius: 12,
                    flex: 1,
                    marginRight: 8,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: 'white', fontWeight: '700', fontSize: 16 }}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={handleSupabaseSave}
                  style={{
                    backgroundColor: colors.accent,
                    paddingHorizontal: 24,
                    paddingVertical: 14,
                    borderRadius: 12,
                    flex: 1,
                    marginLeft: 8,
                    alignItems: 'center',
                    ...shadows.medium,
                  }}
                >
                  <Text style={{ color: 'white', fontWeight: '700', fontSize: 16 }}>
                    Save
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Webhook Config Modal */}
      {showWebhookConfig && (
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
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
                <Icon name="logo-discord" size={28} color="#5865F2" style={{ marginRight: 12 }} />
                <Text style={{
                  fontSize: 22,
                  fontWeight: '800',
                  color: colors.text,
                  letterSpacing: -0.3,
                }}>
                  Discord Webhook
                </Text>
              </View>

              <Text style={{
                fontSize: 14,
                color: colors.textSecondary,
                marginBottom: 20,
                lineHeight: 20,
                fontWeight: '500',
              }}>
                Enter your Discord webhook URL to receive instant notifications when new design requests are submitted.
              </Text>

              <TextInput
                style={{
                  backgroundColor: colors.backgroundAlt,
                  borderColor: colors.border,
                  borderWidth: 1,
                  borderRadius: 12,
                  padding: 16,
                  color: colors.text,
                  fontSize: 14,
                  marginBottom: 20,
                  minHeight: 80,
                  textAlignVertical: 'top',
                  ...shadows.small,
                }}
                placeholder="https://discord.com/api/webhooks/..."
                placeholderTextColor={colors.textSecondary}
                value={webhookUrl}
                onChangeText={setWebhookUrl}
                multiline
                autoCapitalize="none"
                autoCorrect={false}
              />

              <View style={{ flexDirection: 'row', marginBottom: 20 }}>
                <TouchableOpacity
                  onPress={handleWebhookTest}
                  style={{
                    backgroundColor: colors.info,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderRadius: 12,
                    flex: 1,
                    marginRight: 8,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: 'white', fontWeight: '700', fontSize: 14 }}>
                    Test
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={handleWebhookRemove}
                  style={{
                    backgroundColor: colors.error,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderRadius: 12,
                    flex: 1,
                    marginLeft: 8,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: 'white', fontWeight: '700', fontSize: 14 }}>
                    Remove
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <TouchableOpacity
                  onPress={() => setShowWebhookConfig(false)}
                  style={{
                    backgroundColor: colors.grey,
                    paddingHorizontal: 24,
                    paddingVertical: 14,
                    borderRadius: 12,
                    flex: 1,
                    marginRight: 8,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: 'white', fontWeight: '700', fontSize: 16 }}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={handleWebhookSave}
                  style={{
                    backgroundColor: '#5865F2',
                    paddingHorizontal: 24,
                    paddingVertical: 14,
                    borderRadius: 12,
                    flex: 1,
                    marginLeft: 8,
                    alignItems: 'center',
                    ...shadows.medium,
                  }}
                >
                  <Text style={{ color: 'white', fontWeight: '700', fontSize: 16 }}>
                    Save
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </>
  );
}
