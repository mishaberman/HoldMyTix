import React, { useEffect, useState } from "react";
import {
  Auth0Provider as Auth0ProviderSDK,
  useAuth0,
} from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { syncUserWithSupabase } from "@/lib/supabase";
import { setCurrentUser } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";

interface Auth0ProviderProps {
  children: React.ReactNode;
}

export const Auth0Provider = ({ children }: Auth0ProviderProps) => {
  const navigate = useNavigate();
  const domain = import.meta.env.VITE_AUTH0_DOMAIN || "mishaberman.auth0.com";
  const clientId =
    import.meta.env.VITE_AUTH0_CLIENT_ID || "T17DIzlALEvcYGtuUPQOQnZrTH9fFYcd";

  // Handle redirect after authentication
  const onRedirectCallback = (appState: any) => {
    const targetUrl = appState?.returnTo || "/dashboard";
    console.log("Auth0 redirect callback to:", targetUrl);
    navigate(targetUrl, { replace: true });
  };

  if (!domain || !clientId) {
    console.error("Auth0 domain or clientId is missing");
    return (
      <div className="p-4 bg-destructive/20 text-destructive rounded-md">
        <h2 className="text-lg font-semibold">Auth0 Configuration Error</h2>
        <p>
          Auth0 domain or client ID is missing. Please check your environment
          variables.
        </p>
      </div>
    );
  }

  // Ensure we have the correct redirect URI
  const redirectUri = `${window.location.origin}`;

  return (
    <Auth0ProviderSDK
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: redirectUri,
        scope: "openid profile email",
      }}
      onRedirectCallback={onRedirectCallback}
      useRefreshTokens={true}
      cacheLocation="localstorage"
    >
      <Auth0ProviderSync>{children}</Auth0ProviderSync>
    </Auth0ProviderSDK>
  );
};

// Component to sync Auth0 user with Supabase
const Auth0ProviderSync = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [syncAttempted, setSyncAttempted] = useState(false);
  const { toast } = useToast();

  // Reset sync state when authentication state changes
  useEffect(() => {
    if (!isAuthenticated) {
      setSyncAttempted(false);
    }
  }, [isAuthenticated]);

  // Sync user with Supabase when authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading && user && !syncAttempted) {
      console.log("Syncing Auth0 user with Supabase", user);
      setSyncAttempted(true);

      // Update the auth state with the current user
      setCurrentUser(user);

      // Show welcome toast
      toast({
        title: "Welcome back!",
        description: `You're signed in as ${user.name || user.email}`,
        duration: 3000,
      });

      // Sync with Supabase
      syncUserWithSupabase(user)
        .then((syncedUser) => {
          console.log("User successfully synced with Supabase", syncedUser);
        })
        .catch((error) => {
          console.error("Error syncing user with Supabase:", error);
          toast({
            title: "Sync Error",
            description:
              "There was an issue syncing your account data. Some features may be limited.",
            variant: "destructive",
            duration: 5000,
          });
        });
    }
  }, [isAuthenticated, isLoading, user, syncAttempted, toast]);

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
