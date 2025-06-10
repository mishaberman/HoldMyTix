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
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="HoldMyTix" className="h-8 w-8" />
            <Link to="/" className="text-xl font-bold flex items-center gap-1">
              <span className="text-primary">Hold</span>MyTix
              <span className="bg-secondary text-xs px-2 py-0.5 rounded-full text-primary font-medium">
                Secure
              </span>
            </Link>
          </div>
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium hover:text-primary">
              Home
            </Link>
            <Link
              to="/marketplace"
              className="text-sm font-medium hover:text-primary"
            >
              Marketplace
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  to="/dashboard"
                  className="text-sm font-medium hover:text-primary"
                >
                  Dashboard
                </Link>
                <Link
                  to="/single-ticket-transfer"
                  className="text-sm font-medium hover:text-primary"
                >
                  Single Transfer
                </Link>
                {(user?.email === "mishaberman@gmail.com" ||
                  user?.email === "austen.dewolf@hover.to") && (
                  <Link
                    to="/admin"
                    className="text-sm font-medium hover:text-primary bg-red-100 text-red-800 px-2 py-1 rounded"
                  >
                    Admin
                  </Link>
                )}
              </>
            )}
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
            <Link
              to="/contact"
              className="text-sm font-medium hover:text-primary"
            >
              Contact
            </Link>
          </nav>

          {/* Mobile Menu */}
          <div className="lg:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col gap-6 mt-6">
                  <div className="flex items-center gap-2 pb-4 border-b">
                    <img src="/logo.svg" alt="HoldMyTix" className="h-8 w-8" />
                    <span className="text-xl font-bold flex items-center gap-1">
                      <span className="text-primary">Hold</span>MyTix
                      <span className="bg-secondary text-xs px-2 py-0.5 rounded-full text-primary font-medium">
                        Secure
                      </span>
                    </span>
                  </div>

                  <nav className="flex flex-col gap-4">
                    <Link
                      to="/"
                      className="text-lg font-medium hover:text-primary py-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Home
                    </Link>
                    <Link
                      to="/marketplace"
                      className="text-lg font-medium hover:text-primary py-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Marketplace
                    </Link>
                    {isAuthenticated && (
                      <>
                        <Link
                          to="/dashboard"
                          className="text-lg font-medium hover:text-primary py-2"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Dashboard
                        </Link>
                        <Link
                          to="/single-ticket-transfer"
                          className="text-lg font-medium hover:text-primary py-2"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Single Transfer
                        </Link>
                        {(user?.email === "mishaberman@gmail.com" ||
                          user?.email === "austen.dewolf@hover.to") && (
                          <Link
                            to="/admin"
                            className="text-lg font-medium hover:text-primary bg-red-100 text-red-800 px-3 py-2 rounded"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            Admin
                          </Link>
                        )}
                      </>
                    )}
                    <Link
                      to="/how-it-works"
                      className="text-lg font-medium hover:text-primary py-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      How It Works
                    </Link>
                    <Link
                      to="/faq"
                      className="text-lg font-medium hover:text-primary py-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      FAQ
                    </Link>
                    <Link
                      to="/about"
                      className="text-lg font-medium hover:text-primary py-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      About Us
                    </Link>
                    <Link
                      to="/contact"
                      className="text-lg font-medium hover:text-primary py-2"
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
          <div className="flex items-center gap-4">
            {isLoading ? (
              <div className="h-9 w-20 bg-muted animate-pulse rounded-md"></div>
            ) : isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="bg-secondary text-primary px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
                  Secure Session
                </div>
                <UserProfile />
              </div>
            ) : (
              <>
                <div className="hidden sm:block bg-secondary/50 text-muted-foreground px-3 py-1 rounded-full text-xs font-medium mr-2 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-muted-foreground"></span>
                  Not Verified
                </div>
                <Button
                  variant="outline"
                  size="sm"
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
                  onClick={() => navigate("/sign-up")}
                  className="hidden sm:block"
                >
                  Get Started
                </Button>
              </>
            )}
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
