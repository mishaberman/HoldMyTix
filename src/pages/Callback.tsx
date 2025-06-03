import React, { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { setCurrentUser } from "@/lib/auth";

const Callback = () => {
  const { user, isAuthenticated, isLoading, error, handleRedirectCallback } =
    useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    const processCallback = async () => {
      try {
        console.log("Processing Auth0 callback...");

        // Handle the redirect callback
        await handleRedirectCallback();

        console.log("Auth0 callback processed successfully");
      } catch (err) {
        console.error("Error processing Auth0 callback:", err);
      }
    };

    // Only process if we're not already authenticated and not loading
    if (!isAuthenticated && !isLoading) {
      processCallback();
    }
  }, [handleRedirectCallback, isAuthenticated, isLoading]);

  useEffect(() => {
    // Once authenticated, set the user and redirect
    if (isAuthenticated && user) {
      console.log("User authenticated:", user);
      setCurrentUser(user);

      // Redirect to dashboard
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-muted flex flex-col items-center justify-center p-4">
        <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-md max-w-md w-full">
          <h2 className="text-xl font-semibold mb-2">Authentication Error</h2>
          <p>{error.message}</p>
          <button
            onClick={() => navigate("/sign-in", { replace: true })}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted flex flex-col items-center justify-center">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="mt-4 text-lg">Completing authentication...</p>
      <p className="mt-2 text-sm text-muted-foreground">
        {isLoading ? "Processing..." : "Redirecting..."}
      </p>
    </div>
  );
};

export default Callback;
