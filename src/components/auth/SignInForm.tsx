import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { Shield, Info, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
  rememberMe: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const SignInForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithRedirect, isAuthenticated, isLoading } = useAuth0();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  // Get return URL from location state or default to dashboard
  const returnTo = location.state?.returnTo || "/dashboard";

  const onSubmit = async (data: FormValues) => {
    setError(null);
    setIsSubmitting(true);

    try {
      await loginWithRedirect({
        authorizationParams: {
          screen_hint: "login",
          login_hint: data.email,
          connection: "Username-Password-Authentication",
        },
        appState: {
          returnTo,
          email: data.email,
          rememberMe: data.rememberMe,
        },
      });
      // Auth0 will handle the redirect
    } catch (err: any) {
      console.error("Login error:", err);
      setError(
        err?.message ||
          "Failed to sign in. Please check your credentials and try again.",
      );
      setIsSubmitting(false);
    }
  };

  const handleAuth0Login = () => {
    loginWithRedirect({
      appState: { returnTo },
    });
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto bg-white">
        <CardContent className="pt-6 flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <span className="ml-2">Checking authentication status...</span>
        </CardContent>
      </Card>
    );
  }

  if (isAuthenticated) {
    return (
      <Card className="w-full max-w-md mx-auto bg-white">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Already Signed In
          </CardTitle>
          <CardDescription className="text-center">
            You are already signed in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" onClick={() => navigate("/dashboard")}>
            Go to Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-white">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Sign In
        </CardTitle>
        <CardDescription className="text-center">
          Sign in to access your HoldMyTix account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-800">What is Auth0?</AlertTitle>
          <AlertDescription className="text-blue-700">
            Auth0 is a trusted authentication service that securely handles your
            login. We use Auth0 to protect your account with enterprise-grade
            security. Your credentials are never stored on our servers.
          </AlertDescription>
        </Alert>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="w-full flex items-center justify-center gap-2 mb-6"
                onClick={handleAuth0Login}
              >
                <Shield className="h-4 w-4" />
                Sign in with Auth0
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Secure, enterprise-grade authentication</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Or continue with email
            </span>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Authentication Error</AlertTitle>
            <AlertDescription>
              {error}
              <div className="mt-2 flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/sign-up")}
                >
                  Create an account
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/forgot-password")}
                >
                  Forgot password?
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="your.email@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center justify-between">
              <FormField
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <label
                      htmlFor="rememberMe"
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      Remember me
                    </label>
                  </FormItem>
                )}
              />
              <a
                href="#"
                className="text-sm font-medium text-primary hover:underline"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/forgot-password");
                }}
              >
                Forgot password?
              </a>
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In with Email"
              )}
            </Button>
          </form>
        </Form>
        <div className="mt-4 text-center text-sm">
          Don't have an account?{" "}
          <a
            href="#"
            className="font-medium text-primary hover:underline"
            onClick={(e) => {
              e.preventDefault();
              navigate("/sign-up");
            }}
          >
            Sign up
          </a>
        </div>
      </CardContent>
    </Card>
  );
};

export default SignInForm;
