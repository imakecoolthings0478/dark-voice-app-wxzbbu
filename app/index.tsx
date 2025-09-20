
import { Text, View, TextInput, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
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
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState(false);
  
  // Form state with new fields
  const [clientName, setClientName] = useState('');
  const [email, setEmail] = useState('');
  const [discordUsername, setDiscordUsername] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [contactInfo, setContactInfo] = useState('');

  const services = [
    { name: 'Logo Design', icon: 'brush-outline', color: colors.professional.blue, gradient: ['#3b82f6', '#1d4ed8'] },
    { name: 'YouTube Banner', icon: 'image-outline', color: colors.professional.purple, gradient: ['#8b5cf6', '#7c3aed'] },
    { name: 'Professional Profile Photo', icon: 'person-circle-outline', color: colors.professional.teal, gradient: ['#06b6d4', '#0891b2'] },
    { name: 'YouTube Thumbnail', icon: 'play-outline', color: colors.professional.orange, gradient: ['#f97316', '#ea580c'] },
    { name: 'Custom Design', icon: 'create-outline', color: colors.professional.pink, gradient: ['#ec4899', '#db2777'] }
  ];

  const initializeApp = useCallback(async () => {
    try {
      console.log('🚀 Initializing Logify Makers App...');
      
      // Check internet connection first
      const connected = await NetworkService.checkInternetConnection();
      setIsConnected(connected);
      
      if (!connected) {
        console.log('❌ No internet connection detected');
        setCheckingConnection(false);
        return;
      }

      console.log('✅ Internet connection verified');
      
      // Load Supabase configuration
      const supabaseConfigured = await supabaseService.loadConfiguration();
      setIsSupabaseConfigured(supabaseConfigured);
      
      if (supabaseConfigured) {
        console.log('✅ Supabase configured and ready');
        
        // Sync any local data to cloud
        await syncLocalDataToCloud();
      } else {
        console.log('⚠️ Supabase not configured - app will work with local storage only');
      }
      
      // Load order status from cloud or local storage
      await loadOrderStatus();
      
      console.log('✅ App initialization complete');
    } catch (error) {
      console.error('❌ Error initializing app:', error);
    } finally {
      setCheckingConnection(false);
    }
  }, []);

  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  const syncLocalDataToCloud = async () => {
    if (!supabaseService.isReady()) return;
    
    try {
      console.log('🔄 Syncing local data to cloud...');
      
      // Get local requests
      const localRequests = await AsyncStorage.getItem('design_requests');
      if (localRequests) {
        const requests = JSON.parse(localRequests);
        
        // Upload each request to cloud
        for (const request of requests) {
          const result = await supabaseService.createRequest(request);
          if (result.success) {
            console.log(`✅ Synced request ${request.id} to cloud`);
          }
        }
        
        // Clear local storage after successful sync
        await AsyncStorage.removeItem('design_requests');
        console.log('✅ Local data synced and cleared');
      }
    } catch (error) {
      console.error('❌ Error syncing local data:', error);
    }
  };

  const loadOrderStatus = async () => {
    try {
      // Try to load from cloud first
      if (supabaseService.isReady()) {
        // In a real implementation, you'd have an admin settings table
        // For now, we'll use local storage
      }
      
      // Load from local storage
      const status = await AsyncStorage.getItem('order_accept_status');
      if (status !== null) {
        setOrderAcceptStatus(JSON.parse(status));
      }
    } catch (error) {
      console.error('Error loading order status:', error);
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
    // Check internet connection before submitting
    const connected = await NetworkService.checkInternetConnection();
    if (!connected) {
      Alert.alert(
        'No Internet Connection 📡',
        'Please check your internet connection and try again. All data is stored online for global access.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

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

      // Always try to save to cloud first (online-based approach)
      let cloudSuccess = false;
      if (supabaseService.isReady()) {
        const result = await supabaseService.createRequest(requestData);
        cloudSuccess = result.success;
        if (result.success) {
          console.log('✅ Request saved to cloud database');
        } else {
          console.log('❌ Failed to save to cloud:', result.error);
          throw new Error('Failed to save to cloud database');
        }
      } else {
        throw new Error('Cloud database not configured');
      }

      // Try to send to Discord if webhook is configured
      const webhookUrl = await AsyncStorage.getItem('discord_webhook_url');
      let discordSuccess = false;
      
      if (webhookUrl) {
        discordSuccess = await DiscordService.sendRequestToDiscord(requestData, webhookUrl);
        if (discordSuccess) {
          console.log('✅ Discord notification sent');
        }
      }

      // Show success message
      Alert.alert(
        'Request Submitted Successfully! 🎉', 
        `Your request has been saved to our cloud database and is accessible globally! ${discordSuccess ? 'Our team has been notified via Discord and' : 'Please join our Discord for faster processing, or'} we'll contact you at ${email} with updates.\n\nRequest ID: ${requestData.id}`,
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

      clearForm();

    } catch (error) {
      console.error('Error submitting request:', error);
      
      // Show error with emphasis on online requirement
      Alert.alert(
        'Submission Failed ❌', 
        'Failed to submit request to our cloud database. This app requires internet connection for all operations. Please check your connection and try again, or contact us directly on Discord.',
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
          width: 100,
          height: 100,
          borderRadius: 50,
          backgroundColor: colors.accent,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 32,
          ...shadows.large
        }]}>
          <Icon name="cloud-outline" size={48} color="white" />
        </View>
        <Text style={[{
          fontSize: 32,
          fontWeight: '900',
          textAlign: 'center',
          color: colors.text,
          marginBottom: 16,
          letterSpacing: -1,
        }]}>
          Logify Makers
        </Text>
        <Text style={[{
          fontSize: 16,
          color: colors.textSecondary,
          textAlign: 'center',
          marginTop: 8,
          paddingHorizontal: 40,
        }]}>
          Connecting to cloud services...
        </Text>
        <View style={{
          backgroundColor: colors.card,
          paddingHorizontal: 20,
          paddingVertical: 12,
          borderRadius: 25,
          marginTop: 20,
          borderWidth: 1,
          borderColor: colors.border,
        }}>
          <Text style={[{
            fontSize: 12,
            color: colors.accent,
            fontWeight: '600'
          }]}>
            ☁️ Online-Based • Global Access • Real-Time Sync
          </Text>
        </View>
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
          width: 100,
          height: 100,
          borderRadius: 50,
          backgroundColor: colors.accent,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 32,
          ...shadows.large
        }]}>
          <Icon name="hourglass" size={48} color="white" />
        </View>
        <Text style={[{
          fontSize: 32,
          fontWeight: '900',
          textAlign: 'center',
          color: colors.text,
          marginBottom: 16,
          letterSpacing: -1,
        }]}>
          Logify Makers
        </Text>
        <Text style={[{
          fontSize: 16,
          color: colors.textSecondary,
          textAlign: 'center',
          marginTop: 8,
          paddingHorizontal: 40,
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
        
        {/* Modern Header */}
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
            onPress={() => setShowMyRequests(false)}
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
            My Requests
          </Text>
          
          <TouchableOpacity
            onPress={() => setShowSettings(true)}
            style={{
              backgroundColor: colors.card,
              padding: 14,
              borderRadius: 16,
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
      
      {/* Modern Header with Cloud Status */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 24,
        backgroundColor: colors.background,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}>
        <View style={{ flex: 1 }} />
        <View style={{ alignItems: 'center' }}>
          <Text style={{
            fontSize: 24,
            fontWeight: '800',
            color: colors.text,
            textAlign: 'center',
            letterSpacing: -0.5,
          }}>
            Logify Makers
          </Text>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 4,
          }}>
            <View style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: isSupabaseConfigured ? colors.success : colors.warning,
              marginRight: 6,
            }} />
            <Text style={{
              fontSize: 11,
              color: colors.textSecondary,
              fontWeight: '600',
            }}>
              {isSupabaseConfigured ? 'CLOUD CONNECTED' : 'LOCAL MODE'}
            </Text>
          </View>
        </View>
        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          <TouchableOpacity
            onPress={() => setShowSettings(true)}
            style={{
              backgroundColor: colors.card,
              padding: 14,
              borderRadius: 16,
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
          {/* Hero Section */}
          <View style={{ alignItems: 'center', marginBottom: 48, paddingHorizontal: 24 }}>
            <View style={[{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: colors.accent,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 24,
              ...shadows.large
            }]}>
              <Icon name="brush" size={48} color="white" />
            </View>
            <Text style={[{
              fontSize: 42,
              fontWeight: '900',
              textAlign: 'center',
              color: colors.text,
              marginBottom: 12,
              letterSpacing: -1.5,
            }]}>
              Logify Makers
            </Text>
            <Text style={[{
              fontSize: 20,
              fontWeight: '700',
              textAlign: 'center',
              color: colors.text,
              opacity: 0.9,
              marginBottom: 20,
              letterSpacing: -0.3,
            }]}>
              Professional Design Services
            </Text>
            <View style={{
              backgroundColor: colors.card,
              paddingHorizontal: 20,
              paddingVertical: 12,
              borderRadius: 25,
              borderWidth: 1,
              borderColor: colors.border,
              ...shadows.medium,
            }}>
              <Text style={[{
                fontSize: 13,
                color: colors.accent,
                fontWeight: '700',
                letterSpacing: 0.5,
              }]}>
                ✨ PREMIUM QUALITY • FAST DELIVERY • GLOBAL ACCESS
              </Text>
            </View>
          </View>

          {/* Order Status Indicator - Modern Design */}
          <View style={[{
            backgroundColor: colors.card,
            borderRadius: 24,
            padding: 32,
            marginVertical: 12,
            width: '100%',
            borderWidth: 1,
            borderColor: colors.border,
            marginHorizontal: 24,
            marginBottom: 32,
            alignItems: 'center',
            ...shadows.large,
          }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
              <Icon name="pulse" size={28} color={colors.accent} style={{ marginRight: 16 }} />
              <Text style={[{
                fontSize: 22,
                fontWeight: '800',
                color: colors.text,
                marginBottom: 0,
                letterSpacing: -0.3,
              }]}>
                Order Status
              </Text>
            </View>
            
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: orderAcceptStatus ? colors.success : colors.error,
                paddingHorizontal: 32,
                paddingVertical: 18,
                borderRadius: 30,
                ...shadows.large,
                marginBottom: 20,
              }}
            >
              <View
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 8,
                  backgroundColor: 'white',
                  marginRight: 16,
                  opacity: 0.9,
                }}
              />
              <Text style={{ color: 'white', fontSize: 20, fontWeight: '800', letterSpacing: 0.5 }}>
                {orderAcceptStatus ? 'ACCEPTING ORDERS' : 'ORDERS CLOSED'}
              </Text>
            </View>
            
            <Text style={[{
              fontSize: 14,
              color: colors.textSecondary,
              textAlign: 'center',
              fontWeight: '500',
            }]}>
              Status managed by administrators via cloud dashboard
            </Text>
          </View>

          {/* About Us Section - Modern Card */}
          <View style={[{
            backgroundColor: colors.card,
            borderRadius: 24,
            padding: 32,
            marginVertical: 12,
            width: '100%',
            borderWidth: 1,
            borderColor: colors.border,
            marginHorizontal: 24,
            marginBottom: 32,
            ...shadows.large,
          }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
              <Icon name="information-circle" size={28} color={colors.accent} style={{ marginRight: 16 }} />
              <Text style={[{
                fontSize: 24,
                fontWeight: '800',
                color: colors.text,
                marginBottom: 0,
                letterSpacing: -0.3,
              }]}>
                About Us
              </Text>
            </View>
            <Text style={[{
              fontSize: 17,
              color: colors.text,
              textAlign: 'center',
              lineHeight: 28,
              opacity: 0.9,
              fontWeight: '500',
              marginBottom: 24,
            }]}>
              We Logify Makers create stunning logos, YouTube banners, professional profile photos, and eye-catching thumbnails at incredibly affordable prices. We pride ourselves on delivering the best service and support in the industry.
            </Text>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-around',
              paddingTop: 24,
              borderTopWidth: 1,
              borderTopColor: colors.border,
            }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={[{
                  fontSize: 24,
                  fontWeight: '900',
                  color: colors.success,
                  marginBottom: 6,
                  letterSpacing: -0.5,
                }]}>
                  500+
                </Text>
                <Text style={[{
                  fontSize: 13,
                  color: colors.textSecondary,
                  textAlign: 'center',
                  fontWeight: '600',
                }]}>
                  Happy Clients
                </Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={[{
                  fontSize: 24,
                  fontWeight: '900',
                  color: colors.accent,
                  marginBottom: 6,
                  letterSpacing: -0.5,
                }]}>
                  24h
                </Text>
                <Text style={[{
                  fontSize: 13,
                  color: colors.textSecondary,
                  textAlign: 'center',
                  fontWeight: '600',
                }]}>
                  Fast Delivery
                </Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={[{
                  fontSize: 24,
                  fontWeight: '900',
                  color: colors.warning,
                  marginBottom: 6,
                  letterSpacing: -0.5,
                }]}>
                  100%
                </Text>
                <Text style={[{
                  fontSize: 13,
                  color: colors.textSecondary,
                  textAlign: 'center',
                  fontWeight: '600',
                }]}>
                  Satisfaction
                </Text>
              </View>
            </View>
          </View>

          {/* Services Grid - Modern Design */}
          <View style={[{
            backgroundColor: colors.card,
            borderRadius: 24,
            padding: 32,
            marginVertical: 12,
            width: '100%',
            borderWidth: 1,
            borderColor: colors.border,
            marginHorizontal: 24,
            marginBottom: 32,
            ...shadows.large,
          }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 28 }}>
              <Icon name="grid" size={28} color={colors.accent} style={{ marginRight: 16 }} />
              <Text style={[{
                fontSize: 24,
                fontWeight: '800',
                color: colors.text,
                marginBottom: 0,
                letterSpacing: -0.3,
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
                    padding: 24,
                    borderRadius: 20,
                    marginBottom: 16,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: serviceType === service.name ? service.color : colors.border,
                    ...shadows.medium,
                  }}
                >
                  <View style={{
                    backgroundColor: serviceType === service.name ? 'rgba(255,255,255,0.2)' : service.color,
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16,
                    ...shadows.small,
                  }}>
                    <Icon 
                      name={service.icon as any} 
                      size={28} 
                      color="white"
                    />
                  </View>
                  <Text style={[{
                    fontSize: 14,
                    textAlign: 'center',
                    fontWeight: '700',
                    color: serviceType === service.name ? 'white' : colors.text,
                    marginBottom: 0,
                    lineHeight: 20,
                    letterSpacing: -0.2,
                  }]}>
                    {service.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Discord Link - Modern Design */}
          <View style={{ paddingHorizontal: 24, width: '100%', marginBottom: 28 }}>
            <TouchableOpacity
              onPress={handleDiscordLink}
              style={{
                backgroundColor: '#5865F2',
                padding: 24,
                borderRadius: 20,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                ...shadows.large,
              }}
            >
              <Icon name="logo-discord" size={32} color="white" style={{ marginRight: 16 }} />
              <View>
                <Text style={{ color: 'white', fontSize: 20, fontWeight: '800', marginBottom: 4, letterSpacing: -0.3 }}>
                  Join Our Discord
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '600' }}>
                  Get updates, support & exclusive offers
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Action Buttons - Modern Design */}
          <View style={{ paddingHorizontal: 24, width: '100%', marginBottom: 28 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              {/* Submit Request Button */}
              <TouchableOpacity
                onPress={() => setShowRequestForm(!showRequestForm)}
                disabled={submitting}
                style={{
                  backgroundColor: submitting ? colors.grey : colors.accent,
                  padding: 20,
                  borderRadius: 20,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  ...shadows.large,
                  opacity: submitting ? 0.7 : 1,
                  flex: 1,
                  marginRight: 12,
                }}
              >
                <Icon 
                  name={submitting ? "hourglass" : (showRequestForm ? "close" : "add-circle")} 
                  size={28} 
                  color="white"
                  style={{ marginRight: 12 }} 
                />
                <View>
                  <Text style={{ color: 'white', fontSize: 18, fontWeight: '800', marginBottom: 4, letterSpacing: -0.3 }}>
                    {submitting ? 'Submitting...' : (showRequestForm ? 'Close Form' : 'New Request')}
                  </Text>
                  <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '600' }}>
                    {submitting ? 'Processing...' : (showRequestForm ? 'Hide form' : 'Submit project')}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* My Requests Button */}
              <TouchableOpacity
                onPress={() => setShowMyRequests(true)}
                style={{
                  backgroundColor: colors.info,
                  padding: 20,
                  borderRadius: 20,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  ...shadows.large,
                  flex: 1,
                  marginLeft: 12,
                }}
              >
                <Icon name="document-text" size={28} color="white" style={{ marginRight: 12 }} />
                <View>
                  <Text style={{ color: 'white', fontSize: 18, fontWeight: '800', marginBottom: 4, letterSpacing: -0.3 }}>
                    My Requests
                  </Text>
                  <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '600' }}>
                    View status
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Request Form - Modern Design */}
          {showRequestForm && (
            <View style={[{
              backgroundColor: colors.card,
              borderRadius: 24,
              padding: 32,
              marginVertical: 12,
              width: '100%',
              borderWidth: 1,
              borderColor: colors.border,
              marginHorizontal: 24,
              marginBottom: 32,
              ...shadows.large,
            }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 28 }}>
                <Icon name="document-text" size={28} color={colors.accent} style={{ marginRight: 16 }} />
                <Text style={[{
                  fontSize: 24,
                  fontWeight: '800',
                  color: colors.text,
                  marginBottom: 0,
                  letterSpacing: -0.3,
                }]}>
                  Submit Your Request
                </Text>
              </View>

              {/* Cloud Status Warning */}
              {!isSupabaseConfigured && (
                <View style={{
                  backgroundColor: colors.warning,
                  padding: 24,
                  borderRadius: 16,
                  marginBottom: 28,
                  alignItems: 'center'
                }}>
                  <Icon name="cloud-offline" size={28} color="white" style={{ marginBottom: 12 }} />
                  <Text style={{ color: 'white', fontWeight: '800', textAlign: 'center', fontSize: 16, marginBottom: 8 }}>
                    ⚠️ Cloud Database Not Configured
                  </Text>
                  <Text style={{ color: 'white', fontSize: 14, textAlign: 'center', opacity: 0.9 }}>
                    Please configure Supabase in settings for full online functionality
                  </Text>
                </View>
              )}

              {/* Order Status Check */}
              {!orderAcceptStatus && (
                <View style={{
                  backgroundColor: colors.error,
                  padding: 24,
                  borderRadius: 16,
                  marginBottom: 28,
                  alignItems: 'center'
                }}>
                  <Icon name="warning" size={28} color="white" style={{ marginBottom: 12 }} />
                  <Text style={{ color: 'white', fontWeight: '800', textAlign: 'center', fontSize: 18 }}>
                    ⚠️ Orders Currently Closed
                  </Text>
                  <Text style={{ color: 'white', fontSize: 14, textAlign: 'center', marginTop: 12, opacity: 0.9 }}>
                    You can still submit a request, but it will be queued until we reopen
                  </Text>
                </View>
              )}

              {/* Client Name */}
              <Text style={[{
                fontSize: 17,
                color: colors.text,
                marginBottom: 12,
                fontWeight: '700'
              }]}>Your Full Name *</Text>
              <TextInput
                style={[{
                  backgroundColor: colors.backgroundAlt,
                  borderColor: colors.border,
                  borderWidth: 1,
                  borderRadius: 16,
                  padding: 20,
                  color: colors.text,
                  fontSize: 16,
                  minHeight: 56,
                  marginBottom: 24,
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
                fontSize: 17,
                color: colors.text,
                marginBottom: 12,
                fontWeight: '700'
              }]}>Email Address *</Text>
              <TextInput
                style={[{
                  backgroundColor: colors.backgroundAlt,
                  borderColor: colors.border,
                  borderWidth: 1,
                  borderRadius: 16,
                  padding: 20,
                  color: colors.text,
                  fontSize: 16,
                  minHeight: 56,
                  marginBottom: 24,
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
                fontSize: 17,
                color: colors.text,
                marginBottom: 12,
                fontWeight: '700'
              }]}>Discord Username *</Text>
              <TextInput
                style={[{
                  backgroundColor: colors.backgroundAlt,
                  borderColor: colors.border,
                  borderWidth: 1,
                  borderRadius: 16,
                  padding: 20,
                  color: colors.text,
                  fontSize: 16,
                  minHeight: 56,
                  marginBottom: 24,
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
                fontSize: 17,
                color: colors.text,
                marginBottom: 16,
                fontWeight: '700'
              }]}>Service Type *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24 }}>
                {services.map((service) => (
                  <TouchableOpacity
                    key={service.name}
                    onPress={() => setServiceType(service.name)}
                    disabled={submitting}
                    style={[{
                      backgroundColor: serviceType === service.name ? service.color : colors.backgroundAlt,
                      borderColor: serviceType === service.name ? service.color : colors.border,
                      opacity: submitting ? 0.7 : 1,
                      paddingHorizontal: 20,
                      paddingVertical: 14,
                      marginRight: 12,
                      borderWidth: 1,
                      borderRadius: 25,
                      ...shadows.small,
                    }]}
                  >
                    <Text style={[{
                      fontSize: 15,
                      fontWeight: '700',
                      color: serviceType === service.name ? 'white' : colors.text
                    }]}>
                      {service.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Description */}
              <Text style={[{
                fontSize: 17,
                color: colors.text,
                marginBottom: 12,
                fontWeight: '700'
              }]}>Project Description *</Text>
              <TextInput
                style={[{
                  backgroundColor: colors.backgroundAlt,
                  borderColor: colors.border,
                  borderWidth: 1,
                  borderRadius: 16,
                  padding: 20,
                  color: colors.text,
                  fontSize: 16,
                  minHeight: 120,
                  marginBottom: 24,
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
                fontSize: 17,
                color: colors.text,
                marginBottom: 12,
                fontWeight: '700'
              }]}>Budget Range (Optional)</Text>
              <TextInput
                style={[{
                  backgroundColor: colors.backgroundAlt,
                  borderColor: colors.border,
                  borderWidth: 1,
                  borderRadius: 16,
                  padding: 20,
                  color: colors.text,
                  fontSize: 16,
                  minHeight: 56,
                  marginBottom: 24,
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
                fontSize: 17,
                color: colors.text,
                marginBottom: 12,
                fontWeight: '700'
              }]}>Additional Contact Information *</Text>
              <TextInput
                style={[{
                  backgroundColor: colors.backgroundAlt,
                  borderColor: colors.border,
                  borderWidth: 1,
                  borderRadius: 16,
                  padding: 20,
                  color: colors.text,
                  fontSize: 16,
                  minHeight: 56,
                  marginBottom: 28,
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
                  padding: 24,
                  borderRadius: 20,
                  alignItems: 'center',
                  ...shadows.large,
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {submitting && (
                    <Icon name="hourglass" size={24} color="white" style={{ marginRight: 12 }} />
                  )}
                  <View>
                    <Text style={{ color: 'white', fontSize: 20, fontWeight: '800', marginBottom: 4, letterSpacing: -0.3 }}>
                      {submitting ? 'Submitting to Cloud...' : (orderAcceptStatus ? 'Submit Request' : 'Submit Anyway')}
                    </Text>
                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, textAlign: 'center', fontWeight: '600' }}>
                      {submitting ? 'Saving to global database...' : 'We&apos;ll get back to you within 24 hours'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* Footer */}
          <View style={{ paddingHorizontal: 24, paddingBottom: 48, alignItems: 'center' }}>
            <View style={{
              backgroundColor: colors.backgroundAlt,
              padding: 24,
              borderRadius: 20,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: colors.border,
              width: '100%',
              ...shadows.medium,
            }}>
              <Text style={[{
                fontSize: 15,
                color: colors.textSecondary,
                textAlign: 'center',
                marginBottom: 12,
                fontWeight: '600',
              }]}>
                © 2024 Logify Makers - Professional Design Services
              </Text>
              <Text style={[{
                fontSize: 13,
                color: colors.textSecondary,
                textAlign: 'center',
                opacity: 0.7,
                fontWeight: '500',
              }]}>
                Crafting exceptional designs with passion and precision
              </Text>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 16,
                paddingTop: 16,
                borderTopWidth: 1,
                borderTopColor: colors.border,
              }}>
                <Icon name="cloud" size={16} color={colors.accent} style={{ marginRight: 8 }} />
                <Text style={[{
                  fontSize: 12,
                  color: colors.accent,
                  fontWeight: '700',
                  letterSpacing: 0.5,
                }]}>
                  POWERED BY CLOUD TECHNOLOGY
                </Text>
              </View>
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
