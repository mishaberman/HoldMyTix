import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { Shield, Info, Loader2 } from "lucide-react";
import Auth0Lock from "auth0-lock";

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
  const {
    loginWithRedirect,
    isAuthenticated,
    isLoading,
    getAccessTokenSilently,
  } = useAuth0();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmbeddedLogin, setShowEmbeddedLogin] = useState(false);
  const lockRef = useRef<Auth0Lock | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  // Initialize Auth0 Lock for embedded authentication
  useEffect(() => {
    const domain = import.meta.env.VITE_AUTH0_DOMAIN || "mishaberman.auth0.com";
    const clientId =
      import.meta.env.VITE_AUTH0_CLIENT_ID ||
      "T17DIzlALEvcYGtuUPQOQnZrTH9fFYcd";

    if (!lockRef.current && domain && clientId) {
      lockRef.current = new Auth0Lock(clientId, domain, {
        container: "auth0-lock-container",
        theme: {
          primaryColor: "#3b82f6",
        },
        languageDictionary: {
          title: "Sign In to HoldMyTix",
        },
        auth: {
          redirectUrl: `${window.location.origin}/callback`,
          responseType: "code",
          params: {
            scope: "openid profile email",
          },
        },
        socialButtonStyle: "big",
        allowedConnections: [
          "Username-Password-Authentication",
          "google-oauth2",
          "facebook",
        ],
        rememberLastLogin: true,
        closable: false,
        avatar: null,
        mustAcceptTerms: false,
      });

      lockRef.current.on("authenticated", (authResult) => {
        console.log("Auth0 Lock authenticated:", authResult);
        // The Auth0Provider will handle the token exchange
        window.location.href = `/callback?code=${authResult.accessToken}&state=${authResult.state || "default"}`;
      });

      lockRef.current.on("authorization_error", (error) => {
        console.error("Auth0 Lock error:", error);
        setError(error.error_description || "Authentication failed");
        setShowEmbeddedLogin(false);
      });
    }

    return () => {
      if (lockRef.current) {
        lockRef.current.hide();
      }
    };
  }, []);

  // Get return URL from location state or default to dashboard
  const returnTo = location.state?.returnTo || "/dashboard";

  const onSubmit = async (data: FormValues) => {
    setError(null);
    setIsSubmitting(true);

    try {
      // Use Auth0 Lock for embedded authentication
      if (lockRef.current) {
        lockRef.current.show();
        setShowEmbeddedLogin(true);
      } else {
        // Fallback to redirect method
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
      }
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
    if (lockRef.current) {
      lockRef.current.show();
      setShowEmbeddedLogin(true);
    } else {
      loginWithRedirect({
        appState: { returnTo },
      });
    }
  };

  const handleSocialLogin = (connection: string) => {
    if (lockRef.current) {
      lockRef.current.show({
        allowedConnections: [connection],
      });
      setShowEmbeddedLogin(true);
    } else {
      loginWithRedirect({
        authorizationParams: {
          connection: connection,
        },
        appState: { returnTo },
      });
    }
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

        {/* Social Login Buttons */}
        <div className="space-y-3 mb-6">
          <Button
            type="button"
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
            onClick={() => handleSocialLogin("google-oauth2")}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
            onClick={() => handleSocialLogin("facebook")}
          >
            <svg className="h-4 w-4" fill="#1877F2" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Continue with Facebook
          </Button>
        </div>

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

        {/* Auth0 Lock Container - Hidden by default */}
        {showEmbeddedLogin && (
          <div className="mb-6">
            <div
              id="auth0-lock-container"
              className="auth0-lock-container"
            ></div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-2 w-full"
              onClick={() => {
                setShowEmbeddedLogin(false);
                if (lockRef.current) {
                  lockRef.current.hide();
                }
              }}
            >
              Use email/password form instead
            </Button>
          </div>
        )}

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
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || showEmbeddedLogin}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : showEmbeddedLogin ? (
                "Use form above to sign in"
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
