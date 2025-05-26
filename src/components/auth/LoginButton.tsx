import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@/components/ui/button";

interface LoginButtonProps {
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

export const LoginButton = ({
  variant = "default",
  size = "default",
  className = "",
}: LoginButtonProps) => {
  const { loginWithRedirect } = useAuth0();

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={() => loginWithRedirect()}
    >
      Sign In
    </Button>
  );
};
