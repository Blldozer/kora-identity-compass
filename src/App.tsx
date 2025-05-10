
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthRoute } from "./components/auth/AuthRoute";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword";
import ProfileSetup from "./pages/Auth/ProfileSetup";
import Dashboard from "./pages/Dashboard";
import Finances from "./pages/Finances";
import Profile from "./pages/Profile";
import Unauthorized from "./pages/Unauthorized";
import RolesAndPermissions from "./pages/Admin/RolesAndPermissions";
import Callback from "./pages/Auth/Callback";
import { useEffect } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => {
  // Set meta viewport for better mobile experience
  useEffect(() => {
    // Ensure proper scaling on iOS devices
    const metaViewport = document.querySelector('meta[name=viewport]');
    if (metaViewport) {
      metaViewport.setAttribute('content', 
        'width=device-width, initial-scale=1.0, maximum-scale=1.0, viewport-fit=cover, user-scalable=no');
    }
    
    // Apply safe-area padding to body for notched devices
    document.body.classList.add('kora-mobile-bottom-padding');
    
    return () => {
      document.body.classList.remove('kora-mobile-bottom-padding');
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="kora-page-container">
            <Routes>
              <Route path="/" element={<Index />} />
              
              {/* Auth Routes - Available to non-authenticated users */}
              <Route 
                path="/login" 
                element={
                  <AuthRoute>
                    <Login />
                  </AuthRoute>
                } 
              />
              <Route 
                path="/register" 
                element={
                  <AuthRoute>
                    <Register />
                  </AuthRoute>
                } 
              />
              <Route 
                path="/auth/forgot-password" 
                element={
                  <AuthRoute>
                    <ForgotPassword />
                  </AuthRoute>
                } 
              />
              <Route 
                path="/auth/reset-password" 
                element={
                  <AuthRoute>
                    <ResetPassword />
                  </AuthRoute>
                } 
              />
              <Route 
                path="/auth/callback" 
                element={<Callback />} 
              />
              
              {/* Profile Setup - Available to authenticated users without RBAC checks */}
              <Route 
                path="/profile-setup" 
                element={
                  <ProtectedRoute skipRbacCheck={true}>
                    <ProfileSetup />
                  </ProtectedRoute>
                } 
              />
              
              {/* Protected Routes with Permission Checks */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/finances" 
                element={
                  <ProtectedRoute>
                    <Finances />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/roles-and-permissions" 
                element={
                  <ProtectedRoute requiredPermission="roles:manage">
                    <RolesAndPermissions />
                  </ProtectedRoute>
                } 
              />
              
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
