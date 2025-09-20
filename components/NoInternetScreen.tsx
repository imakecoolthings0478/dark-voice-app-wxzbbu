
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { shadows } from '../styles/commonStyles';
import Icon from './Icon';
import { NetworkService } from '../services/networkService';

interface NoInternetScreenProps {
  onRetry: () => void;
}

export default function NoInternetScreen({ onRetry }: NoInternetScreenProps) {
  const { colors } = useTheme();

  const handleRetry = async () => {
    const isConnected = await NetworkService.checkInternetConnection();
    if (isConnected) {
      onRetry();
    }
  };

  return (
    <View style={{
      flex: 1,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 40,
    }}>
      <View style={{
        backgroundColor: colors.card,
        borderRadius: 20,
        padding: 40,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        ...shadows.large,
        width: '100%',
        maxWidth: 400,
      }}>
        <View style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: colors.error,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
        }}>
          <Icon name="wifi-outline" size={40} color="white" />
        </View>

        <Text style={{
          fontSize: 24,
          fontWeight: 'bold',
          color: colors.text,
          textAlign: 'center',
          marginBottom: 16,
        }}>
          No Internet Access
        </Text>

        <Text style={{
          fontSize: 16,
          color: colors.textSecondary,
          textAlign: 'center',
          lineHeight: 24,
          marginBottom: 32,
        }}>
          Please check your internet connection and try again. This app requires an active internet connection to function properly.
        </Text>

        <TouchableOpacity
          onPress={handleRetry}
          style={{
            backgroundColor: colors.accent,
            paddingHorizontal: 32,
            paddingVertical: 16,
            borderRadius: 16,
            flexDirection: 'row',
            alignItems: 'center',
            ...shadows.medium,
          }}
        >
          <Icon name="refresh" size={20} color="white" style={{ marginRight: 8 }} />
          <Text style={{
            color: 'white',
            fontSize: 16,
            fontWeight: 'bold',
          }}>
            Try Again
          </Text>
        </TouchableOpacity>

        <Text style={{
          fontSize: 12,
          color: colors.textSecondary,
          textAlign: 'center',
          marginTop: 24,
          fontStyle: 'italic',
        }}>
          Make sure you&apos;re connected to Wi-Fi or mobile data
        </Text>
      </View>
    </View>
  );
}
