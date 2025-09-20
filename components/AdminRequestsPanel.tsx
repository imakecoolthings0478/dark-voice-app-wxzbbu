
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, TextInput, RefreshControl } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { shadows } from '../styles/commonStyles';
import Icon from './Icon';
import { DesignRequest, GlobalMessage } from '../types';
import { supabaseService } from '../services/supabaseService';
import { AdminService } from '../services/adminService';
import { DiscordService } from '../services/discordService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AdminRequestsPanel() {
  const { colors } = useTheme();
  const [requests, setRequests] = useState<DesignRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showGlobalMessageForm, setShowGlobalMessageForm] = useState(false);
  const [globalMessageTitle, setGlobalMessageTitle] = useState('');
  const [globalMessageText, setGlobalMessageText] = useState('');
  const [globalMessageType, setGlobalMessageType] = useState<GlobalMessage['type']>('info');
  
  // Cloud Database Configuration
  const [showSupabaseConfig, setShowSupabaseConfig] = useState(false);
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  
  // Discord Integration Configuration
  const [showDiscordConfig, setShowDiscordConfig] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');

  useEffect(() => {
    loadRequests();
    loadConfigurations();
    // Extend admin session when panel is accessed
    AdminService.extendSession();
  }, []);

  const loadConfigurations = async () => {
    try {
      // Load Supabase configuration
      const url = await AsyncStorage.getItem('supabase_url');
      const key = await AsyncStorage.getItem('supabase_anon_key');
      if (url && url !== 'YOUR_SUPABASE_URL') {
        setSupabaseUrl(url);
      }
      if (key && key !== 'YOUR_SUPABASE_ANON_KEY') {
        setSupabaseKey(key);
      }

      // Load Discord webhook configuration
      const webhook = await AsyncStorage.getItem('discord_webhook_url');
      if (webhook) {
        setWebhookUrl(webhook);
      }
    } catch (error) {
      console.error('Error loading configurations:', error);
    }
  };

  const loadRequests = async () => {
    try {
      setLoading(true);
      
      // Try to load from Supabase first
      if (supabaseService.isReady()) {
        const result = await supabaseService.getRequests();
        if (result.success && result.data) {
          setRequests(result.data);
          console.log('Loaded requests from Supabase:', result.data.length);
          return;
        }
      }

      // Fallback to local storage
      const savedRequests = await AsyncStorage.getItem('design_requests');
      if (savedRequests) {
        const localRequests = JSON.parse(savedRequests);
        setRequests(localRequests);
        console.log('Loaded requests from local storage:', localRequests.length);
      }
    } catch (error) {
      console.error('Error loading requests:', error);
      Alert.alert('Error', 'Failed to load requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRequests();
    setRefreshing(false);
  };

  const updateRequestStatus = async (
    requestId: string, 
    newStatus: DesignRequest['status'], 
    adminNotes?: string
  ): Promise<boolean> => {
    try {
      console.log(`🔄 Updating request ${requestId} to status: ${newStatus}`);
      
      // Update in cloud first
      if (supabaseService.isReady()) {
        const result = await supabaseService.updateRequestStatus(requestId, newStatus, adminNotes);
        if (result.success) {
          console.log('✅ Request updated in cloud');
        } else {
          console.error('❌ Failed to update in cloud:', result.error);
          throw new Error(`Cloud update failed: ${result.error}`);
        }
      }

      // Update locally
      const updatedRequests = requests.map(req => 
        req.id === requestId 
          ? { 
              ...req, 
              status: newStatus, 
              updated_at: new Date().toISOString(),
              admin_notes: adminNotes || req.admin_notes
            } 
          : req
      );
      
      setRequests(updatedRequests);
      await AsyncStorage.setItem('design_requests', JSON.stringify(updatedRequests));
      
      console.log(`✅ Request ${requestId} status updated to ${newStatus}`);
      
      // Extend admin session
      AdminService.extendSession();
      
      return true;
    } catch (error) {
      console.error('❌ Error updating request status:', error);
      throw error;
    }
  };

  const handleAcceptRequest = async (request: DesignRequest) => {
    try {
      Alert.alert(
        'Accept Request',
        `Accept the ${request.service_type} request from ${request.client_name}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Accept', 
            style: 'default',
            onPress: async () => {
              try {
                console.log('🔄 Processing accept request...');
                const success = await updateRequestStatus(request.id, 'accepted', 'Request accepted by admin');
                
                if (success) {
                  Alert.alert(
                    'Success! 🎉',
                    `Request from ${request.client_name} has been accepted successfully!`,
                    [{ text: 'OK', style: 'default' }]
                  );
                }
              } catch (error) {
                console.error('❌ Error accepting request:', error);
                Alert.alert(
                  'Error',
                  `Failed to accept request: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
                  [{ text: 'OK', style: 'default' }]
                );
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('❌ Error showing accept dialog:', error);
      Alert.alert('Error', 'Failed to show accept dialog. Please try again.');
    }
  };

  const handleRejectRequest = async (request: DesignRequest) => {
    try {
      Alert.prompt(
        'Reject Request',
        `Provide a reason for rejecting ${request.client_name}'s request:`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Reject', 
            style: 'destructive',
            onPress: async (reason) => {
              try {
                console.log('🔄 Processing reject request...');
                const adminNotes = reason || 'Request rejected by admin';
                const success = await updateRequestStatus(request.id, 'rejected', adminNotes);
                
                if (success) {
                  Alert.alert(
                    'Request Rejected',
                    `Request from ${request.client_name} has been rejected.${reason ? `\n\nReason: ${reason}` : ''}`,
                    [{ text: 'OK', style: 'default' }]
                  );
                }
              } catch (error) {
                console.error('❌ Error rejecting request:', error);
                Alert.alert(
                  'Error',
                  `Failed to reject request: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
                  [{ text: 'OK', style: 'default' }]
                );
              }
            }
          }
        ],
        'plain-text',
        'Please provide a brief explanation...'
      );
    } catch (error) {
      console.error('❌ Error showing reject dialog:', error);
      // Fallback to simple alert if prompt fails
      Alert.alert(
        'Reject Request',
        `Are you sure you want to reject ${request.client_name}'s request?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Reject', 
            style: 'destructive',
            onPress: async () => {
              try {
                console.log('🔄 Processing reject request (fallback)...');
                const success = await updateRequestStatus(request.id, 'rejected', 'Request rejected by admin');
                
                if (success) {
                  Alert.alert(
                    'Request Rejected',
                    `Request from ${request.client_name} has been rejected.`,
                    [{ text: 'OK', style: 'default' }]
                  );
                }
              } catch (error) {
                console.error('❌ Error rejecting request (fallback):', error);
                Alert.alert(
                  'Error',
                  `Failed to reject request: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
                  [{ text: 'OK', style: 'default' }]
                );
              }
            }
          }
        ]
      );
    }
  };

  const createGlobalMessage = async () => {
    if (!globalMessageTitle.trim() || !globalMessageText.trim()) {
      Alert.alert('Error', 'Please fill in both title and message');
      return;
    }

    const message: GlobalMessage = {
      id: `MSG-${Date.now()}`,
      title: globalMessageTitle.trim(),
      message: globalMessageText.trim(),
      type: globalMessageType,
      created_at: new Date().toISOString(),
      is_active: true,
    };

    try {
      if (supabaseService.isReady()) {
        const result = await supabaseService.createGlobalMessage(message);
        if (result.success) {
          Alert.alert('Success', 'Global message created successfully!');
          setGlobalMessageTitle('');
          setGlobalMessageText('');
          setShowGlobalMessageForm(false);
          return;
        }
      }

      // Fallback to local storage
      const existingMessages = await AsyncStorage.getItem('global_messages');
      const messages = existingMessages ? JSON.parse(existingMessages) : [];
      messages.push(message);
      await AsyncStorage.setItem('global_messages', JSON.stringify(messages));
      
      Alert.alert('Success', 'Global message created successfully!');
      setGlobalMessageTitle('');
      setGlobalMessageText('');
      setShowGlobalMessageForm(false);
    } catch (error) {
      console.error('Error creating global message:', error);
      Alert.alert('Error', 'Failed to create global message');
    }
  };

  // Cloud Database Configuration Functions
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
          'Supabase configured successfully! Your app is now fully cloud-based with global data access.',
          [{ text: 'OK', onPress: () => setShowSupabaseConfig(false) }]
        );
        console.log('✅ Supabase configured successfully');
        await loadRequests(); // Reload requests from new database
      } else {
        Alert.alert('Error', 'Failed to configure Supabase. Please check your URL and key.');
      }
    } catch (error) {
      console.error('Error configuring Supabase:', error);
      Alert.alert('Error', 'Failed to configure Supabase');
    }
  };

  const handleSupabaseTest = async () => {
    if (!supabaseUrl.trim() || !supabaseKey.trim()) {
      Alert.alert('Error', 'Please enter both URL and key first');
      return;
    }

    try {
      // Test the connection by trying to create a temporary client
      const testClient = await supabaseService.configure(supabaseUrl.trim(), supabaseKey.trim());
      if (testClient) {
        Alert.alert('Success! 🎉', 'Supabase connection test successful!');
      } else {
        Alert.alert('Error ❌', 'Failed to connect to Supabase. Please check your credentials.');
      }
    } catch (error) {
      console.error('Supabase test error:', error);
      Alert.alert('Error ❌', 'Connection test failed. Please verify your URL and key.');
    }
  };

  // Discord Integration Functions
  const handleDiscordSave = async () => {
    try {
      if (webhookUrl.trim()) {
        await AsyncStorage.setItem('discord_webhook_url', webhookUrl.trim());
        Alert.alert('Success', 'Discord webhook URL saved successfully!');
        console.log('✅ Discord webhook URL saved');
      } else {
        await AsyncStorage.removeItem('discord_webhook_url');
        Alert.alert('Success', 'Discord webhook URL removed!');
        console.log('✅ Discord webhook URL removed');
      }
      setShowDiscordConfig(false);
    } catch (error) {
      console.error('Error saving Discord webhook URL:', error);
      Alert.alert('Error', 'Failed to save Discord webhook URL');
    }
  };

  const handleDiscordTest = async () => {
    if (!webhookUrl.trim()) {
      Alert.alert('Error', 'Please enter a webhook URL first');
      return;
    }

    const testMessage = {
      content: '🧪 **Test Message from Logify Makers Admin Panel**',
      embeds: [{
        title: '✅ Discord Integration Test Successful',
        description: 'Your Discord webhook is working correctly! New design requests will be sent to this channel.',
        color: 0x00ff00,
        timestamp: new Date().toISOString(),
        footer: {
          text: 'Logify Makers - Admin Panel Test'
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

  const handleDiscordRemove = async () => {
    Alert.alert(
      'Remove Discord Integration',
      'Are you sure you want to remove the Discord webhook URL? You will no longer receive notifications for new requests.',
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
              console.log('✅ Discord webhook URL removed');
            } catch (error) {
              console.error('Error removing Discord webhook URL:', error);
              Alert.alert('Error', 'Failed to remove Discord webhook URL');
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status: DesignRequest['status']) => {
    switch (status) {
      case 'accepted': return colors.success;
      case 'rejected': return colors.error;
      case 'in_progress': return colors.info;
      case 'completed': return colors.success;
      case 'cancelled': return colors.grey;
      default: return colors.warning;
    }
  };

  const getStatusIcon = (status: DesignRequest['status']) => {
    switch (status) {
      case 'accepted': return 'checkmark-circle';
      case 'rejected': return 'close-circle';
      case 'in_progress': return 'time';
      case 'completed': return 'checkmark-done-circle';
      case 'cancelled': return 'ban';
      default: return 'hourglass';
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <Icon name="hourglass" size={48} color={colors.accent} />
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: '600', marginTop: 16 }}>
          Loading requests...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: colors.background }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={{ padding: 24 }}>
        {/* Cloud Database Configuration Section */}
        <View style={{
          backgroundColor: colors.card,
          borderRadius: 20,
          padding: 24,
          marginBottom: 24,
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
            <View style={{
              backgroundColor: supabaseService.isReady() ? colors.success : colors.warning,
              paddingHorizontal: 12,
              paddingVertical: 4,
              borderRadius: 12,
              marginLeft: 12,
            }}>
              <Text style={{
                color: 'white',
                fontSize: 12,
                fontWeight: '700',
              }}>
                {supabaseService.isReady() ? 'CONNECTED' : 'NOT CONFIGURED'}
              </Text>
            </View>
          </View>
          
          <Text style={{
            fontSize: 14,
            color: colors.textSecondary,
            marginBottom: 16,
            lineHeight: 20,
            fontWeight: '500',
          }}>
            Configure Supabase for full cloud-based functionality with global data access and real-time synchronization.
          </Text>
          
          <TouchableOpacity
            onPress={() => setShowSupabaseConfig(true)}
            style={{
              backgroundColor: supabaseService.isReady() ? colors.info : colors.accent,
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
              name={supabaseService.isReady() ? "settings" : "cloud-upload"} 
              size={20} 
              color="white" 
              style={{ marginRight: 8 }} 
            />
            <Text style={{
              color: 'white',
              fontWeight: '700',
              fontSize: 16,
            }}>
              {supabaseService.isReady() ? 'Reconfigure Database' : 'Configure Database'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Discord Integration Section */}
        <View style={{
          backgroundColor: colors.card,
          borderRadius: 20,
          padding: 24,
          marginBottom: 24,
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
            <View style={{
              backgroundColor: webhookUrl ? colors.success : colors.warning,
              paddingHorizontal: 12,
              paddingVertical: 4,
              borderRadius: 12,
              marginLeft: 12,
            }}>
              <Text style={{
                color: 'white',
                fontSize: 12,
                fontWeight: '700',
              }}>
                {webhookUrl ? 'CONFIGURED' : 'NOT CONFIGURED'}
              </Text>
            </View>
          </View>
          
          <Text style={{
            fontSize: 14,
            color: colors.textSecondary,
            marginBottom: 16,
            lineHeight: 20,
            fontWeight: '500',
          }}>
            Configure Discord webhook to receive instant notifications when new design requests are submitted.
          </Text>
          
          <TouchableOpacity
            onPress={() => setShowDiscordConfig(true)}
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
            <Icon 
              name={webhookUrl ? "settings" : "notifications"} 
              size={20} 
              color="white" 
              style={{ marginRight: 8 }} 
            />
            <Text style={{
              color: 'white',
              fontWeight: '700',
              fontSize: 16,
            }}>
              {webhookUrl ? 'Reconfigure Discord' : 'Configure Discord'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Global Message Section */}
        <View style={{
          backgroundColor: colors.card,
          borderRadius: 20,
          padding: 24,
          marginBottom: 24,
          borderWidth: 1,
          borderColor: colors.border,
          ...shadows.medium,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
            <Icon name="megaphone" size={24} color={colors.accent} style={{ marginRight: 12 }} />
            <Text style={{
              fontSize: 20,
              fontWeight: '800',
              color: colors.text,
              letterSpacing: -0.3,
            }}>
              Global Messages
            </Text>
          </View>
          
          <TouchableOpacity
            onPress={() => setShowGlobalMessageForm(!showGlobalMessageForm)}
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
            <Icon name={showGlobalMessageForm ? "close" : "add"} size={20} color="white" style={{ marginRight: 8 }} />
            <Text style={{
              color: 'white',
              fontWeight: '700',
              fontSize: 16,
            }}>
              {showGlobalMessageForm ? 'Cancel' : 'Create Global Message'}
            </Text>
          </TouchableOpacity>

          {showGlobalMessageForm && (
            <View style={{ marginTop: 20 }}>
              <Text style={{
                fontSize: 16,
                color: colors.text,
                marginBottom: 8,
                fontWeight: '700',
              }}>
                Message Title
              </Text>
              <TextInput
                style={{
                  backgroundColor: colors.backgroundAlt,
                  borderColor: colors.border,
                  borderWidth: 1,
                  borderRadius: 12,
                  padding: 16,
                  color: colors.text,
                  fontSize: 16,
                  marginBottom: 16,
                  ...shadows.small,
                }}
                placeholder="Enter message title"
                placeholderTextColor={colors.textSecondary}
                value={globalMessageTitle}
                onChangeText={setGlobalMessageTitle}
              />

              <Text style={{
                fontSize: 16,
                color: colors.text,
                marginBottom: 8,
                fontWeight: '700',
              }}>
                Message Text
              </Text>
              <TextInput
                style={{
                  backgroundColor: colors.backgroundAlt,
                  borderColor: colors.border,
                  borderWidth: 1,
                  borderRadius: 12,
                  padding: 16,
                  color: colors.text,
                  fontSize: 16,
                  minHeight: 80,
                  textAlignVertical: 'top',
                  marginBottom: 16,
                  ...shadows.small,
                }}
                placeholder="Enter your global message"
                placeholderTextColor={colors.textSecondary}
                value={globalMessageText}
                onChangeText={setGlobalMessageText}
                multiline
              />

              <Text style={{
                fontSize: 16,
                color: colors.text,
                marginBottom: 8,
                fontWeight: '700',
              }}>
                Message Type
              </Text>
              <View style={{ flexDirection: 'row', marginBottom: 20 }}>
                {(['info', 'success', 'warning', 'error'] as const).map((type) => (
                  <TouchableOpacity
                    key={type}
                    onPress={() => setGlobalMessageType(type)}
                    style={{
                      backgroundColor: globalMessageType === type ? colors[type] : colors.backgroundAlt,
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                      borderRadius: 12,
                      marginRight: 8,
                      borderWidth: 1,
                      borderColor: globalMessageType === type ? colors[type] : colors.border,
                    }}
                  >
                    <Text style={{
                      color: globalMessageType === type ? 'white' : colors.text,
                      fontWeight: '600',
                      fontSize: 14,
                      textTransform: 'capitalize',
                    }}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                onPress={createGlobalMessage}
                style={{
                  backgroundColor: colors.success,
                  paddingHorizontal: 20,
                  paddingVertical: 14,
                  borderRadius: 16,
                  alignItems: 'center',
                  ...shadows.medium,
                }}
              >
                <Text style={{
                  color: 'white',
                  fontWeight: '700',
                  fontSize: 16,
                }}>
                  Create Message
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Requests Section */}
        <View style={{
          backgroundColor: colors.card,
          borderRadius: 20,
          padding: 24,
          borderWidth: 1,
          borderColor: colors.border,
          ...shadows.medium,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
            <Icon name="document-text" size={24} color={colors.accent} style={{ marginRight: 12 }} />
            <Text style={{
              fontSize: 20,
              fontWeight: '800',
              color: colors.text,
              letterSpacing: -0.3,
            }}>
              Design Requests ({requests.length})
            </Text>
          </View>

          {requests.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <Icon name="document-outline" size={64} color={colors.textSecondary} style={{ marginBottom: 16 }} />
              <Text style={{
                fontSize: 18,
                color: colors.textSecondary,
                textAlign: 'center',
                fontWeight: '600',
              }}>
                No requests found
              </Text>
              <Text style={{
                fontSize: 14,
                color: colors.textSecondary,
                textAlign: 'center',
                marginTop: 8,
                opacity: 0.7,
              }}>
                New requests will appear here
              </Text>
            </View>
          ) : (
            requests.map((request) => (
              <View
                key={request.id}
                style={{
                  backgroundColor: colors.backgroundAlt,
                  borderRadius: 16,
                  padding: 20,
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: colors.border,
                  ...shadows.small,
                }}
              >
                {/* Request Header */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                  <View style={{
                    backgroundColor: getStatusColor(request.status),
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                  }}>
                    <Icon name={getStatusIcon(request.status) as any} size={20} color="white" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{
                      fontSize: 18,
                      fontWeight: '800',
                      color: colors.text,
                      marginBottom: 4,
                    }}>
                      {request.client_name}
                    </Text>
                    <Text style={{
                      fontSize: 14,
                      color: colors.textSecondary,
                      fontWeight: '600',
                    }}>
                      {request.service_type} • {new Date(request.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                </View>

                {/* Request Details */}
                <View style={{ marginBottom: 16 }}>
                  <Text style={{
                    fontSize: 16,
                    color: colors.text,
                    marginBottom: 8,
                    fontWeight: '600',
                  }}>
                    📧 {request.email}
                  </Text>
                  <Text style={{
                    fontSize: 16,
                    color: colors.text,
                    marginBottom: 8,
                    fontWeight: '600',
                  }}>
                    💬 {request.discord_username}
                  </Text>
                  {request.budget && (
                    <Text style={{
                      fontSize: 16,
                      color: colors.text,
                      marginBottom: 8,
                      fontWeight: '600',
                    }}>
                      💰 {request.budget}
                    </Text>
                  )}
                  <Text style={{
                    fontSize: 14,
                    color: colors.text,
                    lineHeight: 20,
                    marginTop: 8,
                  }}>
                    {request.description}
                  </Text>
                  {request.contact_info && (
                    <Text style={{
                      fontSize: 14,
                      color: colors.textSecondary,
                      marginTop: 8,
                      fontStyle: 'italic',
                    }}>
                      Contact: {request.contact_info}
                    </Text>
                  )}
                </View>

                {/* Admin Actions */}
                {request.status === 'pending' && (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <TouchableOpacity
                      onPress={() => handleAcceptRequest(request)}
                      style={{
                        backgroundColor: colors.success,
                        paddingHorizontal: 20,
                        paddingVertical: 12,
                        borderRadius: 12,
                        flex: 1,
                        marginRight: 8,
                        alignItems: 'center',
                        ...shadows.small,
                      }}
                    >
                      <Text style={{
                        color: 'white',
                        fontWeight: '700',
                        fontSize: 16,
                      }}>
                        Accept
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      onPress={() => handleRejectRequest(request)}
                      style={{
                        backgroundColor: colors.error,
                        paddingHorizontal: 20,
                        paddingVertical: 12,
                        borderRadius: 12,
                        flex: 1,
                        marginLeft: 8,
                        alignItems: 'center',
                        ...shadows.small,
                      }}
                    >
                      <Text style={{
                        color: 'white',
                        fontWeight: '700',
                        fontSize: 16,
                      }}>
                        Reject
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Admin Notes */}
                {request.admin_notes && (
                  <View style={{
                    backgroundColor: colors.card,
                    padding: 12,
                    borderRadius: 8,
                    marginTop: 12,
                    borderLeftWidth: 4,
                    borderLeftColor: colors.accent,
                  }}>
                    <Text style={{
                      fontSize: 12,
                      color: colors.textSecondary,
                      fontWeight: '600',
                      marginBottom: 4,
                    }}>
                      ADMIN NOTES:
                    </Text>
                    <Text style={{
                      fontSize: 14,
                      color: colors.text,
                    }}>
                      {request.admin_notes}
                    </Text>
                  </View>
                )}
              </View>
            ))
          )}
        </View>
      </View>

      {/* Supabase Configuration Modal */}
      {showSupabaseConfig && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
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
                Configure Cloud Database
              </Text>
            </View>

            <Text style={{
              fontSize: 14,
              color: colors.textSecondary,
              marginBottom: 20,
              lineHeight: 20,
              fontWeight: '500',
            }}>
              Enter your Supabase project URL and anonymous key to enable full cloud functionality with global data access.
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

            <View style={{ flexDirection: 'row', marginBottom: 20 }}>
              <TouchableOpacity
                onPress={handleSupabaseTest}
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
                  Test Connection
                </Text>
              </TouchableOpacity>
            </View>

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
                  Save & Connect
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Discord Configuration Modal */}
      {showDiscordConfig && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
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
                Configure Discord
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

            <Text style={{
              fontSize: 16,
              color: colors.text,
              marginBottom: 8,
              fontWeight: '700',
            }}>
              Discord Webhook URL
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
                onPress={handleDiscordTest}
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
                  Test Webhook
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleDiscordRemove}
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
                onPress={() => setShowDiscordConfig(false)}
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
                onPress={handleDiscordSave}
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
                  Save Webhook
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}
