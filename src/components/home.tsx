import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Shield,
  Clock,
  CreditCard,
  CheckCircle,
  User,
  LogOut,
} from "lucide-react";

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, user, logout } = useAuth0();

  const handleLogout = () => {
    logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="HoldMyTix" className="h-8 w-8" />
            <span className="text-xl font-bold">HoldMyTix</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium hover:text-primary">
              Home
            </Link>
            <Link
              to="/marketplace"
              className="text-sm font-medium hover:text-primary"
            >
              Marketplace
            </Link>
            <Link
              to="/how-it-works"
              className="text-sm font-medium hover:text-primary"
            >
              How It Works
            </Link>
            <Link to="/faq" className="text-sm font-medium hover:text-primary">
              FAQ
            </Link>
            <Link
              to="/about"
              className="text-sm font-medium hover:text-primary"
            >
              About Us
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            {isLoading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
            ) : isAuthenticated ? (
              <>
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4" />
                  <span>Welcome, {user?.name || user?.email}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/dashboard")}
                >
                  Dashboard
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate("/single-ticket-transfer")}
                >
                  Single Transfer
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/sign-in")}
                >
                  Sign In
                </Button>
                <Button size="sm" onClick={() => navigate("/sign-up")}>
                  Get Started
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate("/single-ticket-transfer")}
                >
                  Single Transfer
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-20 md:py-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Secure Ticket Exchange Without The Fees
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              HoldMyTix serves as a trusted middleman for peer-to-peer ticket
              sales, eliminating scams and excessive fees by verifying both
              ticket transfers and payments before completing transactions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="gap-2"
                onClick={() => navigate("/create-listing")}
              >
                Sell Tickets <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gap-2 bg-white hover:bg-gray-50 text-gray-900 border-gray-300"
                onClick={() => navigate("/marketplace")}
              >
                Browse Tickets <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
            <img
              src="https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&q=80"
              alt="Concert tickets and smartphone"
              className="rounded-lg shadow-2xl w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-muted py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How HoldMyTix Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our secure process ensures both buyers and sellers are protected
              throughout the transaction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-background">
              <CardContent className="pt-6">
                <div className="mb-4 p-3 bg-primary/10 w-fit rounded-full">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">1. Contract Creation</h3>
                <p className="text-muted-foreground">
                  Buyers and sellers create digital agreements specifying ticket
                  details, price, and payment methods with a 1-hour completion
                  window.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-background">
              <CardContent className="pt-6">
                <div className="mb-4 p-3 bg-primary/10 w-fit rounded-full">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">2. Secure Transfer</h3>
                <p className="text-muted-foreground">
                  HoldMyTix receives tickets from sellers via Ticketmaster's
                  free transfer feature and payment from buyers through various
                  payment platforms.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-background">
              <CardContent className="pt-6">
                <div className="mb-4 p-3 bg-primary/10 w-fit rounded-full">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">
                  3. Verification & Release
                </h3>
                <p className="text-muted-foreground">
                  Platform verifies both ticket authenticity and payment receipt
                  before releasing tickets to buyers and funds to sellers.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Why Choose HoldMyTix</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our platform offers unique advantages for secure peer-to-peer ticket
            exchanges.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="flex flex-col gap-8">
            <div className="flex gap-4">
              <div className="p-2 bg-primary/10 h-fit rounded-full">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Verification System</h3>
                <p className="text-muted-foreground">
                  Our platform verifies both ticket authenticity and payment
                  receipt before releasing tickets to buyers and funds to
                  sellers.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="p-2 bg-primary/10 h-fit rounded-full">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">
                  Multi-Payment Support
                </h3>
                <p className="text-muted-foreground">
                  Accommodates various payment methods (Venmo, Zelle, PayPal,
                  etc.) to eliminate compatibility issues between parties.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="p-2 bg-primary/10 h-fit rounded-full">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">
                  Time-Limited Contracts
                </h3>
                <p className="text-muted-foreground">
                  All transactions have a 1-hour completion window to ensure
                  quick and efficient exchanges without long waiting periods.
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
            <img
              src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80"
              alt="Mobile payment and tickets"
              className="rounded-lg shadow-2xl w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Exchange Tickets Safely?
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of users who have completed secure ticket exchanges
            through HoldMyTix.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              size="lg"
              variant="secondary"
              className="gap-2"
              onClick={() => navigate("/create-listing")}
            >
              Create Listing <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-white border-white text-primary hover:bg-gray-50 gap-2"
              onClick={() => navigate("/marketplace")}
            >
              Browse Tickets <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t py-12">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="/logo.svg" alt="HoldMyTix" className="h-8 w-8" />
                <span className="text-xl font-bold">HoldMyTix</span>
              </div>
              <p className="text-muted-foreground mb-4">
                The secure middleman for peer-to-peer ticket exchanges.
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/marketplace"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Marketplace
                  </Link>
                </li>
                <li>
                  <Link
                    to="/how-it-works"
                    className="text-muted-foreground hover:text-primary"
                  >
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link
                    to="/faq"
                    className="text-muted-foreground hover:text-primary"
                  >
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/terms"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    to="/privacy"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    to="/refund"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Refund Policy
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-4">Contact</h4>
              <ul className="space-y-2">
                <li className="text-muted-foreground">support@holdmytix.com</li>
                <li className="text-muted-foreground">(555) 123-4567</li>
              </ul>
            </div>
          </div>

          <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
            <p>© {new Date().getFullYear()} HoldMyTix. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
