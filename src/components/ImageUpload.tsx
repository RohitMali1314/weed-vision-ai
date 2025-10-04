import { useRef, useState } from "react";
import { Camera, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
}

export const ImageUpload = ({ onImageSelect }: ImageUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        onImageSelect(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive",
        });
      }
    }
  };

  const openCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      
      setStream(mediaStream);
      setIsCameraOpen(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Camera access denied",
        description: "Please allow camera access to capture images",
        variant: "destructive",
      });
    }
  };

  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraOpen(false);
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'captured-image.jpg', { type: 'image/jpeg' });
            onImageSelect(file);
            closeCamera();
          }
        }, 'image/jpeg', 0.9);
      }
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        onImageSelect(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please drop an image file",
          variant: "destructive",
        });
      }
    }
  };

  if (isCameraOpen) {
    return (
      <div className="space-y-4">
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-64 object-cover rounded-lg bg-black"
          />
          <Button
            variant="outline"
            size="sm"
            className="absolute top-2 right-2"
            onClick={closeCamera}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-2">
          <Button onClick={captureImage} className="flex-1">
            <Camera className="h-4 w-4 mr-2" />
            Capture
          </Button>
          <Button variant="outline" onClick={closeCamera}>
            Cancel
          </Button>
        </div>
        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-lg font-medium mb-2">Drop your image here</p>
        <p className="text-muted-foreground mb-4">or click to browse files</p>
        <p className="text-sm text-muted-foreground">Supports JPG, PNG, WEBP</p>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="flex-1"
        >
          <Upload className="h-4 w-4 mr-2" />
          Choose File
        </Button>
        <Button variant="outline" onClick={openCamera} className="flex-1">
          <Camera className="h-4 w-4 mr-2" />
          Use Camera
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};