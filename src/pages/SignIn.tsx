import React from "react";
import SignInForm from "@/components/auth/SignInForm";
import { Shield, AlertCircle } from "lucide-react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

const SignIn = () => {
  const { isAuthenticated, isLoading } = useAuth0();
  const location = useLocation();
  const authError = location.state?.error;

  // If user is already authenticated, redirect to dashboard
  if (isAuthenticated && !isLoading) {
    return <Navigate to="/dashboard" replace />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted flex flex-col">
      <div className="container flex h-16 items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.svg" alt="HoldMyTix" className="h-8 w-8 mr-2" /> {/* Add logo here */}
          <Shield className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">HoldMyTix</span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {authError && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive text-destructive rounded-md flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Authentication failed</p>
                <p className="text-sm">{authError}</p>
              </div>
            </div>
          )}
          <SignInForm />
        </div>
      </div>
    </div>
  );
};

export default SignIn;