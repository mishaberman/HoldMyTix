import React, { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { setCurrentUser } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";

interface Auth0ProviderWrapperProps {
  children: React.ReactNode;
}

/**
 * A wrapper component that handles Auth0 user state and updates local auth state
 */
export const Auth0ProviderWrapper = ({
  children,
}: Auth0ProviderWrapperProps) => {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const { toast } = useToast();

  // Set user in local state when authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading && user) {
      // Update the auth state with the current user
      setCurrentUser(user);

      // Show welcome toast
      toast({
        title: "Welcome back!",
        description: `You're signed in as ${user.name || user.email}`,
        duration: 3000,
      });
    }
  }, [isAuthenticated, isLoading, user, toast]);

  // Update body class for CSS targeting
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      document.body.classList.add("user-authenticated");
    } else {
      document.body.classList.remove("user-authenticated");
    }
  }, [isAuthenticated, isLoading]);

  return <>{children}</>;
};
