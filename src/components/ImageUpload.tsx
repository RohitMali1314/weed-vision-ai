import { useRef, useState, useEffect } from "react";
import { Camera, Upload, X, SwitchCamera, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
}

export const ImageUpload = ({ onImageSelect }: ImageUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  // Check if device has multiple cameras
  useEffect(() => {
    const checkCameras = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setHasMultipleCameras(videoDevices.length > 1);
      } catch (error) {
        console.log('Could not enumerate devices:', error);
      }
    };
    checkCameras();
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        onImageSelect(file);
      } else {
        toast({
          title: t("camera.invalidFile", "Invalid file type"),
          description: t("camera.selectImage", "Please select an image file"),
          variant: "destructive",
        });
      }
    }
  };

  const openCamera = async (mode: 'environment' | 'user' = facingMode) => {
    try {
      // Stop any existing stream first
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      setIsCameraReady(false);
      
      // Request high-resolution camera access
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1920, min: 1280 },
          height: { ideal: 1080, min: 720 },
          aspectRatio: { ideal: 16/9 }
        },
        audio: false,
      };
      
      let mediaStream: MediaStream;
      
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (error) {
        // Fallback to basic constraints if high-res fails
        console.log('High-res failed, trying basic constraints');
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: mode },
          audio: false,
        });
      }
      
      setStream(mediaStream);
      setFacingMode(mode);
      setIsCameraOpen(true);
      
      // Wait for next render cycle to set video source
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().then(() => {
              setIsCameraReady(true);
            }).catch(console.error);
          };
        }
      }, 100);
      
    } catch (error) {
      console.error('Error accessing camera:', error);
      
      // If camera access fails, try native file input with capture
      if (fileInputRef.current) {
        fileInputRef.current.setAttribute('capture', 'environment');
        fileInputRef.current.click();
      }
      
      toast({
        title: t("camera.accessDenied", "Camera access denied"),
        description: t("camera.allowAccess", "Please allow camera access or use file upload"),
        variant: "destructive",
      });
    }
  };

  const switchCamera = () => {
    const newMode = facingMode === 'environment' ? 'user' : 'environment';
    openCamera(newMode);
  };

  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraOpen(false);
    setIsCameraReady(false);
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current && isCameraReady) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      // Use actual video dimensions for best quality
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      if (context) {
        // If using front camera, mirror the image
        if (facingMode === 'user') {
          context.translate(canvas.width, 0);
          context.scale(-1, 1);
        }
        
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const file = new File([blob], `field-capture-${timestamp}.jpg`, { type: 'image/jpeg' });
            onImageSelect(file);
            closeCamera();
            
            toast({
              title: t("camera.captured", "Photo captured!"),
              description: t("camera.capturedDesc", "Image ready for analysis"),
            });
          }
        }, 'image/jpeg', 0.95);
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
          title: t("camera.invalidFile", "Invalid file type"),
          description: t("camera.dropImage", "Please drop an image file"),
          variant: "destructive",
        });
      }
    }
  };

  if (isCameraOpen) {
    return (
      <div className="space-y-4">
        <div className="relative bg-black rounded-xl overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-72 md:h-80 object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
          />
          
          {/* Camera loading overlay */}
          {!isCameraReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70">
              <div className="text-center text-white">
                <Camera className="h-12 w-12 mx-auto mb-2 animate-pulse" />
                <p>{t("camera.starting", "Starting camera...")}</p>
              </div>
            </div>
          )}
          
          {/* Close button */}
          <Button
            variant="outline"
            size="icon"
            className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm border-border"
            onClick={closeCamera}
          >
            <X className="h-4 w-4" />
          </Button>
          
          {/* Switch camera button */}
          {hasMultipleCameras && (
            <Button
              variant="outline"
              size="icon"
              className="absolute top-3 left-3 bg-background/80 backdrop-blur-sm border-border"
              onClick={switchCamera}
            >
              <SwitchCamera className="h-4 w-4" />
            </Button>
          )}
          
          {/* Camera mode indicator */}
          <div className="absolute bottom-3 left-3 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-full text-xs border border-border">
            {facingMode === 'environment' 
              ? t("camera.backCamera", "📷 Back Camera") 
              : t("camera.frontCamera", "🤳 Front Camera")}
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={captureImage} 
            className="flex-1 h-14 text-lg font-semibold"
            disabled={!isCameraReady}
          >
            <Camera className="h-6 w-6 mr-2" />
            {t("camera.capture", "Capture Photo")}
          </Button>
          <Button 
            variant="outline" 
            onClick={closeCamera}
            className="px-6 h-14"
          >
            {t("camera.cancel", "Cancel")}
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
        <Button variant="outline" onClick={() => openCamera()} className="flex-1">
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