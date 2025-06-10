import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Shield } from "lucide-react";
import { useAuth0 } from "@auth0/auth0-react";
import { UserProfile } from "@/components/auth/UserProfile";
import { trackPageView, getEnhancedUserData } from "@/lib/facebook-pixel";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Track page views with Facebook Pixel
  useEffect(() => {
    const pageName =
      location.pathname === "/"
        ? "Home"
        : location.pathname
            .replace("/", "")
            .replace("-", " ")
            .replace(/\b\w/g, (l) => l.toUpperCase());

    const userData = isAuthenticated
      ? getEnhancedUserData(user)
      : getEnhancedUserData();
    trackPageView(pageName, userData);
  }, [location.pathname, isAuthenticated, user]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Mobile Menu - Always on the left */}
            <div className="flex items-center gap-3">
              <div className="xl:hidden">
                <Sheet
                  open={isMobileMenuOpen}
                  onOpenChange={setIsMobileMenuOpen}
                >
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="p-2">
                      <Menu className="h-5 w-5" />
                      <span className="sr-only">Toggle menu</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[280px] sm:w-[320px]">
                    <div className="flex flex-col gap-6 mt-6">
                      <div className="flex items-center gap-2 pb-4 border-b">
                        <img
                          src="/logo.svg"
                          alt="HoldMyTix"
                          className="h-8 w-8"
                        />
                        <span className="text-xl font-bold flex items-center gap-1">
                          <span className="text-primary">Hold</span>MyTix
                          <span className="bg-secondary text-xs px-2 py-0.5 rounded-full text-primary font-medium">
                            Secure
                          </span>
                        </span>
                      </div>

                      <nav className="flex flex-col gap-3">
                        <Link
                          to="/"
                          className="text-base font-medium hover:text-primary py-2 px-2 rounded-md hover:bg-accent transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Home
                        </Link>
                        <Link
                          to="/marketplace"
                          className="text-base font-medium hover:text-primary py-2 px-2 rounded-md hover:bg-accent transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Marketplace
                        </Link>
                        {isAuthenticated && (
                          <>
                            <Link
                              to="/dashboard"
                              className="text-base font-medium hover:text-primary py-2 px-2 rounded-md hover:bg-accent transition-colors"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              Dashboard
                            </Link>
                            <Link
                              to="/single-ticket-transfer"
                              className="text-base font-medium hover:text-primary py-2 px-2 rounded-md hover:bg-accent transition-colors"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              Single Transfer
                            </Link>
                            {(user?.email === "mishaberman@gmail.com" ||
                              user?.email === "austen.dewolf@hover.to") && (
                              <Link
                                to="/admin"
                                className="text-base font-medium hover:text-primary bg-red-100 text-red-800 px-3 py-2 rounded-md"
                                onClick={() => setIsMobileMenuOpen(false)}
                              >
                                Admin
                              </Link>
                            )}
                          </>
                        )}
                        <Link
                          to="/how-it-works"
                          className="text-base font-medium hover:text-primary py-2 px-2 rounded-md hover:bg-accent transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          How It Works
                        </Link>
                        <Link
                          to="/faq"
                          className="text-base font-medium hover:text-primary py-2 px-2 rounded-md hover:bg-accent transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          FAQ
                        </Link>
                        <Link
                          to="/about"
                          className="text-base font-medium hover:text-primary py-2 px-2 rounded-md hover:bg-accent transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          About Us
                        </Link>
                        <Link
                          to="/contact"
                          className="text-base font-medium hover:text-primary py-2 px-2 rounded-md hover:bg-accent transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Contact
                        </Link>
                      </nav>

                      <div className="pt-4 border-t">
                        {isLoading ? (
                          <div className="h-9 w-full bg-muted animate-pulse rounded-md"></div>
                        ) : isAuthenticated ? (
                          <div className="flex flex-col gap-3">
                            <div className="bg-secondary text-primary px-3 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
                              Secure Session
                            </div>
                            <UserProfile />
                          </div>
                        ) : (
                          <div className="flex flex-col gap-3">
                            <div className="bg-secondary/50 text-muted-foreground px-3 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-muted-foreground"></span>
                              Not Verified
                            </div>
                            <Button
                              variant="outline"
                              className="w-full"
                              onClick={() => {
                                setIsMobileMenuOpen(false);
                                navigate("/sign-in", {
                                  state: { returnTo: location.pathname },
                                });
                              }}
                            >
                              Sign In
                            </Button>
                            <Button
                              className="w-full"
                              onClick={() => {
                                setIsMobileMenuOpen(false);
                                navigate("/sign-up");
                              }}
                            >
                              Get Started
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Logo */}
              <div className="flex items-center gap-2">
                <img src="/logo.svg" alt="HoldMyTix" className="h-8 w-8" />
                <Link
                  to="/"
                  className="text-lg sm:text-xl font-bold flex items-center gap-1"
                >
                  <span className="text-primary">Hold</span>MyTix
                  <span className="bg-secondary text-xs px-2 py-0.5 rounded-full text-primary font-medium">
                    Secure
                  </span>
                </Link>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden xl:flex items-center gap-4 2xl:gap-6">
              <Link
                to="/"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Home
              </Link>
              <Link
                to="/marketplace"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Marketplace
              </Link>
              {isAuthenticated && (
                <>
                  <Link
                    to="/dashboard"
                    className="text-sm font-medium hover:text-primary transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/single-ticket-transfer"
                    className="text-sm font-medium hover:text-primary transition-colors"
                  >
                    Single Transfer
                  </Link>
                  {(user?.email === "mishaberman@gmail.com" ||
                    user?.email === "austen.dewolf@hover.to") && (
                    <Link
                      to="/admin"
                      className="text-sm font-medium hover:text-primary bg-red-100 text-red-800 px-2 py-1 rounded transition-colors"
                    >
                      Admin
                    </Link>
                  )}
                </>
              )}
              <Link
                to="/how-it-works"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                How It Works
              </Link>
              <Link
                to="/faq"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                FAQ
              </Link>
              <Link
                to="/about"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                About Us
              </Link>
              <Link
                to="/contact"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Contact
              </Link>
            </nav>

            {/* User Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {isLoading ? (
                <div className="h-9 w-16 sm:w-20 bg-muted animate-pulse rounded-md"></div>
              ) : isAuthenticated ? (
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="hidden sm:flex bg-secondary text-primary px-2 sm:px-3 py-1 rounded-full text-xs font-medium items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
                    <span className="hidden md:inline">Secure Session</span>
                    <span className="md:hidden">Secure</span>
                  </div>
                  <UserProfile />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="hidden lg:flex bg-secondary/50 text-muted-foreground px-2 sm:px-3 py-1 rounded-full text-xs font-medium items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-muted-foreground"></span>
                    <span className="hidden xl:inline">Not Verified</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs sm:text-sm px-2 sm:px-3"
                    onClick={() =>
                      navigate("/sign-in", {
                        state: { returnTo: location.pathname },
                      })
                    }
                  >
                    Sign In
                  </Button>
                  <Button
                    size="sm"
                    className="hidden sm:flex text-xs sm:text-sm px-2 sm:px-3"
                    onClick={() => navigate("/sign-up")}
                  >
                    Get Started
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-secondary/30 border-t py-12">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="/logo.svg" alt="HoldMyTix" className="h-8 w-8" />
                <span className="text-xl font-bold flex items-center gap-1">
                  <span className="text-primary">Hold</span>MyTix
                  <span className="bg-secondary text-xs px-2 py-0.5 rounded-full text-primary font-medium">
                    Secure
                  </span>
                </span>
              </div>
              <p className="text-muted-foreground mb-4">
                The secure middleman for peer-to-peer ticket exchanges.
              </p>
              <div className="flex items-center gap-2 mb-4 bg-secondary/50 p-3 rounded-lg">
                <div className="p-2 bg-primary rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-white"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-medium">Secure & Trusted</p>
                  <p className="text-xs text-muted-foreground">
                    All transactions are protected
                  </p>
                </div>
              </div>
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
                {isAuthenticated && (
                  <li>
                    <Link
                      to="/dashboard"
                      className="text-muted-foreground hover:text-primary"
                    >
                      Dashboard
                    </Link>
                  </li>
                )}
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
                <li>
                  <Link
                    to="/about"
                    className="text-muted-foreground hover:text-primary"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Contact
                  </Link>
                </li>
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

export default Layout;
