import React, { useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Clock, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { trackViewContent, trackInitiateCheckout, getEnhancedUserData } from "@/lib/facebook-pixel";
import { useAuth0 } from "@auth0/auth0-react";

const HowItWorks = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth0();
  const userData = isAuthenticated ? getEnhancedUserData(user) : getEnhancedUserData();

  useEffect(() => {
    // Track page view
    if (typeof fbq !== 'undefined') {
      fbq('track', 'PageView', {
        content_name: 'How It Works',
        content_category: 'informational'
      });
    }
  }, []);

  const handleGetStartedClick = () => {
    trackInitiateCheckout(undefined, "USD", userData);
  };

  return (
    <Layout>
      <div className="container py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">How HoldMyTix Works</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our secure process ensures both buyers and sellers are protected
            throughout the transaction.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
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
                HoldMyTix receives tickets from sellers via Ticketmaster's free
                transfer feature and payment from buyers through various payment
                platforms.
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

        <div className="bg-muted p-8 rounded-lg mb-16">
          <h2 className="text-2xl font-bold mb-6">Detailed Process</h2>

          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Listing Creation</h3>
                <p className="text-muted-foreground mb-2">
                  Sellers create listings with detailed information about their
                  tickets, including event details, seat information, and price.
                </p>
                <p className="text-muted-foreground">
                  Sellers also specify which payment methods they accept (Venmo,
                  PayPal, Zelle, etc.).
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Purchase Initiation</h3>
                <p className="text-muted-foreground mb-2">
                  Buyers browse listings and select tickets they want to
                  purchase.
                </p>
                <p className="text-muted-foreground">
                  When a buyer decides to purchase, a digital contract is
                  created between the buyer and seller.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Contract Activation</h3>
                <p className="text-muted-foreground mb-2">
                  Both parties must accept the contract terms within a specified
                  timeframe.
                </p>
                <p className="text-muted-foreground">
                  Once both parties accept, a 1-hour window begins for
                  completing the transaction.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Dual Verification</h3>
                <p className="text-muted-foreground mb-2">
                  The buyer sends payment through the agreed-upon method, and
                  the seller transfers tickets to HoldMyTix.
                </p>
                <p className="text-muted-foreground">
                  HoldMyTix verifies both the payment receipt and ticket
                  authenticity before proceeding.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                5
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">
                  Transaction Completion
                </h3>
                <p className="text-muted-foreground mb-2">
                  Once both payment and tickets are verified, HoldMyTix releases
                  the tickets to the buyer and notifies the seller that they can
                  collect the payment.
                </p>
                <p className="text-muted-foreground">
                  The transaction is marked as complete, and both parties
                  receive confirmation.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-primary text-primary-foreground p-8 rounded-lg text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
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
              Sell Tickets <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-transparent border-primary-foreground hover:bg-primary-foreground/10 gap-2"
              onClick={() => navigate("/marketplace")}
            >
              Buy Tickets <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HowItWorks;