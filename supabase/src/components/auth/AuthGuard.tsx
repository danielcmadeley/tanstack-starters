import React, { useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { CircularProgress, Box, Typography } from "@mui/material";
import { useNavigate } from "@tanstack/react-router";

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAuth?: boolean;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  fallback,
  requireAuth = true,
}) => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    if (requireAuth && !isAuthenticated) {
      navigate({
        to: "/login",
        search: {
          redirect: window.location.pathname,
        },
      });
    } else if (!requireAuth && isAuthenticated) {
      navigate({ to: "/" });
    }
  }, [isAuthenticated, loading, requireAuth, navigate]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      fallback || (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="100vh"
          gap={2}
        >
          <CircularProgress />
          <Typography variant="body2" color="text.secondary">
            Checking authentication...
          </Typography>
        </Box>
      )
    );
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  // If authentication is not required but user is authenticated (for login/register pages)
  if (!requireAuth && isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  // Render children if auth state matches requirement
  return <>{children}</>;
};

export default AuthGuard;
