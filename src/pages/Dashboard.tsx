import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Clock, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";
import { ProfileEditor } from "@/components/profile/ProfileEditor";

const Dashboard = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [activeTab, setActiveTab] = useState("transfers");

  const [transfers, setTransfers] = useState([]);
  const [loadingTransfers, setLoadingTransfers] = useState(false);
  const [transferError, setTransferError] = useState(null);

  useEffect(() => {
    if (isAuthenticated && user?.sub) {
      fetchUserTransactions(user.sub);
    }
  }, [isAuthenticated, user]);

  const fetchUserTransactions = async (userId) => {
    setLoadingTransfers(true);
    setTransferError(null);

    try {
      const { getUserTransactions } = await import("@/lib/api");
      const { data, error } = await getUserTransactions(userId);

      if (error) throw error;

      if (data) {
        // Transform the data to match our component's expected format
        const formattedTransfers = data.map((tx) => ({
          id: tx.id,
          eventName: tx.event_name,
          eventDate: tx.event_date,
          venue: tx.venue,
          role: tx.seller_id === userId ? "seller" : "buyer",
          counterparty:
            tx.seller_id === userId ? tx.buyer?.email : tx.seller?.email,
          status: tx.status,
          price: tx.price,
          created: tx.created_at,
          ticketTransferred: tx.tickets_verified,
          paymentReceived: tx.payment_verified,
          agreementSigned:
            tx.docusign_agreements?.some(
              (a) => a.status === "signed" || a.status === "completed",
            ) || false,
        }));

        setTransfers(formattedTransfers);
      } else {
        // Fallback to mock data if no transactions found
        setTransfers([
          {
            id: "tx-1",
            eventName: "Taylor Swift | The Eras Tour",
            eventDate: "2023-08-15",
            venue: "SoFi Stadium, Los Angeles",
            role: "seller",
            counterparty: "john.doe@example.com",
            status: "pending",
            price: 350,
            created: "2023-07-20",
            ticketTransferred: true,
            paymentReceived: false,
            agreementSigned: true,
          },
          {
            id: "tx-2",
            eventName: "Beyoncé | Renaissance World Tour",
            eventDate: "2023-09-02",
            venue: "MetLife Stadium, New Jersey",
            role: "buyer",
            counterparty: "jane.smith@example.com",
            status: "completed",
            price: 275,
            created: "2023-07-15",
            ticketTransferred: true,
            paymentReceived: true,
            agreementSigned: true,
          },
        ]);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setTransferError(
        "Failed to load your transactions. Please try again later.",
      );
      // Fallback to mock data on error
      setTransfers([
        {
          id: "tx-1",
          eventName: "Taylor Swift | The Eras Tour",
          eventDate: "2023-08-15",
          venue: "SoFi Stadium, Los Angeles",
          role: "seller",
          counterparty: "john.doe@example.com",
          status: "pending",
          price: 350,
          created: "2023-07-20",
          ticketTransferred: true,
          paymentReceived: false,
          agreementSigned: true,
        },
        {
          id: "tx-2",
          eventName: "Beyoncé | Renaissance World Tour",
          eventDate: "2023-09-02",
          venue: "MetLife Stadium, New Jersey",
          role: "buyer",
          counterparty: "jane.smith@example.com",
          status: "completed",
          price: 275,
          created: "2023-07-15",
          ticketTransferred: true,
          paymentReceived: true,
          agreementSigned: true,
        },
      ]);
    } finally {
      setLoadingTransfers(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="container py-12">
          <div className="max-w-md mx-auto bg-card p-6 rounded-lg shadow-md text-center">
            <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
            <p className="text-muted-foreground mb-6">
              Please sign in to access your dashboard.
            </p>
            <Button asChild>
              <Link to="/sign-in">Sign In</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-800 border-yellow-200"
          >
            Pending
          </Badge>
        );
      case "completed":
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 border-green-200"
          >
            Completed
          </Badge>
        );
      case "cancelled":
        return (
          <Badge
            variant="outline"
            className="bg-red-100 text-red-800 border-red-200"
          >
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.name || "User"}!
            </p>
          </div>
          <Button asChild>
            <Link to="/single-ticket-transfer">New Ticket Transfer</Link>
          </Button>
        </div>

        <Tabs
          defaultValue="transfers"
          className="w-full"
          onValueChange={setActiveTab}
        >
          <TabsList className="grid w-full md:w-[400px] grid-cols-2">
            <TabsTrigger value="transfers">My Transfers</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>

          <TabsContent value="transfers" className="mt-6">
            <div className="grid gap-6">
              {loadingTransfers ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                  <span className="ml-2">Loading your transfers...</span>
                </div>
              ) : transferError ? (
                <div className="text-center py-8">
                  <p className="text-red-500">{transferError}</p>
                  <Button
                    onClick={() => fetchUserTransactions(user?.sub)}
                    className="mt-4"
                  >
                    Try Again
                  </Button>
                </div>
              ) : transfers.length > 0 ? (
                transfers.map((transfer) => (
                  <Card key={transfer.id}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{transfer.eventName}</CardTitle>
                          <CardDescription>
                            {transfer.venue} •{" "}
                            {new Date(transfer.eventDate).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        {getStatusBadge(transfer.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium">
                            Transfer Details
                          </p>
                          <ul className="mt-2 space-y-1 text-sm">
                            <li className="flex justify-between">
                              <span className="text-muted-foreground">
                                Role:
                              </span>
                              <span className="font-medium capitalize">
                                {transfer.role}
                              </span>
                            </li>
                            <li className="flex justify-between">
                              <span className="text-muted-foreground">
                                {transfer.role === "seller"
                                  ? "Buyer"
                                  : "Seller"}
                                :
                              </span>
                              <span className="font-medium">
                                {transfer.counterparty}
                              </span>
                            </li>
                            <li className="flex justify-between">
                              <span className="text-muted-foreground">
                                Price:
                              </span>
                              <span className="font-medium">
                                ${transfer.price.toFixed(2)}
                              </span>
                            </li>
                            <li className="flex justify-between">
                              <span className="text-muted-foreground">
                                Created:
                              </span>
                              <span className="font-medium">
                                {new Date(
                                  transfer.created,
                                ).toLocaleDateString()}
                              </span>
                            </li>
                          </ul>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Progress</p>
                          <ul className="mt-2 space-y-2 text-sm">
                            <li className="flex items-center gap-2">
                              {transfer.agreementSigned ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <Clock className="h-4 w-4 text-yellow-500" />
                              )}
                              <span>
                                Agreement{" "}
                                {transfer.agreementSigned
                                  ? "signed"
                                  : "pending"}
                              </span>
                            </li>
                            <li className="flex items-center gap-2">
                              {transfer.ticketTransferred ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <Clock className="h-4 w-4 text-yellow-500" />
                              )}
                              <span>
                                Ticket{" "}
                                {transfer.ticketTransferred
                                  ? "transferred"
                                  : "pending"}
                              </span>
                            </li>
                            <li className="flex items-center gap-2">
                              {transfer.paymentReceived ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <Clock className="h-4 w-4 text-yellow-500" />
                              )}
                              <span>
                                Payment{" "}
                                {transfer.paymentReceived
                                  ? "received"
                                  : "pending"}
                              </span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button asChild className="w-full">
                        <Link
                          to={`/transaction/${transfer.id}`}
                          className="flex items-center justify-center gap-2"
                        >
                          View Details <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>No transfers yet</CardTitle>
                    <CardDescription>
                      You haven't initiated any ticket transfers yet.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-center text-muted-foreground py-8">
                      Start by creating a new ticket transfer to buy or sell
                      tickets securely.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button asChild className="w-full">
                      <Link to="/single-ticket-transfer">
                        Create New Transfer
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="account" className="mt-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>
                    Manage your account details and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium">Profile</p>
                      <ul className="mt-2 space-y-1">
                        <li className="flex justify-between">
                          <span className="text-muted-foreground">Name:</span>
                          <span className="font-medium">{user?.name}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-muted-foreground">Email:</span>
                          <span className="font-medium">{user?.email}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Profile Editor */}
              <div className="mt-6">
                <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
                <div className="bg-card rounded-lg shadow">
                  {/* Import the ProfileEditor component */}
                  {isAuthenticated && user && <ProfileEditor />}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Dashboard;
