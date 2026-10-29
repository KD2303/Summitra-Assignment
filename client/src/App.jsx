import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { EventsPage } from './pages/EventsPage';
import { EventDetailsPage } from './pages/EventDetailsPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { BookingSuccessPage } from './pages/BookingSuccessPage';
import { BookingFailurePage } from './pages/BookingFailurePage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { api } from './lib/api';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 10, // 10 seconds
      retry: 1,
      refetchOnWindowFocus: true
    }
  }
});

function ProtectedAdminRoute({ children }) {
  const token = localStorage.getItem('summitra_admin_token');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-auth-session'],
    queryFn: () => api.getMe(),
    enabled: Boolean(token),
    retry: false,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 rounded-full border-2 border-[#8617d0] border-t-transparent animate-spin" />
        <p className="text-white/60 text-[13px] font-semibold tracking-wide">
          Verifying administrator credentials...
        </p>
      </div>
    );
  }

  if (isError || !data?.admin) {
    localStorage.removeItem('summitra_admin_token');
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      {!isAdminRoute && <Navbar />}
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:id" element={<EventDetailsPage />} />
          <Route path="/checkout/:id" element={<CheckoutPage />} />
          <Route path="/booking/:id/success" element={<BookingSuccessPage />} />
          <Route path="/booking/failed" element={<BookingFailurePage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedAdminRoute>
                <AdminDashboardPage />
              </ProtectedAdminRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      {!isAdminRoute && <Footer />}
    </div>
  );
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
