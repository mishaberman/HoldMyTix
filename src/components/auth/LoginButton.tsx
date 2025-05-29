import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "react-router-dom";
import { LogIn } from "lucide-react";

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
  children?: React.ReactNode;
}

export const LoginButton = ({
  variant = "default",
  size = "default",
  className = "",
  children,
}: LoginButtonProps) => {
  const { loginWithRedirect, isAuthenticated, isLoading } = useAuth0();
  const location = useLocation();

  // Don't show if already authenticated
  if (isAuthenticated || isLoading) {
    return null;
  }

  const handleLogin = () => {
    loginWithRedirect({
      appState: {
        returnTo:
          location.pathname !== "/sign-in" ? location.pathname : "/dashboard",
      },
    });
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleLogin}
    >
      {children || (
        <>
          <LogIn className="mr-2 h-4 w-4" />
          Sign In
        </>
      )}
    </Button>
  );
};
