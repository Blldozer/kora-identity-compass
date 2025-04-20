
import React from 'react';

interface PasswordStrengthProps {
  password: string;
}

export const PasswordStrength = ({ password }: PasswordStrengthProps) => {
  const calculateStrength = (password: string): number => {
    let strength = 0;
    
    if (password.length >= 8) strength += 20;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[a-z]/.test(password)) strength += 20;
    if (/[0-9]/.test(password)) strength += 20;
    if (/[^A-Za-z0-9]/.test(password)) strength += 20;
    
    return strength;
  };

  const getStrengthText = (strength: number): string => {
    if (strength === 0) return 'Very Weak';
    if (strength <= 20) return 'Weak';
    if (strength <= 40) return 'Fair';
    if (strength <= 60) return 'Good';
    if (strength <= 80) return 'Strong';
    return 'Very Strong';
  };

  const getStrengthColor = (strength: number): string => {
    if (strength <= 20) return 'text-red-500';
    if (strength <= 40) return 'text-orange-500';
    if (strength <= 60) return 'text-yellow-500';
    if (strength <= 80) return 'text-green-400';
    return 'text-green-500';
  };

  const strength = calculateStrength(password);

  return (
    <div className="space-y-2">
      <p className={`text-sm font-medium ${getStrengthColor(strength)}`}>
        Password Strength: {getStrengthText(strength)}
      </p>
      <ul className="text-sm text-muted-foreground list-disc pl-4 space-y-1">
        <li className={password.length >= 8 ? 'text-green-500' : ''}>At least 8 characters</li>
        <li className={/[A-Z]/.test(password) ? 'text-green-500' : ''}>One uppercase letter</li>
        <li className={/[a-z]/.test(password) ? 'text-green-500' : ''}>One lowercase letter</li>
        <li className={/[0-9]/.test(password) ? 'text-green-500' : ''}>One number</li>
        <li className={/[^A-Za-z0-9]/.test(password) ? 'text-green-500' : ''}>One special character</li>
      </ul>
    </div>
  );
};

