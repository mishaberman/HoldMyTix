import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const ProfileEditor = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const { toast } = useToast();

  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6 flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <span className="ml-2">Loading profile...</span>
        </CardContent>
      </Card>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6 text-center">
          <p>Please sign in to view your profile</p>
          <Button
            className="mt-4"
            onClick={() => (window.location.href = "/sign-in")}
          >
            Sign In
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full">
      <Card>
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
          <CardDescription>
            Manage your account information and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6 bg-blue-50 border-blue-200">
            <AlertDescription className="text-blue-700">
              Profile information is managed by Auth0. To update your profile
              details, please visit your Auth0 account settings.
            </AlertDescription>
          </Alert>

          <div className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.picture} alt={user.name || "User"} />
                <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={user.name || ""}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Name is provided by Auth0
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={user.email || ""}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Email is provided by Auth0
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="userId">User ID</Label>
              <Input
                id="userId"
                value={user.sub || ""}
                disabled
                className="bg-muted text-xs"
              />
              <p className="text-xs text-muted-foreground">
                Your unique user identifier
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={() => {
              toast({
                title: "Profile information",
                description:
                  "Profile details are managed through your Auth0 account.",
                duration: 3000,
              });
            }}
            className="w-full"
          >
            Manage Account Settings
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
