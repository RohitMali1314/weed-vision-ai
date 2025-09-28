import { useState } from "react";
import { Camera, Upload, Loader2 } from "lucide-react";
import { ImageUpload } from "@/components/ImageUpload";
import { ResultsDisplay } from "@/components/ResultsDisplay";
import { DetectionTable } from "@/components/DetectionTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export interface Detection {
  label: string;
  confidence: number;
  bbox: [number, number, number, number];
}

export interface PredictionResult {
  detections: Detection[];
  result_image_url: string;
  original_image_url: string;
}

const Index = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<PredictionResult | null>(null);
  const { toast } = useToast();

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
        title: "No image selected",
        description: "Please select an image first",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      formData.append('image', selectedImage);

      // Replace with your Flask backend URL
      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process image');
      }

      const result: PredictionResult = await response.json();
      setResults(result);
      
      toast({
        title: "Analysis complete!",
        description: `Found ${result.detections.length} detections`,
      });
    } catch (error) {
      console.error('Error processing image:', error);
      toast({
        title: "Processing failed",
        description: "Failed to process image. Make sure your Flask backend is running.",
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
    <div className="min-h-screen bg-gradient-field relative overflow-hidden">
      {/* Agricultural pattern overlay */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000' fill-opacity='0.1' fill-rule='evenodd'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Hero Section with farm-inspired design */}
      <div className="relative bg-gradient-primary text-primary-foreground py-20 shadow-crop">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
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
            🌾 Weed Detection
            <span className="block text-3xl md:text-5xl mt-2 opacity-90">using Deep Learning</span>
          </h1>
          <p className="text-xl md:text-2xl opacity-90 max-w-4xl mx-auto leading-relaxed">
            Advanced AI-powered precision agriculture • Protect your crops with YOLOv11 technology
          </p>
          <div className="mt-8 flex justify-center space-x-8 text-sm opacity-80">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-accent rounded-full"></div>
              <span>Real-time Detection</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-wheat rounded-full"></div>
              <span>High Accuracy</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-crop rounded-full"></div>
              <span>Farm-Ready</span>
            </div>
          </div>
        </div>
        
        {/* Decorative farm elements */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Upload Section with agricultural styling */}
          <div className="space-y-8">
            <Card className="shadow-crop border-2 border-primary/20 bg-card/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-earth/10 border-b border-soil/20">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Upload className="h-6 w-6 text-primary" />
                  </div>
                  Field Image Upload
                </CardTitle>
                <CardDescription className="text-base">
                  Upload a crop field image or capture directly from your device camera
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
                        📸 Ready for Analysis
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
                            🔍 Analyzing Crop Field...
                          </>
                        ) : (
                          <>
                            🧠 Analyze Field Image
                          </>
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={handleReset}
                        className="px-8 h-12 border-2 border-primary/30 hover:bg-primary/10"
                        size="lg"
                      >
                        🔄 Reset
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Detection Results Table with farm theme */}
            {results && (
              <Card className="shadow-crop border-2 border-accent/30 bg-card/90 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-accent/10 to-crop/10 border-b border-accent/20">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 bg-accent/20 rounded-lg">
                      <span className="text-xl">🌱</span>
                    </div>
                    Field Analysis Results
                  </CardTitle>
                  <CardDescription className="text-base">
                    🎯 Detected {results.detections.length} weed instances in your crop field
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  <DetectionTable detections={results.detections} />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Results Section with agricultural design */}
          <div className="space-y-8">
            {results ? (
              <ResultsDisplay results={results} />
            ) : (
              <Card className="shadow-medium border-2 border-muted bg-card/70 backdrop-blur-sm">
                <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="mb-6 p-6 bg-gradient-earth/20 rounded-2xl">
                    <Camera className="h-20 w-20 text-soil" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-foreground">🚜 Ready for Field Analysis</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed max-w-md">
                    Upload your crop field image to detect weeds and protect your harvest with AI precision
                  </p>
                  <div className="mt-8 flex justify-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🌾</span>
                      <span>Crop Protection</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🎯</span>
                      <span>Precision Detection</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;