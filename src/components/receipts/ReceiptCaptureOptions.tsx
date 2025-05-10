
import React from 'react';
import { Camera, Upload, Skeleton } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReceiptCaptureOptionsProps {
  onCameraCapture: () => void;
  onGallerySelect: () => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isCapturing: boolean;
  cameraLoading: boolean;
}

export function ReceiptCaptureOptions({
  onCameraCapture,
  onGallerySelect,
  onFileUpload,
  isCapturing,
  cameraLoading
}: ReceiptCaptureOptionsProps) {
  return (
    <div className="flex flex-col space-y-4 w-full">
      <Button 
        className="w-full h-36 border-dashed border-2 border-gray-300 flex flex-col gap-2"
        variant="outline"
        onClick={onCameraCapture}
        disabled={isCapturing || cameraLoading}
      >
        {isCapturing || cameraLoading ? (
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
        onClick={onGallerySelect}
        disabled={isCapturing || cameraLoading}
      >
        {isCapturing || cameraLoading ? (
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
                onChange={onFileUpload}
                disabled={isCapturing}
              />
            </label>
          </>
        </Button>
      </div>
    </div>
  );
}
