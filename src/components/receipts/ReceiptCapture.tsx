
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useCamera } from '@/hooks/useCamera';
import { useReceiptProcessing } from '@/hooks/useReceiptProcessing';
import { ReceiptCaptureOptions } from './ReceiptCaptureOptions';
import { ReceiptImagePreview } from './ReceiptImagePreview';
import { ReceiptProcessingStatus } from './ReceiptProcessingStatus';

interface ReceiptCaptureProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function ReceiptCapture({ onClose, onSuccess }: ReceiptCaptureProps) {
  const { loading: cameraLoading, takePhoto, selectPhoto } = useCamera();
  const { 
    processingState: captureState, 
    processingProgress, 
    startCapturing, 
    finishCapturing, 
    processReceipt 
  } = useReceiptProcessing(onSuccess);
  
  const [receiptImageUrl, setReceiptImageUrl] = useState<string | null>(null);

  // Handle camera capture
  const handleCameraCapture = async () => {
    startCapturing();
    const capturedPhoto = await takePhoto();
    if (capturedPhoto) {
      setReceiptImageUrl(capturedPhoto.webPath);
    }
    finishCapturing();
  };

  // Handle gallery selection
  const handleGallerySelect = async () => {
    startCapturing();
    const selectedPhoto = await selectPhoto();
    if (selectedPhoto) {
      setReceiptImageUrl(selectedPhoto.webPath);
    }
    finishCapturing();
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
            <ReceiptImagePreview 
              imageUrl={receiptImageUrl} 
              onClear={() => setReceiptImageUrl(null)} 
            />
          ) : (
            <ReceiptCaptureOptions 
              onCameraCapture={handleCameraCapture}
              onGallerySelect={handleGallerySelect}
              onFileUpload={handleFileUpload}
              isCapturing={captureState === 'capturing'}
              cameraLoading={cameraLoading}
            />
          )}
          
          <ReceiptProcessingStatus
            status={captureState}
            progress={processingProgress}
          />
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
