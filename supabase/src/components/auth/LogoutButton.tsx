import React from "react";
import { Button, ButtonProps } from "@mui/material";
import { useSupabase } from "@/components/providers/SystemProvider";
import { useNavigate } from "@tanstack/react-router";

interface LogoutButtonProps extends Omit<ButtonProps, "onClick"> {
  redirectTo?: string;
  onLogout?: () => void;
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({
  redirectTo = "/login",
  onLogout,
  children = "Logout",
  variant = "outlined",
  ...buttonProps
}) => {
  const supabase = useSupabase();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (!supabase) return;

    try {
      await supabase.client.auth.signOut();
      onLogout?.();
      navigate({ to: redirectTo });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <Button
      variant={variant}
      onClick={handleLogout}
      disabled={!supabase}
      {...buttonProps}
    >
      {children}
    </Button>
  );
};

export default LogoutButton;
