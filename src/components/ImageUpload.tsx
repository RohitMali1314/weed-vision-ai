import { useEffect, useRef, useState } from "react";
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
  const [isCameraReady, setIsCameraReady] = useState(false);

  // Cleanup camera when component unmounts or stream changes
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [stream]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('[ImageUpload] handleFileSelect triggered', event.target.files);
    const file = event.target.files?.[0];
    if (file) {
      console.log('[ImageUpload] File selected:', file.name, file.type, file.size);
      if (file.type.startsWith('image/')) {
        console.log('[ImageUpload] Valid image, calling onImageSelect');
        onImageSelect(file);
        // Reset file input so same file can be selected again
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        console.error('[ImageUpload] Invalid file type:', file.type);
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive",
        });
      }
    } else {
      console.warn('[ImageUpload] No file selected');
    }
  };

  const openCamera = async () => {
    // Stop any existing streams first
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
    setIsCameraReady(false);

    // If running inside an iframe, many browsers block camera. Fallback to native capture.
    if (window.self !== window.top) {
      console.warn('[ImageUpload] Detected iframe context; falling back to file input capture.');
      fileInputRef.current?.click();
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      toast({
        title: "Camera unsupported",
        description: "Your browser doesn't support camera access.",
        variant: "destructive",
      });
      return;
    }

    try {
      let mediaStream: MediaStream;
      try {
        // Prefer back camera on mobile
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        });
      } catch (err) {
        // Fallback to any available camera
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      setStream(mediaStream);
      setIsCameraOpen(true);

      const video = videoRef.current;
      if (video) {
        video.srcObject = mediaStream;
        // iOS Safari requirements
        video.setAttribute('playsinline', 'true');
        video.muted = true;

        const markReady = (e?: Event) => {
          console.log('[ImageUpload] video event', e?.type, 'readyState', video.readyState);
          if (video.readyState >= 2) setIsCameraReady(true);
        };

        video.onloadedmetadata = () => {
          console.log('[ImageUpload] loadedmetadata');
          video.play()
            .then(() => console.log('[ImageUpload] video.play() resolved'))
            .catch((err) => console.warn('[ImageUpload] video.play() error', err));
        };
        video.onloadeddata = markReady as any;
        video.oncanplay = markReady as any;
        video.onplaying = markReady as any;

        if (video.readyState >= 2) {
          setIsCameraReady(true);
        }
      }
    } catch (error: any) {
      console.error('Error accessing camera:', error);
      let description = "Please allow camera access to capture images";
      if (error?.name === 'NotAllowedError') description = 'Camera permission denied. Enable it in your browser settings.';
      if (error?.name === 'NotFoundError') description = 'No camera found on this device.';
      if (window.isSecureContext === false) description = 'Camera requires HTTPS. Please open the app over https://';
      toast({
        title: 'Camera error',
        description,
        variant: 'destructive',
      });
    }
  };

  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraReady(false);
    setIsCameraOpen(false);
  };

  const captureImage = () => {
    if (!isCameraReady) {
      toast({
        title: "Camera not ready",
        description: "Please wait for the preview before capturing.",
      });
      return;
    }
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
        {!isCameraReady && (
          <p className="text-sm text-muted-foreground">Initializing camera...</p>
        )}
        <div className="flex gap-2">
          <Button onClick={captureImage} className="flex-1" disabled={!isCameraReady}>
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
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};