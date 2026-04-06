import React from "react";
import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Loader2 } from "lucide-react";

const FullScreenLoader = () => (
  <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
    <Loader2 className="h-10 w-10 animate-spin text-brand-500" />
  </div>
);

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <FullScreenLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}`} replace />;
  }

  return children ? children : <Outlet />;
};

export const RequireOnboarding = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <FullScreenLoader />;
  }

  if (user?.role === 'creator' && !user?.profile?.isOnboarded) {
    return <Navigate to="/creator/onboarding" replace />;
  }
  
  if (user?.role === 'brand' && !user?.profile?.isOnboarded) {
    return <Navigate to="/brand/onboarding" replace />;
  }
  
  return children ? children : <Outlet />;
};

export const RequirePayoutSetup = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <FullScreenLoader />;
  }

  if (user?.role === 'creator' && !user?.profile?.payoutConnected) {
    return <Navigate to="/creator/payout-setup" replace />;
  }

  return children ? children : <Outlet />;
};
