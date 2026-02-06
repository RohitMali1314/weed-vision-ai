import { useState } from "react";
import { MessageSquare, Lightbulb, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

export const FeedbackSection = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [suggestion, setSuggestion] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<"suggestion" | "feedback" | null>(null);

  const handleSubmit = async (type: "suggestion" | "feedback") => {
    const content = type === "suggestion" ? suggestion : feedback;
    
    if (!content.trim()) {
      toast({
        title: t("feedback.error", "Error"),
        description: t("feedback.emptyMessage", "Please enter a message"),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call - in production, this would send to your backend
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    toast({
      title: t("feedback.success", "Thank you!"),
      description: t("feedback.successMessage", "Your message has been received"),
    });
    
    setSubmitted(type);
    if (type === "suggestion") {
      setSuggestion("");
    } else {
      setFeedback("");
    }
    
    setIsSubmitting(false);
    
    // Reset submitted state after 3 seconds
    setTimeout(() => setSubmitted(null), 3000);
  };

  return (
    <Card className="glass border-primary/20">
      <CardHeader className="border-b border-border/50">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="p-2 bg-primary/20 rounded-lg">
            <MessageSquare className="h-5 w-5 text-primary" />
          </div>
          {t("feedback.title", "Suggestions & Feedback")}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs defaultValue="suggestion" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-secondary">
            <TabsTrigger
              value="suggestion"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Lightbulb className="h-4 w-4 mr-2" />
              {t("feedback.suggestions", "Suggestions")}
            </TabsTrigger>
            <TabsTrigger
              value="feedback"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              {t("feedback.feedback", "Feedback")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="suggestion" className="mt-4 space-y-4">
            <Textarea
              placeholder={t("feedback.suggestionPlaceholder", "Share your ideas to improve this app...")}
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value)}
              className="min-h-[100px] bg-secondary/50 border-border focus:border-primary"
            />
            <Button
              onClick={() => handleSubmit("suggestion")}
              disabled={isSubmitting || submitted === "suggestion"}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {submitted === "suggestion" ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {t("feedback.sent", "Sent!")}
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  {t("feedback.sendSuggestion", "Send Suggestion")}
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="feedback" className="mt-4 space-y-4">
            <Textarea
              placeholder={t("feedback.feedbackPlaceholder", "Tell us what you think about this app...")}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="min-h-[100px] bg-secondary/50 border-border focus:border-primary"
            />
            <Button
              onClick={() => handleSubmit("feedback")}
              disabled={isSubmitting || submitted === "feedback"}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {submitted === "feedback" ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {t("feedback.sent", "Sent!")}
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  {t("feedback.sendFeedback", "Send Feedback")}
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
