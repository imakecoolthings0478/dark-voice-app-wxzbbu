import { Text, View, TextInput, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import * as Speech from 'expo-speech';
import { commonStyles } from '../styles/commonStyles';
import Button from '../components/Button';
import Icon from '../components/Icon';

export default function TextToVoiceApp() {
  const [text, setText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [speechPitch, setSpeechPitch] = useState(1.0);
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const [showSettings, setShowSettings] = useState(false);

  const languages = [
    { code: 'en-US', name: 'English (US)' },
    { code: 'en-GB', name: 'English (UK)' },
    { code: 'es-ES', name: 'Spanish' },
    { code: 'fr-FR', name: 'French' },
    { code: 'de-DE', name: 'German' },
    { code: 'it-IT', name: 'Italian' },
    { code: 'pt-BR', name: 'Portuguese' },
    { code: 'ja-JP', name: 'Japanese' },
    { code: 'ko-KR', name: 'Korean' },
    { code: 'zh-CN', name: 'Chinese' },
  ];

  useEffect(() => {
    console.log('Text-to-Voice app initialized');
    return () => {
      // Stop speech when component unmounts
      Speech.stop();
    };
  }, []);

  const handleSpeak = async () => {
    if (!text.trim()) {
      Alert.alert('Error', 'Please enter some text to speak');
      return;
    }

    try {
      if (isSpeaking) {
        console.log('Stopping speech');
        Speech.stop();
        setIsSpeaking(false);
      } else {
        console.log('Starting speech with text:', text.substring(0, 50) + '...');
        setIsSpeaking(true);
        
        await Speech.speak(text, {
          language: selectedLanguage,
          pitch: speechPitch,
          rate: speechRate,
          onStart: () => {
            console.log('Speech started');
            setIsSpeaking(true);
          },
          onDone: () => {
            console.log('Speech completed');
            setIsSpeaking(false);
          },
          onStopped: () => {
            console.log('Speech stopped');
            setIsSpeaking(false);
          },
          onError: (error) => {
            console.log('Speech error:', error);
            setIsSpeaking(false);
            Alert.alert('Error', 'Failed to speak text. Please try again.');
          },
        });
      }
    } catch (error) {
      console.error('Speech error:', error);
      setIsSpeaking(false);
      Alert.alert('Error', 'Failed to speak text. Please try again.');
    }
  };

  const handleClearText = () => {
    setText('');
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
    }
  };

  const handlePasteText = async () => {
    try {
      // For web, we can use the clipboard API
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        const clipboardText = await navigator.clipboard.readText();
        setText(clipboardText);
        console.log('Text pasted from clipboard');
      } else {
        Alert.alert('Info', 'Paste functionality not available on this platform');
      }
    } catch (error) {
      console.log('Clipboard error:', error);
      Alert.alert('Error', 'Could not access clipboard');
    }
  };

  const currentStyles = isDarkMode ? commonStyles : commonStyles; // We'll use dark mode styles

  return (
    <View style={currentStyles.container}>
      <ScrollView style={{ flex: 1, width: '100%' }} contentContainerStyle={{ flexGrow: 1 }}>
        <View style={currentStyles.content}>
          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingHorizontal: 20, marginBottom: 20 }}>
            <Text style={[currentStyles.title, { fontSize: 28 }]}>Text to Voice</Text>
            <TouchableOpacity
              onPress={() => setShowSettings(!showSettings)}
              style={{ padding: 10 }}
            >
              <Icon name="settings-outline" size={24} />
            </TouchableOpacity>
          </View>

          {/* Settings Panel */}
          {showSettings && (
            <View style={[currentStyles.card, { marginHorizontal: 20, marginBottom: 20 }]}>
              <Text style={[currentStyles.text, { fontSize: 18, fontWeight: 'bold', marginBottom: 15 }]}>Settings</Text>
              
              {/* Dark Mode Toggle */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                <Text style={currentStyles.text}>Dark Mode</Text>
                <TouchableOpacity
                  onPress={() => setIsDarkMode(!isDarkMode)}
                  style={{
                    width: 50,
                    height: 30,
                    borderRadius: 15,
                    backgroundColor: isDarkMode ? '#64B5F6' : '#ccc',
                    justifyContent: 'center',
                    paddingHorizontal: 3,
                  }}
                >
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: 'white',
                      alignSelf: isDarkMode ? 'flex-end' : 'flex-start',
                    }}
                  />
                </TouchableOpacity>
              </View>

              {/* Language Selection */}
              <Text style={[currentStyles.text, { marginBottom: 10 }]}>Language</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 15 }}>
                {languages.map((lang) => (
                  <TouchableOpacity
                    key={lang.code}
                    onPress={() => setSelectedLanguage(lang.code)}
                    style={{
                      backgroundColor: selectedLanguage === lang.code ? '#64B5F6' : '#2a2a2a',
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 20,
                      marginRight: 10,
                    }}
                  >
                    <Text style={[currentStyles.text, { fontSize: 14 }]}>{lang.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Speech Rate */}
              <Text style={[currentStyles.text, { marginBottom: 10 }]}>Speed: {speechRate.toFixed(1)}x</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
                <TouchableOpacity
                  onPress={() => setSpeechRate(Math.max(0.1, speechRate - 0.1))}
                  style={{ backgroundColor: '#64B5F6', padding: 10, borderRadius: 5, marginRight: 10 }}
                >
                  <Text style={{ color: 'white', fontWeight: 'bold' }}>-</Text>
                </TouchableOpacity>
                <View style={{ flex: 1, height: 4, backgroundColor: '#2a2a2a', borderRadius: 2 }}>
                  <View
                    style={{
                      width: `${(speechRate / 2) * 100}%`,
                      height: '100%',
                      backgroundColor: '#64B5F6',
                      borderRadius: 2,
                    }}
                  />
                </View>
                <TouchableOpacity
                  onPress={() => setSpeechRate(Math.min(2.0, speechRate + 0.1))}
                  style={{ backgroundColor: '#64B5F6', padding: 10, borderRadius: 5, marginLeft: 10 }}
                >
                  <Text style={{ color: 'white', fontWeight: 'bold' }}>+</Text>
                </TouchableOpacity>
              </View>

              {/* Speech Pitch */}
              <Text style={[currentStyles.text, { marginBottom: 10 }]}>Pitch: {speechPitch.toFixed(1)}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity
                  onPress={() => setSpeechPitch(Math.max(0.5, speechPitch - 0.1))}
                  style={{ backgroundColor: '#64B5F6', padding: 10, borderRadius: 5, marginRight: 10 }}
                >
                  <Text style={{ color: 'white', fontWeight: 'bold' }}>-</Text>
                </TouchableOpacity>
                <View style={{ flex: 1, height: 4, backgroundColor: '#2a2a2a', borderRadius: 2 }}>
                  <View
                    style={{
                      width: `${((speechPitch - 0.5) / 1.5) * 100}%`,
                      height: '100%',
                      backgroundColor: '#64B5F6',
                      borderRadius: 2,
                    }}
                  />
                </View>
                <TouchableOpacity
                  onPress={() => setSpeechPitch(Math.min(2.0, speechPitch + 0.1))}
                  style={{ backgroundColor: '#64B5F6', padding: 10, borderRadius: 5, marginLeft: 10 }}
                >
                  <Text style={{ color: 'white', fontWeight: 'bold' }}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Text Input Area */}
          <View style={[currentStyles.card, { marginHorizontal: 20, marginBottom: 20, minHeight: 200 }]}>
            <Text style={[currentStyles.text, { fontSize: 16, fontWeight: 'bold', marginBottom: 10 }]}>
              Enter text to speak:
            </Text>
            <TextInput
              style={{
                flex: 1,
                color: currentStyles.text.color,
                fontSize: 16,
                textAlignVertical: 'top',
                padding: 10,
                backgroundColor: '#1a1a1a',
                borderRadius: 8,
                borderWidth: 1,
                borderColor: '#333',
                minHeight: 150,
              }}
              multiline
              placeholder="Type or paste your text here..."
              placeholderTextColor="#666"
              value={text}
              onChangeText={setText}
            />
            <Text style={[currentStyles.text, { fontSize: 12, marginTop: 5, opacity: 0.7 }]}>
              Characters: {text.length}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={{ paddingHorizontal: 20, width: '100%' }}>
            <View style={{ flexDirection: 'row', marginBottom: 15 }}>
              <TouchableOpacity
                onPress={handlePasteText}
                style={{
                  flex: 1,
                  backgroundColor: '#2a2a2a',
                  padding: 15,
                  borderRadius: 10,
                  marginRight: 10,
                  alignItems: 'center',
                }}
              >
                <Icon name="clipboard-outline" size={20} />
                <Text style={[currentStyles.text, { marginTop: 5, fontSize: 12 }]}>Paste</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleClearText}
                style={{
                  flex: 1,
                  backgroundColor: '#2a2a2a',
                  padding: 15,
                  borderRadius: 10,
                  marginLeft: 10,
                  alignItems: 'center',
                }}
              >
                <Icon name="trash-outline" size={20} />
                <Text style={[currentStyles.text, { marginTop: 5, fontSize: 12 }]}>Clear</Text>
              </TouchableOpacity>
            </View>

            {/* Main Speak Button */}
            <TouchableOpacity
              onPress={handleSpeak}
              style={{
                backgroundColor: isSpeaking ? '#ff4444' : '#64B5F6',
                padding: 20,
                borderRadius: 15,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)',
                elevation: 4,
              }}
            >
              <Icon 
                name={isSpeaking ? "stop" : "play"} 
                size={24} 
                style={{ marginRight: 10 }} 
              />
              <Text style={{
                color: 'white',
                fontSize: 18,
                fontWeight: 'bold',
              }}>
                {isSpeaking ? 'Stop Speaking' : 'Start Speaking'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Status Indicator */}
          {isSpeaking && (
            <View style={{ marginTop: 20, alignItems: 'center' }}>
              <View style={{
                backgroundColor: '#64B5F6',
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 20,
                flexDirection: 'row',
                alignItems: 'center',
              }}>
                <View style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: 'white',
                  marginRight: 10,
                  opacity: 0.8,
                }} />
                <Text style={{ color: 'white', fontWeight: 'bold' }}>Speaking...</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}