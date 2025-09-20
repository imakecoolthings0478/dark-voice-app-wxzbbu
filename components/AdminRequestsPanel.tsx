
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, TextInput, RefreshControl } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { shadows } from '../styles/commonStyles';
import Icon from './Icon';
import { DesignRequest, GlobalMessage } from '../types';
import { supabaseService } from '../services/supabaseService';
import { AdminService } from '../services/adminService';
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

  useEffect(() => {
    loadRequests();
    // Extend admin session when panel is accessed
    AdminService.extendSession();
  }, []);

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
  ) => {
    try {
      // Update in cloud first
      if (supabaseService.isReady()) {
        const result = await supabaseService.updateRequestStatus(requestId, newStatus, adminNotes);
        if (result.success) {
          console.log('✅ Request updated in cloud');
        } else {
          console.log('❌ Failed to update in cloud:', result.error);
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
      
      const statusText = newStatus === 'accepted' ? 'accepted' : 
                        newStatus === 'rejected' ? 'rejected' : newStatus;
      
      Alert.alert('Success', `Request ${requestId} has been ${statusText}`);
      console.log(`Request ${requestId} status updated to ${newStatus}`);
      
      // Extend admin session
      AdminService.extendSession();
    } catch (error) {
      console.error('Error updating request status:', error);
      Alert.alert('Error', 'Failed to update request status');
    }
  };

  const handleAcceptRequest = (request: DesignRequest) => {
    Alert.alert(
      'Accept Request',
      `Accept the ${request.service_type} request from ${request.client_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Accept', 
          style: 'default',
          onPress: () => updateRequestStatus(request.id, 'accepted', 'Request accepted by admin')
        }
      ]
    );
  };

  const handleRejectRequest = (request: DesignRequest) => {
    Alert.prompt(
      'Reject Request',
      `Provide a reason for rejecting ${request.client_name}'s request:`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reject', 
          style: 'destructive',
          onPress: (reason) => {
            const adminNotes = reason || 'Request rejected by admin';
            updateRequestStatus(request.id, 'rejected', adminNotes);
          }
        }
      ],
      'plain-text',
      'Please provide a brief explanation...'
    );
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
    </ScrollView>
  );
}
