
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { shadows } from '../styles/commonStyles';
import Icon from './Icon';
import { DesignRequest } from '../types';
import { supabaseService } from '../services/supabaseService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function MyRequestsPanel() {
  const { colors } = useTheme();
  const [requests, setRequests] = useState<DesignRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadMyRequests();
  }, []);

  const loadMyRequests = async () => {
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
      Alert.alert('Error', 'Failed to load your requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMyRequests();
    setRefreshing(false);
  };

  const getStatusColor = (status: DesignRequest['status']) => {
    switch (status) {
      case 'pending': return colors.warning;
      case 'accepted': return colors.success;
      case 'rejected': return colors.error;
      case 'in_progress': return colors.info;
      case 'completed': return colors.success;
      case 'cancelled': return colors.error;
      default: return colors.grey;
    }
  };

  const getStatusIcon = (status: DesignRequest['status']) => {
    switch (status) {
      case 'pending': return 'time-outline';
      case 'accepted': return 'checkmark-circle-outline';
      case 'rejected': return 'close-circle-outline';
      case 'in_progress': return 'construct-outline';
      case 'completed': return 'checkmark-done-outline';
      case 'cancelled': return 'ban-outline';
      default: return 'help-circle-outline';
    }
  };

  const getStatusText = (status: DesignRequest['status']) => {
    switch (status) {
      case 'pending': return 'Pending Review';
      case 'accepted': return 'Accepted';
      case 'rejected': return 'Rejected';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return 'Unknown';
    }
  };

  if (loading) {
    return (
      <View style={{ padding: 20, alignItems: 'center' }}>
        <Icon name="hourglass" size={32} color={colors.accent} />
        <Text style={{ color: colors.text, marginTop: 12 }}>Loading your requests...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}>
        <Icon name="document-text" size={24} color={colors.accent} style={{ marginRight: 12 }} />
        <Text style={{
          fontSize: 20,
          fontWeight: 'bold',
          color: colors.text,
        }}>
          My Requests ({requests.length})
        </Text>
      </View>

      {requests.length === 0 ? (
        <ScrollView
          contentContainerStyle={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <View style={{
            backgroundColor: colors.card,
            padding: 40,
            borderRadius: 16,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: colors.border,
            width: '100%',
          }}>
            <Icon name="document-outline" size={48} color={colors.textSecondary} />
            <Text style={{
              color: colors.textSecondary,
              fontSize: 16,
              marginTop: 16,
              textAlign: 'center',
            }}>
              No requests found
            </Text>
            <Text style={{
              color: colors.textSecondary,
              fontSize: 14,
              marginTop: 8,
              textAlign: 'center',
            }}>
              Submit your first design request to get started
            </Text>
          </View>
        </ScrollView>
      ) : (
        <ScrollView 
          style={{ flex: 1 }} 
          contentContainerStyle={{ padding: 20 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
        >
          {requests.map((request) => (
            <View
              key={request.id}
              style={{
                backgroundColor: colors.card,
                padding: 20,
                borderRadius: 16,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: colors.border,
                ...shadows.medium,
              }}
            >
              {/* Header */}
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16,
              }}>
                <View>
                  <Text style={{
                    fontSize: 16,
                    fontWeight: 'bold',
                    color: colors.text,
                    marginBottom: 4,
                  }}>
                    {request.service_type}
                  </Text>
                  <Text style={{
                    fontSize: 12,
                    color: colors.textSecondary,
                  }}>
                    {request.id} • {new Date(request.created_at).toLocaleDateString()}
                  </Text>
                </View>
                <View style={{
                  backgroundColor: getStatusColor(request.status),
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                  <Icon 
                    name={getStatusIcon(request.status) as any} 
                    size={14} 
                    color="white" 
                    style={{ marginRight: 6 }} 
                  />
                  <Text style={{
                    color: 'white',
                    fontSize: 12,
                    fontWeight: 'bold',
                  }}>
                    {getStatusText(request.status)}
                  </Text>
                </View>
              </View>

              {/* Client Details */}
              <View style={{
                backgroundColor: colors.backgroundAlt,
                padding: 16,
                borderRadius: 12,
                marginBottom: 16,
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Icon name="person" size={16} color={colors.accent} style={{ marginRight: 8 }} />
                  <Text style={{ fontSize: 14, color: colors.text, fontWeight: '600' }}>
                    {request.client_name}
                  </Text>
                </View>
                
                {request.email && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <Icon name="mail" size={16} color={colors.accent} style={{ marginRight: 8 }} />
                    <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                      {request.email}
                    </Text>
                  </View>
                )}
                
                {request.discord_username && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <Icon name="logo-discord" size={16} color={colors.accent} style={{ marginRight: 8 }} />
                    <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                      {request.discord_username}
                    </Text>
                  </View>
                )}

                {request.budget && (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Icon name="card" size={16} color={colors.accent} style={{ marginRight: 8 }} />
                    <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                      Budget: {request.budget}
                    </Text>
                  </View>
                )}
              </View>

              {/* Description */}
              <Text style={{
                fontSize: 14,
                color: colors.text,
                lineHeight: 20,
                marginBottom: 16,
              }}>
                {request.description}
              </Text>

              {/* Admin Notes */}
              {request.admin_notes && (
                <View style={{
                  backgroundColor: colors.info,
                  padding: 12,
                  borderRadius: 12,
                  marginBottom: 16,
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <Icon name="chatbubble-ellipses" size={16} color="white" style={{ marginRight: 8 }} />
                    <Text style={{ color: 'white', fontSize: 14, fontWeight: 'bold' }}>
                      Admin Notes
                    </Text>
                  </View>
                  <Text style={{ color: 'white', fontSize: 14, lineHeight: 18 }}>
                    {request.admin_notes}
                  </Text>
                </View>
              )}

              {/* Contact Info */}
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingTop: 16,
                borderTopWidth: 1,
                borderTopColor: colors.border,
              }}>
                <Icon name="call" size={16} color={colors.textSecondary} style={{ marginRight: 8 }} />
                <Text style={{
                  fontSize: 14,
                  color: colors.textSecondary,
                }}>
                  {request.contact_info}
                </Text>
              </View>

              {/* Updated timestamp */}
              {request.updated_at && (
                <Text style={{
                  fontSize: 12,
                  color: colors.textSecondary,
                  textAlign: 'right',
                  marginTop: 8,
                  fontStyle: 'italic',
                }}>
                  Last updated: {new Date(request.updated_at).toLocaleString()}
                </Text>
              )}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
