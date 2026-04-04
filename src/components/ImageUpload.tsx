import { useRef, useState, useEffect } from "react";
import { Camera, Upload, X, SwitchCamera } from "lucide-react";
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
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

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
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      setIsCameraReady(false);
      
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
      } catch {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: mode },
          audio: false,
        });
      }
      
      setStream(mediaStream);
      setFacingMode(mode);
      setIsCameraOpen(true);
      
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

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      if (context) {
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
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
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
        <div className="relative rounded-xl overflow-hidden glass">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-72 md:h-80 object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
          />
          
          {!isCameraReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
              <div className="text-center text-foreground">
                <Camera className="h-12 w-12 mx-auto mb-2 animate-pulse text-primary" />
                <p className="text-sm">{t("camera.starting", "Starting camera...")}</p>
              </div>
            </div>
          )}
          
          <Button
            variant="outline"
            size="icon"
            className="absolute top-3 right-3 glass-subtle"
            onClick={closeCamera}
          >
            <X className="h-4 w-4" />
          </Button>
          
          {hasMultipleCameras && (
            <Button
              variant="outline"
              size="icon"
              className="absolute top-3 left-3 glass-subtle"
              onClick={switchCamera}
            >
              <SwitchCamera className="h-4 w-4" />
            </Button>
          )}
          
          <div className="absolute bottom-3 left-3 glass-subtle px-3 py-1.5 text-xs font-medium">
            {facingMode === 'environment' 
              ? t("camera.backCamera", "📷 Back Camera") 
              : t("camera.frontCamera", "🤳 Front Camera")}
          </div>
        </div>
        
        <div className="flex gap-3">
          <Button 
            onClick={captureImage} 
            className="flex-1 h-14 text-lg font-semibold bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-glow"
            disabled={!isCameraReady}
          >
            <Camera className="h-6 w-6 mr-2" />
            {t("camera.capture", "Capture Photo")}
          </Button>
          <Button 
            variant="outline" 
            onClick={closeCamera}
            className="px-6 h-14 border-border/50"
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
        className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 cursor-pointer group ${
          isDragging 
            ? "border-primary bg-primary/5 scale-[1.02]" 
            : "border-border/50 hover:border-primary/40 hover:bg-primary/3"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-4 group-hover:scale-110 group-hover:bg-primary/15 transition-all duration-300">
          <Upload className="h-7 w-7 text-primary" />
        </div>
        <p className="text-lg font-semibold mb-1 text-foreground">Drop your image here</p>
        <p className="text-muted-foreground mb-3">or click to browse files</p>
        <p className="text-xs text-muted-foreground/70">Supports JPG, PNG, WEBP</p>
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 h-11 border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300"
        >
          <Upload className="h-4 w-4 mr-2" />
          Choose File
        </Button>
        <Button 
          variant="outline" 
          onClick={() => openCamera()} 
          className="flex-1 h-11 border-border/50 hover:border-accent/30 hover:bg-accent/5 transition-all duration-300"
        >
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
