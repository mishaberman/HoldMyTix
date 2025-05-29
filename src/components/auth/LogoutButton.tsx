import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { clearCurrentUser } from "@/lib/auth";

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
  children?: React.ReactNode;
}

export const LogoutButton = ({
  variant = "outline",
  size = "default",
  className = "",
  children,
}: LogoutButtonProps) => {
  const { logout, isAuthenticated, isLoading } = useAuth0();

  // Only show logout button if authenticated
  if (!isAuthenticated || isLoading) {
    return null;
  }

  const handleLogout = () => {
    // Clear any stored user data
    clearCurrentUser();

    // Log out from Auth0
    logout({
      logoutParams: { returnTo: `${window.location.origin}/` },
    });
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleLogout}
    >
      {children || (
        <>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </>
      )}
    </Button>
  );
};
