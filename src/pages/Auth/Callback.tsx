
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const Callback = () => {
  const [message, setMessage] = useState<string>("Processing authentication...");
  const navigate = useNavigate();

  useEffect(() => {
    // Extract the hash parameters from the URL
    const hashParams = window.location.hash.substring(1).split('&').reduce((acc, param) => {
      const [key, value] = param.split('=');
      if (key && value) acc[key] = decodeURIComponent(value);
      return acc;
    }, {} as Record<string, string>);

    // Extract error information from URL if present
    const error = hashParams.error;
    const errorDescription = hashParams.error_description;

    if (error) {
      setMessage(`Authentication error: ${errorDescription || error}`);
      setTimeout(() => navigate('/login'), 3000);
      return;
    }

    const handleAuthRedirect = async () => {
      try {
        // Let Supabase handle the authentication callback
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (data?.session) {
          // Successfully authenticated
          setMessage("Authentication successful! Redirecting...");
          navigate('/dashboard');
        } else {
          // No session found
          setMessage("No active session found. Redirecting to login...");
          setTimeout(() => navigate('/login'), 2000);
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        setMessage("Authentication failed. Redirecting to login...");
        setTimeout(() => navigate('/login'), 2000);
      }
    };

    handleAuthRedirect();
  }, [navigate]);

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-4">Authentication</h2>
        <p className="text-gray-600 mb-4">{message}</p>
        <div className="animate-pulse flex justify-center">
          <div className="h-2 w-24 bg-gradient-to-r from-orange-500 to-blue-600 rounded"></div>
        </div>
      </div>
    </div>
  );
};

export default Callback;
