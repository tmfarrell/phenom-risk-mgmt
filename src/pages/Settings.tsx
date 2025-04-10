
import React, { useState, useEffect, useContext } from 'react';
import { Header } from '@/components/Header';
import { AuthContext } from '@/App';
import { Navigate, useNavigate } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

type AppVersion = 'patient' | 'safety' | 'cohort';

export const Settings = () => {
  const { isAdmin } = useContext(AuthContext);
  const [selectedVersion, setSelectedVersion] = useState<AppVersion>('patient');
  const { toast } = useToast();
  const navigate = useNavigate();

  // Load saved preference from localStorage on component mount
  useEffect(() => {
    const savedVersion = localStorage.getItem('appVersion') as AppVersion | null;
    if (savedVersion) {
      setSelectedVersion(savedVersion);
    }
  }, []);

  // If not admin, redirect to homepage
  if (!isAdmin) {
    return <Navigate to="/" />;
  }

  const handleVersionChange = (value: AppVersion) => {
    setSelectedVersion(value);
    localStorage.setItem('appVersion', value);
    
    toast({
      title: "Settings updated",
      description: `App version set to: ${getVersionDisplayName(value)}`,
      duration: 3000,
    });
  };

  const getVersionDisplayName = (version: AppVersion): string => {
    switch (version) {
      case 'patient':
        return 'Patient Risk Panel';
      case 'safety':
        return 'Safety Risk Panel';
      case 'cohort':
        return 'Cohort Risk Panel';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container max-w-4xl mx-auto py-8 px-4">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mr-2"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
        
        <h1 className="text-3xl font-bold mb-8">Settings</h1>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Application Version</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-w-md">
              <p className="text-sm text-gray-500 mb-4">
                Select which version of the application to use across the platform.
              </p>
              <Select 
                value={selectedVersion} 
                onValueChange={(value) => handleVersionChange(value as AppVersion)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select app version" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="patient">Patient Risk Panel</SelectItem>
                  <SelectItem value="safety">Safety Risk Panel</SelectItem>
                  <SelectItem value="cohort">Cohort Risk Panel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Settings;
