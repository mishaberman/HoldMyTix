import React from "react";
import SignInForm from "@/components/auth/SignInForm";
import { Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

const SignIn = () => {
  const { isAuthenticated, isLoading } = useAuth0();

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
          <SignInForm />
        </div>
      </div>
    </div>
  );
};

export default SignIn;
