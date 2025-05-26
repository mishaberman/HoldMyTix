import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@/components/ui/button";

interface LogoutButtonProps {
  variant?:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export const LogoutButton = ({
  variant = "outline",
  size = "default",
  className = "",
}: LogoutButtonProps) => {
  const { logout } = useAuth0();

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={() =>
        logout({ logoutParams: { returnTo: window.location.origin } })
      }
    >
      Sign Out
    </Button>
  );
};
