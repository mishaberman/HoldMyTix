import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  CalendarIcon,
  MapPinIcon,
  TicketIcon,
  ShieldCheckIcon,
  ArrowLeft,
  CreditCardIcon,
  Share2Icon,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

// Types for the ticket transfer process
type TransferStatus =
  | "pending"
  | "transferring"
  | "verifying"
  | "completed"
  | "failed";

interface TransferState {
  status: TransferStatus;
  ticketTransferred: boolean;
  paymentReceived: boolean;
  message: string;
  progress: number;
}

const ListingDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [listing, setListing] = useState<any>(null);
  const [transferState, setTransferState] = useState<TransferState>({
    status: "pending",
    ticketTransferred: false,
    paymentReceived: false,
    message: "Ready to initiate purchase",
    progress: 0,
  });

  useEffect(() => {
    const fetchListingDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        // In a real app, you would fetch from an API
        // const response = await fetch(`https://api.example.com/listings/${id}`);
        // const data = await response.json();

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Mock data for the listing
        const mockListing = {
          id: id || "1",
          title: "Taylor Swift - The Eras Tour",
          date: "2023-08-15",
          time: "7:00 PM",
          venue: "SoFi Stadium",
          location: "Los Angeles, CA",
          price: 350,
          quantity: 2,
          section: "134",
          row: "G",
          seats: "12-13",
          description:
            "Two tickets for Taylor Swift's Eras Tour at SoFi Stadium. Section 134, Row G, Seats 12-13. Great view of the stage! Mobile transfer through Ticketmaster.",
          seller: {
            name: "John Doe",
            rating: 4.9,
            transactions: 24,
            joinedDate: "2022-05-10",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
          },
          paymentMethods: ["Venmo", "PayPal"],
          verified: true,
          imageUrl:
            "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&q=80",
        };

        setListing(mockListing);
      } catch (err) {
        console.error("Error fetching listing details:", err);
        setError("Failed to load listing details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchListingDetails();
  }, [id]);

  const handlePurchase = () => {
    // Initiate the purchase process
    setTransferState({
      ...transferState,
      status: "transferring",
      message: "Waiting for ticket transfer to holding account...",
      progress: 25,
    });

    // Simulate the ticket transfer process
    setTimeout(() => {
      setTransferState({
        ...transferState,
        ticketTransferred: true,
        status: "verifying",
        message: "Tickets received! Waiting for payment...",
        progress: 50,
      });

      // Simulate payment verification
      setTimeout(() => {
        setTransferState({
          status: "verifying",
          ticketTransferred: true,
          paymentReceived: true,
          message: "Payment received! Verifying transaction...",
          progress: 75,
        });

        // Simulate completion
        setTimeout(() => {
          setTransferState({
            status: "completed",
            ticketTransferred: true,
            paymentReceived: true,
            message:
              "Transaction complete! Tickets transferred to your account.",
            progress: 100,
          });

          // In a real app, you would navigate to the transaction page
          // navigate(`/transaction/${listing.id}`);
        }, 2000);
      }, 3000);
    }, 3000);
  };

  const formattedDate = listing
    ? new Date(listing.date).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  if (loading) {
    return (
      <Layout>
        <div className="container py-8 flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-lg">Loading listing details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !listing) {
    return (
      <Layout>
        <div className="container py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error || "Listing not found"}</AlertDescription>
          </Alert>
          <Button className="mt-4" onClick={() => navigate("/marketplace")}>
            Return to Marketplace
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <Button
          variant="ghost"
          className="mb-6 flex items-center gap-2"
          onClick={() => navigate("/marketplace")}
        >
          <ArrowLeft className="h-4 w-4" /> Back to Marketplace
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg overflow-hidden shadow-md mb-6">
              <div className="relative h-64 md:h-80">
                <img
                  src={listing.imageUrl}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
                {listing.verified && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-green-500 text-white flex items-center gap-1">
                      <ShieldCheckIcon className="h-3 w-3" />
                      Verified Listing
                    </Badge>
                  </div>
                )}
              </div>

              <div className="p-6">
                <h1 className="text-2xl font-bold mb-2">{listing.title}</h1>

                <div className="flex flex-wrap gap-4 mb-4">
                  <div className="flex items-center text-muted-foreground">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    <span>
                      {formattedDate} at {listing.time}
                    </span>
                  </div>

                  <div className="flex items-center text-muted-foreground">
                    <MapPinIcon className="h-4 w-4 mr-2" />
                    <span>
                      {listing.venue}, {listing.location}
                    </span>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h2 className="text-lg font-semibold mb-2">
                      Ticket Details
                    </h2>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Section:</span>
                        <span className="font-medium">{listing.section}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Row:</span>
                        <span className="font-medium">{listing.row}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Seats:</span>
                        <span className="font-medium">{listing.seats}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Quantity:</span>
                        <span className="font-medium">
                          {listing.quantity} tickets
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold mb-2">
                      Seller Information
                    </h2>
                    <div className="flex items-center mb-3">
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarImage src={listing.seller.avatar} />
                        <AvatarFallback>
                          {listing.seller.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{listing.seller.name}</div>
                        <div className="flex items-center text-sm">
                          <span className="text-yellow-500 mr-1">★</span>
                          <span>
                            {listing.seller.rating} ·{" "}
                            {listing.seller.transactions} transactions
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Member since{" "}
                      {new Date(listing.seller.joinedDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                <div>
                  <h2 className="text-lg font-semibold mb-2">Description</h2>
                  <p className="text-muted-foreground">{listing.description}</p>
                </div>

                <Separator className="my-4" />

                <div>
                  <h2 className="text-lg font-semibold mb-2">
                    Accepted Payment Methods
                  </h2>
                  <div className="flex gap-2">
                    {listing.paymentMethods.map(
                      (method: string, index: number) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="flex items-center gap-1"
                        >
                          <CreditCardIcon className="h-3 w-3" />
                          {method}
                        </Badge>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <Card className="sticky top-6">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Price per ticket
                    </div>
                    <div className="text-3xl font-bold">${listing.price}</div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Share2Icon className="h-5 w-5" />
                  </Button>
                </div>

                <Separator className="my-4" />

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Price ({listing.quantity} tickets)
                    </span>
                    <span>${listing.price * listing.quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Service fee</span>
                    <span>$0.00</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>${listing.price * listing.quantity}</span>
                  </div>
                </div>

                {transferState.status === "pending" ? (
                  <Button className="w-full mb-3" onClick={handlePurchase}>
                    Purchase Now
                  </Button>
                ) : (
                  <div className="mb-4">
                    <div className="mb-2">
                      <Progress
                        value={transferState.progress}
                        className="h-2"
                      />
                    </div>
                    <div className="flex items-center justify-center mb-3 text-sm font-medium">
                      {transferState.status === "completed" ? (
                        <div className="flex items-center text-green-600">
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          {transferState.message}
                        </div>
                      ) : transferState.status === "failed" ? (
                        <div className="flex items-center text-red-600">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {transferState.message}
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          {transferState.message}
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="flex items-center">
                        <div
                          className={`w-3 h-3 rounded-full mr-2 ${
                            transferState.ticketTransferred
                              ? "bg-green-500"
                              : "bg-gray-300"
                          }`}
                        ></div>
                        <span className="text-sm">Tickets Transferred</span>
                      </div>
                      <div className="flex items-center">
                        <div
                          className={`w-3 h-3 rounded-full mr-2 ${
                            transferState.paymentReceived
                              ? "bg-green-500"
                              : "bg-gray-300"
                          }`}
                        ></div>
                        <span className="text-sm">Payment Verified</span>
                      </div>
                    </div>
                    {transferState.status === "completed" && (
                      <Button
                        className="w-full"
                        onClick={() => navigate(`/transaction/${listing.id}`)}
                      >
                        View Transaction Details
                      </Button>
                    )}
                  </div>
                )}

                <div className="text-center text-sm text-muted-foreground">
                  <div className="flex items-center justify-center mb-2">
                    <TicketIcon className="h-4 w-4 mr-1" />
                    <span>Tickets will be verified before transfer</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <ShieldCheckIcon className="h-4 w-4 mr-1" />
                    <span>Secure transaction through HoldMyTix</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ListingDetails;
