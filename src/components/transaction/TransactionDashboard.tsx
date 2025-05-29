import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  FileText,
  CreditCard,
  Ticket,
} from "lucide-react";

interface TransactionDashboardProps {
  transactionId?: string;
  contractId?: string;
  eventName?: string;
  eventDate?: string;
  eventVenue?: string;
  seatDetails?: string;
  ticketQuantity?: number;
  price?: number;
  sellerName?: string;
  buyerName?: string;
  paymentMethod?: string;
  status?: "pending" | "active" | "completed" | "cancelled";
  timeRemaining?: number; // in minutes
  paymentVerified?: boolean;
  ticketsVerified?: boolean;
}

const TransactionDashboard = ({
  transactionId,
  contractId = "TIX-12345",
  eventName = "Taylor Swift | The Eras Tour",
  eventDate = "June 15, 2023 - 7:00 PM",
  eventVenue = "SoFi Stadium, Los Angeles",
  seatDetails = "Section 134, Row 20, Seats 15-16",
  ticketQuantity = 2,
  price = 450.0,
  sellerName = "John Doe",
  buyerName = "Jane Smith",
  paymentMethod = "Venmo",
  status = "active",
  timeRemaining = 45,
  paymentVerified = false,
  ticketsVerified = true,
}: TransactionDashboardProps) => {
  // Use transactionId if provided, otherwise use contractId
  const displayId = transactionId || contractId;
  const [activeTab, setActiveTab] = useState("overview");

  // Calculate progress percentage for verification
  const verificationProgress = [
    paymentVerified ? 50 : 0,
    ticketsVerified ? 50 : 0,
  ].reduce((a, b) => a + b, 0);

  const getStatusBadge = () => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
            Pending
          </Badge>
        );
      case "active":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            Active
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Completed
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800">
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 bg-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Transaction Dashboard</h1>
          <p className="text-muted-foreground">Contract ID: {displayId}</p>
        </div>
        <div className="flex items-center mt-4 md:mt-0">
          {getStatusBadge()}
          {status === "active" && (
            <div className="ml-4 flex items-center">
              <Clock className="h-4 w-4 mr-1 text-amber-500" />
              <span className="text-sm font-medium">
                {timeRemaining} minutes remaining
              </span>
            </div>
          )}
        </div>
      </div>

      <Tabs
        defaultValue="overview"
        className="w-full"
        onValueChange={setActiveTab}
      >
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="verification">Verification</TabsTrigger>
          <TabsTrigger value="details">Contract Details</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Event Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <h3 className="font-semibold text-lg">{eventName}</h3>
                  <p className="text-muted-foreground">{eventDate}</p>
                  <p className="text-muted-foreground">{eventVenue}</p>
                </div>
                <div className="pt-2">
                  <p className="font-medium">Seat Details</p>
                  <p>{seatDetails}</p>
                  <p>Quantity: {ticketQuantity} tickets</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Transaction Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Price per ticket:</span>
                  <span>${(price / ticketQuantity).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Quantity:</span>
                  <span>{ticketQuantity}</span>
                </div>
                <div className="flex justify-between">
                  <span>Service fee:</span>
                  <span>$0.00</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>${price.toFixed(2)}</span>
                </div>
                <div className="pt-2">
                  <p className="text-sm text-muted-foreground">
                    Payment method: {paymentMethod}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Verification Status</CardTitle>
              <CardDescription>
                Both payment and tickets must be verified to complete the
                transaction
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span>Overall Progress</span>
                  <span>{verificationProgress}%</span>
                </div>
                <Progress value={verificationProgress} className="h-2" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center p-4 border rounded-md">
                  {paymentVerified ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
                  )}
                  <div>
                    <p className="font-medium">Payment</p>
                    <p className="text-sm text-muted-foreground">
                      {paymentVerified ? "Verified" : "Awaiting verification"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center p-4 border rounded-md">
                  {ticketsVerified ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
                  )}
                  <div>
                    <p className="font-medium">Tickets</p>
                    <p className="text-sm text-muted-foreground">
                      {ticketsVerified ? "Verified" : "Awaiting verification"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              {!paymentVerified && (
                <Button className="mr-2">
                  <CreditCard className="mr-2 h-4 w-4" /> Submit Payment
                </Button>
              )}
              {!ticketsVerified && (
                <Button>
                  <Ticket className="mr-2 h-4 w-4" /> Transfer Tickets
                </Button>
              )}
              {paymentVerified && ticketsVerified && (
                <Alert className="w-full bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <AlertTitle>All verifications complete!</AlertTitle>
                  <AlertDescription>
                    Your transaction is being processed and will complete
                    shortly.
                  </AlertDescription>
                </Alert>
              )}
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="verification" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Verification Steps</CardTitle>
              <CardDescription>
                Follow these steps to complete your transaction
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex">
                  <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-primary font-medium">1</span>
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">Contract Activation</p>
                    <p className="text-sm text-muted-foreground">
                      Both buyer and seller have agreed to the terms
                    </p>
                    <Badge
                      variant="outline"
                      className="bg-green-100 text-green-800 mt-1"
                    >
                      Completed
                    </Badge>
                  </div>
                </div>

                <div className="flex">
                  <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-primary font-medium">2</span>
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">Payment Verification</p>
                    <p className="text-sm text-muted-foreground">
                      Buyer sends payment via {paymentMethod}
                    </p>
                    {paymentVerified ? (
                      <Badge
                        variant="outline"
                        className="bg-green-100 text-green-800 mt-1"
                      >
                        Completed
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-amber-100 text-amber-800 mt-1"
                      >
                        Pending
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex">
                  <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-primary font-medium">3</span>
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">Ticket Verification</p>
                    <p className="text-sm text-muted-foreground">
                      Seller transfers tickets to TixBank
                    </p>
                    {ticketsVerified ? (
                      <Badge
                        variant="outline"
                        className="bg-green-100 text-green-800 mt-1"
                      >
                        Completed
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-amber-100 text-amber-800 mt-1"
                      >
                        Pending
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex">
                  <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-primary font-medium">4</span>
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">Transaction Completion</p>
                    <p className="text-sm text-muted-foreground">
                      TixBank releases tickets to buyer and payment to seller
                    </p>
                    {paymentVerified && ticketsVerified ? (
                      <Badge
                        variant="outline"
                        className="bg-blue-100 text-blue-800 mt-1"
                      >
                        In Progress
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-gray-100 text-gray-800 mt-1"
                      >
                        Waiting
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {status === "active" && (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertTitle>Time Remaining</AlertTitle>
              <AlertDescription>
                You have {timeRemaining} minutes to complete all verification
                steps before the contract expires.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contract Details</CardTitle>
              <CardDescription>
                Full information about this transaction
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Contract ID
                    </h3>
                    <p>{displayId}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Created On
                    </h3>
                    <p>{new Date().toLocaleDateString()}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Expiration
                    </h3>
                    <p>1 hour after activation</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Seller
                    </h3>
                    <p>{sellerName}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Buyer
                    </h3>
                    <p>{buyerName}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Payment Method
                    </h3>
                    <p>{paymentMethod}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium mb-2">Terms & Conditions</h3>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>
                    By accepting this contract, both parties agree to complete
                    their respective actions within the 1-hour timeframe.
                  </p>
                  <p>
                    If either party fails to complete their action, the
                    transaction will be cancelled and any transferred items will
                    be returned.
                  </p>
                  <p>
                    TixBank serves as an intermediary only and is not
                    responsible for the quality or authenticity of tickets
                    beyond verification of transfer.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                <FileText className="mr-2 h-4 w-4" /> Download Contract PDF
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {status === "active" && (
        <div className="mt-6 flex justify-end">
          <Button variant="outline" className="mr-2">
            Cancel Transaction
          </Button>
          <Button disabled={!paymentVerified || !ticketsVerified}>
            Complete Transaction <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default TransactionDashboard;
