
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { User, Mail, Phone, Save } from 'lucide-react';

interface ProfileFormProps {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onSave: () => void;
  saving: boolean;
}

export const ProfileForm = ({
  email,
  firstName,
  lastName,
  phoneNumber,
  onFirstNameChange,
  onLastNameChange,
  onPhoneChange,
  onSave,
  saving
}: ProfileFormProps) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="firstName">First Name</Label>
          </div>
          <Input
            id="firstName"
            value={firstName}
            onChange={(e) => onFirstNameChange(e.target.value)}
            placeholder="Enter your first name"
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="lastName">Last Name</Label>
          </div>
          <Input
            id="lastName"
            value={lastName}
            onChange={(e) => onLastNameChange(e.target.value)}
            placeholder="Enter your last name"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <Label htmlFor="email">Email</Label>
        </div>
        <Input
          id="email"
          value={email}
          disabled
          className="bg-gray-100"
        />
        <p className="text-xs text-muted-foreground">You cannot change your email address</p>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <Label htmlFor="phone">Phone Number</Label>
        </div>
        <Input
          id="phone"
          value={phoneNumber}
          onChange={(e) => onPhoneChange(e.target.value)}
          placeholder="Enter your phone number"
        />
      </div>
      
      <Button 
        className="w-full flex items-center gap-2 justify-center" 
        onClick={onSave}
        disabled={saving}
      >
        <Save className="h-4 w-4" />
        {saving ? 'Saving...' : 'Save Profile'}
      </Button>
    </div>
  );
};
