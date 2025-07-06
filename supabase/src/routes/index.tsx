import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/contexts/auth";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { TodoListManager } from "@/components/todo/TodoListManager";
import { Box, Typography, Card, CardContent } from "@mui/material";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <AuthGuard requireAuth={true}>
      <Box sx={{ p: 3, maxWidth: 1200, mx: "auto", minHeight: "100vh" }}>
        {/* Header Section */}
        <Card
          sx={{
            mb: 4,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
          }}
        >
          <CardContent sx={{ py: 4 }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box>
                <Typography variant="h3" gutterBottom sx={{ fontWeight: 600 }}>
                  My Todo Lists
                </Typography>
                {isAuthenticated && user && (
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>
                    Welcome back, {user.email?.split("@")[0]}!
                  </Typography>
                )}
                <Typography variant="body1" sx={{ mt: 1, opacity: 0.8 }}>
                  Organize your tasks and boost your productivity
                </Typography>
              </Box>
              <Box>
                <LogoutButton
                  sx={{
                    color: "white",
                    borderColor: "white",
                    "&:hover": {
                      borderColor: "white",
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                    },
                  }}
                />
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Todo Lists Section */}
        <TodoListManager />
      </Box>
    </AuthGuard>
  );
}
