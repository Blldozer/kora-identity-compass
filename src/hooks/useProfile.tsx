
import { useEffect, useState } from 'react';
import { fetchProfileById, updateProfileData } from '@/utils/profile';
import { uploadAvatar } from '@/utils/avatar';

// Define the Profile type directly in this file since it's not exported from integrations/supabase/types
export interface Profile {
  id: string;
  created_at?: string | null;
  updated_at?: string | null;
  email?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
}

export function useProfile(userId?: string) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchProfile(userId);
    }
  }, [userId]);

  const fetchProfile = async (id: string) => {
    try {
      const data = await fetchProfileById(id);
      if (data) {
        setProfile(data);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUploadAvatar = async (file: File): Promise<string | null> => {
    if (!userId) return null;
    return await uploadAvatar(userId, file);
  };

  const handleUpdateProfile = async (updates: Partial<Profile>) => {
    if (!userId) return null;
    const updatedProfile = await updateProfileData(userId, updates);
    if (updatedProfile) {
      setProfile(updatedProfile);
    }
    return updatedProfile;
  };

  return {
    profile,
    loading,
    updateProfile: handleUpdateProfile,
    uploadAvatar: handleUploadAvatar,
    refreshProfile: () => userId && fetchProfile(userId)
  };
}
