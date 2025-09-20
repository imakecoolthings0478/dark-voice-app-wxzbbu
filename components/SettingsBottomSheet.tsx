
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, TextInput, Alert } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { shadows } from '../styles/commonStyles';
import Icon from './Icon';
import PasscodeAuth from './PasscodeAuth';
import AdminRequestsPanel from './AdminRequestsPanel';
import { DiscordService } from '../services/discordService';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsBottomSheetProps {
  visible: boolean;
  onClose: () => void;
}

export default function SettingsBottomSheet({ visible, onClose }: SettingsBottomSheetProps) {
  const { theme, toggleTheme, colors } = useTheme();
  const [showAdminAuth, setShowAdminAuth] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [showWebhookConfig, setShowWebhookConfig] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [currentWebhookUrl, setCurrentWebhookUrl] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      loadCurrentWebhook();
    }
  }, [visible]);

  const loadCurrentWebhook = async () => {
    try {
      const url = await DiscordService.getWebhookUrl();
      setCurrentWebhookUrl(url);
    } catch (error) {
      console.error('Error loading webhook URL:', error);
    }
  };

  const handleAdminAccess = () => {
    setShowAdminAuth(true);
  };

  const handleAdminAuthSuccess = () => {
    setShowAdminAuth(false);
    setIsAdminAuthenticated(true);
    console.log('Admin authenticated successfully');
  };

  const handleAdminAuthCancel = () => {
    setShowAdminAuth(false);
  };

  const handleWebhookSave = async () => {
    if (!webhookUrl.trim()) {
      Alert.alert('Error', 'Please enter a webhook URL');
      return;
    }

    if (!webhookUrl.startsWith('https://discord.com/api/webhooks/')) {
      Alert.alert('Error', 'Invalid webhook URL format. Must start with "https://discord.com/api/webhooks/"');
      return;
    }

    const success = await DiscordService.setWebhookUrl(webhookUrl.trim());
    
    if (success) {
      Alert.alert('Success! ✅', 'Discord webhook URL saved successfully! Your requests will now be sent to Discord.');
      setWebhookUrl('');
      setShowWebhookConfig(false);
      await loadCurrentWebhook();
    } else {
      Alert.alert('Error ❌', 'Failed to save webhook URL. Please try again.');
    }
  };

  const handleWebhookTest = async () => {
    try {
      const result = await DiscordService.testWebhookConnection();
      
      if (result.success) {
        Alert.alert('Test Successful! ✅', 'Test message sent to Discord successfully! Check your Discord channel.');
      } else {
        Alert.alert('Test Failed ❌', `Failed to send test message: ${result.message}`);
      }
    } catch (error) {
      console.error('Webhook test error:', error);
      Alert.alert('Test Error ❌', 'An error occurred while testing the webhook. Please try again.');
    }
  };

  const handleWebhookRemove = async () => {
    Alert.alert(
      'Remove Webhook',
      'Are you sure you want to remove the Discord webhook? Requests will no longer be sent to Discord.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('discord_webhook_url');
              setCurrentWebhookUrl(null);
              Alert.alert('Success', 'Discord webhook removed successfully');
            } catch (error) {
              console.error('Error removing webhook:', error);
              Alert.alert('Error', 'Failed to remove webhook');
            }
          }
        }
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout from admin panel?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => {
            setIsAdminAuthenticated(false);
            Alert.alert('Success', 'Logged out successfully');
          }
        }
      ]
    );
  };

  if (showAdminAuth) {
    return (
      <Modal visible={visible} transparent animationType="slide">
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <PasscodeAuth
            onSuccess={handleAdminAuthSuccess}
            onCancel={handleAdminAuthCancel}
          />
        </View>
      </Modal>
    );
  }

  if (isAdminAuthenticated) {
    return (
      <Modal visible={visible} transparent animationType="slide">
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'flex-end',
        }}>
          <View style={{
            backgroundColor: colors.background,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            maxHeight: '90%',
            minHeight: '60%',
          }}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 20,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}>
              <Text style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: colors.text,
              }}>
                Admin Panel
              </Text>
              <TouchableOpacity onPress={onClose}>
                <Icon name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ flex: 1 }}>
              <AdminRequestsPanel />
              
              <View style={{ padding: 20 }}>
                <TouchableOpacity
                  onPress={handleLogout}
                  style={{
                    backgroundColor: colors.error,
                    padding: 16,
                    borderRadius: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    ...shadows.medium,
                  }}
                >
                  <Icon name="log-out" size={20} color="white" style={{ marginRight: 8 }} />
                  <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
                    Logout from Admin Panel
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
      }}>
        <View style={{
          backgroundColor: colors.background,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          maxHeight: '80%',
          minHeight: '50%',
        }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 20,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}>
            <Text style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: colors.text,
            }}>
              Settings
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1, padding: 20 }}>
            {/* Theme Toggle */}
            <View style={{
              backgroundColor: colors.card,
              padding: 20,
              borderRadius: 16,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: colors.border,
              ...shadows.medium,
            }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Icon 
                    name={theme === 'dark' ? 'moon' : 'sunny'} 
                    size={24} 
                    color={colors.accent} 
                    style={{ marginRight: 12 }} 
                  />
                  <View>
                    <Text style={{
                      fontSize: 16,
                      fontWeight: 'bold',
                      color: colors.text,
                      marginBottom: 4,
                    }}>
                      Theme
                    </Text>
                    <Text style={{
                      fontSize: 12,
                      color: colors.textSecondary,
                    }}>
                      Current: {theme === 'dark' ? 'Dark' : 'Light'}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={toggleTheme}
                  style={{
                    backgroundColor: colors.accent,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 20,
                  }}
                >
                  <Text style={{ color: 'white', fontWeight: 'bold' }}>
                    Switch to {theme === 'dark' ? 'Light' : 'Dark'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Webhook Configuration */}
            <View style={{
              backgroundColor: colors.card,
              padding: 20,
              borderRadius: 16,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: colors.border,
              ...shadows.medium,
            }}>
              <TouchableOpacity
                onPress={() => setShowWebhookConfig(!showWebhookConfig)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: showWebhookConfig ? 16 : 0,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Icon name="link" size={24} color={colors.accent} style={{ marginRight: 12 }} />
                  <View>
                    <Text style={{
                      fontSize: 16,
                      fontWeight: 'bold',
                      color: colors.text,
                      marginBottom: 4,
                    }}>
                      Discord Webhook
                    </Text>
                    <Text style={{
                      fontSize: 12,
                      color: currentWebhookUrl ? colors.success : colors.textSecondary,
                    }}>
                      {currentWebhookUrl ? 'Configured & Active' : 'Not configured'}
                    </Text>
                  </View>
                </View>
                <Icon 
                  name={showWebhookConfig ? 'chevron-up' : 'chevron-down'} 
                  size={20} 
                  color={colors.text} 
                />
              </TouchableOpacity>

              {showWebhookConfig && (
                <View>
                  {currentWebhookUrl && (
                    <View style={{
                      backgroundColor: colors.backgroundAlt,
                      padding: 16,
                      borderRadius: 12,
                      marginBottom: 16,
                    }}>
                      <Text style={{
                        fontSize: 12,
                        color: colors.textSecondary,
                        marginBottom: 8,
                      }}>
                        Current webhook:
                      </Text>
                      <Text style={{
                        fontSize: 12,
                        color: colors.text,
                        fontFamily: 'monospace',
                        marginBottom: 12,
                      }}>
                        {currentWebhookUrl.substring(0, 50)}...
                      </Text>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <TouchableOpacity
                          onPress={handleWebhookTest}
                          style={{
                            backgroundColor: colors.info,
                            padding: 12,
                            borderRadius: 12,
                            flex: 1,
                            marginRight: 8,
                            alignItems: 'center',
                          }}
                        >
                          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 12 }}>
                            Test
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={handleWebhookRemove}
                          style={{
                            backgroundColor: colors.error,
                            padding: 12,
                            borderRadius: 12,
                            flex: 1,
                            marginLeft: 8,
                            alignItems: 'center',
                          }}
                        >
                          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 12 }}>
                            Remove
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}

                  <Text style={{
                    fontSize: 14,
                    color: colors.textSecondary,
                    marginBottom: 12,
                  }}>
                    {currentWebhookUrl ? 'Update your Discord webhook URL:' : 'Enter your Discord webhook URL:'}
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
                      minHeight: 80,
                      textAlignVertical: 'top',
                    }}
                    placeholder="https://discord.com/api/webhooks/..."
                    placeholderTextColor={colors.textSecondary}
                    value={webhookUrl}
                    onChangeText={setWebhookUrl}
                    multiline
                  />
                  <TouchableOpacity
                    onPress={handleWebhookSave}
                    style={{
                      backgroundColor: colors.success,
                      padding: 12,
                      borderRadius: 12,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>
                      {currentWebhookUrl ? 'Update Webhook URL' : 'Save Webhook URL'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Admin Panel Access */}
            <View style={{
              backgroundColor: colors.card,
              padding: 20,
              borderRadius: 16,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: colors.border,
              ...shadows.medium,
            }}>
              <TouchableOpacity
                onPress={handleAdminAccess}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Icon name="shield" size={24} color={colors.warning} style={{ marginRight: 12 }} />
                  <View>
                    <Text style={{
                      fontSize: 16,
                      fontWeight: 'bold',
                      color: colors.text,
                      marginBottom: 4,
                    }}>
                      Admin Panel
                    </Text>
                    <Text style={{
                      fontSize: 12,
                      color: colors.textSecondary,
                    }}>
                      Access admin features & view requests
                    </Text>
                  </View>
                </View>
                <Icon name="chevron-forward" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* App Info */}
            <View style={{
              backgroundColor: colors.card,
              padding: 20,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: colors.border,
              ...shadows.medium,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <Icon name="information-circle" size={24} color={colors.info} style={{ marginRight: 12 }} />
                <Text style={{
                  fontSize: 16,
                  fontWeight: 'bold',
                  color: colors.text,
                }}>
                  App Information
                </Text>
              </View>
              <Text style={{
                fontSize: 14,
                color: colors.textSecondary,
                marginBottom: 8,
              }}>
                Version: 2.0.0
              </Text>
              <Text style={{
                fontSize: 14,
                color: colors.textSecondary,
                marginBottom: 8,
              }}>
                Built with React Native & Expo
              </Text>
              <Text style={{
                fontSize: 12,
                color: colors.textSecondary,
              }}>
                © 2024 Logify Makers
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
