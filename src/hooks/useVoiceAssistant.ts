import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface VoiceAssistantState {
  isListening: boolean;
  isSpeaking: boolean;
  transcript: string;
  error: string | null;
  isSupported: boolean;
}

export const useVoiceAssistant = () => {
  const { i18n } = useTranslation();
  const [state, setState] = useState<VoiceAssistantState>({
    isListening: false,
    isSpeaking: false,
    transcript: '',
    error: null,
    isSupported: false,
  });

  const [recognition, setRecognition] = useState<any>(null);
  const [synthesis] = useState(() => window.speechSynthesis);

  // Map app language to speech recognition language code
  const getLanguageCode = useCallback(() => {
    const langMap: Record<string, string> = {
      en: 'en-IN',
      hi: 'hi-IN',
      mr: 'mr-IN',
    };
    return langMap[i18n.language] || 'hi-IN';
  }, [i18n.language]);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = getLanguageCode();

      recognitionInstance.onstart = () => {
        setState(prev => ({ ...prev, isListening: true, error: null }));
      };

      recognitionInstance.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setState(prev => ({ ...prev, transcript }));
      };

      recognitionInstance.onerror = (event) => {
        setState(prev => ({ 
          ...prev, 
          isListening: false, 
          error: event.error === 'not-allowed' 
            ? 'माइक्रोफ़ोन की अनुमति दें / Please allow microphone access'
            : `Error: ${event.error}`
        }));
      };

      recognitionInstance.onend = () => {
        setState(prev => ({ ...prev, isListening: false }));
      };

      setRecognition(recognitionInstance);
      setState(prev => ({ ...prev, isSupported: true }));
    } else {
      setState(prev => ({ 
        ...prev, 
        isSupported: false,
        error: 'आपका ब्राउज़र वॉइस को सपोर्ट नहीं करता / Voice not supported in your browser'
      }));
    }
  }, [getLanguageCode]);

  // Update recognition language when app language changes
  useEffect(() => {
    if (recognition) {
      recognition.lang = getLanguageCode();
    }
  }, [recognition, getLanguageCode]);

  const startListening = useCallback(() => {
    if (recognition && !state.isListening) {
      setState(prev => ({ ...prev, transcript: '' }));
      try {
        recognition.start();
      } catch (error) {
        console.error('Failed to start recognition:', error);
      }
    }
  }, [recognition, state.isListening]);

  const stopListening = useCallback(() => {
    if (recognition && state.isListening) {
      recognition.stop();
    }
  }, [recognition, state.isListening]);

  const speak = useCallback((text: string) => {
    if (!synthesis) return;

    // Cancel any ongoing speech
    synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = getLanguageCode();
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1;

    // Try to find a voice for the current language
    const voices = synthesis.getVoices();
    const langCode = getLanguageCode();
    const preferredVoice = voices.find(voice => voice.lang.startsWith(langCode.split('-')[0]));
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      setState(prev => ({ ...prev, isSpeaking: true }));
    };

    utterance.onend = () => {
      setState(prev => ({ ...prev, isSpeaking: false }));
    };

    utterance.onerror = () => {
      setState(prev => ({ ...prev, isSpeaking: false }));
    };

    synthesis.speak(utterance);
  }, [synthesis, getLanguageCode]);

  const stopSpeaking = useCallback(() => {
    if (synthesis) {
      synthesis.cancel();
      setState(prev => ({ ...prev, isSpeaking: false }));
    }
  }, [synthesis]);

  return {
    ...state,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  };
};

// Extend Window interface for speech recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
