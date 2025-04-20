
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { User, Home, Settings, LogOut } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Skeleton } from '@/components/ui/skeleton';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user: authUser, signOut } = useAuth();
  const { profile, loading } = useProfile(authUser?.id);
  const isMobile = useIsMobile();

  const getInitials = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();
    } else if (profile?.email) {
      return profile.email[0].toUpperCase();
    }
    return '?';
  };

  const handleEditProfile = () => {
    navigate('/profile');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col gap-4">
          <header className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-3">
              {loading ? (
                <>
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div>
                    <Skeleton className="h-6 w-32 mb-1" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                </>
              ) : (
                <>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={profile?.avatar_url || ''} alt={profile?.first_name || 'User'} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="text-xl font-semibold">
                      {profile?.first_name || profile?.email?.split('@')[0] || 'User'}
                    </h1>
                    <p className="text-sm text-muted-foreground truncate max-w-[200px]">{profile?.email}</p>
                  </div>
                </>
              )}
            </div>
            <Button 
              variant="outline" 
              size="icon"
              onClick={signOut}
              className="h-10 w-10"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </header>

          <Alert>
            <Home className="h-4 w-4" />
            <AlertTitle>Welcome to Kora</AlertTitle>
            <AlertDescription>
              Your financial dashboard is ready. Complete your profile to get personalized insights.
            </AlertDescription>
          </Alert>

          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Account Information</CardTitle>
                <CardDescription>Manage your personal details</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm">Your account is active and secure.</p>
                <Button 
                  className="w-full justify-center h-12 text-base"
                  onClick={handleEditProfile}
                >
                  <User className="h-5 w-5 mr-2" />
                  View Profile
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Getting Started</CardTitle>
                <CardDescription>Next steps for your account</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm">Complete your profile to get personalized recommendations.</p>
                <Button 
                  className="w-full justify-center h-12 text-base"
                  onClick={handleEditProfile}
                >
                  <Settings className="h-5 w-5 mr-2" />
                  Complete Profile
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
