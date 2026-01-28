import { useState } from "react";
import { Upload, Loader2, Scan, Sparkles, Zap, Target, Shield, Leaf, ArrowRight, Play, Camera } from "lucide-react";
import { ImageUpload } from "@/components/ImageUpload";
import { ResultsDisplay } from "@/components/ResultsDisplay";
import { DetectionTable } from "@/components/DetectionTable";
import { FertilizerRecommendations } from "@/components/FertilizerRecommendations";
import { SupportChat } from "@/components/SupportChat";
import { SubscriptionPlans } from "@/components/SubscriptionPlans";
import { LanguageSelector } from "@/components/LanguageSelector";
import { FeatureCard } from "@/components/FeatureCard";
import { StatCard } from "@/components/StatCard";
import { BackendStatusBadge } from "@/components/BackendStatusBadge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
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
  const [results, setResults] = useState<PredictionResult | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [backendOnline, setBackendOnline] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  // Demo data for testing UI without backend
  const demoData: PredictionResult = {
    detections: [
      { label: "Cyperus rotundus", confidence: 94.5, fertilizer: "Glyphosate", quantity: "2-3 L/ha", frequency: "Once per season" },
      { label: "Amaranthus viridis", confidence: 89.2, fertilizer: "2,4-D Amine", quantity: "1-1.5 L/ha", frequency: "Twice per season" },
      { label: "Cynodon dactylon", confidence: 87.8, fertilizer: "Paraquat", quantity: "2-2.5 L/ha", frequency: "As needed" },
      { label: "Echinochloa colona", confidence: 82.1, fertilizer: "Pendimethalin", quantity: "3-3.5 L/ha", frequency: "Pre-emergence" },
    ],
    result_image_url: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&h=600&fit=crop",
    original_image_url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop",
    fertilizers: [
      { name: "Glyphosate", quantity: "2-3 L/ha", frequency: "Once per season", type: "Cyperus rotundus" },
      { name: "2,4-D Amine", quantity: "1-1.5 L/ha", frequency: "Twice per season", type: "Amaranthus viridis" },
      { name: "Paraquat", quantity: "2-2.5 L/ha", frequency: "As needed", type: "Cynodon dactylon" },
      { name: "Pendimethalin", quantity: "3-3.5 L/ha", frequency: "Pre-emergence", type: "Echinochloa colona" },
    ]
  };

  const handleDemoMode = () => {
    setIsDemoMode(true);
    setImagePreview(demoData.original_image_url);
    setResults(demoData);
    toast({
      title: t("toast.demoMode"),
      description: t("toast.demoDescription"),
    });
  };

  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
    setResults(null);
    setIsDemoMode(false);
    
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
      // If you're running locally, call your local Flask directly (no proxy).
      // The hosted proxy can't reach 127.0.0.1.
      const isLocalhost = ["localhost", "127.0.0.1"].includes(window.location.hostname);

      if (isLocalhost) {
        const formData = new FormData();
        formData.append("file", selectedImage);
        formData.append("image", selectedImage);

        const response = await fetch("http://127.0.0.1:5000/predict", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(`Local backend error ${response.status}: ${text.slice(0, 200)}`);
        }

        const result: PredictionResult = await response.json();
        setResults(result);

        toast({
          title: t("toast.complete"),
          description: `${t("toast.found")} ${result.detections.length} ${t("toast.detections")}`,
        });
        return;
      }

      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("Failed to read image"));
        reader.readAsDataURL(selectedImage);
      });

      // Hosted mode: call backend function proxy (JSON body) to avoid CORS/network issues.
      const { data, error } = await supabase.functions.invoke("predict-proxy", {
        body: {
          dataUrl,
          filename: selectedImage.name,
          mimeType: selectedImage.type,
        },
      });

      if (error) {
        throw new Error(`Backend error ${error.status || ""}: ${error.message}`.trim());
      }

      const result = data as PredictionResult;

      const uniqueFertilizers = Array.from(
        new Map(
          result.detections
            .filter((d) => d.fertilizer && d.quantity && d.frequency)
            .map((d) => [
              d.fertilizer,
              {
                name: d.fertilizer!,
                quantity: d.quantity!,
                frequency: d.frequency!,
                type: d.label,
              },
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
      console.error("Error processing image:", error);
      const message = error instanceof Error ? error.message : t("toast.backendError");
      toast({
        title: t("toast.failed"),
        description: message,
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
    setIsDemoMode(false);
  };

  const features = [
    { icon: Scan, title: t("features.detection"), description: t("features.detectionDesc") },
    { icon: Sparkles, title: t("features.ai"), description: t("features.aiDesc") },
    { icon: Target, title: t("features.precision"), description: t("features.precisionDesc") },
    { icon: Shield, title: t("features.protection"), description: t("features.protectionDesc") },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 grid-pattern opacity-50" />
      <div className="fixed inset-0 bg-gradient-glow" />
      
      {/* Animated orbs */}
      <div className="fixed top-1/4 -left-32 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse" />
      <div className="fixed bottom-1/4 -right-32 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      {/* Navigation */}
      <nav className="relative z-50 border-b border-border/50 glass">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center glow-primary">
                <Leaf className="w-5 h-5 text-background" />
              </div>
              <span className="text-xl font-bold text-gradient">AgriVision AI</span>
            </div>
            <div className="flex items-center gap-4">
              <BackendStatusBadge onStatusChange={(s) => setBackendOnline(s === "online")} />
              <Badge variant="outline" className="border-primary/50 text-primary hidden sm:flex">
                <Zap className="w-3 h-3 mr-1" /> YOLOv11 Powered
              </Badge>
              <LanguageSelector />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/30 hover:bg-primary/20">
              <Sparkles className="w-3 h-3 mr-1" />
              {t("hero.badge")}
            </Badge>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="text-foreground">{t("hero.title")}</span>
              <br />
              <span className="text-gradient">{t("hero.subtitle")}</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              {t("hero.description")}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button 
                size="lg" 
                className="bg-gradient-primary hover:opacity-90 text-background font-semibold px-8 glow-primary transition-all"
                onClick={() => document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                {t("hero.getStarted")} <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-primary/50 hover:bg-primary/10 text-foreground"
                onClick={handleDemoMode}
              >
                <Play className="mr-2 w-4 h-4" /> {t("hero.watchDemo")}
              </Button>
            </div>

            {/* Backend status hint */}
            {!backendOnline && (
              <p className="text-sm text-muted-foreground mb-8">
                {t("hero.serverHint") || "Backend is starting. Click the status badge to refresh."}
              </p>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <StatCard value="95" suffix="%" label={t("stats.accuracy")} />
              <StatCard value="50" suffix="+" label={t("stats.species")} />
              <StatCard value="<2" suffix="s" label={t("stats.detection")} />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-16 border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              {t("features.title")}
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              {t("features.subtitle")}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Main App Section */}
      <section id="upload-section" className="relative z-10 py-16 border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upload Section */}
            <div className="space-y-6">
              <Card className="glass border-border/50 overflow-hidden">
                <CardHeader className="border-b border-border/50 bg-secondary/30">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 rounded-lg bg-gradient-primary">
                      <Upload className="h-5 w-5 text-background" />
                    </div>
                    {t("upload.title")}
                  </CardTitle>
                  <CardDescription>
                    {t("upload.description")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  <ImageUpload onImageSelect={handleImageSelect} />
                  
                  {!imagePreview && !results && (
                    <div className="text-center pt-4 border-t border-border/50">
                      <p className="text-sm text-muted-foreground mb-3">{t("upload.orTryDemo")}</p>
                      <Button
                        variant="outline"
                        onClick={handleDemoMode}
                        className="border-primary/50 hover:bg-primary/10"
                      >
                        <Play className="w-4 h-4 mr-2" /> {t("upload.tryDemo")}
                      </Button>
                    </div>
                  )}
                  
                  {imagePreview && (
                    <div className="space-y-4">
                      <div className="relative group rounded-xl overflow-hidden border border-border/50">
                        <div className="absolute inset-0 bg-gradient-primary/20 opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-64 object-cover"
                        />
                        <Badge className="absolute top-3 left-3 z-20 bg-background/80 backdrop-blur-sm">
                          {isDemoMode ? "Demo Mode" : t("upload.ready")}
                        </Badge>
                      </div>
                      
                      {!isDemoMode ? (
                        <div className="flex gap-3">
                          <Button
                            onClick={handleProcessImage}
                            disabled={isProcessing}
                            className="flex-1 bg-gradient-primary hover:opacity-90 text-background font-semibold"
                            size="lg"
                          >
                            {isProcessing ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                {t("upload.analyzing")}
                              </>
                            ) : (
                              <>
                                <Scan className="h-4 w-4 mr-2" />
                                {t("upload.analyze")}
                              </>
                            )}
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={handleReset}
                            className="border-border hover:bg-secondary"
                            size="lg"
                          >
                            {t("upload.reset")}
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          variant="outline" 
                          onClick={handleReset}
                          className="w-full border-border hover:bg-secondary"
                          size="lg"
                        >
                          {t("upload.exitDemo")}
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {results && (
                <>
                  <Card className="glass border-border/50 overflow-hidden animate-fade-in">
                    <CardHeader className="border-b border-border/50 bg-primary/10">
                      <CardTitle className="flex items-center gap-3 text-xl">
                        <div className="p-2 rounded-lg bg-gradient-primary">
                          <Target className="h-5 w-5 text-background" />
                        </div>
                        {t("results.title")}
                      </CardTitle>
                      <CardDescription>
                        {t("results.detected")} {results.detections.length} {t("results.instances")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <DetectionTable detections={results.detections} />
                    </CardContent>
                  </Card>
                  
                  {results.fertilizers && results.fertilizers.length > 0 && (
                    <FertilizerRecommendations fertilizers={results.fertilizers} />
                  )}
                </>
              )}
            </div>

            {/* Results Section */}
            <div className="space-y-6">
              {results ? (
                <ResultsDisplay results={results} />
              ) : (
                <Card className="glass border-border/50 h-full min-h-[400px]">
                  <CardContent className="flex flex-col items-center justify-center h-full text-center p-8">
                    <div className="w-20 h-20 rounded-2xl bg-secondary/50 flex items-center justify-center mb-6">
                      <Camera className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-foreground">{t("results.readyTitle")}</h3>
                    <p className="text-muted-foreground max-w-sm leading-relaxed">
                      {t("results.readyDescription")}
                    </p>
                    <div className="flex gap-6 mt-8 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        {t("results.cropProtection")}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-accent" />
                        {t("results.precisionDetection")}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Subscription Plans Section */}
      <SubscriptionPlans />
      
      <SupportChat />
      
      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 mt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Leaf className="w-4 h-4 text-background" />
              </div>
              <span className="text-lg font-bold text-gradient">AgriVision AI</span>
            </div>
            <h3 className="text-sm font-medium text-muted-foreground mb-4">
              {t("footer.developedBy")}
            </h3>
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              <Badge variant="outline" className="border-border/50 text-foreground">
                Rohit Mali
              </Badge>
              <Badge variant="outline" className="border-border/50 text-foreground">
                Sakshi Padalkar
              </Badge>
              <Badge variant="outline" className="border-border/50 text-foreground">
                Shivam Narevekar
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {t("footer.tagline")}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
