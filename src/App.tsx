
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useEffect, useState, createContext } from 'react';
import { supabase } from './integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { Login } from './pages/Login';
import Index from './pages/Index';
import { PatientDetails } from './pages/PatientDetails';
import Settings from './pages/Settings';
import { useAdminStatus } from './hooks/useAdminStatus';
import './App.css';
import PhenomBuilder from './pages/PhenomBuilder';
import { SidebarProvider } from './components/ui/sidebar';
import { AppSidebar } from './components/AppSidebar';

// Create a context to share auth and admin status
export const AuthContext = createContext<{
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
}>({
  session: null,
  loading: true,
  isAdmin: false,
});

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { isAdmin, loading: adminLoading } = useAdminStatus();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session);
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', session);
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Add a console log to debug isAdmin status
  console.log('Protected Route - isAdmin:', isAdmin, 'loading:', loading, 'adminLoading:', adminLoading);

  if (loading || adminLoading) {
    return <div>Loading...</div>;
  }

  if (!session) {
    console.log('No session found, redirecting to login');
    return <Navigate to="/login" />;
  }

  return (
    <AuthContext.Provider value={{ session, loading: loading || adminLoading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Index />} />
          <Route path="patient/:id" element={<PatientDetails />} />
          <Route path="settings" element={<Settings />} />
          <Route path="phenom-builder" element={<PhenomBuilder />} />
          <Route path="phenom-builder/:modelId" element={<PhenomBuilder />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

function MainLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex bg-gray-50">
        <AppSidebar />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
}
