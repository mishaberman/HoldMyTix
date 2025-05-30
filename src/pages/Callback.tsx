import React, { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Loader2 } from "lucide-react";

const Callback = () => {
  const { error } = useAuth0();

  useEffect(() => {
    // This page exists just to handle the Auth0 callback
    // The actual redirect logic is in Auth0Provider.tsx
    console.log("Auth0 callback page loaded");
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-muted flex flex-col items-center justify-center p-4">
        <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-md max-w-md w-full">
          <h2 className="text-xl font-semibold mb-2">Authentication Error</h2>
          <p>{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted flex flex-col items-center justify-center">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="mt-4 text-lg">Completing authentication...</p>
    </div>
  );
};

export default Callback;
