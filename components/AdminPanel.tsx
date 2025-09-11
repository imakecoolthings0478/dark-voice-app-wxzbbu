
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, TextInput } from 'react-native';
import { commonStyles, colors } from '../styles/commonStyles';
import Icon from './Icon';
import { useAuth } from '../hooks/useAuth';
import { DiscordService } from '../services/discordService';

interface AdminPanelProps {
  orderAcceptStatus: boolean;
  onToggleOrderStatus: () => void;
}

export default function AdminPanel({ orderAcceptStatus, onToggleOrderStatus }: AdminPanelProps) {
  const { user, isAdmin } = useAuth();
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [showWebhookConfig, setShowWebhookConfig] = useState(false);

  // Don't show admin panel if user is not admin
  if (!isAdmin()) {
    return null;
  }

  const handleToggleWithNotification = async () => {
    try {
      // Double-check admin status before allowing action
      if (!isAdmin()) {
        Alert.alert(
          'Access Denied',
          "You're not an admin. Only users with 'owner' or 'admin' roles can change order status.",
          [{ text: 'OK', style: 'default' }]
        );
        return;
      }

      const newStatus = !orderAcceptStatus;
      const defaultMessage = newStatus 
        ? 'We are now accepting new design requests! Submit your projects now.' 
        : 'We have temporarily closed new orders. Join our Discord for updates on when we reopen.';

      const message = customMessage.trim() || defaultMessage;

      console.log(`Admin ${user?.discord_username} is changing order status to: ${newStatus ? 'ACCEPTING' : 'CLOSED'}`);

      // Send notification to Discord
      const success = await DiscordService.sendStatusUpdate(message, newStatus);
      
      // Send admin action alert
      await DiscordService.sendAdminAlert(
        `Order status changed by ${user?.discord_username}`,
        `Status: ${newStatus ? 'ACCEPTING ORDERS' : 'ORDERS CLOSED'}`
      );

      if (success) {
        onToggleOrderStatus();
        Alert.alert(
          'Status Updated Successfully! ✅',
          `Order status changed to: ${newStatus ? 'ACCEPTING' : 'CLOSED'}\n\n${DiscordService.isWebhookConfigured() ? 'Notification sent to Discord!' : 'Webhook not configured - using simulation mode'}`,
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
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => {
            console.log(`Admin ${user?.discord_username} logged out`);
            Alert.alert(
              'Logged Out ✅', 
              'You have been logged out successfully.',
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
        `Webhook test by ${user?.discord_username}`,
        'Testing Discord integration'
      );

      if (success) {
        Alert.alert(
          'Test Successful! ✅',
          DiscordService.isWebhookConfigured() 
            ? 'Test message sent to Discord successfully!' 
            : 'Webhook not configured - test ran in simulation mode',
          [{ text: 'OK', style: 'default' }]
        );
      } else {
        Alert.alert(
          'Test Failed ❌',
          'Failed to send test message. Check your webhook configuration.',
          [{ text: 'OK', style: 'default' }]
        );
      }
    } catch (error) {
      console.error('Webhook test error:', error);
      Alert.alert(
        'Test Error ❌',
        'An error occurred while testing the webhook.',
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  return (
    <View style={[commonStyles.card, { marginHorizontal: 20, marginBottom: 20 }]}>
      <TouchableOpacity
        onPress={() => setShowAdminPanel(!showAdminPanel)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: showAdminPanel ? 20 : 0,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Icon name="shield-checkmark" size={20} color={colors.accent} style={{ marginRight: 10 }} />
          <Text style={[commonStyles.text, { fontSize: 16, fontWeight: 'bold' }]}>
            Admin Panel
          </Text>
          <View style={{
            backgroundColor: user?.roles.includes('owner') ? colors.warning : colors.accent,
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 10,
            marginLeft: 10,
          }}>
            <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
              {user?.roles.includes('owner') ? 'OWNER' : 'ADMIN'}
            </Text>
          </View>
        </View>
        <Icon 
          name={showAdminPanel ? "chevron-up" : "chevron-down"} 
          size={20} 
          color={colors.text} 
        />
      </TouchableOpacity>

      {showAdminPanel && (
        <View>
          {/* User Info */}
          <View style={{
            backgroundColor: colors.backgroundAlt,
            padding: 15,
            borderRadius: 10,
            marginBottom: 20,
          }}>
            <Text style={[commonStyles.text, { fontSize: 14, marginBottom: 5 }]}>
              Logged in as: <Text style={{ fontWeight: 'bold' }}>{user?.discord_username}</Text>
            </Text>
            <Text style={[commonStyles.text, { fontSize: 12, opacity: 0.7 }]}>
              Discord ID: {user?.discord_id}
            </Text>
            <Text style={[commonStyles.text, { fontSize: 12, opacity: 0.7, marginTop: 5 }]}>
              Webhook Status: {DiscordService.isWebhookConfigured() ? '✅ Configured' : '⚠️ Not Configured'}
            </Text>
          </View>

          {/* Webhook Configuration */}
          <View style={{ marginBottom: 20 }}>
            <TouchableOpacity
              onPress={() => setShowWebhookConfig(!showWebhookConfig)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: colors.backgroundAlt,
                padding: 15,
                borderRadius: 10,
                marginBottom: showWebhookConfig ? 15 : 0,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="link" size={16} color={colors.accent} style={{ marginRight: 10 }} />
                <Text style={[commonStyles.text, { fontSize: 14, fontWeight: 'bold' }]}>
                  Discord Webhook Config
                </Text>
              </View>
              <Icon 
                name={showWebhookConfig ? "chevron-up" : "chevron-down"} 
                size={16} 
                color={colors.text} 
              />
            </TouchableOpacity>

            {showWebhookConfig && (
              <View>
                <Text style={[commonStyles.text, { fontSize: 12, marginBottom: 10, opacity: 0.8 }]}>
                  Enter your Discord webhook URL to enable real Discord integration:
                </Text>
                <TextInput
                  style={[commonStyles.textInput, { marginBottom: 10, fontSize: 12 }]}
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
                      padding: 10,
                      borderRadius: 8,
                      flex: 1,
                      marginRight: 5,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
                      Update Webhook
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleTestWebhook}
                    style={{
                      backgroundColor: colors.accent,
                      padding: 10,
                      borderRadius: 8,
                      flex: 1,
                      marginLeft: 5,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
                      Test Webhook
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* Order Status Control */}
          <View style={{ marginBottom: 20 }}>
            <Text style={[commonStyles.text, { fontSize: 16, fontWeight: 'bold', marginBottom: 10 }]}>
              Order Status Control
            </Text>
            
            <Text style={[commonStyles.text, { fontSize: 14, marginBottom: 10 }]}>
              Custom notification message (optional):
            </Text>
            <TextInput
              style={[commonStyles.textInput, { marginBottom: 15, minHeight: 80 }]}
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
                padding: 15,
                borderRadius: 10,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon 
                name={orderAcceptStatus ? "close-circle" : "checkmark-circle"} 
                size={20} 
                color="white" 
                style={{ marginRight: 10 }} 
              />
              <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
                {orderAcceptStatus ? 'Close Orders' : 'Open Orders'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Quick Actions */}
          <View style={{ marginBottom: 20 }}>
            <Text style={[commonStyles.text, { fontSize: 16, fontWeight: 'bold', marginBottom: 10 }]}>
              Quick Actions
            </Text>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity
                onPress={() => Alert.alert('Feature Coming Soon', 'Request management will be available in the next update!')}
                style={{
                  backgroundColor: colors.accent,
                  padding: 12,
                  borderRadius: 8,
                  flex: 1,
                  marginRight: 5,
                  alignItems: 'center',
                }}
              >
                <Icon name="list" size={16} color="white" />
                <Text style={{ color: 'white', fontSize: 12, marginTop: 5 }}>
                  View Requests
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => Alert.alert('Feature Coming Soon', 'Settings panel will be available in the next update!')}
                style={{
                  backgroundColor: colors.secondary,
                  padding: 12,
                  borderRadius: 8,
                  flex: 1,
                  marginHorizontal: 5,
                  alignItems: 'center',
                }}
              >
                <Icon name="settings" size={16} color="white" />
                <Text style={{ color: 'white', fontSize: 12, marginTop: 5 }}>
                  Settings
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleLogout}
                style={{
                  backgroundColor: colors.error,
                  padding: 12,
                  borderRadius: 8,
                  flex: 1,
                  marginLeft: 5,
                  alignItems: 'center',
                }}
              >
                <Icon name="log-out" size={16} color="white" />
                <Text style={{ color: 'white', fontSize: 12, marginTop: 5 }}>
                  Logout
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
