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
import { supabase } from "@/lib/supabase";

const Dashboard = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [activeTab, setActiveTab] = useState("transfers");
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminStats, setAdminStats] = useState(null);
  const [allTransfers, setAllTransfers] = useState([]);
  const [loadingAdminData, setLoadingAdminData] = useState(false);

  const [transfers, setTransfers] = useState([]);
  const [loadingTransfers, setLoadingTransfers] = useState(false);
  const [transferError, setTransferError] = useState(null);

  // Check if user is admin
  useEffect(() => {
    if (user?.email === "mishaberman@gmail.com") {
      setIsAdmin(true);
      fetchAdminData();
    }
  }, [user]);

  const fetchAdminData = async () => {
    setLoadingAdminData(true);
    try {
      // Fetch all transfers for admin view
      const { data: allTransfersData, error: transfersError } = await supabase
        .from("ticket_transfers")
        .select("*")
        .order("created_at", { ascending: false });

      if (transfersError) throw transfersError;
      setAllTransfers(allTransfersData || []);

      // Calculate stats
      const stats = {
        totalTransfers: allTransfersData?.length || 0,
        pendingTransfers:
          allTransfersData?.filter((t) => t.status === "pending").length || 0,
        completedTransfers:
          allTransfersData?.filter((t) => t.status === "completed").length || 0,
        totalRevenue:
          allTransfersData?.reduce((sum, t) => sum + (t.price || 0), 0) || 0,
      };
      setAdminStats(stats);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoadingAdminData(false);
    }
  };

  const updateTransferStatus = async (
    transferId: string,
    newStatus: string,
  ) => {
    try {
      const { error } = await supabase
        .from("ticket_transfers")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", transferId);

      if (error) throw error;

      // Refresh admin data
      fetchAdminData();
    } catch (error) {
      console.error("Error updating transfer status:", error);
    }
  };

  const deleteTransfer = async (transferId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this transfer? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      const { error } = await supabase
        .from("ticket_transfers")
        .delete()
        .eq("id", transferId);

      if (error) {
        throw error;
      }

      // Refresh admin data
      fetchAdminData();
      alert("Transfer deleted successfully.");
    } catch (error) {
      console.error("Error deleting transfer:", error);
      alert("Failed to delete transfer. Please try again.");
    }
  };

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

      if (data && data.length > 0) {
        // Transform the data to match our component's expected format
        const formattedTransfers = data.map((tx) => ({
          id: tx.id,
          eventName: tx.event_name,
          eventDate: tx.event_date,
          venue: tx.venue,
          role: tx.seller_id === userId ? "seller" : "buyer",
          counterparty:
            tx.seller_id === userId
              ? "buyer@example.com"
              : "seller@example.com",
          status: tx.status,
          price: tx.price,
          created: tx.created_at,
          ticketTransferred: tx.tickets_verified,
          paymentReceived: tx.payment_verified,
          agreementSigned: true,
        }));

        setTransfers(formattedTransfers);
      } else {
        // Use mock data for development
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
          <TabsList
            className={`grid w-full ${isAdmin ? "md:w-[600px] grid-cols-3" : "md:w-[400px] grid-cols-2"}`}
          >
            <TabsTrigger value="transfers">My Transfers</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
            {isAdmin && <TabsTrigger value="admin">Admin</TabsTrigger>}
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
                <ProfileEditor />
              </div>
            </div>
          </TabsContent>

          {isAdmin && (
            <TabsContent value="admin" className="mt-6">
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Admin Dashboard</CardTitle>
                    <CardDescription>
                      Manage all ticket transfers and view site statistics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loadingAdminData ? (
                      <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                        <span className="ml-2">Loading admin data...</span>
                      </div>
                    ) : adminStats ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h3 className="text-lg font-semibold text-blue-800">
                            Total Transfers
                          </h3>
                          <p className="text-2xl font-bold text-blue-600">
                            {adminStats.totalTransfers}
                          </p>
                        </div>
                        <div className="bg-yellow-50 p-4 rounded-lg">
                          <h3 className="text-lg font-semibold text-yellow-800">
                            Pending
                          </h3>
                          <p className="text-2xl font-bold text-yellow-600">
                            {adminStats.pendingTransfers}
                          </p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h3 className="text-lg font-semibold text-green-800">
                            Completed
                          </h3>
                          <p className="text-2xl font-bold text-green-600">
                            {adminStats.completedTransfers}
                          </p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <h3 className="text-lg font-semibold text-purple-800">
                            Total Revenue
                          </h3>
                          <p className="text-2xl font-bold text-purple-600">
                            ${adminStats.totalRevenue.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>All Transfers</CardTitle>
                    <CardDescription>
                      Manage and update transfer statuses
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {allTransfers.map((transfer) => (
                        <div
                          key={transfer.id}
                          className="border rounded-lg p-4"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-semibold">
                                {transfer.event_name}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {transfer.venue} •{" "}
                                {new Date(
                                  transfer.event_date,
                                ).toLocaleDateString()}
                              </p>
                            </div>
                            {getStatusBadge(transfer.status)}
                          </div>
                          <div className="grid md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <p>
                                <strong>Seller:</strong>{" "}
                                {transfer.seller_name || transfer.seller_email}
                              </p>
                              <p>
                                <strong>Buyer:</strong>{" "}
                                {transfer.buyer_name || transfer.buyer_email}
                              </p>
                            </div>
                            <div>
                              <p>
                                <strong>Price:</strong> $
                                {transfer.price?.toFixed(2) || "0.00"}
                              </p>
                              <p>
                                <strong>Tickets:</strong>{" "}
                                {transfer.ticket_quantity || 1}
                              </p>
                            </div>
                            <div>
                              <p>
                                <strong>Created:</strong>{" "}
                                {new Date(
                                  transfer.created_at,
                                ).toLocaleDateString()}
                              </p>
                              <p>
                                <strong>Payment Verified:</strong>{" "}
                                {transfer.payment_verified ? "Yes" : "No"}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                updateTransferStatus(transfer.id, "completed")
                              }
                              disabled={transfer.status === "completed"}
                            >
                              Mark Complete
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                updateTransferStatus(transfer.id, "cancelled")
                              }
                              disabled={transfer.status === "cancelled"}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                updateTransferStatus(transfer.id, "pending")
                              }
                              disabled={transfer.status === "pending"}
                            >
                              Reset to Pending
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteTransfer(transfer.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </Layout>
  );
};

export default Dashboard;
