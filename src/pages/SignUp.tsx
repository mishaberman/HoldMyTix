import React from "react";
import SignUpForm from "@/components/auth/SignUpForm";
import { Shield } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

const SignUp = () => {
  const { isAuthenticated, isLoading } = useAuth0();

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
        <Link to="/" className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">HoldMyTix</span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <SignUpForm />
        </div>
      </div>
    </div>
  );
};

export default SignUp;
