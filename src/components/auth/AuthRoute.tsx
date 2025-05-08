
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface AuthRouteProps {
  children: React.ReactNode;
}

export const AuthRoute = ({ children }: AuthRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-2 w-24 bg-gradient-to-r from-orange-500 to-blue-600 rounded mb-3"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, check if they need to complete profile setup
  if (user) {
    // In a real app, you'd check if profile is complete
    // Since we can't easily do that here, we'll redirect to dashboard
    console.log("User is authenticated, redirecting from auth route");
    
    // Get the intended destination if it exists, or use dashboard as default
    const from = location.state?.from?.pathname || "/dashboard";
    return <Navigate to={from} replace />;
  }

  // User is not authenticated, allow access to auth pages
  return <>{children}</>;
};
