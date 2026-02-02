import { useState, useEffect } from "react";
import { Camera, Upload, Loader2, AlertCircle, Leaf, Sparkles, Shield, Zap } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ImageUpload } from "@/components/ImageUpload";
import { ResultsDisplay } from "@/components/ResultsDisplay";
import { DetectionTable } from "@/components/DetectionTable";
import { FertilizerRecommendations } from "@/components/FertilizerRecommendations";
import { SupportChat } from "@/components/SupportChat";
import { LanguageSelector } from "@/components/LanguageSelector";
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
    <div className="min-h-screen bg-background field-bg organic-pattern relative overflow-hidden">
      {/* Subtle ambient background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-crop/5 to-transparent blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-wheat/8 to-transparent blur-3xl" />
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] rounded-full bg-gradient-to-b from-primary/3 to-transparent blur-2xl animate-pulse" style={{ animationDuration: '8s' }} />
      </div>

      {/* Hero Section - Modern & Minimal */}
      <header className="relative bg-gradient-hero text-primary-foreground overflow-hidden">
        {/* Geometric pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="hero-grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="0.5" fill="currentColor" opacity="0.4" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#hero-grid)" />
          </svg>
        </div>
        
        <div className="relative container mx-auto px-6 py-16 md:py-24">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                <Leaf className="w-5 h-5" />
              </div>
              <span className="font-semibold text-lg hidden sm:block">WeedVision AI</span>
            </div>
            <LanguageSelector />
          </div>
          
          {/* Hero content */}
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm mb-6">
              <Sparkles className="w-4 h-4" />
              <span>{t("hero.accuracy")}</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              {t("hero.title")}
              <span className="block text-white/80 text-2xl md:text-3xl lg:text-4xl font-medium mt-3">
                {t("hero.subtitle")}
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-white/70 max-w-2xl leading-relaxed mb-10">
              {t("hero.description")}
            </p>
            
            {/* Feature pills */}
            <div className="flex flex-wrap gap-3">
              {[
                { icon: Zap, label: t("hero.realtime") },
                { icon: Shield, label: t("hero.farmReady") },
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm">
                  <feature.icon className="w-4 h-4 text-white/60" />
                  <span className="text-white/80">{feature.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Upload Section */}
          <div className="space-y-6 animate-fade-in">
            <Card className="glass border border-border/50 shadow-medium hover-lift">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl font-semibold">
                  <div className="p-2.5 bg-primary/10 rounded-xl">
                    <Upload className="h-5 w-5 text-primary" />
                  </div>
                  {t("upload.title")}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {t("upload.description")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 pt-0">
                <ImageUpload onImageSelect={handleImageSelect} />
                
                {imagePreview && (
                  <div className="space-y-5">
                    {/* Image preview with overlay */}
                    <div className="relative group rounded-xl overflow-hidden">
                      <img
                        src={imagePreview}
                        alt="Field Image Preview"
                        className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-white/90 dark:bg-black/70 backdrop-blur-sm rounded-full text-sm font-medium text-foreground">
                        <div className="w-2 h-2 bg-crop rounded-full animate-pulse" />
                        {t("upload.ready")}
                      </div>
                    </div>
                    
                    {/* Action buttons */}
                    <div className="flex gap-3">
                      <Button
                        onClick={handleProcessImage}
                        disabled={isProcessing}
                        className="flex-1 h-12 text-base font-medium shadow-soft hover:shadow-medium transition-all glow-primary"
                        size="lg"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            {t("upload.analyzing")}
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-5 w-5" />
                            {t("upload.analyze")}
                          </>
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={handleReset}
                        className="px-6 h-12 border-border/50 hover:bg-muted/50 transition-all"
                        size="lg"
                      >
                        {t("upload.reset")}
                      </Button>
                    </div>
                    
                    {/* Cold Start Warning */}
                    {isProcessing && processingTime >= 5 && (
                      <Alert className="border-warning/30 bg-warning/10">
                        <AlertCircle className="h-4 w-4 text-warning" />
                        <AlertDescription className="text-warning-foreground">
                          {t("upload.coldStartWarning", "Server is waking up... First requests may take 30-60 seconds on free hosting. Please wait!")}
                          <span className="ml-2 font-mono text-xs bg-warning/20 px-2 py-0.5 rounded">{processingTime}s</span>
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Detection Results Table */}
            {results && (
              <>
                <Card className="glass border border-border/50 shadow-medium animate-slide-up">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-lg font-semibold">
                      <div className="p-2.5 bg-crop/15 rounded-xl">
                        <Leaf className="h-5 w-5 text-crop" />
                      </div>
                      {t("results.title")}
                    </CardTitle>
                    <CardDescription>
                      {t("results.detected")} <span className="font-semibold text-foreground">{results.detections.length}</span> {t("results.instances")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <DetectionTable detections={results.detections} />
                  </CardContent>
                </Card>
                
                {/* Fertilizer Recommendations */}
                {results.fertilizers && results.fertilizers.length > 0 && (
                  <FertilizerRecommendations fertilizers={results.fertilizers} />
                )}
              </>
            )}
          </div>

          {/* Results Display Section */}
          <div className="space-y-6 animate-fade-in" style={{ animationDelay: '0.15s' }}>
            {results ? (
              <ResultsDisplay results={results} />
            ) : (
              <Card className="glass border border-border/50 shadow-soft h-full min-h-[400px] flex items-center justify-center">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="mb-8 p-8 bg-gradient-to-br from-muted/50 to-muted/30 rounded-3xl">
                    <Camera className="h-16 w-16 text-muted-foreground/60" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-3 text-foreground">{t("results.readyTitle")}</h3>
                  <p className="text-muted-foreground max-w-sm leading-relaxed">
                    {t("results.readyDescription")}
                  </p>
                  <div className="mt-8 flex flex-wrap justify-center gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-full text-sm text-muted-foreground">
                      <Leaf className="w-4 h-4" />
                      <span>{t("results.cropProtection")}</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-full text-sm text-muted-foreground">
                      <Zap className="w-4 h-4" />
                      <span>{t("results.precisionDetection")}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      
      <SupportChat />
      
      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 mt-16 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-10">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              {t("footer.developedBy")}
            </p>
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              {["Rohit Mali", "Sakshi Padalkar", "Shivam Narevekar"].map((name, i) => (
                <span 
                  key={i} 
                  className="px-4 py-2 bg-muted/50 rounded-full text-sm font-medium text-foreground border border-border/50"
                >
                  {name}
                </span>
              ))}
            </div>
            <p className="text-xs text-muted-foreground/60">
              {t("footer.tagline")}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;