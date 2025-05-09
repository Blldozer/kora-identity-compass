
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Key } from 'lucide-react';

interface AuthPasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  onForgotPassword?: () => void;
}

export const AuthPasswordInput = ({ 
  value, 
  onChange, 
  disabled, 
  onForgotPassword 
}: AuthPasswordInputProps) => {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <div>
      <div className="flex justify-between items-center">
        <Label htmlFor="password" className="text-base">Password</Label>
        {onForgotPassword && (
          <Button 
            variant="link" 
            className="p-0 h-auto text-base"
            onClick={(e) => {
              e.preventDefault();
              onForgotPassword();
            }}
            disabled={disabled}
          >
            Forgot Password?
          </Button>
        )}
      </div>
      <div className="relative flex items-center">
        {!value && (
          <div className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none">
            <Key className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
        <Input 
          type={showPassword ? "text" : "password"} 
          id="password"
          className={`p-3 text-base h-12 placeholder-shifted input-left-cursor ${value ? 'pl-4' : 'pl-10'} pr-12`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required 
          placeholder="Enter your password"
          disabled={disabled}
          autoComplete="current-password"
        />
        <button
          type="button"
          className="absolute right-3 text-muted-foreground"
          onClick={() => setShowPassword(!showPassword)}
          disabled={disabled}
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
};
