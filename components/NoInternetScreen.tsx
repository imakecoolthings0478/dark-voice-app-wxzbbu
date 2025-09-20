
import React from 'react';
import Icon from './Icon';
import { shadows } from '../styles/commonStyles';
import { NetworkService } from '../services/networkService';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface NoInternetScreenProps {
  onRetry: () => void;
}

export default function NoInternetScreen({ onRetry }: NoInternetScreenProps) {
  const { colors } = useTheme();

  const handleRetry = async () => {
    console.log('Retrying internet connection...');
    const isConnected = await NetworkService.checkInternetConnection();
    if (isConnected) {
      console.log('✅ Internet connection restored');
      onRetry();
    } else {
      console.log('❌ Still no internet connection');
    }
  };

  return (
    <View style={{
      flex: 1,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 32,
    }}>
      {/* Icon */}
      <View style={[{
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: colors.error,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
        ...shadows.large
      }]}>
        <Icon name="cloud-offline" size={56} color="white" />
      </View>

      {/* Title */}
      <Text style={[{
        fontSize: 36,
        fontWeight: '900',
        textAlign: 'center',
        color: colors.text,
        marginBottom: 16,
        letterSpacing: -1,
      }]}>
        No Internet Access
      </Text>

      {/* Subtitle */}
      <Text style={[{
        fontSize: 20,
        fontWeight: '700',
        textAlign: 'center',
        color: colors.error,
        marginBottom: 24,
        letterSpacing: -0.3,
      }]}>
        Please Go Back Online
      </Text>

      {/* Description */}
      <Text style={[{
        fontSize: 17,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 26,
        marginBottom: 32,
        fontWeight: '500',
      }]}>
        Logify Makers is a fully online-based application that requires internet access to function. All your data is stored in the cloud for global accessibility.
      </Text>

      {/* Features that require internet */}
      <View style={{
        backgroundColor: colors.card,
        borderRadius: 20,
        padding: 28,
        width: '100%',
        marginBottom: 32,
        borderWidth: 1,
        borderColor: colors.border,
        ...shadows.medium,
      }}>
        <Text style={[{
          fontSize: 18,
          fontWeight: '800',
          color: colors.text,
          marginBottom: 20,
          textAlign: 'center',
          letterSpacing: -0.3,
        }]}>
          What You&apos;ll Miss Without Internet:
        </Text>
        
        <View style={{ alignItems: 'flex-start' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Icon name="cloud-upload" size={20} color={colors.error} style={{ marginRight: 12 }} />
            <Text style={[{
              fontSize: 15,
              color: colors.textSecondary,
              fontWeight: '600',
            }]}>
              Submit design requests to cloud database
            </Text>
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Icon name="sync" size={20} color={colors.error} style={{ marginRight: 12 }} />
            <Text style={[{
              fontSize: 15,
              color: colors.textSecondary,
              fontWeight: '600',
            }]}>
              Real-time status updates from anywhere
            </Text>
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Icon name="notifications" size={20} color={colors.error} style={{ marginRight: 12 }} />
            <Text style={[{
              fontSize: 15,
              color: colors.textSecondary,
              fontWeight: '600',
            }]}>
              Discord notifications to our team
            </Text>
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Icon name="globe" size={20} color={colors.error} style={{ marginRight: 12 }} />
            <Text style={[{
              fontSize: 15,
              color: colors.textSecondary,
              fontWeight: '600',
            }]}>
              Access your requests from any device
            </Text>
          </View>
        </View>
      </View>

      {/* Retry Button */}
      <TouchableOpacity
        onPress={handleRetry}
        style={{
          backgroundColor: colors.accent,
          paddingHorizontal: 32,
          paddingVertical: 20,
          borderRadius: 20,
          flexDirection: 'row',
          alignItems: 'center',
          ...shadows.large,
          marginBottom: 20,
        }}
      >
        <Icon name="refresh" size={24} color="white" style={{ marginRight: 12 }} />
        <View>
          <Text style={{
            color: 'white',
            fontSize: 18,
            fontWeight: '800',
            marginBottom: 2,
            letterSpacing: -0.3,
          }}>
            Check Connection
          </Text>
          <Text style={{
            color: 'rgba(255,255,255,0.8)',
            fontSize: 12,
            fontWeight: '600',
          }}>
            Tap to retry internet connection
          </Text>
        </View>
      </TouchableOpacity>

      {/* Help Text */}
      <Text style={[{
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: 'center',
        fontWeight: '500',
        opacity: 0.8,
      }]}>
        Make sure you&apos;re connected to WiFi or mobile data
      </Text>
    </View>
  );
}
