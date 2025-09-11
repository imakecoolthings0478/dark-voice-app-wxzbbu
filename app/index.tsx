
import { Text, View, TextInput, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { useState } from 'react';
import { commonStyles, colors } from '../styles/commonStyles';
import Button from '../components/Button';
import Icon from '../components/Icon';
import AdminPanel from '../components/AdminPanel';
import { useAuth } from '../hooks/useAuth';
import { DiscordService } from '../services/discordService';
import { DesignRequest } from '../types';

export default function LogifyMakersApp() {
  const { user, isAdmin, loading } = useAuth();
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [orderAcceptStatus, setOrderAcceptStatus] = useState(true); // true = accepting orders (green), false = not accepting (red)
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [clientName, setClientName] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [contactInfo, setContactInfo] = useState('');

  const services = [
    'Logo Design',
    'YouTube Banner',
    'Professional Profile Photo',
    'YouTube Thumbnail',
    'Custom Design'
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
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!orderAcceptStatus) {
      Alert.alert(
        'Orders Closed', 
        'We are not accepting new orders at the moment. Would you like to submit anyway? Your request will be queued for when we reopen.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Submit Anyway', onPress: () => submitRequest() }
        ]
      );
      return;
    }

    await submitRequest();
  };

  const submitRequest = async () => {
    setSubmitting(true);
    
    try {
      const requestData: Partial<DesignRequest> = {
        client_name: clientName.trim(),
        service_type: serviceType,
        description: description.trim(),
        budget: budget.trim() || undefined,
        contact_info: contactInfo.trim(),
        status: 'pending',
      };

      console.log('Submitting request:', requestData);

      // Send to Discord
      const discordSuccess = await DiscordService.sendRequestToDiscord(requestData);

      if (discordSuccess) {
        Alert.alert(
          'Request Submitted Successfully! 🎉', 
          `Thank you ${clientName}! Your ${serviceType.toLowerCase()} request has been sent to our Discord channel. Our team will review it and contact you soon via ${contactInfo}.\n\nJoin our Discord for real-time updates!`,
          [
            {
              text: 'Join Discord',
              onPress: handleDiscordLink
            },
            {
              text: 'OK',
              style: 'default'
            }
          ]
        );
      } else {
        Alert.alert(
          'Request Submitted',
          `Your request has been saved locally, but we couldn't send it to Discord right now. Please join our Discord and mention your request manually.\n\nRequest ID: ${Date.now()}`,
          [
            {
              text: 'Join Discord',
              onPress: handleDiscordLink
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
      Alert.alert('Error', 'Failed to submit request. Please try again or contact us directly on Discord.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleOrderStatus = () => {
    if (!isAdmin()) {
      Alert.alert(
        'Access Denied',
        'Only administrators can change the order status. Please contact an admin if you need to make changes.',
        [
          {
            text: 'Join Discord',
            onPress: handleDiscordLink
          },
          {
            text: 'OK',
            style: 'default'
          }
        ]
      );
      return;
    }

    setOrderAcceptStatus(!orderAcceptStatus);
    console.log('Order status changed to:', !orderAcceptStatus ? 'Accepting' : 'Not Accepting');
  };

  if (loading) {
    return (
      <View style={[commonStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Icon name="hourglass" size={48} color={colors.accent} />
        <Text style={[commonStyles.text, { marginTop: 20, textAlign: 'center' }]}>
          Loading Logify Makers...
        </Text>
      </View>
    );
  }

  return (
    <View style={commonStyles.container}>
      <ScrollView style={{ flex: 1, width: '100%' }} contentContainerStyle={{ flexGrow: 1 }}>
        <View style={commonStyles.content}>
          {/* Header */}
          <View style={{ alignItems: 'center', marginBottom: 30, paddingHorizontal: 20 }}>
            <Text style={[commonStyles.title, { fontSize: 32, marginBottom: 10 }]}>
              Logify Makers
            </Text>
            <Text style={[commonStyles.text, { fontSize: 18, textAlign: 'center', opacity: 0.8 }]}>
              Professional Design Services
            </Text>
            {user && (
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 10,
                backgroundColor: colors.backgroundAlt,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 15,
              }}>
                <Icon name="person-circle" size={16} color={colors.accent} style={{ marginRight: 8 }} />
                <Text style={[commonStyles.text, { fontSize: 12 }]}>
                  Welcome, {user.discord_username}
                </Text>
              </View>
            )}
          </View>

          {/* Admin Panel - Only visible to admins */}
          {isAdmin() && (
            <AdminPanel 
              orderAcceptStatus={orderAcceptStatus}
              onToggleOrderStatus={() => setOrderAcceptStatus(!orderAcceptStatus)}
            />
          )}

          {/* Order Status Indicator */}
          <View style={[commonStyles.card, { marginHorizontal: 20, marginBottom: 20, alignItems: 'center' }]}>
            <Text style={[commonStyles.text, { fontSize: 18, fontWeight: 'bold', marginBottom: 15 }]}>
              Current Order Status
            </Text>
            <TouchableOpacity
              onPress={toggleOrderStatus}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: orderAcceptStatus ? colors.success : colors.error,
                paddingHorizontal: 20,
                paddingVertical: 12,
                borderRadius: 25,
                boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.3)',
                elevation: 3,
              }}
            >
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: 'white',
                  marginRight: 10,
                }}
              />
              <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
                {orderAcceptStatus ? 'ACCEPTING ORDERS' : 'ORDERS CLOSED'}
              </Text>
            </TouchableOpacity>
            <Text style={[commonStyles.text, { fontSize: 12, textAlign: 'center', marginTop: 10, opacity: 0.7 }]}>
              {isAdmin() ? 'Tap to toggle status' : 'Contact admin to change status'}
            </Text>
          </View>

          {/* About Us Section */}
          <View style={[commonStyles.card, { marginHorizontal: 20, marginBottom: 20 }]}>
            <Text style={[commonStyles.text, { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' }]}>
              About Us
            </Text>
            <Text style={[commonStyles.text, { fontSize: 16, textAlign: 'center', lineHeight: 24 }]}>
              We Logify Makers create logos, Banner for YouTube, Professional Profile Photos, Thumbnails for very cheap. We offer best service and support.
            </Text>
          </View>

          {/* Services Grid */}
          <View style={[commonStyles.card, { marginHorizontal: 20, marginBottom: 20 }]}>
            <Text style={[commonStyles.text, { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' }]}>
              Our Services
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              {services.slice(0, 4).map((service, index) => (
                <View
                  key={index}
                  style={{
                    width: '48%',
                    backgroundColor: colors.backgroundAlt,
                    padding: 15,
                    borderRadius: 10,
                    marginBottom: 10,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <Icon 
                    name={
                      service === 'Logo Design' ? 'brush-outline' :
                      service === 'YouTube Banner' ? 'image-outline' :
                      service === 'Professional Profile Photo' ? 'person-circle-outline' :
                      'play-outline'
                    } 
                    size={24} 
                    style={{ marginBottom: 8 }}
                  />
                  <Text style={[commonStyles.text, { fontSize: 12, textAlign: 'center' }]}>
                    {service}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Discord Link */}
          <View style={{ paddingHorizontal: 20, width: '100%', marginBottom: 20 }}>
            <TouchableOpacity
              onPress={handleDiscordLink}
              style={{
                backgroundColor: '#5865F2',
                padding: 15,
                borderRadius: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.3)',
                elevation: 3,
              }}
            >
              <Icon name="logo-discord" size={24} style={{ marginRight: 10 }} />
              <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
                Join Our Discord
              </Text>
            </TouchableOpacity>
          </View>

          {/* Add Request Button */}
          <View style={{ paddingHorizontal: 20, width: '100%', marginBottom: 20 }}>
            <TouchableOpacity
              onPress={() => setShowRequestForm(!showRequestForm)}
              disabled={submitting}
              style={{
                backgroundColor: submitting ? colors.grey : colors.accent,
                padding: 18,
                borderRadius: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.3)',
                elevation: 3,
                opacity: submitting ? 0.7 : 1,
              }}
            >
              <Icon 
                name={submitting ? "hourglass" : (showRequestForm ? "close" : "add")} 
                size={24} 
                style={{ marginRight: 10 }} 
              />
              <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
                {submitting ? 'Submitting...' : (showRequestForm ? 'Close Request Form' : 'Add Request')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Request Form */}
          {showRequestForm && (
            <View style={[commonStyles.card, { marginHorizontal: 20, marginBottom: 20 }]}>
              <Text style={[commonStyles.text, { fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' }]}>
                Submit Your Request
              </Text>

              {/* Order Status Check */}
              {!orderAcceptStatus && (
                <View style={{
                  backgroundColor: colors.error,
                  padding: 15,
                  borderRadius: 10,
                  marginBottom: 20,
                  alignItems: 'center'
                }}>
                  <Text style={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>
                    ⚠️ Orders are currently closed
                  </Text>
                  <Text style={{ color: 'white', fontSize: 12, textAlign: 'center', marginTop: 5 }]}>
                    You can still submit a request, but it will be queued until we reopen
                  </Text>
                </View>
              )}

              {/* Discord Integration Notice */}
              <View style={{
                backgroundColor: '#5865F2',
                padding: 15,
                borderRadius: 10,
                marginBottom: 20,
                alignItems: 'center'
              }}>
                <Icon name="logo-discord" size={20} color="white" style={{ marginBottom: 5 }} />
                <Text style={{ color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: 14 }}>
                  🚀 Discord Integration Active
                </Text>
                <Text style={{ color: 'white', fontSize: 12, textAlign: 'center', marginTop: 5 }}>
                  Your request will be sent directly to our Discord channel for faster processing!
                </Text>
              </View>

              {/* Client Name */}
              <Text style={[commonStyles.text, { marginBottom: 8 }]}>Your Name *</Text>
              <TextInput
                style={[commonStyles.textInput, { marginBottom: 15, minHeight: 50 }]}
                placeholder="Enter your name"
                placeholderTextColor="#666"
                value={clientName}
                onChangeText={setClientName}
                editable={!submitting}
              />

              {/* Service Type */}
              <Text style={[commonStyles.text, { marginBottom: 8 }]}>Service Type *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 15 }}>
                {services.map((service) => (
                  <TouchableOpacity
                    key={service}
                    onPress={() => setServiceType(service)}
                    disabled={submitting}
                    style={{
                      backgroundColor: serviceType === service ? colors.accent : colors.backgroundAlt,
                      paddingHorizontal: 15,
                      paddingVertical: 10,
                      borderRadius: 20,
                      marginRight: 10,
                      borderWidth: 1,
                      borderColor: serviceType === service ? colors.accent : colors.border,
                      opacity: submitting ? 0.7 : 1,
                    }}
                  >
                    <Text style={[commonStyles.text, { 
                      fontSize: 14, 
                      color: serviceType === service ? 'white' : colors.text 
                    }]}>
                      {service}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Description */}
              <Text style={[commonStyles.text, { marginBottom: 8 }]}>Description *</Text>
              <TextInput
                style={[commonStyles.textInput, { marginBottom: 15, minHeight: 100 }]}
                placeholder="Describe your project in detail..."
                placeholderTextColor="#666"
                value={description}
                onChangeText={setDescription}
                multiline
                editable={!submitting}
              />

              {/* Budget */}
              <Text style={[commonStyles.text, { marginBottom: 8 }]}>Budget (Optional)</Text>
              <TextInput
                style={[commonStyles.textInput, { marginBottom: 15, minHeight: 50 }]}
                placeholder="Your budget range"
                placeholderTextColor="#666"
                value={budget}
                onChangeText={setBudget}
                editable={!submitting}
              />

              {/* Contact Info */}
              <Text style={[commonStyles.text, { marginBottom: 8 }]}>Contact Information *</Text>
              <TextInput
                style={[commonStyles.textInput, { marginBottom: 20, minHeight: 50 }]}
                placeholder="Discord username, email, or phone"
                placeholderTextColor="#666"
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
                  padding: 15,
                  borderRadius: 10,
                  alignItems: 'center',
                  boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.3)',
                  elevation: 3,
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {submitting && (
                    <Icon name="hourglass" size={16} color="white" style={{ marginRight: 8 }} />
                  )}
                  <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
                    {submitting ? 'Sending to Discord...' : (orderAcceptStatus ? 'Submit Request' : 'Submit Anyway')}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* Footer */}
          <View style={{ paddingHorizontal: 20, paddingBottom: 30, alignItems: 'center' }}>
            <Text style={[commonStyles.text, { fontSize: 12, opacity: 0.6, textAlign: 'center' }]}>
              © 2024 Logify Makers - Professional Design Services
            </Text>
            {user && (
              <Text style={[commonStyles.text, { fontSize: 10, opacity: 0.5, textAlign: 'center', marginTop: 5 }]}>
                Connected as {user.discord_username} • Discord Integration Active
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
