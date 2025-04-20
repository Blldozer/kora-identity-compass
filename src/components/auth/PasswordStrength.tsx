
import React from 'react';

interface PasswordStrengthProps {
  password: string;
}

export const PasswordStrength = ({ password }: PasswordStrengthProps) => {
  // Calculate strength value
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
    if (strength === 0) return 'weak';
    if (strength <= 20) return 'weak';
    if (strength <= 40) return 'fair';
    if (strength <= 60) return 'good';
    if (strength <= 80) return 'strong';
    return 'very strong';
  };

  const getStrengthColor = (strength: number): string => {
    if (strength <= 20) return 'text-red-500';
    if (strength <= 40) return 'text-orange-500';
    if (strength <= 60) return 'text-yellow-500';
    if (strength <= 80) return 'text-green-500';
    return 'text-green-600';
  };

  // Only show password strength if user has typed something
  if (!password || password.length === 0) return null;

  const strength = calculateStrength(password);
  const strengthText = getStrengthText(strength);
  const strengthColor = getStrengthColor(strength);

  return (
    <div>
      <p className={`font-medium mb-1 ${strengthColor}`}>
        Password strength: <span className="lowercase">{strengthText}</span>
      </p>
      <div className="text-[15px] text-muted-foreground">
        Strong passwords include: 8+ characters, uppercase &amp; lowercase letters, numbers, and special characters
      </div>
    </div>
  );
};
