import { createFileRoute } from "@tanstack/react-router";
import { LoginDetailsWidget } from "@/components/widgets/LoginDetailsWidget";
import { useSupabase } from "@/components/providers/SystemProvider";
import { useNavigate } from "@tanstack/react-router";
import { AuthGuard } from "@/components/auth/AuthGuard";

const DEFAULT_ENTRY_ROUTE = "/";

type SearchParams = {
  redirect?: string;
};

export const Route = createFileRoute("/(auth)/login")({
  validateSearch: (search: Record<string, unknown>): SearchParams => {
    return {
      redirect: search.redirect as string | undefined,
    };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const supabase = useSupabase();
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();

  return (
    <AuthGuard requireAuth={false}>
      <LoginDetailsWidget
        title="Login"
        submitTitle="Login"
        onSubmit={async (values) => {
          if (!supabase) {
            throw new Error("Supabase has not been initialized yet");
          }
          await supabase.login(values.email, values.password);
          navigate({ to: redirect || DEFAULT_ENTRY_ROUTE });
        }}
        secondaryActions={[
          {
            title: "Register",
            onClick: () => {
              navigate({ to: "/register" });
            },
          },
        ]}
      />
    </AuthGuard>
  );
}
