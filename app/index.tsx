
import { Text, View, TextInput, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { shadows } from '../styles/commonStyles';
import Button from '../components/Button';
import Icon from '../components/Icon';
import SettingsBottomSheet from '../components/SettingsBottomSheet';
import { useAuth } from '../hooks/useAuth';
import { DiscordService } from '../services/discordService';
import { DesignRequest } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LogifyMakersApp() {
  const { user, isAdmin, loading } = useAuth();
  const { colors } = useTheme();
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [orderAcceptStatus, setOrderAcceptStatus] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Form state
  const [clientName, setClientName] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [contactInfo, setContactInfo] = useState('');

  const services = [
    { name: 'Logo Design', icon: 'brush-outline', color: colors.professional.blue },
    { name: 'YouTube Banner', icon: 'image-outline', color: colors.professional.purple },
    { name: 'Professional Profile Photo', icon: 'person-circle-outline', color: colors.professional.teal },
    { name: 'YouTube Thumbnail', icon: 'play-outline', color: colors.professional.orange },
    { name: 'Custom Design', icon: 'create-outline', color: colors.professional.pink }
  ];

  const handleDiscordLink = async () => {
    const discordUrl = 'https://discord.gg/7kj6eHGrAS';
    try {
      const supported = await Linking.canOpenURL(discordUrl);
      if (supported) {
        await Linking.openURL(discordUrl);
        console.log('Opening Discord link');
      } else {
        Alert.alert('Error', 'Cannot open Discord link');
      }
    } catch (error) {
      console.error('Error opening Discord link:', error);
      Alert.alert('Error', 'Failed to open Discord link');
    }
  };

  const handleSubmitRequest = async () => {
    if (!clientName.trim() || !serviceType || !description.trim() || !contactInfo.trim()) {
      Alert.alert('Missing Information ⚠️', 'Please fill in all required fields to submit your request.');
      return;
    }

    if (!orderAcceptStatus) {
      Alert.alert(
        'Orders Currently Closed 🔒', 
        'We are not accepting new orders at the moment. Would you like to submit your request anyway? It will be queued for when we reopen.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Submit Anyway', onPress: () => submitRequest(), style: 'default' }
        ]
      );
      return;
    }

    await submitRequest();
  };

  const submitRequest = async () => {
    setSubmitting(true);
    
    try {
      const requestData: DesignRequest = {
        id: `REQ-${Date.now()}`,
        client_name: clientName.trim(),
        service_type: serviceType,
        description: description.trim(),
        budget: budget.trim() || undefined,
        contact_info: contactInfo.trim(),
        status: 'pending',
        created_at: new Date().toISOString(),
      };

      console.log('🚀 Submitting request:', requestData);

      // Save request locally
      try {
        const existingRequests = await AsyncStorage.getItem('design_requests');
        const requests = existingRequests ? JSON.parse(existingRequests) : [];
        requests.unshift(requestData);
        await AsyncStorage.setItem('design_requests', JSON.stringify(requests));
        console.log('✅ Request saved locally');
      } catch (error) {
        console.error('Error saving request locally:', error);
      }

      // Try to send to Discord if webhook is configured
      const webhookUrl = await AsyncStorage.getItem('discord_webhook_url');
      let discordSuccess = false;
      
      if (webhookUrl) {
        discordSuccess = await DiscordService.sendRequestToDiscord(requestData, webhookUrl);
      }

      if (discordSuccess) {
        Alert.alert(
          'Request Submitted Successfully! 🎉', 
          `Thank you ${clientName}! Your ${serviceType.toLowerCase()} request has been sent to our team via Discord. We&apos;ll review it and contact you soon at ${contactInfo}.\n\nJoin our Discord community for real-time updates and exclusive offers!`,
          [
            {
              text: 'Join Discord',
              onPress: handleDiscordLink,
              style: 'default'
            },
            {
              text: 'Perfect!',
              style: 'default'
            }
          ]
        );
      } else {
        Alert.alert(
          'Request Submitted! 📝',
          `Your request has been saved successfully! ${webhookUrl ? 'We couldn&apos;t send it to Discord right now, but' : 'Configure Discord webhook in settings for instant notifications, or'} please join our Discord and mention your request for faster processing.\n\nRequest ID: ${requestData.id}`,
          [
            {
              text: 'Join Discord',
              onPress: handleDiscordLink,
              style: 'default'
            },
            {
              text: 'OK',
              style: 'default'
            }
          ]
        );
      }

      // Clear form
      setClientName('');
      setServiceType('');
      setDescription('');
      setBudget('');
      setContactInfo('');
      setShowRequestForm(false);

    } catch (error) {
      console.error('Error submitting request:', error);
      Alert.alert(
        'Submission Error ❌', 
        'Failed to submit request. Please try again or contact us directly on Discord for immediate assistance.',
        [
          {
            text: 'Join Discord',
            onPress: handleDiscordLink,
            style: 'default'
          },
          {
            text: 'Retry',
            style: 'default'
          }
        ]
      );
    } finally {
      setSubmitting(false);
    }
  };

  const toggleOrderStatus = () => {
    if (!isAdmin()) {
      Alert.alert(
        'Access Denied 🚫',
        "You&apos;re not an admin. Only users with &apos;owner&apos; or &apos;admin&apos; roles can change the order status.\n\nContact an admin on Discord if you need to make changes.",
        [
          {
            text: 'Join Discord',
            onPress: handleDiscordLink,
            style: 'default'
          },
          {
            text: 'OK',
            style: 'default'
          }
        ]
      );
      console.log(`Non-admin user ${user?.discord_username || 'Anonymous'} attempted to change order status`);
      return;
    }

    setOrderAcceptStatus(!orderAcceptStatus);
    console.log(`Admin ${user?.discord_username} changed order status to:`, !orderAcceptStatus ? 'Accepting' : 'Not Accepting');
  };

  if (loading) {
    return (
      <View style={[{ 
        flex: 1, 
        backgroundColor: colors.background,
        alignItems: 'center',
        justifyContent: 'center'
      }]}>
        <View style={[{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: colors.accent,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24
        }]}>
          <Icon name="hourglass" size={40} color="white" />
        </View>
        <Text style={[{
          fontSize: 28,
          fontWeight: '800',
          textAlign: 'center',
          color: colors.text,
          marginBottom: 12,
        }]}>
          Loading Logify Makers
        </Text>
        <Text style={[{
          fontSize: 14,
          color: colors.textSecondary,
          textAlign: 'center',
          marginTop: 8
        }]}>
          Preparing your design experience...
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header with Settings Button */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: colors.background,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}>
        <View style={{ flex: 1 }} />
        <Text style={{
          fontSize: 20,
          fontWeight: 'bold',
          color: colors.text,
          textAlign: 'center',
        }}>
          Logify Makers
        </Text>
        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          <TouchableOpacity
            onPress={() => setShowSettings(true)}
            style={{
              backgroundColor: colors.card,
              padding: 12,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
              ...shadows.medium,
            }}
          >
            <Icon name="settings" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={{ flex: 1, width: '100%' }} 
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flex: 1, alignItems: 'center', paddingTop: 20 }}>
          {/* Main Header */}
          <View style={{ alignItems: 'center', marginBottom: 40, paddingHorizontal: 20 }}>
            <View style={[{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: colors.accent,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
              ...shadows.large
            }]}>
              <Icon name="brush" size={40} color="white" />
            </View>
            <Text style={[{
              fontSize: 36,
              fontWeight: '800',
              textAlign: 'center',
              color: colors.text,
              marginBottom: 8,
            }]}>
              Logify Makers
            </Text>
            <Text style={[{
              fontSize: 18,
              fontWeight: '600',
              textAlign: 'center',
              color: colors.text,
              opacity: 0.9,
              marginBottom: 16
            }]}>
              Professional Design Services
            </Text>
            <View style={{
              backgroundColor: colors.backgroundAlt,
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: colors.border,
            }}>
              <Text style={[{
                fontSize: 12,
                color: colors.accent,
                fontWeight: '600'
              }]}>
                ✨ Premium Quality • Fast Delivery • Affordable Prices
              </Text>
            </View>
          </View>

          {/* Order Status Indicator */}
          <View style={[{
            backgroundColor: colors.card,
            borderRadius: 20,
            padding: 28,
            marginVertical: 12,
            width: '100%',
            borderWidth: 1,
            borderColor: colors.border,
            marginHorizontal: 20,
            marginBottom: 30,
            alignItems: 'center',
            ...shadows.large,
          }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
              <Icon name="pulse" size={24} color={colors.accent} style={{ marginRight: 12 }} />
              <Text style={[{
                fontSize: 20,
                fontWeight: '600',
                color: colors.text,
                marginBottom: 0
              }]}>
                Current Order Status
              </Text>
            </View>
            
            <TouchableOpacity
              onPress={toggleOrderStatus}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: orderAcceptStatus ? colors.success : colors.error,
                paddingHorizontal: 28,
                paddingVertical: 16,
                borderRadius: 30,
                ...shadows.large,
                marginBottom: 16,
              }}
            >
              <View
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 7,
                  backgroundColor: 'white',
                  marginRight: 12,
                  opacity: 0.9,
                }}
              />
              <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', letterSpacing: 0.5 }}>
                {orderAcceptStatus ? 'ACCEPTING ORDERS' : 'ORDERS CLOSED'}
              </Text>
            </TouchableOpacity>
            
            <Text style={[{
              fontSize: 13,
              color: colors.textSecondary,
              textAlign: 'center'
            }]}>
              {isAdmin() ? '👆 Tap to toggle status (Admin Access)' : 'Only administrators can change this status'}
            </Text>
          </View>

          {/* About Us Section */}
          <View style={[{
            backgroundColor: colors.card,
            borderRadius: 20,
            padding: 28,
            marginVertical: 12,
            width: '100%',
            borderWidth: 1,
            borderColor: colors.border,
            marginHorizontal: 20,
            marginBottom: 30,
            ...shadows.large,
          }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
              <Icon name="information-circle" size={24} color={colors.accent} style={{ marginRight: 12 }} />
              <Text style={[{
                fontSize: 22,
                fontWeight: '600',
                color: colors.text,
                marginBottom: 0
              }]}>
                About Us
              </Text>
            </View>
            <Text style={[{
              fontSize: 16,
              color: colors.text,
              textAlign: 'center',
              lineHeight: 26,
              opacity: 0.9
            }]}>
              We Logify Makers create stunning logos, YouTube banners, professional profile photos, and eye-catching thumbnails at incredibly affordable prices. We pride ourselves on delivering the best service and support in the industry.
            </Text>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-around',
              marginTop: 20,
              paddingTop: 20,
              borderTopWidth: 1,
              borderTopColor: colors.border,
            }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={[{
                  fontSize: 20,
                  fontWeight: 'bold',
                  color: colors.success,
                  marginBottom: 4
                }]}>
                  500+
                </Text>
                <Text style={[{
                  fontSize: 12,
                  color: colors.textSecondary,
                  textAlign: 'center'
                }]}>
                  Happy Clients
                </Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={[{
                  fontSize: 20,
                  fontWeight: 'bold',
                  color: colors.accent,
                  marginBottom: 4
                }]}>
                  24h
                </Text>
                <Text style={[{
                  fontSize: 12,
                  color: colors.textSecondary,
                  textAlign: 'center'
                }]}>
                  Fast Delivery
                </Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={[{
                  fontSize: 20,
                  fontWeight: 'bold',
                  color: colors.warning,
                  marginBottom: 4
                }]}>
                  100%
                </Text>
                <Text style={[{
                  fontSize: 12,
                  color: colors.textSecondary,
                  textAlign: 'center'
                }]}>
                  Satisfaction
                </Text>
              </View>
            </View>
          </View>

          {/* Services Grid */}
          <View style={[{
            backgroundColor: colors.card,
            borderRadius: 20,
            padding: 28,
            marginVertical: 12,
            width: '100%',
            borderWidth: 1,
            borderColor: colors.border,
            marginHorizontal: 20,
            marginBottom: 30,
            ...shadows.large,
          }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 25 }}>
              <Icon name="grid" size={24} color={colors.accent} style={{ marginRight: 12 }} />
              <Text style={[{
                fontSize: 22,
                fontWeight: '600',
                color: colors.text,
                marginBottom: 0
              }]}>
                Our Services
              </Text>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              {services.map((service, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setServiceType(service.name)}
                  style={{
                    width: '48%',
                    backgroundColor: serviceType === service.name ? service.color : colors.backgroundAlt,
                    padding: 20,
                    borderRadius: 16,
                    marginBottom: 12,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: serviceType === service.name ? service.color : colors.border,
                    ...shadows.small,
                  }}
                >
                  <View style={{
                    backgroundColor: serviceType === service.name ? 'rgba(255,255,255,0.2)' : service.color,
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 12,
                  }}>
                    <Icon 
                      name={service.icon as any} 
                      size={24} 
                      color={serviceType === service.name ? 'white' : 'white'}
                    />
                  </View>
                  <Text style={[{
                    fontSize: 13,
                    textAlign: 'center',
                    fontWeight: '600',
                    color: serviceType === service.name ? 'white' : colors.text,
                    marginBottom: 0,
                    lineHeight: 18,
                  }]}>
                    {service.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Discord Link */}
          <View style={{ paddingHorizontal: 20, width: '100%', marginBottom: 25 }}>
            <TouchableOpacity
              onPress={handleDiscordLink}
              style={{
                backgroundColor: '#5865F2',
                padding: 20,
                borderRadius: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                ...shadows.large,
              }}
            >
              <Icon name="logo-discord" size={28} color="white" style={{ marginRight: 12 }} />
              <View>
                <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 2 }}>
                  Join Our Discord
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
                  Get updates, support & exclusive offers
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Add Request Button */}
          <View style={{ paddingHorizontal: 20, width: '100%', marginBottom: 25 }}>
            <TouchableOpacity
              onPress={() => setShowRequestForm(!showRequestForm)}
              disabled={submitting}
              style={{
                backgroundColor: submitting ? colors.grey : colors.accent,
                padding: 22,
                borderRadius: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                ...shadows.large,
                opacity: submitting ? 0.7 : 1,
              }}
            >
              <Icon 
                name={submitting ? "hourglass" : (showRequestForm ? "close" : "add-circle")} 
                size={28} 
                color="white"
                style={{ marginRight: 12 }} 
              />
              <View>
                <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 2 }}>
                  {submitting ? 'Submitting Request...' : (showRequestForm ? 'Close Request Form' : 'Submit New Request')}
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
                  {submitting ? 'Processing your request' : (showRequestForm ? 'Hide the request form' : 'Tell us about your project')}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Request Form */}
          {showRequestForm && (
            <View style={[{
              backgroundColor: colors.card,
              borderRadius: 20,
              padding: 28,
              marginVertical: 12,
              width: '100%',
              borderWidth: 1,
              borderColor: colors.border,
              marginHorizontal: 20,
              marginBottom: 30,
              ...shadows.large,
            }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 25 }}>
                <Icon name="document-text" size={24} color={colors.accent} style={{ marginRight: 12 }} />
                <Text style={[{
                  fontSize: 22,
                  fontWeight: '600',
                  color: colors.text,
                  marginBottom: 0
                }]}>
                  Submit Your Request
                </Text>
              </View>

              {/* Order Status Check */}
              {!orderAcceptStatus && (
                <View style={{
                  backgroundColor: colors.error,
                  padding: 20,
                  borderRadius: 12,
                  marginBottom: 25,
                  alignItems: 'center'
                }}>
                  <Icon name="warning" size={24} color="white" style={{ marginBottom: 8 }} />
                  <Text style={{ color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: 16 }}>
                    ⚠️ Orders Currently Closed
                  </Text>
                  <Text style={{ color: 'white', fontSize: 13, textAlign: 'center', marginTop: 8, opacity: 0.9 }}>
                    You can still submit a request, but it will be queued until we reopen
                  </Text>
                </View>
              )}

              {/* Client Name */}
              <Text style={[{
                fontSize: 16,
                color: colors.text,
                marginBottom: 8,
                fontWeight: '600'
              }]}>Your Name *</Text>
              <TextInput
                style={[{
                  backgroundColor: colors.backgroundAlt,
                  borderColor: colors.border,
                  borderWidth: 1,
                  borderRadius: 12,
                  padding: 16,
                  color: colors.text,
                  fontSize: 16,
                  minHeight: 50,
                  marginBottom: 20,
                  ...shadows.small,
                }]}
                placeholder="Enter your full name"
                placeholderTextColor={colors.textSecondary}
                value={clientName}
                onChangeText={setClientName}
                editable={!submitting}
              />

              {/* Service Type */}
              <Text style={[{
                fontSize: 16,
                color: colors.text,
                marginBottom: 12,
                fontWeight: '600'
              }]}>Service Type *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
                {services.map((service) => (
                  <TouchableOpacity
                    key={service.name}
                    onPress={() => setServiceType(service.name)}
                    disabled={submitting}
                    style={[{
                      backgroundColor: serviceType === service.name ? service.color : colors.backgroundAlt,
                      borderColor: serviceType === service.name ? service.color : colors.border,
                      opacity: submitting ? 0.7 : 1,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      marginRight: 12,
                      borderWidth: 1,
                      borderRadius: 20,
                    }]}
                  >
                    <Text style={[{
                      fontSize: 14,
                      fontWeight: '600',
                      color: serviceType === service.name ? 'white' : colors.text
                    }]}>
                      {service.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Description */}
              <Text style={[{
                fontSize: 16,
                color: colors.text,
                marginBottom: 8,
                fontWeight: '600'
              }]}>Project Description *</Text>
              <TextInput
                style={[{
                  backgroundColor: colors.backgroundAlt,
                  borderColor: colors.border,
                  borderWidth: 1,
                  borderRadius: 12,
                  padding: 16,
                  color: colors.text,
                  fontSize: 16,
                  minHeight: 120,
                  marginBottom: 20,
                  textAlignVertical: 'top',
                  ...shadows.small,
                }]}
                placeholder="Describe your project in detail. Include style preferences, colors, dimensions, and any specific requirements..."
                placeholderTextColor={colors.textSecondary}
                value={description}
                onChangeText={setDescription}
                multiline
                editable={!submitting}
              />

              {/* Budget */}
              <Text style={[{
                fontSize: 16,
                color: colors.text,
                marginBottom: 8,
                fontWeight: '600'
              }]}>Budget Range (Optional)</Text>
              <TextInput
                style={[{
                  backgroundColor: colors.backgroundAlt,
                  borderColor: colors.border,
                  borderWidth: 1,
                  borderRadius: 12,
                  padding: 16,
                  color: colors.text,
                  fontSize: 16,
                  minHeight: 50,
                  marginBottom: 20,
                  ...shadows.small,
                }]}
                placeholder="e.g., $50-100, €30-60, or your preferred range"
                placeholderTextColor={colors.textSecondary}
                value={budget}
                onChangeText={setBudget}
                editable={!submitting}
              />

              {/* Contact Info */}
              <Text style={[{
                fontSize: 16,
                color: colors.text,
                marginBottom: 8,
                fontWeight: '600'
              }]}>Contact Information *</Text>
              <TextInput
                style={[{
                  backgroundColor: colors.backgroundAlt,
                  borderColor: colors.border,
                  borderWidth: 1,
                  borderRadius: 12,
                  padding: 16,
                  color: colors.text,
                  fontSize: 16,
                  minHeight: 50,
                  marginBottom: 25,
                  ...shadows.small,
                }]}
                placeholder="Discord username, email, or phone number"
                placeholderTextColor={colors.textSecondary}
                value={contactInfo}
                onChangeText={setContactInfo}
                editable={!submitting}
              />

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleSubmitRequest}
                disabled={submitting}
                style={{
                  backgroundColor: submitting ? colors.grey : (orderAcceptStatus ? colors.success : colors.warning),
                  padding: 20,
                  borderRadius: 16,
                  alignItems: 'center',
                  ...shadows.large,
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {submitting && (
                    <Icon name="hourglass" size={20} color="white" style={{ marginRight: 10 }} />
                  )}
                  <View>
                    <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 2 }}>
                      {submitting ? 'Submitting...' : (orderAcceptStatus ? 'Submit Request' : 'Submit Anyway')}
                    </Text>
                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, textAlign: 'center' }}>
                      {submitting ? 'Please wait while we process your request' : 'We&apos;ll get back to you within 24 hours'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* Footer */}
          <View style={{ paddingHorizontal: 20, paddingBottom: 40, alignItems: 'center' }}>
            <View style={{
              backgroundColor: colors.backgroundAlt,
              padding: 20,
              borderRadius: 16,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: colors.border,
              width: '100%',
            }}>
              <Text style={[{
                fontSize: 14,
                color: colors.textSecondary,
                textAlign: 'center',
                marginBottom: 8
              }]}>
                © 2024 Logify Makers - Professional Design Services
              </Text>
              <Text style={[{
                fontSize: 12,
                color: colors.textSecondary,
                textAlign: 'center',
                opacity: 0.7
              }]}>
                Crafting exceptional designs with passion and precision
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Settings Bottom Sheet */}
      <SettingsBottomSheet
        visible={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </View>
  );
}
