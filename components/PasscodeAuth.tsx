
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { commonStyles, colors } from '../styles/commonStyles';
import Icon from './Icon';

interface PasscodeAuthProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function PasscodeAuth({ onSuccess, onCancel }: PasscodeAuthProps) {
  const [passcode, setPasscode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const CORRECT_PASSCODE = 'logify@makers@91!@$%!';
  const MAX_ATTEMPTS = 3;

  const handleSubmit = async () => {
    if (passcode.trim() === '') {
      Alert.alert('Error', 'Please enter the passcode');
      return;
    }

    setIsLoading(true);

    // Simulate authentication delay for security
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (passcode === CORRECT_PASSCODE) {
      console.log('Admin passcode authenticated successfully');
      setIsLoading(false);
      onSuccess();
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setPasscode('');
      setIsLoading(false);

      if (newAttempts >= MAX_ATTEMPTS) {
        Alert.alert(
          'Access Denied ❌',
          `Too many failed attempts (${MAX_ATTEMPTS}/${MAX_ATTEMPTS}). Access blocked for security.`,
          [
            {
              text: 'OK',
              onPress: onCancel
            }
          ]
        );
        return;
      }

      Alert.alert(
        'Incorrect Passcode ❌',
        `Invalid passcode. ${MAX_ATTEMPTS - newAttempts} attempts remaining.`,
        [{ text: 'Try Again', style: 'default' }]
      );
    }
  };

  const handleKeyPress = (key: string) => {
    if (passcode.length < 50) { // Reasonable limit
      setPasscode(prev => prev + key);
    }
  };

  const handleBackspace = () => {
    setPasscode(prev => prev.slice(0, -1));
  };

  return (
    <View style={[commonStyles.card, { margin: 20 }]}>
      <View style={{ alignItems: 'center', marginBottom: 30 }}>
        <View style={{
          backgroundColor: colors.accent,
          width: 80,
          height: 80,
          borderRadius: 40,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
        }}>
          <Icon name="shield-checkmark" size={40} color="white" />
        </View>
        <Text style={[commonStyles.title, { fontSize: 24, marginBottom: 10 }]}>
          Admin Access
        </Text>
        <Text style={[commonStyles.text, { textAlign: 'center', opacity: 0.8 }]}>
          Enter the admin passcode to access the control panel
        </Text>
        {attempts > 0 && (
          <Text style={[commonStyles.text, { 
            color: colors.error, 
            fontSize: 14, 
            textAlign: 'center',
            marginTop: 10 
          }]}>
            Failed attempts: {attempts}/{MAX_ATTEMPTS}
          </Text>
        )}
      </View>

      {/* Passcode Input */}
      <View style={{ marginBottom: 30 }}>
        <Text style={[commonStyles.text, { marginBottom: 10, textAlign: 'center' }]}>
          Passcode
        </Text>
        <TextInput
          style={[
            commonStyles.textInput,
            {
              minHeight: 60,
              textAlign: 'center',
              fontSize: 18,
              fontFamily: 'monospace',
              letterSpacing: 2,
              borderColor: attempts > 0 ? colors.error : colors.border,
              borderWidth: 2,
            }
          ]}
          value={passcode}
          onChangeText={setPasscode}
          secureTextEntry={true}
          placeholder="Enter admin passcode..."
          placeholderTextColor="#666"
          editable={!isLoading}
          autoCapitalize="none"
          autoCorrect={false}
          maxLength={50}
        />
      </View>

      {/* Action Buttons */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <TouchableOpacity
          onPress={onCancel}
          disabled={isLoading}
          style={{
            backgroundColor: colors.backgroundAlt,
            padding: 15,
            borderRadius: 12,
            flex: 1,
            marginRight: 10,
            alignItems: 'center',
            opacity: isLoading ? 0.5 : 1,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon name="close" size={20} color={colors.text} style={{ marginRight: 8 }} />
            <Text style={[commonStyles.text, { fontWeight: 'bold' }]}>
              Cancel
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isLoading || passcode.trim() === ''}
          style={{
            backgroundColor: isLoading ? colors.grey : colors.accent,
            padding: 15,
            borderRadius: 12,
            flex: 1,
            marginLeft: 10,
            alignItems: 'center',
            opacity: (isLoading || passcode.trim() === '') ? 0.5 : 1,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {isLoading ? (
              <Icon name="hourglass" size={20} color="white" style={{ marginRight: 8 }} />
            ) : (
              <Icon name="checkmark" size={20} color="white" style={{ marginRight: 8 }} />
            )}
            <Text style={{ color: 'white', fontWeight: 'bold' }}>
              {isLoading ? 'Verifying...' : 'Access'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Security Notice */}
      <View style={{
        backgroundColor: colors.backgroundAlt,
        padding: 15,
        borderRadius: 10,
        marginTop: 20,
        alignItems: 'center',
      }}>
        <Icon name="information-circle" size={16} color={colors.accent} style={{ marginBottom: 5 }} />
        <Text style={[commonStyles.text, { 
          fontSize: 12, 
          textAlign: 'center', 
          opacity: 0.7,
          lineHeight: 18 
        }]}>
          This area is restricted to authorized administrators only. 
          All access attempts are logged for security purposes.
        </Text>
      </View>
    </View>
  );
}
