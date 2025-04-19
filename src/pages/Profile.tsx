
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { Home } from 'lucide-react';
import { ProfileAvatar } from '@/components/profile/ProfileAvatar';
import { ProfileForm } from '@/components/profile/ProfileForm';

const Profile = () => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const { profile, loading, updateProfile, uploadAvatar } = useProfile(authUser?.id);
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setPhoneNumber(profile.phone || '');
      setAvatarUrl(profile.avatar_url || '');
    }
  }, [profile]);

  const getInitials = () => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    } else if (profile?.email) {
      return profile.email[0].toUpperCase();
    }
    return '?';
  };

  const handleUploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const url = await uploadAvatar(file);
      
      if (url) {
        setAvatarUrl(url);
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Upload Error",
        description: error instanceof Error ? error.message : "An error occurred during upload",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    
    try {
      const updatedProfile = await updateProfile({
        first_name: firstName,
        last_name: lastName,
        phone: phoneNumber,
        avatar_url: avatarUrl
      });
      
      if (updatedProfile) {
        toast({
          title: "Success",
          description: "Profile updated successfully"
        });
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading profile...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <Button 
          variant="outline" 
          className="mb-6 flex items-center gap-2"
          onClick={() => navigate('/dashboard')}
        >
          <Home className="h-4 w-4" />
          Back to Dashboard
        </Button>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Profile Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileAvatar 
              avatarUrl={avatarUrl}
              getInitials={getInitials}
              onUpload={handleUploadAvatar}
              uploading={uploading}
            />
            
            <ProfileForm 
              email={profile?.email || ''}
              firstName={firstName}
              lastName={lastName}
              phoneNumber={phoneNumber}
              onFirstNameChange={setFirstName}
              onLastNameChange={setLastName}
              onPhoneChange={setPhoneNumber}
              onSave={handleSaveProfile}
              saving={saving}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
