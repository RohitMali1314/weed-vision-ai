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
    <Card className="shadow-medium">
      <CardHeader>
        <CardTitle>{t("results.analysisResults")}</CardTitle>
        <CardDescription>
          {t("results.analysisDescription")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">{t("results.originalImage")}</h4>
            <div className="relative">
              <img
                src={results.original_image_url}
                alt="Original"
                className="w-full h-48 object-cover rounded-lg border"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">{t("results.detectionResults")}</h4>
            <div className="relative">
              <img
                src={results.result_image_url}
                alt="Processed"
                className="w-full h-48 object-cover rounded-lg border"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 p-4 bg-secondary/50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {results.detections.length}
            </div>
            <div className="text-sm text-muted-foreground">{t("results.totalDetections")}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {results.detections.length > 0 
                ? Math.round(results.detections.reduce((acc, det) => acc + det.confidence, 0) / results.detections.length)
                : 0}%
            </div>
            <div className="text-sm text-muted-foreground">{t("results.avgConfidence")}</div>
          </div>
        </div>

        <Button onClick={handleDownload} className="w-full">
          <Download className="h-4 w-4 mr-2" />
          {t("results.downloadProcessed")}
        </Button>
      </CardContent>
    </Card>
  );
};