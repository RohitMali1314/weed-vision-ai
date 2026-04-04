import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PredictionResult } from "@/pages/Index";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

interface ResultsDisplayProps {
  results: PredictionResult;
}

export const ResultsDisplay = ({ results }: ResultsDisplayProps) => {
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleDownload = async () => {
    try {
      const response = await fetch(results.result_image_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `weed-detection-result-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: t("results.downloadStarted"),
        description: t("results.downloadStartedDesc"),
      });
    } catch (error) {
      console.error('Error downloading image:', error);
      toast({
        title: t("results.downloadFailed"),
        description: t("results.downloadFailedDesc"),
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="glass border-primary/10 hover:border-primary/20 transition-all duration-500">
      <CardHeader className="border-b border-border/30">
        <CardTitle className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/15 rounded-xl border border-primary/20">
            <span className="text-lg">📸</span>
          </div>
          {t("results.analysisResults")}
        </CardTitle>
        <CardDescription>
          {t("results.analysisDescription")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">{t("results.originalImage")}</h4>
            <div className="relative group rounded-xl overflow-hidden">
              <img
                src={results.original_image_url}
                alt="Original"
                className="w-full h-52 object-cover rounded-xl border border-border/50 group-hover:scale-[1.02] transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">{t("results.detectionResults")}</h4>
            <div className="relative group rounded-xl overflow-hidden">
              <img
                src={results.result_image_url}
                alt="Processed"
                className="w-full h-52 object-cover rounded-xl border border-accent/30 group-hover:scale-[1.02] transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 p-5 glass-subtle rounded-xl">
          <div className="text-center">
            <div className="text-3xl font-bold text-gradient">
              {results.detections.length}
            </div>
            <div className="text-sm text-muted-foreground mt-1">{t("results.totalDetections")}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gradient">
              {results.detections.length > 0 
                ? Math.round(results.detections.reduce((acc, det) => acc + det.confidence, 0) / results.detections.length)
                : 0}%
            </div>
            <div className="text-sm text-muted-foreground mt-1">{t("results.avgConfidence")}</div>
          </div>
        </div>

        <Button onClick={handleDownload} className="w-full h-11 bg-gradient-primary hover:opacity-90 text-primary-foreground font-semibold transition-all duration-300 hover:shadow-glow">
          <Download className="h-4 w-4 mr-2" />
          {t("results.downloadProcessed")}
        </Button>
      </CardContent>
    </Card>
  );
};
