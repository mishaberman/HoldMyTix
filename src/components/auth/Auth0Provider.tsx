import React, { useEffect } from "react";
import {
  Auth0Provider as Auth0ProviderSDK,
  useAuth0,
} from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
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
    // Extract error information if present
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get("error");
    const errorDescription = urlParams.get("error_description");

    if (error) {
      console.error("Auth0 error:", error, errorDescription);
      navigate("/sign-in", {
        replace: true,
        state: { error: errorDescription || "Authentication failed" },
      });
      return;
    }

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
  const redirectUri = `${window.location.origin}/callback`;

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
      {children}
    </Auth0ProviderSDK>
  );
};
