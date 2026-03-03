import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Detection } from "@/pages/Index";

interface WhatsAppShareProps {
  detections: Detection[];
  className?: string;
}

export const WhatsAppShare = ({ detections, className }: WhatsAppShareProps) => {
  const { t, i18n } = useTranslation();

  const generateShareText = () => {
    const lang = i18n.language;
    
    // Create header based on language
    const headers: Record<string, string> = {
      en: "🌿 *Weed Detection Report* 🌿\n\n",
      hi: "🌿 *खरपतवार पहचान रिपोर्ट* 🌿\n\n",
      mr: "🌿 *तण ओळख अहवाल* 🌿\n\n",
    };

    const detectedLabel: Record<string, string> = {
      en: "Detected Weeds:",
      hi: "पहचाने गए खरपतवार:",
      mr: "ओळखलेले तण:",
    };

    const fertilizerLabel: Record<string, string> = {
      en: "Recommended Fertilizer:",
      hi: "अनुशंसित उर्वरक:",
      mr: "शिफारस केलेले खत:",
    };

    const quantityLabel: Record<string, string> = {
      en: "Quantity:",
      hi: "मात्रा:",
      mr: "प्रमाण:",
    };

    let message = headers[lang] || headers.en;
    message += `📊 ${detectedLabel[lang] || detectedLabel.en}\n\n`;

    detections.forEach((detection, index) => {
      const conf = detection.confidence > 1 ? detection.confidence : detection.confidence * 100;
      message += `${index + 1}. *${detection.label}* (${Math.min(conf, 100).toFixed(1)}%)\n`;
      
      if (detection.fertilizer) {
        message += `   💊 ${fertilizerLabel[lang] || fertilizerLabel.en} ${detection.fertilizer}\n`;
      }
      if (detection.quantity) {
        message += `   📏 ${quantityLabel[lang] || quantityLabel.en} ${detection.quantity}\n`;
      }
      message += "\n";
    });

    // Add app promotion
    const appPromo: Record<string, string> = {
      en: "📱 Analyzed using Weed Vision AI\n🔗 https://weed-vision-ai.lovable.app",
      hi: "📱 Weed Vision AI द्वारा विश्लेषित\n🔗 https://weed-vision-ai.lovable.app",
      mr: "📱 Weed Vision AI द्वारे विश्लेषण\n🔗 https://weed-vision-ai.lovable.app",
    };

    message += "\n" + (appPromo[lang] || appPromo.en);

    return message;
  };

  const handleShare = () => {
    const text = generateShareText();
    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://wa.me/?text=${encodedText}`;
    window.open(whatsappUrl, "_blank");
  };

  if (detections.length === 0) return null;

  return (
    <Button
      onClick={handleShare}
      className={`bg-[#25D366] hover:bg-[#128C7E] text-white ${className}`}
      size="lg"
    >
      <Share2 className="h-5 w-5 mr-2" />
      {t("share.whatsapp", "WhatsApp पर शेयर करें")}
    </Button>
  );
};
