import React from "react";
import { Auth0Provider as Auth0ProviderSDK } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";

interface Auth0ProviderProps {
  children: React.ReactNode;
}

export const Auth0Provider = ({ children }: Auth0ProviderProps) => {
  const navigate = useNavigate();
  const domain = import.meta.env.VITE_AUTH0_DOMAIN || "";
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID || "";

  const onRedirectCallback = (appState: any) => {
    navigate(appState?.returnTo || "/dashboard");
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

  return (
    <Auth0ProviderSDK
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
      }}
      onRedirectCallback={onRedirectCallback}
    >
      {children}
    </Auth0ProviderSDK>
  );
};
