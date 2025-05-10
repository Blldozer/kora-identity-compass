
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

export function useReceiptProcessing(onSuccess: () => void) {
  const { toast } = useToast();
  const [processingState, setProcessingState] = useState<'idle' | 'capturing' | 'processing' | 'success'>('idle');
  const [processingProgress, setProcessingProgress] = useState(0);

  const startCapturing = () => {
    setProcessingState('capturing');
  };

  const finishCapturing = () => {
    setProcessingState('idle');
  };

  const processReceipt = async () => {
    setProcessingState('processing');
    
    // Simulate processing steps with progress
    const totalSteps = 5;
    for (let step = 1; step <= totalSteps; step++) {
      await new Promise(resolve => setTimeout(resolve, 600));
      setProcessingProgress((step / totalSteps) * 100);
    }
    
    // Show success state
    setProcessingState('success');
    toast({
      title: "Receipt processed successfully",
      description: "Your receipt has been digitized and added to your account.",
    });
    
    // After a delay, call the success callback
    setTimeout(() => {
      onSuccess();
    }, 1500);
  };

  return {
    processingState,
    processingProgress,
    startCapturing,
    finishCapturing,
    processReceipt
  };
}
