
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { User, Home, Settings } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user: authUser, signOut } = useAuth();
  const { profile, loading } = useProfile(authUser?.id);

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
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-6">
          <header className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={profile?.avatar_url || ''} alt={profile?.first_name || 'User'} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">
                  Welcome, {profile?.first_name || profile?.email?.split('@')[0] || 'User'}!
                </h1>
                <p className="text-muted-foreground">{profile?.email}</p>
              </div>
            </div>
            <Button variant="outline" onClick={signOut}>Log out</Button>
          </header>

          <Alert>
            <Home className="h-4 w-4" />
            <AlertTitle>Welcome to Kora Financial Health Platform</AlertTitle>
            <AlertDescription>
              Your financial dashboard is now ready. Complete your profile to get personalized financial insights.
            </AlertDescription>
          </Alert>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Manage your personal details</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Your account is active and secure.</p>
                <Button 
                  className="flex items-center gap-2" 
                  onClick={handleEditProfile}
                >
                  <User className="h-4 w-4" />
                  View Profile
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Getting Started</CardTitle>
                <CardDescription>Next steps for your account</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Complete your profile to get personalized recommendations.</p>
                <Button 
                  className="flex items-center gap-2" 
                  onClick={handleEditProfile}
                >
                  <Settings className="h-4 w-4" />
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
