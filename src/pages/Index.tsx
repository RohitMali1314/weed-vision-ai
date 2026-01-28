import { useState } from "react";
import { Camera, Upload, Loader2 } from "lucide-react";
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
  const [results, setResults] = useState<PredictionResult | null>(null);
  const { toast } = useToast();
  const { t } = useTranslation();

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
    <div className="min-h-screen bg-gradient-field relative overflow-hidden farm-texture">
      {/* Agricultural pattern overlay with animated elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000' fill-opacity='0.08' fill-rule='evenodd'%3E%3Cpath d='M30 10c-2 0-4 1-5 3l-5 10c-1 2-1 4 0 6l5 10c1 2 3 3 5 3s4-1 5-3l5-10c1-2 1-4 0-6l-5-10c-1-2-3-3-5-3z'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }} />
      </div>
      
      {/* Floating decorative farm elements */}
      <div className="absolute top-20 left-10 w-16 h-16 opacity-10 animate-float">
        <span className="text-6xl">🌾</span>
      </div>
      <div className="absolute top-40 right-20 w-16 h-16 opacity-10 animate-float" style={{ animationDelay: '1s' }}>
        <span className="text-6xl">🚜</span>
      </div>
      <div className="absolute bottom-40 left-1/4 w-16 h-16 opacity-10 animate-float" style={{ animationDelay: '2s' }}>
        <span className="text-6xl">🌻</span>
      </div>

      {/* Hero Section with farm-inspired design */}
      <div className="relative bg-gradient-primary text-primary-foreground py-20 shadow-crop">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex justify-end mb-4">
            <LanguageSelector />
          </div>
          <div className="text-center">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4 backdrop-blur-sm">
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L13.09 7.91L19 9L13.09 10.09L12 16L10.91 10.09L5 9L10.91 7.91L12 2Z" opacity="0.7"/>
                <path d="M19 15L20.09 20.91L26 22L20.09 23.09L19 29L17.91 23.09L12 22L17.91 20.91L19 15Z" opacity="0.5"/>
                <path d="M7 8L8.09 13.91L14 15L8.09 16.09L7 22L5.91 16.09L0 15L5.91 13.91L7 8Z" opacity="0.3"/>
              </svg>
            </div>
          </div>
            <h1 className="text-4xl md:text-7xl font-bold mb-6 leading-tight">
              🌾 {t("hero.title")}
              <span className="block text-3xl md:text-5xl mt-2 opacity-90">{t("hero.subtitle")}</span>
            </h1>
            <p className="text-xl md:text-2xl opacity-90 max-w-4xl mx-auto leading-relaxed">
              {t("hero.description")}
            </p>
            <div className="mt-8 flex justify-center space-x-8 text-sm opacity-80">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-accent rounded-full"></div>
                <span>{t("hero.realtime")}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-wheat rounded-full"></div>
                <span>{t("hero.accuracy")}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-crop rounded-full"></div>
                <span>{t("hero.farmReady")}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative farm elements */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Upload Section with agricultural styling */}
          <div className="space-y-8 animate-slide-up">
            <Card className="shadow-crop border-2 border-primary/20 bg-card/80 backdrop-blur-sm hover:shadow-strong transition-shadow duration-300">
              <CardHeader className="bg-gradient-earth/10 border-b border-soil/20">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Upload className="h-6 w-6 text-primary" />
                  </div>
                  {t("upload.title")}
                </CardTitle>
                <CardDescription className="text-base">
                  {t("upload.description")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-8">
                <ImageUpload onImageSelect={handleImageSelect} />
                
                {imagePreview && (
                  <div className="space-y-6">
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-primary/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                      <img
                        src={imagePreview}
                        alt="Field Image Preview"
                        className="relative w-full h-72 object-cover rounded-xl border-2 border-primary/30 shadow-medium"
                      />
                      <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                        📸 {t("upload.ready")}
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <Button
                        onClick={handleProcessImage}
                        disabled={isProcessing}
                        className="flex-1 h-12 text-base font-semibold bg-primary hover:bg-primary/90 shadow-crop"
                        size="lg"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                            🔍 {t("upload.analyzing")}
                          </>
                        ) : (
                          <>
                            🧠 {t("upload.analyze")}
                          </>
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={handleReset}
                        className="px-8 h-12 border-2 border-primary/30 hover:bg-primary/10"
                        size="lg"
                      >
                        🔄 {t("upload.reset")}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Detection Results Table with farm theme */}
            {results && (
              <>
                <Card className="shadow-crop border-2 border-accent/30 bg-card/90 backdrop-blur-sm hover:shadow-strong transition-all duration-300 animate-grow">
                  <CardHeader className="bg-gradient-to-r from-accent/10 to-crop/10 border-b border-accent/20">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="p-2 bg-accent/20 rounded-lg">
                        <span className="text-xl">🌱</span>
                      </div>
                      {t("results.title")}
                    </CardTitle>
                    <CardDescription className="text-base">
                      🎯 {t("results.detected")} {results.detections.length} {t("results.instances")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-8">
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

          {/* Results Section with agricultural design */}
          <div className="space-y-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            {results ? (
              <ResultsDisplay results={results} />
            ) : (
              <Card className="shadow-medium border-2 border-muted bg-card/70 backdrop-blur-sm">
                <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="mb-6 p-6 bg-gradient-earth/20 rounded-2xl">
                    <Camera className="h-20 w-20 text-soil" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-foreground">🚜 {t("results.readyTitle")}</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed max-w-md">
                    {t("results.readyDescription")}
                  </p>
                  <div className="mt-8 flex justify-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🌾</span>
                      <span>{t("results.cropProtection")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🎯</span>
                      <span>{t("results.precisionDetection")}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      
      <SupportChat />
      
      {/* Team Credits Footer */}
      <footer className="relative z-10 bg-gradient-earth/20 border-t-2 border-primary/20 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-foreground mb-3">
              {t("footer.developedBy")}
            </h3>
            <div className="flex flex-wrap justify-center gap-4 text-muted-foreground">
              <span className="px-4 py-2 bg-card rounded-lg border border-primary/20 shadow-soft">
                👨‍💻 Rohit Mali
              </span>
              <span className="px-4 py-2 bg-card rounded-lg border border-primary/20 shadow-soft">
                👩‍💻 Sakshi Padalkar
              </span>
              <span className="px-4 py-2 bg-card rounded-lg border border-primary/20 shadow-soft">
                👨‍💻 Shivam Narevekar
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