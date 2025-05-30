import { Suspense, lazy } from "react";
import { Routes, Route, useRoutes } from "react-router-dom";
import { Auth0Provider } from "@/components/auth/Auth0Provider";
import { Auth0ProviderWrapper } from "@/components/auth/Auth0ProviderWrapper";
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
const Callback = lazy(() => import("./pages/Callback"));

function App() {
  return (
    <Auth0Provider>
      <Auth0ProviderWrapper>
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-screen">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          }
        >
          {/* For the tempo routes */}
          {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}

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
            <Route path="/callback" element={<Callback />} />

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
              <Route path="/tempobook/*" element={<div />} />
            )}
          </Routes>

          {/* Toast notifications */}
          <Toaster />
        </Suspense>
      </Auth0ProviderWrapper>
    </Auth0Provider>
  );
}

export default App;
