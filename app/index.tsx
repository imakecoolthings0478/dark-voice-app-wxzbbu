
import { Text, View, TextInput, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { shadows } from '../styles/commonStyles';
import Button from '../components/Button';
import Icon from '../components/Icon';
import SettingsBottomSheet from '../components/SettingsBottomSheet';
import GlobalMessageBanner from '../components/GlobalMessageBanner';
import NoInternetScreen from '../components/NoInternetScreen';
import MyRequestsPanel from '../components/MyRequestsPanel';
import { useAuth } from '../hooks/useAuth';
import { DiscordService } from '../services/discordService';
import { NetworkService } from '../services/networkService';
import { ValidationService } from '../services/validationService';
import { supabaseService } from '../services/supabaseService';
import { DesignRequest } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LogifyMakersApp() {
  const { user, isAdmin, loading } = useAuth();
  const { colors } = useTheme();
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showMyRequests, setShowMyRequests] = useState(false);
  const [orderAcceptStatus, setOrderAcceptStatus] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [checkingConnection, setCheckingConnection] = useState(true);
  
  // Form state with new fields
  const [clientName, setClientName] = useState('');
  const [email, setEmail] = useState('');
  const [discordUsername, setDiscordUsername] = useState('');
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

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Check internet connection
      const connected = await NetworkService.checkInternetConnection();
      setIsConnected(connected);
      
      if (connected) {
        // Initialize Supabase if configured
        await supabaseService.loadConfiguration();
        console.log('App initialized successfully');
      }
    } catch (error) {
      console.error('Error initializing app:', error);
    } finally {
      setCheckingConnection(false);
    }
  };

  const handleRetryConnection = async () => {
    setCheckingConnection(true);
    await initializeApp();
  };

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
    // Validate form data
    const requestData = {
      client_name: clientName,
      email: email,
      discord_username: discordUsername,
      service_type: serviceType,
      description: description,
      budget: budget,
      contact_info: contactInfo,
    };

    const validation = ValidationService.validateRequest(requestData);
    
    if (!validation.isValid) {
      Alert.alert(
        'Invalid Information ⚠️', 
        validation.errors.join('\n\n'),
        [{ text: 'OK', style: 'default' }]
      );
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
        client_name: ValidationService.sanitizeInput(clientName),
        email: ValidationService.sanitizeInput(email),
        discord_username: ValidationService.sanitizeInput(discordUsername),
        service_type: serviceType,
        description: ValidationService.sanitizeInput(description),
        budget: budget.trim() || undefined,
        contact_info: ValidationService.sanitizeInput(contactInfo),
        status: 'pending',
        created_at: new Date().toISOString(),
      };

      console.log('🚀 Submitting request:', requestData);

      // Save to cloud (Supabase) first
      let cloudSuccess = false;
      if (supabaseService.isReady()) {
        const result = await supabaseService.createRequest(requestData);
        cloudSuccess = result.success;
        if (result.success) {
          console.log('✅ Request saved to cloud');
        } else {
          console.log('❌ Failed to save to cloud:', result.error);
        }
      }

      // Save request locally as backup
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

      // Show success message
      const successMessage = cloudSuccess 
        ? 'Your request has been submitted and saved to our cloud database!'
        : 'Your request has been submitted and saved locally!';

      if (discordSuccess) {
        Alert.alert(
          'Request Submitted Successfully! 🎉', 
          `${successMessage} Our team has been notified via Discord and will review your ${serviceType.toLowerCase()} request soon.\n\nWe'll contact you at ${email} with updates.\n\nRequest ID: ${requestData.id}`,
          [
            {
              text: 'View My Requests',
              onPress: () => {
                clearForm();
                setShowMyRequests(true);
              },
              style: 'default'
            },
            {
              text: 'Join Discord',
              onPress: handleDiscordLink,
              style: 'default'
            }
          ]
        );
      } else {
        Alert.alert(
          'Request Submitted! 📝',
          `${successMessage} ${webhookUrl ? 'We couldn&apos;t send it to Discord right now, but' : 'Configure Discord webhook in settings for instant notifications, or'} please join our Discord and mention your request for faster processing.\n\nRequest ID: ${requestData.id}`,
          [
            {
              text: 'View My Requests',
              onPress: () => {
                clearForm();
                setShowMyRequests(true);
              },
              style: 'default'
            },
            {
              text: 'Join Discord',
              onPress: handleDiscordLink,
              style: 'default'
            }
          ]
        );
      }

      clearForm();

    } catch (error) {
      console.error('Error submitting request:', error);
      Alert.alert(
        'Submission Error ❌', 
        'Failed to submit request. Please check your internet connection and try again, or contact us directly on Discord for immediate assistance.',
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

  const clearForm = () => {
    setClientName('');
    setEmail('');
    setDiscordUsername('');
    setServiceType('');
    setDescription('');
    setBudget('');
    setContactInfo('');
    setShowRequestForm(false);
  };

  // Show no internet screen if not connected
  if (checkingConnection) {
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
          Checking internet connection...
        </Text>
      </View>
    );
  }

  if (!isConnected) {
    return <NoInternetScreen onRetry={handleRetryConnection} />;
  }

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

  // Show My Requests panel
  if (showMyRequests) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <GlobalMessageBanner />
        
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingTop: 60,
          paddingBottom: 20,
          backgroundColor: colors.background,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}>
          <TouchableOpacity
            onPress={() => setShowMyRequests(false)}
            style={{
              backgroundColor: colors.card,
              padding: 12,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
              ...shadows.medium,
            }}
          >
            <Icon name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          
          <Text style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: colors.text,
            textAlign: 'center',
            flex: 1,
          }}>
            My Requests
          </Text>
          
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

        <MyRequestsPanel />

        <SettingsBottomSheet
          visible={showSettings}
          onClose={() => setShowSettings(false)}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <GlobalMessageBanner />
      
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

          {/* Order Status Indicator - Non-clickable */}
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
            
            <View
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
            </View>
            
            <Text style={[{
              fontSize: 13,
              color: colors.textSecondary,
              textAlign: 'center'
            }]}>
              Status can only be changed by administrators
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

          {/* Action Buttons */}
          <View style={{ paddingHorizontal: 20, width: '100%', marginBottom: 25 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              {/* Submit Request Button */}
              <TouchableOpacity
                onPress={() => setShowRequestForm(!showRequestForm)}
                disabled={submitting}
                style={{
                  backgroundColor: submitting ? colors.grey : colors.accent,
                  padding: 18,
                  borderRadius: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  ...shadows.large,
                  opacity: submitting ? 0.7 : 1,
                  flex: 1,
                  marginRight: 8,
                }}
              >
                <Icon 
                  name={submitting ? "hourglass" : (showRequestForm ? "close" : "add-circle")} 
                  size={24} 
                  color="white"
                  style={{ marginRight: 8 }} 
                />
                <View>
                  <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold', marginBottom: 2 }}>
                    {submitting ? 'Submitting...' : (showRequestForm ? 'Close Form' : 'New Request')}
                  </Text>
                  <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 10 }}>
                    {submitting ? 'Processing...' : (showRequestForm ? 'Hide form' : 'Submit project')}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* My Requests Button */}
              <TouchableOpacity
                onPress={() => setShowMyRequests(true)}
                style={{
                  backgroundColor: colors.info,
                  padding: 18,
                  borderRadius: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  ...shadows.large,
                  flex: 1,
                  marginLeft: 8,
                }}
              >
                <Icon name="document-text" size={24} color="white" style={{ marginRight: 8 }} />
                <View>
                  <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold', marginBottom: 2 }}>
                    My Requests
                  </Text>
                  <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 10 }}>
                    View status
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
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
              }]}>Your Full Name *</Text>
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

              {/* Email */}
              <Text style={[{
                fontSize: 16,
                color: colors.text,
                marginBottom: 8,
                fontWeight: '600'
              }]}>Email Address *</Text>
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
                placeholder="your.email@example.com"
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!submitting}
              />

              {/* Discord Username */}
              <Text style={[{
                fontSize: 16,
                color: colors.text,
                marginBottom: 8,
                fontWeight: '600'
              }]}>Discord Username *</Text>
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
                placeholder="username#1234 or username"
                placeholderTextColor={colors.textSecondary}
                value={discordUsername}
                onChangeText={setDiscordUsername}
                autoCapitalize="none"
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
              }]}>Additional Contact Information *</Text>
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
                placeholder="Phone number, alternative contact method, etc."
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
