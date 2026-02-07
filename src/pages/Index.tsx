import { useState, useEffect } from "react";
import { Camera, Upload, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ImageUpload } from "@/components/ImageUpload";
import { ResultsDisplay } from "@/components/ResultsDisplay";
import { DetectionTable } from "@/components/DetectionTable";
import { FertilizerRecommendations } from "@/components/FertilizerRecommendations";
import { SupportChat } from "@/components/SupportChat";
import { LanguageSelector } from "@/components/LanguageSelector";
import { ThemeToggle } from "@/components/ThemeToggle";
import { WhatsAppShare } from "@/components/WhatsAppShare";
import { NearbyShopLocator } from "@/components/NearbyShopLocator";
import { FeedbackSection } from "@/components/FeedbackSection";
import { SMSNotification } from "@/components/SMSNotification";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

export interface Detection {
  label: string;
  confidence: number;
  bbox?: [number, number, number, number];
  fertilizer?: string;
  quantity?: string;
  frequency?: string;
}

export interface FertilizerData {
  name: string;
  quantity: string;
  frequency: string;
  type?: string;
}

export interface PredictionResult {
  detections: Detection[];
  result_image_url: string;
  original_image_url: string;
  fertilizers?: FertilizerData[];
}

const Index = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingTime, setProcessingTime] = useState(0);
  const [results, setResults] = useState<PredictionResult | null>(null);
  const { toast } = useToast();
  const { t } = useTranslation();

  // Track processing time for cold start warning
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isProcessing) {
      setProcessingTime(0);
      interval = setInterval(() => {
        setProcessingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isProcessing]);

  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
    setResults(null);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleProcessImage = async () => {
    if (!selectedImage) {
      toast({
        title: t("toast.noImage"),
        description: t("toast.selectImage"),
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      let response: Response;
      
      // Check if running locally or in production
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      
      if (isLocalhost) {
        // Direct call to Flask backend for local development
        const formData = new FormData();
        formData.append('file', selectedImage);
        response = await fetch('http://127.0.0.1:5000/predict', {
          method: 'POST',
          body: formData,
        });
      } else {
        // Use edge function proxy for production
        const reader = new FileReader();
        const imageData = await new Promise<string>((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(selectedImage);
        });
        
        response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/predict-proxy`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ imageData }),
        });
      }

      if (!response.ok) {
        throw new Error('Failed to process image');
      }

      const result: PredictionResult = await response.json();
      
      // Extract unique fertilizers from detections
      const uniqueFertilizers = Array.from(
        new Map(
          result.detections
            .filter(d => d.fertilizer && d.quantity && d.frequency)
            .map(d => [
              d.fertilizer,
              {
                name: d.fertilizer!,
                quantity: d.quantity!,
                frequency: d.frequency!,
                type: d.label
              }
            ])
        ).values()
      );
      
      result.fertilizers = uniqueFertilizers;
      setResults(result);
      
      toast({
        title: t("toast.complete"),
        description: `${t("toast.found")} ${result.detections.length} ${t("toast.detections")}`,
      });
    } catch (error) {
      console.error('Error processing image:', error);
      toast({
        title: t("toast.failed"),
        description: t("toast.backendError"),
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setResults(null);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 grid-pattern opacity-50"></div>
      
      {/* Ambient glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl"></div>

      {/* Hero Section with modern dark design */}
      <div className="relative bg-gradient-hero border-b border-border/50 py-20">
        <div className="absolute inset-0 bg-gradient-glow"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex justify-end items-center gap-3 mb-4">
            <ThemeToggle />
            <LanguageSelector />
          </div>
          <div className="text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/20 rounded-2xl mb-4 glow-accent">
                <Camera className="w-10 h-10 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-7xl font-bold mb-6 leading-tight text-foreground">
              {t("hero.title")}
              <span className="block text-3xl md:text-5xl mt-2 text-primary">{t("hero.subtitle")}</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              {t("hero.description")}
            </p>
            <div className="mt-8 flex justify-center flex-wrap gap-4 md:gap-8 text-sm">
              <div className="flex items-center gap-2 px-4 py-2 bg-secondary/50 rounded-full border border-border">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <span className="text-foreground">{t("hero.realtime")}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-secondary/50 rounded-full border border-border">
                <div className="w-2 h-2 bg-accent rounded-full"></div>
                <span className="text-foreground">{t("hero.accuracy")}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-secondary/50 rounded-full border border-border">
                <div className="w-2 h-2 bg-wheat rounded-full"></div>
                <span className="text-foreground">{t("hero.farmReady")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Upload Section with modern styling */}
          <div className="space-y-8 animate-slide-up">
            <Card className="glass shadow-glow border-primary/20 hover:border-primary/40 transition-all duration-300">
              <CardHeader className="border-b border-border/50">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <Upload className="h-6 w-6 text-primary" />
                  </div>
                  {t("upload.title")}
                </CardTitle>
                <CardDescription className="text-base text-muted-foreground">
                  {t("upload.description")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-8">
                <ImageUpload onImageSelect={handleImageSelect} />
                
                {imagePreview && (
                  <div className="space-y-6">
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-primary rounded-xl blur opacity-25 group-hover:opacity-50 transition-all duration-300"></div>
                      <img
                        src={imagePreview}
                        alt="Field Image Preview"
                        className="relative w-full h-72 object-cover rounded-xl border border-border shadow-medium"
                      />
                      <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm text-foreground px-3 py-1 rounded-full text-sm border border-border">
                        ✓ {t("upload.ready")}
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <Button
                        onClick={handleProcessImage}
                        disabled={isProcessing}
                        className="flex-1 h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow hover-glow"
                        size="lg"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                            {t("upload.analyzing")}
                          </>
                        ) : (
                          <>
                            <Camera className="h-5 w-5 mr-2" />
                            {t("upload.analyze")}
                          </>
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={handleReset}
                        className="px-8 h-12 border border-border hover:bg-secondary hover:border-primary/50"
                        size="lg"
                      >
                        {t("upload.reset")}
                      </Button>
                    </div>
                    
                    {/* Cold Start Warning */}
                    {isProcessing && processingTime >= 5 && (
                      <Alert className="border-warning/50 bg-warning/10">
                        <AlertCircle className="h-4 w-4 text-warning" />
                        <AlertDescription className="text-warning-foreground">
                          {t("upload.coldStartWarning", "Server is waking up... First requests may take 30-60 seconds on free hosting. Please wait!")}
                          <span className="ml-2 font-mono text-sm">({processingTime}s)</span>
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Empty placeholder - will show content after feedback when no results */}
          <div className="space-y-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            {/* This column intentionally left for layout balance */}
          </div>
        </div>

        {/* Results Flow Section - Shows after detection */}
        {results && (
          <div className="mt-12 space-y-8">
            {/* Detection Results Table */}
            <Card className="glass border-accent/30 hover:border-accent/50 transition-all duration-300 animate-grow">
              <CardHeader className="border-b border-border/50">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-accent/20 rounded-lg">
                    <span className="text-xl">🔍</span>
                  </div>
                  {t("results.title")}
                </CardTitle>
                <CardDescription className="text-base">
                  {t("results.detected")} {results.detections.length} {t("results.instances")}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <DetectionTable detections={results.detections} />
              </CardContent>
            </Card>

            {/* Field Analysis Results (Images) */}
            <ResultsDisplay results={results} />
            
            {/* Fertilizer Recommendations */}
            {results.fertilizers && results.fertilizers.length > 0 && (
              <FertilizerRecommendations fertilizers={results.fertilizers} />
            )}

            {/* Nearby Shop Locator - After Fertilizer Recommendations */}
            <NearbyShopLocator />

            {/* SMS Notification */}
            <SMSNotification detections={results.detections} />

            {/* WhatsApp Share Button */}
            <div className="flex justify-center">
              <WhatsAppShare detections={results.detections} />
            </div>
          </div>
        )}
      </div>

      {/* Feedback Section - At the bottom */}
      <div className="container mx-auto px-4 py-8 relative z-10">
        <FeedbackSection />
      </div>

      {/* Ready for Field Analysis - Shows after Feedback when no results */}
      {!results && (
        <div className="container mx-auto px-4 pb-8 relative z-10">
          <Card className="glass border-muted max-w-2xl mx-auto">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-6 p-6 bg-secondary rounded-2xl border border-border">
                <Camera className="h-16 w-16 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">{t("results.readyTitle")}</h3>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-md">
                {t("results.readyDescription")}
              </p>
              <div className="mt-8 flex justify-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2 px-3 py-1 bg-secondary rounded-full">
                  <span className="text-primary">●</span>
                  <span>{t("results.cropProtection")}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-secondary rounded-full">
                  <span className="text-accent">●</span>
                  <span>{t("results.precisionDetection")}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      <SupportChat />
      
      {/* Team Credits Footer */}
      <footer className="relative z-10 bg-secondary/30 border-t border-border mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-foreground mb-3">
              {t("footer.developedBy")}
            </h3>
            <div className="flex flex-wrap justify-center gap-4 text-muted-foreground">
              <span className="px-4 py-2 bg-card rounded-lg border border-border shadow-soft hover:border-primary/50 transition-colors">
                Rohit Mali
              </span>
              <span className="px-4 py-2 bg-card rounded-lg border border-border shadow-soft hover:border-primary/50 transition-colors">
                Sakshi Padalkar
              </span>
              <span className="px-4 py-2 bg-card rounded-lg border border-border shadow-soft hover:border-primary/50 transition-colors">
                Shivam Narevekar
              </span>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              {t("footer.tagline")}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;