
import React, { useState } from 'react';
import { Camera, Upload, X, CircleCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { useCamera } from '@/hooks/useCamera';

interface ReceiptCaptureProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function ReceiptCapture({ onClose, onSuccess }: ReceiptCaptureProps) {
  const { toast } = useToast();
  const { loading: cameraLoading, takePhoto, selectPhoto, photo } = useCamera();
  const [captureState, setCaptureState] = useState<'idle' | 'capturing' | 'processing' | 'success'>('idle');
  const [processingProgress, setProcessingProgress] = useState(0);
  const [receiptImageUrl, setReceiptImageUrl] = useState<string | null>(null);

  // Handle camera capture
  const handleCameraCapture = async () => {
    setCaptureState('capturing');
    const capturedPhoto = await takePhoto();
    if (capturedPhoto) {
      setReceiptImageUrl(capturedPhoto.webPath);
    }
    setCaptureState('idle');
  };

  // Handle gallery selection
  const handleGallerySelect = async () => {
    setCaptureState('capturing');
    const selectedPhoto = await selectPhoto();
    if (selectedPhoto) {
      setReceiptImageUrl(selectedPhoto.webPath);
    }
    setCaptureState('idle');
  };

  // Handle file upload from web
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setReceiptImageUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Process the receipt (simulated)
  const processReceipt = async () => {
    setCaptureState('processing');
    
    // Simulate processing steps with progress
    const totalSteps = 5;
    for (let step = 1; step <= totalSteps; step++) {
      await new Promise(resolve => setTimeout(resolve, 600));
      setProcessingProgress((step / totalSteps) * 100);
    }
    
    // Show success state
    setCaptureState('success');
    toast({
      title: "Receipt processed successfully",
      description: "Your receipt has been digitized and added to your account.",
    });
    
    // After a delay, call the success callback
    setTimeout(() => {
      onSuccess();
    }, 1500);
  };

  return (
    <Card className="relative animate-fade-in">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Capture Receipt</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-6">
          {receiptImageUrl ? (
            <div className="relative w-full max-w-md mx-auto">
              <img 
                src={receiptImageUrl} 
                alt="Captured receipt" 
                className="w-full h-auto rounded-md border border-gray-200"
              />
              <Button 
                variant="outline" 
                size="icon" 
                className="absolute top-2 right-2 bg-white rounded-full" 
                onClick={() => setReceiptImageUrl(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex flex-col space-y-4 w-full">
              <Button 
                className="w-full h-36 border-dashed border-2 border-gray-300 flex flex-col gap-2"
                variant="outline"
                onClick={handleCameraCapture}
                disabled={captureState === 'capturing' || cameraLoading}
              >
                {captureState === 'capturing' || cameraLoading ? (
                  <Skeleton className="h-12 w-12 rounded-full" />
                ) : (
                  <>
                    <Camera className="h-8 w-8" />
                    <span>Take Photo</span>
                  </>
                )}
              </Button>
              
              <Button 
                className="w-full h-36 border-dashed border-2 border-gray-300 flex flex-col gap-2"
                variant="outline"
                onClick={handleGallerySelect}
                disabled={captureState === 'capturing' || cameraLoading}
              >
                {captureState === 'capturing' || cameraLoading ? (
                  <Skeleton className="h-12 w-12 rounded-full" />
                ) : (
                  <>
                    <Upload className="h-8 w-8" />
                    <span>Upload from Gallery</span>
                  </>
                )}
              </Button>
              
              <div className="relative w-full h-36">
                <Button 
                  className="w-full h-full border-dashed border-2 border-gray-300 flex flex-col gap-2"
                  variant="outline"
                  asChild
                >
                  <>
                    <label>
                      <Upload className="h-8 w-8" />
                      <span>Choose File</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="sr-only" 
                        onChange={handleFileUpload}
                        disabled={captureState === 'capturing'}
                      />
                    </label>
                  </>
                </Button>
              </div>
            </div>
          )}
          
          {captureState === 'processing' && (
            <div className="w-full space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Processing receipt</span>
                <span className="text-sm font-medium">{Math.round(processingProgress)}%</span>
              </div>
              <Progress value={processingProgress} className="w-full" />
            </div>
          )}
          
          {captureState === 'success' && (
            <div className="flex items-center justify-center p-4 bg-green-50 rounded-md w-full">
              <CircleCheck className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-green-800 font-medium">Receipt processed successfully!</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex justify-end w-full gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={processReceipt} 
            disabled={!receiptImageUrl || captureState === 'processing' || captureState === 'success'}
          >
            Process Receipt
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
