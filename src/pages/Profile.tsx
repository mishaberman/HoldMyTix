import React from "react";
import Layout from "@/components/layout/Layout";
import { ProfileEditor } from "@/components/profile/ProfileEditor";
import { useAuth0 } from "@auth0/auth0-react";
import { Loader2 } from "lucide-react";

const Profile = () => {
  const { isLoading, isAuthenticated } = useAuth0();

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8 flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-lg">Loading profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="max-w-md mx-auto bg-card p-6 rounded-lg shadow-md text-center">
            <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
            <p className="text-muted-foreground mb-6">
              Please sign in to view your profile.
            </p>
            <a href="/sign-in" className="text-primary hover:underline">
              Sign In
            </a>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Profile Settings</h1>
          <ProfileEditor />
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
