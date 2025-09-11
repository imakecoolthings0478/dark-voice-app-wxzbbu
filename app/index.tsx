
import { Text, View, TextInput, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { useState } from 'react';
import { commonStyles, colors } from '../styles/commonStyles';
import Button from '../components/Button';
import Icon from '../components/Icon';

export default function LogifyMakersApp() {
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [orderAcceptStatus, setOrderAcceptStatus] = useState(true); // true = accepting orders (green), false = not accepting (red)
  
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

  const handleSubmitRequest = () => {
    if (!clientName.trim() || !serviceType || !description.trim() || !contactInfo.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!orderAcceptStatus) {
      Alert.alert('Orders Closed', 'Sorry, we are not accepting new orders at the moment. Please check back later or join our Discord for updates.');
      return;
    }

    console.log('Submitting request:', {
      clientName,
      serviceType,
      description,
      budget,
      contactInfo
    });

    Alert.alert(
      'Request Submitted!', 
      `Thank you ${clientName}! Your ${serviceType.toLowerCase()} request has been submitted. We'll contact you soon via ${contactInfo}. Join our Discord for updates!`,
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

    // Clear form
    setClientName('');
    setServiceType('');
    setDescription('');
    setBudget('');
    setContactInfo('');
    setShowRequestForm(false);
  };

  const toggleOrderStatus = () => {
    setOrderAcceptStatus(!orderAcceptStatus);
    console.log('Order status changed to:', !orderAcceptStatus ? 'Accepting' : 'Not Accepting');
  };

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
          </View>

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
              Tap to toggle status (Admin only)
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
              style={{
                backgroundColor: colors.accent,
                padding: 18,
                borderRadius: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.3)',
                elevation: 3,
              }}
            >
              <Icon name={showRequestForm ? "close" : "add"} size={24} style={{ marginRight: 10 }} />
              <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
                {showRequestForm ? 'Close Request Form' : 'Add Request'}
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
                  <Text style={{ color: 'white', fontSize: 12, textAlign: 'center', marginTop: 5 }}>
                    You can still submit a request, but it won&apos;t be processed until we reopen
                  </Text>
                </View>
              )}

              {/* Client Name */}
              <Text style={[commonStyles.text, { marginBottom: 8 }]}>Your Name *</Text>
              <TextInput
                style={[commonStyles.textInput, { marginBottom: 15, minHeight: 50 }]}
                placeholder="Enter your name"
                placeholderTextColor="#666"
                value={clientName}
                onChangeText={setClientName}
              />

              {/* Service Type */}
              <Text style={[commonStyles.text, { marginBottom: 8 }]}>Service Type *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 15 }}>
                {services.map((service) => (
                  <TouchableOpacity
                    key={service}
                    onPress={() => setServiceType(service)}
                    style={{
                      backgroundColor: serviceType === service ? colors.accent : colors.backgroundAlt,
                      paddingHorizontal: 15,
                      paddingVertical: 10,
                      borderRadius: 20,
                      marginRight: 10,
                      borderWidth: 1,
                      borderColor: serviceType === service ? colors.accent : colors.border,
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
              />

              {/* Budget */}
              <Text style={[commonStyles.text, { marginBottom: 8 }]}>Budget (Optional)</Text>
              <TextInput
                style={[commonStyles.textInput, { marginBottom: 15, minHeight: 50 }]}
                placeholder="Your budget range"
                placeholderTextColor="#666"
                value={budget}
                onChangeText={setBudget}
              />

              {/* Contact Info */}
              <Text style={[commonStyles.text, { marginBottom: 8 }]}>Contact Information *</Text>
              <TextInput
                style={[commonStyles.textInput, { marginBottom: 20, minHeight: 50 }]}
                placeholder="Discord username, email, or phone"
                placeholderTextColor="#666"
                value={contactInfo}
                onChangeText={setContactInfo}
              />

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleSubmitRequest}
                style={{
                  backgroundColor: orderAcceptStatus ? colors.success : colors.warning,
                  padding: 15,
                  borderRadius: 10,
                  alignItems: 'center',
                  boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.3)',
                  elevation: 3,
                }}
              >
                <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
                  {orderAcceptStatus ? 'Submit Request' : 'Submit Anyway'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Footer */}
          <View style={{ paddingHorizontal: 20, paddingBottom: 30, alignItems: 'center' }}>
            <Text style={[commonStyles.text, { fontSize: 12, opacity: 0.6, textAlign: 'center' }]}>
              © 2024 Logify Makers - Professional Design Services
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
