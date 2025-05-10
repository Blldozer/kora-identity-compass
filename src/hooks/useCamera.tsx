
import { useState } from 'react';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { useToast } from '@/components/ui/use-toast';

export function useCamera() {
  const { toast } = useToast();
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [loading, setLoading] = useState(false);

  // Take a photo with the camera
  const takePhoto = async () => {
    try {
      setLoading(true);
      
      // Request camera permissions
      const permissionStatus = await Camera.requestPermissions();
      
      if (permissionStatus.camera === 'granted' || permissionStatus.camera === 'limited') {
        const image = await Camera.getPhoto({
          quality: 90,
          allowEditing: true,
          resultType: CameraResultType.Uri,
          source: CameraSource.Camera,
          saveToGallery: false,
        });
        
        setPhoto(image);
        return image;
      } else {
        toast({
          variant: "destructive",
          title: "Camera Permission Denied",
          description: "Please enable camera access in your device settings to use this feature.",
        });
        return null;
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      toast({
        variant: "destructive",
        title: "Failed to capture photo",
        description: "There was a problem capturing your photo. Please try again.",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Select a photo from the gallery
  const selectPhoto = async () => {
    try {
      setLoading(true);
      
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos
      });
      
      setPhoto(image);
      return image;
    } catch (error) {
      console.error('Error selecting photo:', error);
      toast({
        variant: "destructive",
        title: "Failed to select photo",
        description: "There was a problem selecting your photo. Please try again.",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Clear the current photo
  const clearPhoto = () => {
    setPhoto(null);
  };

  return {
    photo,
    loading,
    takePhoto,
    selectPhoto,
    clearPhoto
  };
}
