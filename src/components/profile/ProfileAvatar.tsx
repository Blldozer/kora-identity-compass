
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload } from 'lucide-react';

interface ProfileAvatarProps {
  avatarUrl: string;
  getInitials: () => string;
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  uploading: boolean;
}

export const ProfileAvatar = ({
  avatarUrl,
  getInitials,
  onUpload,
  uploading
}: ProfileAvatarProps) => {
  return (
    <div className="flex flex-col items-center mb-8">
      <div className="relative group">
        <Avatar className="h-24 w-24 cursor-pointer">
          <AvatarImage src={avatarUrl} alt="Profile" />
          <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
            {getInitials()}
          </AvatarFallback>
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <Upload className="h-6 w-6 text-white" />
          </div>
        </Avatar>
        <input 
          type="file"
          accept="image/*"
          onChange={onUpload}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />
      </div>
      {uploading && (
        <p className="mt-2 text-sm text-muted-foreground">Uploading...</p>
      )}
      <p className="mt-2 text-sm text-muted-foreground">Click to upload a new avatar</p>
    </div>
  );
};
