
import { useEffect, useState } from 'react';
import type { Profile } from '@/integrations/supabase/types';
import { uploadAvatar } from '@/utils/avatar';
import { fetchProfileById, updateProfileData } from '@/utils/profile';

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

export type { Profile };
