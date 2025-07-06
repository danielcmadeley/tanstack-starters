import { createFileRoute } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";
import { useSupabase } from "@/components/providers/SystemProvider";
import { LoginDetailsWidget } from "@/components/widgets/LoginDetailsWidget";
import { AuthGuard } from "@/components/auth/AuthGuard";

const DEFAULT_ENTRY_ROUTE = "/";
const LOGIN_ROUTE = "/login";

export const Route = createFileRoute("/(auth)/register")({
  component: RouteComponent,
});

function RouteComponent() {
  const supabase = useSupabase();
  const navigate = useNavigate();

  return (
    <AuthGuard requireAuth={false}>
      <LoginDetailsWidget
        title="Register"
        submitTitle="Register"
        onSubmit={async ({ email, password }) => {
          if (!supabase) {
            throw new Error("Supabase has not been initialized yet");
          }
          const {
            data: { session },
            error,
          } = await supabase.client.auth.signUp({ email, password });
          if (error) {
            throw new Error(error.message);
          }

          if (session) {
            supabase.updateSession(session);
            navigate({ to: DEFAULT_ENTRY_ROUTE });
            return;
          }

          // TODO better dialog
          alert("Registration successful, please login");
          navigate({ to: LOGIN_ROUTE });
        }}
        secondaryActions={[
          { title: "Back", onClick: () => navigate({ to: LOGIN_ROUTE }) },
        ]}
      />
    </AuthGuard>
  );
}
