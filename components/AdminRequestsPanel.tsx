
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { shadows } from '../styles/commonStyles';
import Icon from './Icon';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface DesignRequest {
  id: string;
  client_name: string;
  service_type: string;
  description: string;
  budget?: string;
  contact_info: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
}

export default function AdminRequestsPanel() {
  const { colors } = useTheme();
  const [requests, setRequests] = useState<DesignRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const savedRequests = await AsyncStorage.getItem('design_requests');
      if (savedRequests) {
        setRequests(JSON.parse(savedRequests));
      } else {
        // Mock data for demonstration
        const mockRequests: DesignRequest[] = [
          {
            id: 'REQ-001',
            client_name: 'John Doe',
            service_type: 'Logo Design',
            description: 'Need a modern logo for my tech startup. Looking for something clean and professional.',
            budget: '$100-200',
            contact_info: 'john.doe@email.com',
            status: 'pending',
            created_at: new Date().toISOString(),
          },
          {
            id: 'REQ-002',
            client_name: 'Sarah Smith',
            service_type: 'YouTube Banner',
            description: 'Gaming channel banner with dark theme and neon colors.',
            budget: '$50-100',
            contact_info: 'sarah_gaming#1234',
            status: 'in_progress',
            created_at: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            id: 'REQ-003',
            client_name: 'Mike Johnson',
            service_type: 'YouTube Thumbnail',
            description: 'Thumbnail for cooking video, needs to be eye-catching.',
            contact_info: 'mike.johnson@gmail.com',
            status: 'completed',
            created_at: new Date(Date.now() - 172800000).toISOString(),
          },
        ];
        setRequests(mockRequests);
        await AsyncStorage.setItem('design_requests', JSON.stringify(mockRequests));
      }
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (requestId: string, newStatus: DesignRequest['status']) => {
    try {
      const updatedRequests = requests.map(req => 
        req.id === requestId ? { ...req, status: newStatus } : req
      );
      setRequests(updatedRequests);
      await AsyncStorage.setItem('design_requests', JSON.stringify(updatedRequests));
      
      Alert.alert('Success', `Request ${requestId} status updated to ${newStatus}`);
      console.log(`Request ${requestId} status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating request status:', error);
      Alert.alert('Error', 'Failed to update request status');
    }
  };

  const getStatusColor = (status: DesignRequest['status']) => {
    switch (status) {
      case 'pending': return colors.warning;
      case 'in_progress': return colors.info;
      case 'completed': return colors.success;
      case 'cancelled': return colors.error;
      default: return colors.grey;
    }
  };

  const getStatusIcon = (status: DesignRequest['status']) => {
    switch (status) {
      case 'pending': return 'time-outline';
      case 'in_progress': return 'construct-outline';
      case 'completed': return 'checkmark-circle-outline';
      case 'cancelled': return 'close-circle-outline';
      default: return 'help-circle-outline';
    }
  };

  if (loading) {
    return (
      <View style={{ padding: 20, alignItems: 'center' }}>
        <Icon name="hourglass" size={32} color={colors.accent} />
        <Text style={{ color: colors.text, marginTop: 12 }}>Loading requests...</Text>
      </View>
    );
  }

  return (
    <View style={{ padding: 20 }}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
      }}>
        <Icon name="list" size={24} color={colors.accent} style={{ marginRight: 12 }} />
        <Text style={{
          fontSize: 20,
          fontWeight: 'bold',
          color: colors.text,
        }}>
          Design Requests ({requests.length})
        </Text>
      </View>

      {requests.length === 0 ? (
        <View style={{
          backgroundColor: colors.card,
          padding: 40,
          borderRadius: 16,
          alignItems: 'center',
          borderWidth: 1,
          borderColor: colors.border,
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
            New requests will appear here
          </Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
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
                    {request.client_name}
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
                    textTransform: 'capitalize',
                  }}>
                    {request.status.replace('_', ' ')}
                  </Text>
                </View>
              </View>

              {/* Service Type */}
              <View style={{
                backgroundColor: colors.backgroundAlt,
                padding: 12,
                borderRadius: 12,
                marginBottom: 16,
              }}>
                <Text style={{
                  fontSize: 14,
                  fontWeight: 'bold',
                  color: colors.accent,
                  marginBottom: 4,
                }}>
                  Service: {request.service_type}
                </Text>
                {request.budget && (
                  <Text style={{
                    fontSize: 12,
                    color: colors.textSecondary,
                  }}>
                    Budget: {request.budget}
                  </Text>
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

              {/* Contact Info */}
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 20,
                paddingTop: 16,
                borderTopWidth: 1,
                borderTopColor: colors.border,
              }}>
                <Icon name="mail" size={16} color={colors.textSecondary} style={{ marginRight: 8 }} />
                <Text style={{
                  fontSize: 14,
                  color: colors.textSecondary,
                }}>
                  {request.contact_info}
                </Text>
              </View>

              {/* Action Buttons */}
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}>
                {request.status === 'pending' && (
                  <>
                    <TouchableOpacity
                      onPress={() => updateRequestStatus(request.id, 'in_progress')}
                      style={{
                        backgroundColor: colors.info,
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                        borderRadius: 12,
                        flex: 1,
                        marginRight: 8,
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 12 }}>
                        Start Work
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => updateRequestStatus(request.id, 'cancelled')}
                      style={{
                        backgroundColor: colors.error,
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                        borderRadius: 12,
                        flex: 1,
                        marginLeft: 8,
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 12 }}>
                        Decline
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
                
                {request.status === 'in_progress' && (
                  <TouchableOpacity
                    onPress={() => updateRequestStatus(request.id, 'completed')}
                    style={{
                      backgroundColor: colors.success,
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                      borderRadius: 12,
                      flex: 1,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 12 }}>
                      Mark Complete
                    </Text>
                  </TouchableOpacity>
                )}

                {(request.status === 'completed' || request.status === 'cancelled') && (
                  <TouchableOpacity
                    onPress={() => updateRequestStatus(request.id, 'pending')}
                    style={{
                      backgroundColor: colors.grey,
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                      borderRadius: 12,
                      flex: 1,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 12 }}>
                      Reopen
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
