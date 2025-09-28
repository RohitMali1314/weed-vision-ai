import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PredictionResult } from "@/pages/Index";
import { useToast } from "@/hooks/use-toast";

interface ResultsDisplayProps {
  results: PredictionResult;
}

export const ResultsDisplay = ({ results }: ResultsDisplayProps) => {
  const { toast } = useToast();

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
        title: "Download started",
        description: "The processed image is being downloaded",
      });
    } catch (error) {
      console.error('Error downloading image:', error);
      toast({
        title: "Download failed",
        description: "Failed to download the processed image",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="shadow-medium">
      <CardHeader>
        <CardTitle>Analysis Results</CardTitle>
        <CardDescription>
          Processed image with detected weeds and bounding boxes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Before and After Images */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">Original Image</h4>
            <div className="relative">
              <img
                src={results.original_image_url}
                alt="Original"
                className="w-full h-48 object-cover rounded-lg border"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">Processed Image</h4>
            <div className="relative">
              <img
                src={results.result_image_url}
                alt="Processed"
                className="w-full h-48 object-cover rounded-lg border"
              />
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-secondary/50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {results.detections.length}
            </div>
            <div className="text-sm text-muted-foreground">Total Detections</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {results.detections.length > 0 
                ? Math.round(results.detections.reduce((acc, det) => acc + det.confidence, 0) / results.detections.length)
                : 0}%
            </div>
            <div className="text-sm text-muted-foreground">Avg. Confidence</div>
          </div>
        </div>

        {/* Download Button */}
        <Button onClick={handleDownload} className="w-full">
          <Download className="h-4 w-4 mr-2" />
          Download Processed Image
        </Button>
      </CardContent>
    </Card>
  );
};