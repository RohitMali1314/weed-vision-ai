import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVoiceAssistant } from "@/hooks/useVoiceAssistant";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface VoiceAssistantProps {
  onVoiceInput?: (transcript: string) => void;
  textToSpeak?: string;
  className?: string;
}

export const VoiceAssistant = ({ onVoiceInput, textToSpeak, className }: VoiceAssistantProps) => {
  const { t } = useTranslation();
  const {
    isListening,
    isSpeaking,
    transcript,
    error,
    isSupported,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  } = useVoiceAssistant();

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
      if (transcript && onVoiceInput) {
        onVoiceInput(transcript);
      }
    } else {
      startListening();
    }
  };

  const handleSpeakClick = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else if (textToSpeak) {
      speak(textToSpeak);
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Microphone Button */}
      <Button
        variant={isListening ? "default" : "outline"}
        size="icon"
        onClick={handleMicClick}
        className={cn(
          "relative transition-all duration-300",
          isListening && "bg-primary animate-pulse ring-2 ring-primary/50"
        )}
        title={isListening ? t("voice.stopListening", "बंद करें") : t("voice.startListening", "बोलें")}
      >
        {isListening ? (
          <MicOff className="h-5 w-5" />
        ) : (
          <Mic className="h-5 w-5" />
        )}
        {isListening && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full animate-ping" />
        )}
      </Button>

      {/* Speaker Button (only if there's text to speak) */}
      {textToSpeak && (
        <Button
          variant={isSpeaking ? "default" : "outline"}
          size="icon"
          onClick={handleSpeakClick}
          className={cn(
            "transition-all duration-300",
            isSpeaking && "bg-accent"
          )}
          title={isSpeaking ? t("voice.stopSpeaking", "रोकें") : t("voice.speak", "सुनें")}
        >
          {isSpeaking ? (
            <VolumeX className="h-5 w-5" />
          ) : (
            <Volume2 className="h-5 w-5" />
          )}
        </Button>
      )}

      {/* Transcript Display */}
      {isListening && transcript && (
        <div className="ml-2 px-3 py-1 bg-secondary rounded-lg text-sm text-secondary-foreground animate-fade-in max-w-xs truncate">
          "{transcript}"
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="ml-2 text-xs text-destructive">
          {error}
        </div>
      )}
    </div>
  );
};
