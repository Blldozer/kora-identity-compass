
import React from 'react';
import { Separator } from "@/components/ui/separator";

export const LoginSeparator = () => {
  return (
    <div className="relative my-6">
      <Separator />
      <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-gray-500 text-sm">
        Or continue with
      </span>
    </div>
  );
};
