
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { shadows } from '../styles/commonStyles';
import Icon from './Icon';
import { GlobalMessage } from '../types';
import { supabaseService } from '../services/supabaseService';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface GlobalMessageBannerProps {
  onMessageDismissed?: () => void;
}

export default function GlobalMessageBanner({ onMessageDismissed }: GlobalMessageBannerProps) {
  const { colors } = useTheme();
  const [messages, setMessages] = useState<GlobalMessage[]>([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [slideAnim] = useState(new Animated.Value(-100));
  const [dismissedMessages, setDismissedMessages] = useState<string[]>([]);

  useEffect(() => {
    loadGlobalMessages();
    loadDismissedMessages();
    
    // Check for new messages every 30 seconds
    const interval = setInterval(loadGlobalMessages, 30000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (messages.length > 0 && !isMessageDismissed(messages[currentMessageIndex])) {
      showMessage();
    } else if (messages.length > 0) {
      // Find next non-dismissed message
      const nextIndex = messages.findIndex(msg => !isMessageDismissed(msg));
      if (nextIndex !== -1) {
        setCurrentMessageIndex(nextIndex);
      } else {
        hideMessage();
      }
    }
  }, [messages, currentMessageIndex, dismissedMessages]);

  const loadGlobalMessages = async () => {
    try {
      const result = await supabaseService.getGlobalMessages();
      if (result.success && result.data) {
        setMessages(result.data);
        console.log('Loaded global messages:', result.data.length);
      }
    } catch (error) {
      console.error('Error loading global messages:', error);
    }
  };

  const loadDismissedMessages = async () => {
    try {
      const dismissed = await AsyncStorage.getItem('dismissed_global_messages');
      if (dismissed) {
        setDismissedMessages(JSON.parse(dismissed));
      }
    } catch (error) {
      console.error('Error loading dismissed messages:', error);
    }
  };

  const saveDismissedMessages = async (dismissed: string[]) => {
    try {
      await AsyncStorage.setItem('dismissed_global_messages', JSON.stringify(dismissed));
    } catch (error) {
      console.error('Error saving dismissed messages:', error);
    }
  };

  const isMessageDismissed = (message: GlobalMessage): boolean => {
    return dismissedMessages.includes(message.id);
  };

  const showMessage = () => {
    setIsVisible(true);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const hideMessage = () => {
    Animated.timing(slideAnim, {
      toValue: -100,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsVisible(false);
    });
  };

  const dismissMessage = async () => {
    const currentMessage = messages[currentMessageIndex];
    if (!currentMessage) return;

    const newDismissed = [...dismissedMessages, currentMessage.id];
    setDismissedMessages(newDismissed);
    await saveDismissedMessages(newDismissed);

    hideMessage();
    
    if (onMessageDismissed) {
      onMessageDismissed();
    }

    // Show next message after a delay
    setTimeout(() => {
      const nextIndex = messages.findIndex((msg, index) => 
        index > currentMessageIndex && !newDismissed.includes(msg.id)
      );
      
      if (nextIndex !== -1) {
        setCurrentMessageIndex(nextIndex);
      }
    }, 500);
  };

  const getMessageColor = (type: GlobalMessage['type']) => {
    switch (type) {
      case 'success': return colors.success;
      case 'warning': return colors.warning;
      case 'error': return colors.error;
      case 'info':
      default: return colors.info;
    }
  };

  const getMessageIcon = (type: GlobalMessage['type']) => {
    switch (type) {
      case 'success': return 'checkmark-circle';
      case 'warning': return 'warning';
      case 'error': return 'alert-circle';
      case 'info':
      default: return 'information-circle';
    }
  };

  if (!isVisible || messages.length === 0 || !messages[currentMessageIndex]) {
    return null;
  }

  const currentMessage = messages[currentMessageIndex];

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <View
        style={{
          backgroundColor: getMessageColor(currentMessage.type),
          paddingHorizontal: 20,
          paddingVertical: 16,
          paddingTop: 60, // Account for status bar
          flexDirection: 'row',
          alignItems: 'center',
          ...shadows.large,
        }}
      >
        <Icon 
          name={getMessageIcon(currentMessage.type) as any} 
          size={24} 
          color="white" 
          style={{ marginRight: 12 }} 
        />
        
        <View style={{ flex: 1 }}>
          {currentMessage.title && (
            <Text style={{
              color: 'white',
              fontSize: 16,
              fontWeight: 'bold',
              marginBottom: 4,
            }}>
              {currentMessage.title}
            </Text>
          )}
          <Text style={{
            color: 'white',
            fontSize: 14,
            lineHeight: 20,
          }}>
            {currentMessage.message}
          </Text>
        </View>

        <TouchableOpacity
          onPress={dismissMessage}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: 20,
            padding: 8,
            marginLeft: 12,
          }}
        >
          <Icon name="close" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}
