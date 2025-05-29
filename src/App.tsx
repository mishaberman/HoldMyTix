import { Suspense, lazy, useEffect } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import { Auth0Provider } from "@/components/auth/Auth0Provider";
import { AuthGuard } from "@/components/auth/AuthGuard";
import Home from "./components/home";
import routes from "tempo-routes";
import { Toaster } from "@/components/ui/toaster";

// Lazy load pages for better performance
const SignIn = lazy(() => import("./pages/SignIn"));
const SignUp = lazy(() => import("./pages/SignUp"));
const Marketplace = lazy(() => import("./pages/Marketplace"));
const CreateListing = lazy(() => import("./pages/CreateListing"));
const ListingDetails = lazy(() => import("./pages/ListingDetails"));
const TransactionView = lazy(() => import("./pages/TransactionView"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const FAQ = lazy(() => import("./pages/FAQ"));
const About = lazy(() => import("./pages/About"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const SingleTicketTransfer = lazy(() => import("./pages/SingleTicketTransfer"));

function App() {
  // Check for authentication on app load
  useEffect(() => {
    // Check if we have stored user data
    const storedUser = localStorage.getItem("auth_user");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        const lastLogin = new Date(userData.lastLogin);
        const now = new Date();
        const hoursSinceLogin =
          (now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60);

        // If last login was more than 24 hours ago, clear the stored data
        if (hoursSinceLogin > 24) {
          localStorage.removeItem("auth_user");
          document.body.classList.remove("user-authenticated");
        } else {
          // Otherwise, mark as authenticated for CSS targeting
          document.body.classList.add("user-authenticated");
        }
      } catch (e) {
        console.error("Error parsing stored user data:", e);
        localStorage.removeItem("auth_user");
      }
    }
  }, []);

  return (
    <Auth0Provider>
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        }
      >
        <>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/sign-up" element={<SignUp />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/create-listing" element={<CreateListing />} />
            <Route path="/listing/:id" element={<ListingDetails />} />
            <Route path="/transaction/:id" element={<TransactionView />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/about" element={<About />} />

            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <AuthGuard>
                  <Dashboard />
                </AuthGuard>
              }
            />
            <Route
              path="/single-ticket-transfer"
              element={
                <AuthGuard>
                  <SingleTicketTransfer />
                </AuthGuard>
              }
            />

            {/* Add this before the catchall route */}
            {import.meta.env.VITE_TEMPO === "true" && (
              <Route path="/tempobook/*" />
            )}
          </Routes>
          {import.meta.env.VITE_TEMPO === "true" && routes && useRoutes(routes)}

          {/* Toast notifications */}
          <Toaster />
        </>
      </Suspense>
    </Auth0Provider>
  );
}

export default App;
