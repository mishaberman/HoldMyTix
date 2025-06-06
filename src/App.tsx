import { Suspense, lazy } from "react";
import { Routes, Route, useRoutes } from "react-router-dom";
import { Auth0Provider } from "@/components/auth/Auth0Provider";
import { Auth0ProviderWrapper } from "@/components/auth/Auth0ProviderWrapper";
import { AuthGuard } from "@/components/auth/AuthGuard";
import Home from "./components/home";
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
const Admin = lazy(() => import("./pages/Admin"));
const TransferDetails = lazy(() => import("./pages/TransferDetails"));
const Profile = lazy(() => import("./pages/Profile"));
const Callback = lazy(() => import("./pages/Callback"));

// Import tempo routes
let routes: any[] = [];
try {
  routes = require("tempo-routes").default || [];
} catch (e) {
  // Tempo routes not available
}

function App() {
  const tempoRoutes = useRoutes(routes);

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
          {/* Tempo routes */}
          {import.meta.env.VITE_TEMPO && tempoRoutes}

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
              path="/profile"
              element={
                <AuthGuard>
                  <Profile />
                </AuthGuard>
              }
            />
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
            <Route
              path="/admin"
              element={
                <AuthGuard>
                  <Admin />
                </AuthGuard>
              }
            />
            <Route
              path="/transfer/:id"
              element={
                <AuthGuard>
                  <TransferDetails />
                </AuthGuard>
              }
            />

            {/* Add tempo route before catchall */}
            {import.meta.env.VITE_TEMPO && <Route path="/tempobook/*" />}
          </Routes>

          {/* Toast notifications */}
          <Toaster />
        </Suspense>
      </Auth0ProviderWrapper>
    </Auth0Provider>
  );
}

export default App;
