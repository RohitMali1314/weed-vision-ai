import { useState, useEffect } from "react";
import { Camera, Upload, Loader2, AlertCircle, Sparkles, Shield, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ImageUpload } from "@/components/ImageUpload";
import { ResultsDisplay } from "@/components/ResultsDisplay";
import { DetectionTable } from "@/components/DetectionTable";
import { FertilizerRecommendations } from "@/components/FertilizerRecommendations";
import { SupportChat } from "@/components/SupportChat";
import { LanguageSelector } from "@/components/LanguageSelector";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BackendStatus } from "@/components/BackendStatus";
import { WhatsAppShare } from "@/components/WhatsAppShare";
import { NearbyShopLocator } from "@/components/NearbyShopLocator";
import { FeedbackSection } from "@/components/FeedbackSection";
import { DashboardStats } from "@/components/DashboardStats";
import { ScanHistory } from "@/components/ScanHistory";
import { SprayManagement } from "@/components/SprayManagement";
import { supabase } from "@/integrations/supabase/client";
import { getDeviceId } from "@/lib/deviceId";

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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

const Index = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingTime, setProcessingTime] = useState(0);
  const [results, setResults] = useState<PredictionResult | null>(null);
  const [scanCount, setScanCount] = useState(0);
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
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
      const formData = new FormData();
      formData.append('file', selectedImage);
      const response = await fetch('https://weed-yolo-backend-weed-yolo-backend.hf.space/predict', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to process image');

      const result: PredictionResult = await response.json();
      
      const uniqueFertilizers = Array.from(
        new Map(
          result.detections
            .filter(d => d.fertilizer && d.quantity && d.frequency)
            .map(d => [
              d.fertilizer,
              { name: d.fertilizer!, quantity: d.quantity!, frequency: d.frequency!, type: d.label }
            ])
        ).values()
      );
      
      result.fertilizers = uniqueFertilizers;
      setResults(result);

      try {
        const avgConf = result.detections.length > 0
          ? result.detections.reduce((a, d) => a + Math.min(d.confidence, 100), 0) / result.detections.length
          : 0;
        await supabase.from("scan_history").insert({
          device_id: getDeviceId(),
          detections: result.detections as any,
          fertilizers: (result.fertilizers || []) as any,
          detection_count: result.detections.length,
          avg_confidence: Math.round(avgConf * 100) / 100,
          result_image_url: result.result_image_url,
        });
        setScanCount(prev => prev + 1);
      } catch (e) {
        console.error("Failed to save scan history:", e);
      }

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
      {/* Background effects */}
      <div className="fixed inset-0 grid-pattern opacity-30 pointer-events-none"></div>
      <div className="fixed inset-0 bg-gradient-mesh pointer-events-none"></div>
      
      {/* Floating ambient orbs */}
      <div className="fixed top-[-10%] left-[15%] w-[500px] h-[500px] bg-primary/8 rounded-full blur-[120px] animate-float pointer-events-none"></div>
      <div className="fixed bottom-[10%] right-[10%] w-[400px] h-[400px] bg-accent/6 rounded-full blur-[100px] pointer-events-none" style={{ animationDelay: '2s', animation: 'float 6s ease-in-out infinite' }}></div>

      {/* Hero Section */}
      <div className="relative border-b border-border/30">
        <div className="absolute inset-0 bg-gradient-hero"></div>
        <div className="absolute inset-0 bg-gradient-glow"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          {/* Top bar */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex justify-end items-center gap-2 pt-5 pb-2"
          >
            <BackendStatus />
            <div className="glass-subtle px-1 py-1 flex gap-1">
              <ThemeToggle />
              <LanguageSelector />
            </div>
          </motion.div>

          {/* Hero content */}
          <motion.div
            className="text-center py-16 md:py-24"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants} className="mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 glass rounded-2xl mb-6 animate-glow-pulse">
                <Camera className="w-9 h-9 text-primary" />
              </div>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-4xl md:text-7xl font-extrabold mb-6 leading-[1.1] tracking-tight"
            >
              <span className="text-foreground">{t("hero.title")}</span>
              <span className="block text-3xl md:text-5xl mt-3 text-gradient">
                {t("hero.subtitle")}
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
            >
              {t("hero.description")}
            </motion.p>

            <motion.div variants={itemVariants} className="mt-10 flex justify-center flex-wrap gap-3 md:gap-4">
              {[
                { icon: Zap, label: t("hero.realtime"), color: "text-primary" },
                { icon: Shield, label: t("hero.accuracy"), color: "text-accent" },
                { icon: Sparkles, label: t("hero.farmReady"), color: "text-wheat" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 px-5 py-2.5 glass-subtle hover-lift cursor-default"
                >
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                  <span className="text-sm font-medium text-foreground">{item.label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 md:py-16 relative z-10">
        {/* Dashboard Stats */}
        <div className="mb-10">
          <DashboardStats key={`stats-${scanCount}`} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Upload Section */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="glass border-primary/10 hover:border-primary/25 transition-all duration-500 hover:shadow-glow">
              <CardHeader className="border-b border-border/30 pb-5">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-2.5 bg-primary/15 rounded-xl border border-primary/20">
                    <Upload className="h-5 w-5 text-primary" />
                  </div>
                  {t("upload.title")}
                </CardTitle>
                <CardDescription className="text-base text-muted-foreground">
                  {t("upload.description")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-6 md:p-8">
                <ImageUpload onImageSelect={handleImageSelect} />
                
                {imagePreview && (
                  <motion.div
                    className="space-y-5"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="relative group rounded-xl overflow-hidden">
                      <div className="absolute -inset-0.5 bg-gradient-primary rounded-xl blur opacity-20 group-hover:opacity-40 transition-all duration-500"></div>
                      <img
                        src={imagePreview}
                        alt="Field Image Preview"
                        className="relative w-full h-64 md:h-72 object-cover rounded-xl border border-border/50"
                      />
                      <div className="absolute top-3 left-3 glass-subtle px-3 py-1.5 text-sm font-medium text-foreground">
                        ✓ {t("upload.ready")}
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <Button
                        onClick={handleProcessImage}
                        disabled={isProcessing}
                        className="flex-1 h-12 text-base font-semibold bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-glow hover:shadow-glow-accent transition-all duration-300"
                        size="lg"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                            {t("upload.analyzing")}
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-5 w-5 mr-2" />
                            {t("upload.analyze")}
                          </>
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={handleReset}
                        className="px-6 h-12 border-border/50 hover:bg-secondary hover:border-primary/30 transition-all duration-300"
                        size="lg"
                      >
                        {t("upload.reset")}
                      </Button>
                    </div>
                    
                    {isProcessing && processingTime >= 5 && (
                      <Alert className="border-warning/40 bg-warning/8 glass-subtle">
                        <AlertCircle className="h-4 w-4 text-warning" />
                        <AlertDescription className="text-warning-foreground">
                          {t("upload.coldStartWarning", "Server is waking up... First requests may take 30-60 seconds on free hosting. Please wait!")}
                          <span className="ml-2 font-mono text-sm">({processingTime}s)</span>
                        </AlertDescription>
                      </Alert>
                    )}
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Scan History */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
          >
            <ScanHistory key={`history-${scanCount}`} />
          </motion.div>
        </div>

        {/* Results Flow */}
        {results && (
          <motion.div
            className="mt-12 space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Detection Results Table */}
            <motion.div variants={itemVariants}>
              <Card className="glass border-accent/15 hover:border-accent/30 transition-all duration-500">
                <CardHeader className="border-b border-border/30">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2.5 bg-accent/15 rounded-xl border border-accent/20">
                      <span className="text-lg">🔍</span>
                    </div>
                    {t("results.title")}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {t("results.detected")} {results.detections.length} {t("results.instances")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 md:p-8">
                  <DetectionTable detections={results.detections} />
                </CardContent>
              </Card>
            </motion.div>

            {/* Field Analysis Results */}
            <motion.div variants={itemVariants}>
              <ResultsDisplay results={results} />
            </motion.div>
            
            {/* Fertilizer Recommendations */}
            {results.fertilizers && results.fertilizers.length > 0 && (
              <motion.div variants={itemVariants}>
                <FertilizerRecommendations fertilizers={results.fertilizers} />
              </motion.div>
            )}

            {/* Nearby Shop Locator */}
            <motion.div variants={itemVariants}>
              <NearbyShopLocator />
            </motion.div>

            {/* Spray Management */}
            <motion.div variants={itemVariants}>
              <SprayManagement />
            </motion.div>

            {/* WhatsApp Share */}
            <motion.div variants={itemVariants} className="flex justify-center">
              <WhatsAppShare detections={results.detections} />
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* Feedback Section */}
      <div className="container mx-auto px-4 py-8 relative z-10">
        <FeedbackSection />
      </div>

      {/* Ready placeholder */}
      {!results && (
        <div className="container mx-auto px-4 pb-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="glass border-border/30 max-w-2xl mx-auto hover:border-primary/20 transition-all duration-500">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-6 p-6 glass-subtle rounded-2xl animate-float">
                  <Camera className="h-14 w-14 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-foreground">{t("results.readyTitle")}</h3>
                <p className="text-muted-foreground text-lg leading-relaxed max-w-md">
                  {t("results.readyDescription")}
                </p>
                <div className="mt-8 flex justify-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2 px-4 py-2 glass-subtle">
                    <span className="text-primary">●</span>
                    <span>{t("results.cropProtection")}</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 glass-subtle">
                    <span className="text-accent">●</span>
                    <span>{t("results.precisionDetection")}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
      
      <SupportChat />
      
      {/* Footer */}
      <footer className="relative z-10 border-t border-border/30">
        <div className="absolute inset-0 bg-gradient-secondary opacity-50"></div>
        <div className="container mx-auto px-4 py-10 relative">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              {t("footer.developedBy")}
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              {["Rohit Mali", "Sakshi Padalkar", "Shivam Narevekar"].map((name) => (
                <span
                  key={name}
                  className="px-5 py-2.5 glass-subtle hover-lift text-foreground font-medium cursor-default"
                >
                  {name}
                </span>
              ))}
            </div>
            <p className="mt-5 text-sm text-muted-foreground">
              {t("footer.tagline")}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
