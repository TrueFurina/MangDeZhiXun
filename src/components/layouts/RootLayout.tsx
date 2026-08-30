import { Outlet } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/sonner';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { RouteProgress } from '@/components/common/RouteProgress';

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <RouteProgress />
        <Outlet />
        <Toaster />
      </AuthProvider>
    </ErrorBoundary>
  );
}
