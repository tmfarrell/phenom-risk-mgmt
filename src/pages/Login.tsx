import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSignIn, setShowSignIn] = useState(false);
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [leadDialogOpen, setLeadDialogOpen] = useState(false);

  useEffect(() => {
    // Check current auth session on mount
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/');
      }
    };
    
    checkSession();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session);
      if (session) {
        navigate('/');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else {
      // Navigation will happen through the auth state change listener
      toast({
        title: 'Success',
        description: 'Signed in successfully!',
      });
    }
  };

  const handleDemoRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmittingLead(true);

    const formData = new FormData(e.currentTarget);
    const leadData = {
      email: formData.get('email') as string,
      full_name: formData.get('full_name') as string,
      company: formData.get('company') as string,
      phone: formData.get('phone') as string || null,
      message: formData.get('message') as string || null,
      status: 'new',
    };

    const { error } = await (supabase as any)
      .from('leads')
      .insert([leadData]);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit your request. Please try again.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Thank you!',
        description: 'We\'ll be in touch shortly to schedule your demo.',
      });
      setLeadDialogOpen(false);
      // Reset form
      (e.target as HTMLFormElement).reset();
    }

    setIsSubmittingLead(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img 
                src="/om1_logo_clr.png" 
                alt="OM1 Logo" 
                className="h-10 w-auto"
              />
            </div>
            <Button
              variant="ghost"
              onClick={() => setShowSignIn(!showSignIn)}
              className="text-sm font-medium"
            >
              {showSignIn ? 'Back to Home' : 'Sign In'}
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {showSignIn ? (
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Sign In</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2 text-left">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="Enter your email"
                    />
                  </div>
                  <div className="space-y-2 text-left">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                      placeholder="Enter your password"
                    />
                  </div>
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            {/* Hero Section */}
            <div className="text-center mb-16">
              <h1 className="text-5xl md:text-6xl font-bold text-blue-900 mt-6 mb-4">
                Precision phenotyping for<br/> smarter patient risk management
                <span className="block text-4xl font-normal text-gray-500 mt-6">
                  AI-Powered Clinical Risk Prediction
                </span>
              </h1>
              {/*<p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                PhenOM 2.0 Patient Risk Panel helps healthcare teams identify high-risk patients, 
                prioritize interventions, and reduce care delivery costs with precision clinical event predictions.
              </p>*/}
              <div className="flex gap-4 justify-center">
                <Dialog open={leadDialogOpen} onOpenChange={setLeadDialogOpen}>
                  {/*<DialogTrigger asChild>
                    <Button size="lg" className="bg-blue-600 text-white hover:bg-blue-700 text-lg px-8 py-6">
                      Schedule a Demo
                    </Button>
                  </DialogTrigger>*/}
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Schedule a Demo</DialogTitle>
                      <DialogDescription>
                        Fill out the form below and we'll get in touch shortly to show you how the PhenOM can transform your care delivery.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleDemoRequest} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="full_name">Full Name *</Label>
                        <Input
                          id="full_name"
                          name="full_name"
                          type="text"
                          required
                          placeholder="First Last"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="demo_email">Email *</Label>
                        <Input
                          id="demo_email"
                          name="email"
                          type="email"
                          required
                          placeholder="first@company.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company">Company *</Label>
                        <Input
                          id="company"
                          name="company"
                          type="text"
                          required
                          placeholder="Company Name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                          id="message"
                          name="message"
                          placeholder="Tell us about your needs..."
                          rows={3}
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full bg-blue-600 text-white hover:bg-blue-700"
                        disabled={isSubmittingLead}
                      >
                        {isSubmittingLead ? 'Submitting...' : 'Submit Request'}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-8 mb-20">
            <Card className="border-2 hover:shadow-lg transition-shadow text-left">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <svg
                      className="w-6 h-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
                      />
                    </svg>
                  </div>
                  <CardTitle>Real-World Data</CardTitle>
                  <CardDescription>
                    Runs on data from real-world EHR or claims systems so you can generate predictions specific to your patients.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-2 hover:shadow-lg transition-shadow text-left">
              <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <svg
                      className="w-6 h-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <CardTitle>AI-Powered Phenotyping</CardTitle>
                  <CardDescription>
                    Leverages state-of-the-art AI to precisely quantify patient risk across a wide range of clinical outcomes and time domains. 
                  </CardDescription>
                </CardHeader>
              </Card>
                         

              <Card className="border-2 hover:shadow-lg transition-shadow text-left">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <svg
                      className="w-6 h-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                      />
                    </svg>
                  </div>
                  <CardTitle>Accessible by API</CardTitle>
                  <CardDescription>
                    Upload data and generate predictions through a secure API, enabling seamless integration into your existing workflows.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            {/* CTA Section */}
            <div className="text-center bg-blue-900 rounded-2xl p-10 text-white">
              <h2 className="text-3xl font-bold mb-4">
                Ready to Modernize Your Risk Management?
              </h2>
              {/*<p className="text-lg mb-6 text-blue-100">
                See how the Patient Risk Panel can help you identify high-risk patients and improve outcomes.
              </p>*/}
              <Dialog open={leadDialogOpen} onOpenChange={setLeadDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                    Schedule a Demo
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2025 OM1. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};