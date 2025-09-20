
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, TextInput } from 'react-native';
import { commonStyles, colors } from '../styles/commonStyles';
import Icon from './Icon';
import { useAuth } from '../hooks/useAuth';
import { DiscordService } from '../services/discordService';
import PasscodeAuth from './PasscodeAuth';

interface AdminPanelProps {
  orderAcceptStatus: boolean;
  onToggleOrderStatus: () => void;
}

export default function AdminPanel({ orderAcceptStatus, onToggleOrderStatus }: AdminPanelProps) {
  const { user, isAdmin } = useAuth();
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPasscodeAuth, setShowPasscodeAuth] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [showWebhookConfig, setShowWebhookConfig] = useState(false);

  // Don't show admin panel if user is not admin
  if (!isAdmin()) {
    return null;
  }

  const handleAdminPanelToggle = () => {
    if (!isAuthenticated) {
      setShowPasscodeAuth(true);
    } else {
      setShowAdminPanel(!showAdminPanel);
    }
  };

  const handlePasscodeSuccess = () => {
    setIsAuthenticated(true);
    setShowPasscodeAuth(false);
    setShowAdminPanel(true);
    console.log(`Admin ${user?.discord_username} authenticated with passcode`);
  };

  const handlePasscodeCancel = () => {
    setShowPasscodeAuth(false);
    console.log(`Admin passcode authentication cancelled by ${user?.discord_username}`);
  };

  const handleToggleWithNotification = async () => {
    try {
      // Double-check admin status and authentication
      if (!isAdmin() || !isAuthenticated) {
        Alert.alert(
          'Access Denied',
          "Authentication required. Please re-authenticate to perform admin actions.",
          [{ text: 'OK', style: 'default' }]
        );
        setIsAuthenticated(false);
        return;
      }

      const newStatus = !orderAcceptStatus;
      const defaultMessage = newStatus 
        ? '🎉 We are now accepting new design requests! Submit your projects now for fast turnaround.' 
        : '⏸️ We have temporarily closed new orders. Join our Discord for updates on when we reopen.';

      const message = customMessage.trim() || defaultMessage;

      console.log(`Admin ${user?.discord_username} is changing order status to: ${newStatus ? 'ACCEPTING' : 'CLOSED'}`);

      // Send notification to Discord
      const success = await DiscordService.sendStatusUpdate(message, newStatus);
      
      // Send admin action alert
      await DiscordService.sendAdminAlert(
        `Order status changed by ${user?.discord_username}`,
        `Status: ${newStatus ? 'ACCEPTING ORDERS' : 'ORDERS CLOSED'}\nMessage: ${message}`
      );

      if (success) {
        onToggleOrderStatus();
        Alert.alert(
          'Status Updated Successfully! ✅',
          `Order status changed to: ${newStatus ? 'ACCEPTING ORDERS' : 'ORDERS CLOSED'}\n\n${DiscordService.isWebhookConfigured() ? 'Notification sent to Discord!' : 'Webhook not configured - using simulation mode'}\n\nMessage sent: "${message}"`,
          [{ text: 'OK', style: 'default' }]
        );
        setCustomMessage('');
      } else {
        Alert.alert(
          'Warning ⚠️',
          'Status updated locally, but failed to notify Discord. Check your webhook configuration.',
          [{ text: 'OK', style: 'default' }]
        );
        onToggleOrderStatus();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert(
        'Error ❌', 
        'Failed to update status. Please try again.',
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  const handleWebhookUpdate = () => {
    if (!webhookUrl.trim()) {
      Alert.alert('Error', 'Please enter a webhook URL');
      return;
    }

    try {
      DiscordService.updateWebhookUrl(webhookUrl.trim());
      Alert.alert(
        'Success! ✅',
        'Discord webhook URL updated successfully. Your requests will now be sent to Discord.',
        [{ text: 'OK', style: 'default' }]
      );
      setWebhookUrl('');
      setShowWebhookConfig(false);
    } catch (error) {
      Alert.alert(
        'Error ❌',
        'Invalid webhook URL format. Please make sure it starts with "https://discord.com/api/webhooks/"',
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout Confirmation',
      'Are you sure you want to logout from the admin panel?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => {
            setIsAuthenticated(false);
            setShowAdminPanel(false);
            console.log(`Admin ${user?.discord_username} logged out from admin panel`);
            Alert.alert(
              'Logged Out ✅', 
              'You have been logged out from the admin panel successfully.',
              [{ text: 'OK', style: 'default' }]
            );
          }
        }
      ]
    );
  };

  const handleTestWebhook = async () => {
    try {
      const success = await DiscordService.sendAdminAlert(
        `🧪 Webhook test by ${user?.discord_username}`,
        'Testing Discord integration from admin panel'
      );

      if (success) {
        Alert.alert(
          'Test Successful! ✅',
          DiscordService.isWebhookConfigured() 
            ? 'Test message sent to Discord successfully! Check your Discord channel.' 
            : 'Webhook not configured - test ran in simulation mode. Configure webhook for real Discord integration.',
          [{ text: 'OK', style: 'default' }]
        );
      } else {
        Alert.alert(
          'Test Failed ❌',
          'Failed to send test message. Please check your webhook configuration and try again.',
          [{ text: 'OK', style: 'default' }]
        );
      }
    } catch (error) {
      console.error('Webhook test error:', error);
      Alert.alert(
        'Test Error ❌',
        'An error occurred while testing the webhook. Please try again.',
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  // Show passcode authentication if not authenticated
  if (showPasscodeAuth) {
    return (
      <PasscodeAuth
        onSuccess={handlePasscodeSuccess}
        onCancel={handlePasscodeCancel}
      />
    );
  }

  return (
    <View style={[commonStyles.card, { 
      marginHorizontal: 20, 
      marginBottom: 20,
      borderWidth: 2,
      borderColor: isAuthenticated ? colors.success : colors.accent,
      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.4)',
      elevation: 6,
    }]}>
      <TouchableOpacity
        onPress={handleAdminPanelToggle}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: showAdminPanel ? 20 : 0,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{
            backgroundColor: isAuthenticated ? colors.success : colors.accent,
            width: 40,
            height: 40,
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 15,
          }}>
            <Icon 
              name={isAuthenticated ? "shield-checkmark" : "shield"} 
              size={20} 
              color="white" 
            />
          </View>
          <View>
            <Text style={[commonStyles.text, { fontSize: 18, fontWeight: 'bold', marginBottom: 2 }]}>
              Admin Control Panel
            </Text>
            <Text style={[commonStyles.text, { 
              fontSize: 12, 
              opacity: 0.7,
              color: isAuthenticated ? colors.success : colors.accent 
            }]}>
              {isAuthenticated ? '🔓 Authenticated' : '🔒 Authentication Required'}
            </Text>
          </View>
          <View style={{
            backgroundColor: user?.roles.includes('owner') ? colors.warning : colors.accent,
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 12,
            marginLeft: 15,
          }}>
            <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
              {user?.roles.includes('owner') ? 'OWNER' : 'ADMIN'}
            </Text>
          </View>
        </View>
        <Icon 
          name={showAdminPanel ? "chevron-up" : "chevron-down"} 
          size={24} 
          color={colors.text} 
        />
      </TouchableOpacity>

      {showAdminPanel && isAuthenticated && (
        <View>
          {/* User Info */}
          <View style={{
            backgroundColor: colors.backgroundAlt,
            padding: 20,
            borderRadius: 15,
            marginBottom: 25,
            borderWidth: 1,
            borderColor: colors.border,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
              <Icon name="person-circle" size={24} color={colors.accent} style={{ marginRight: 10 }} />
              <Text style={[commonStyles.text, { fontSize: 16, fontWeight: 'bold' }]}>
                Session Information
              </Text>
            </View>
            <Text style={[commonStyles.text, { fontSize: 14, marginBottom: 5 }]}>
              Logged in as: <Text style={{ fontWeight: 'bold', color: colors.accent }}>{user?.discord_username}</Text>
            </Text>
            <Text style={[commonStyles.text, { fontSize: 12, opacity: 0.7, marginBottom: 5 }]}>
              Discord ID: {user?.discord_id}
            </Text>
            <Text style={[commonStyles.text, { fontSize: 12, opacity: 0.7, marginBottom: 10 }]}>
              Session: {new Date().toLocaleString()}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon 
                name={DiscordService.isWebhookConfigured() ? "checkmark-circle" : "warning"} 
                size={16} 
                color={DiscordService.isWebhookConfigured() ? colors.success : colors.warning} 
                style={{ marginRight: 8 }} 
              />
              <Text style={[commonStyles.text, { 
                fontSize: 12, 
                color: DiscordService.isWebhookConfigured() ? colors.success : colors.warning 
              }]}>
                Webhook Status: {DiscordService.isWebhookConfigured() ? 'Active & Configured' : 'Not Configured'}
              </Text>
            </View>
          </View>

          {/* Webhook Configuration */}
          <View style={{ marginBottom: 25 }}>
            <TouchableOpacity
              onPress={() => setShowWebhookConfig(!showWebhookConfig)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: colors.backgroundAlt,
                padding: 20,
                borderRadius: 15,
                marginBottom: showWebhookConfig ? 20 : 0,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="link" size={20} color={colors.accent} style={{ marginRight: 12 }} />
                <View>
                  <Text style={[commonStyles.text, { fontSize: 16, fontWeight: 'bold', marginBottom: 2 }]}>
                    Discord Webhook Configuration
                  </Text>
                  <Text style={[commonStyles.text, { fontSize: 12, opacity: 0.7 }]}>
                    Configure Discord integration
                  </Text>
                </View>
              </View>
              <Icon 
                name={showWebhookConfig ? "chevron-up" : "chevron-down"} 
                size={20} 
                color={colors.text} 
              />
            </TouchableOpacity>

            {showWebhookConfig && (
              <View style={{
                backgroundColor: colors.backgroundAlt,
                padding: 20,
                borderRadius: 15,
                borderWidth: 1,
                borderColor: colors.border,
              }}>
                <Text style={[commonStyles.text, { fontSize: 14, marginBottom: 15, opacity: 0.8 }]}>
                  Enter your Discord webhook URL to enable real Discord integration:
                </Text>
                <TextInput
                  style={[commonStyles.textInput, { marginBottom: 15, fontSize: 12, minHeight: 50 }]}
                  placeholder="https://discord.com/api/webhooks/..."
                  placeholderTextColor="#666"
                  value={webhookUrl}
                  onChangeText={setWebhookUrl}
                />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <TouchableOpacity
                    onPress={handleWebhookUpdate}
                    style={{
                      backgroundColor: colors.success,
                      padding: 15,
                      borderRadius: 12,
                      flex: 1,
                      marginRight: 8,
                      alignItems: 'center',
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Icon name="save" size={16} color="white" style={{ marginRight: 8 }} />
                      <Text style={{ color: 'white', fontSize: 14, fontWeight: 'bold' }}>
                        Update
                      </Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleTestWebhook}
                    style={{
                      backgroundColor: colors.accent,
                      padding: 15,
                      borderRadius: 12,
                      flex: 1,
                      marginLeft: 8,
                      alignItems: 'center',
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Icon name="flask" size={16} color="white" style={{ marginRight: 8 }} />
                      <Text style={{ color: 'white', fontSize: 14, fontWeight: 'bold' }}>
                        Test
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* Order Status Control */}
          <View style={{ marginBottom: 25 }}>
            <View style={{
              backgroundColor: colors.backgroundAlt,
              padding: 20,
              borderRadius: 15,
              borderWidth: 1,
              borderColor: colors.border,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                <Icon name="settings" size={20} color={colors.accent} style={{ marginRight: 12 }} />
                <Text style={[commonStyles.text, { fontSize: 18, fontWeight: 'bold' }]}>
                  Order Status Control
                </Text>
              </View>
              
              <Text style={[commonStyles.text, { fontSize: 14, marginBottom: 15 }]}>
                Custom notification message (optional):
              </Text>
              <TextInput
                style={[commonStyles.textInput, { marginBottom: 20, minHeight: 100 }]}
                placeholder="Enter custom message for Discord notification..."
                placeholderTextColor="#666"
                value={customMessage}
                onChangeText={setCustomMessage}
                multiline
              />

              <TouchableOpacity
                onPress={handleToggleWithNotification}
                style={{
                  backgroundColor: orderAcceptStatus ? colors.error : colors.success,
                  padding: 18,
                  borderRadius: 15,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)',
                  elevation: 4,
                }}
              >
                <Icon 
                  name={orderAcceptStatus ? "close-circle" : "checkmark-circle"} 
                  size={24} 
                  color="white" 
                  style={{ marginRight: 12 }} 
                />
                <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
                  {orderAcceptStatus ? 'Close Orders' : 'Open Orders'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={{ marginBottom: 20 }}>
            <View style={{
              backgroundColor: colors.backgroundAlt,
              padding: 20,
              borderRadius: 15,
              borderWidth: 1,
              borderColor: colors.border,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                <Icon name="flash" size={20} color={colors.accent} style={{ marginRight: 12 }} />
                <Text style={[commonStyles.text, { fontSize: 18, fontWeight: 'bold' }]}>
                  Quick Actions
                </Text>
              </View>
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <TouchableOpacity
                  onPress={() => Alert.alert('Feature Coming Soon', 'Request management dashboard will be available in the next update!')}
                  style={{
                    backgroundColor: colors.accent,
                    padding: 15,
                    borderRadius: 12,
                    flex: 1,
                    marginRight: 6,
                    alignItems: 'center',
                  }}
                >
                  <Icon name="list" size={20} color="white" />
                  <Text style={{ color: 'white', fontSize: 12, marginTop: 8, fontWeight: 'bold' }}>
                    Requests
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => Alert.alert('Feature Coming Soon', 'Advanced settings panel will be available in the next update!')}
                  style={{
                    backgroundColor: colors.secondary,
                    padding: 15,
                    borderRadius: 12,
                    flex: 1,
                    marginHorizontal: 6,
                    alignItems: 'center',
                  }}
                >
                  <Icon name="cog" size={20} color="white" />
                  <Text style={{ color: 'white', fontSize: 12, marginTop: 8, fontWeight: 'bold' }}>
                    Settings
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleLogout}
                  style={{
                    backgroundColor: colors.error,
                    padding: 15,
                    borderRadius: 12,
                    flex: 1,
                    marginLeft: 6,
                    alignItems: 'center',
                  }}
                >
                  <Icon name="log-out" size={20} color="white" />
                  <Text style={{ color: 'white', fontSize: 12, marginTop: 8, fontWeight: 'bold' }}>
                    Logout
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
