import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/contexts/auth";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Box, Typography, Card, CardContent } from "@mui/material";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <AuthGuard requireAuth={true}>
      <Box sx={{ p: 3, maxWidth: 600, mx: "auto" }}>
        <Card>
          <CardContent>
            <Typography variant="h4" gutterBottom>
              Welcome to Your App
            </Typography>

            {isAuthenticated && user && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="body1" gutterBottom>
                  Hello, {user.email}!
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  You are successfully logged in.
                </Typography>
              </Box>
            )}

            <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
              <LogoutButton />
            </Box>
          </CardContent>
        </Card>
      </Box>
    </AuthGuard>
  );
}
