import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { Loader2 } from "lucide-react";
import { createAuth0User } from "@/lib/auth0-api";
import { supabase } from "@/lib/supabase";

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
  CardFooter,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const formSchema = z
  .object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z.string(),
    terms: z.boolean().refine((val) => val === true, {
      message: "You must agree to the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof formSchema>;

const SignUpForm = () => {
  const navigate = useNavigate();
  const { loginWithRedirect, isAuthenticated, isLoading } = useAuth0();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  });

  const onSubmit = async (data: FormValues) => {
    setError(null);
    setIsSubmitting(true);

    try {
      // Create user directly via Auth0 API
      const auth0Result = await createAuth0User({
        email: data.email,
        password: data.password,
        name: data.name,
        connection: "Username-Password-Authentication",
      });

      if (!auth0Result.success) {
        throw new Error(auth0Result.error);
      }

      // Create user in Supabase
      const { error: supabaseError } = await supabase.from("users").insert({
        id: auth0Result.data._id || `auth0|${Date.now()}`,
        email: data.email,
        full_name: data.name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (supabaseError) {
        console.warn("Failed to create user in Supabase:", supabaseError);
        // Don't fail the signup if Supabase fails
      }

      // Now sign in the user
      await loginWithRedirect({
        authorizationParams: {
          screen_hint: "login",
          login_hint: data.email,
          connection: "Username-Password-Authentication",
        },
        appState: {
          returnTo: "/dashboard",
        },
      });
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(
        err?.message ||
          "Failed to create account. This email may already be registered.",
      );
      setIsSubmitting(false);
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
            Already Signed Up
          </CardTitle>
          <CardDescription className="text-center">
            You already have an account and are signed in
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
          Create an account
        </CardTitle>
        <CardDescription className="text-center">
          Enter your information to create an account
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Registration Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="terms"
              render={({ field }) => (
                <FormItem className="flex items-start space-x-2 mt-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <label
                      htmlFor="terms"
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      I agree to the{" "}
                      <a
                        href="#"
                        className="text-primary hover:underline"
                        onClick={(e) => {
                          e.preventDefault();
                          navigate("/terms");
                        }}
                      >
                        terms of service
                      </a>{" "}
                      and{" "}
                      <a
                        href="#"
                        className="text-primary hover:underline"
                        onClick={(e) => {
                          e.preventDefault();
                          navigate("/privacy");
                        }}
                      >
                        privacy policy
                      </a>
                    </label>
                  </div>
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full mt-6"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>
        </Form>
        <div className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <a
            href="#"
            className="font-medium text-primary hover:underline"
            onClick={(e) => {
              e.preventDefault();
              navigate("/sign-in");
            }}
          >
            Sign in
          </a>
        </div>
      </CardContent>
    </Card>
  );
};

export default SignUpForm;
