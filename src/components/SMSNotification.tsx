import { useState } from "react";
import { Phone, Send, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import type { Detection } from "@/pages/Index";

interface SMSNotificationProps {
  detections: Detection[];
}

export const SMSNotification = ({ detections }: SMSNotificationProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  const formatDetectionsForSMS = () => {
    const header = t("sms.header", "🌱 Weed Detection Results:\n");
    
    const detectionList = detections
      .map((d, i) => {
        let line = `${i + 1}. ${d.label} (${(d.confidence * 100).toFixed(0)}%)`;
        if (d.fertilizer) {
          line += `\n   💊 ${d.fertilizer}: ${d.quantity} - ${d.frequency}`;
        }
        return line;
      })
      .join("\n");

    const footer = t("sms.footer", "\n\n🚜 Weed Vision AI - Kisan ka Saathi");
    
    return header + detectionList + footer;
  };

  const handleSendSMS = async () => {
    // Validate phone number (Indian format)
    const cleanNumber = phoneNumber.replace(/\D/g, "");
    if (cleanNumber.length !== 10) {
      toast({
        title: t("sms.invalidNumber", "Invalid Number"),
        description: t("sms.enterValid", "Please enter a valid 10-digit mobile number"),
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);

    try {
      const message = formatDetectionsForSMS();
      
      const { data, error } = await supabase.functions.invoke("send-sms", {
        body: {
          to: `+91${cleanNumber}`,
          message,
        },
      });

      if (error) throw error;

      toast({
        title: t("sms.sent", "SMS Sent!"),
        description: t("sms.sentDescription", "Detection results sent to your phone"),
      });
      
      setSent(true);
      setTimeout(() => setSent(false), 5000);
    } catch (error) {
      console.error("SMS Error:", error);
      toast({
        title: t("sms.failed", "Failed to send"),
        description: t("sms.tryAgain", "Please try again later"),
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="glass border-accent/30">
      <CardHeader className="border-b border-border/50 pb-4">
        <CardTitle className="flex items-center gap-3 text-lg">
          <div className="p-2 bg-accent/20 rounded-lg">
            <Phone className="h-5 w-5 text-accent" />
          </div>
          {t("sms.title", "Send Results to Mobile")}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="flex gap-2">
          <div className="flex items-center px-3 bg-secondary rounded-l-lg border border-r-0 border-border">
            <span className="text-muted-foreground text-sm">+91</span>
          </div>
          <Input
            type="tel"
            placeholder={t("sms.placeholder", "Enter mobile number")}
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
            className="flex-1 bg-secondary/50 border-border rounded-l-none"
            maxLength={10}
          />
        </div>
        
        <Button
          onClick={handleSendSMS}
          disabled={isSending || sent || phoneNumber.length !== 10}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          {isSending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t("sms.sending", "Sending...")}
            </>
          ) : sent ? (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              {t("sms.sentButton", "Sent!")}
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              {t("sms.send", "Send SMS")}
            </>
          )}
        </Button>
        
        <p className="text-xs text-muted-foreground text-center">
          {t("sms.note", "Standard SMS charges may apply")}
        </p>
      </CardContent>
    </Card>
  );
};
