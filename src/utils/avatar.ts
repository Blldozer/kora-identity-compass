
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export async function uploadAvatar(userId: string, file: File): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}-${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);
      
    if (uploadError) throw uploadError;
    
    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);
      
    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading avatar:', error);
    toast({
      title: "Error",
      description: "Failed to upload avatar",
      variant: "destructive"
    });
    return null;
  }
}
