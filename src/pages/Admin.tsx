import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Loader2, Eye, Trash2, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Admin = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const navigate = useNavigate();
  const [adminStats, setAdminStats] = useState(null);
  const [allTransfers, setAllTransfers] = useState([]);
  const [loadingAdminData, setLoadingAdminData] = useState(false);
  const [error, setError] = useState(null);

  // Check if user is admin
  useEffect(() => {
    if (isAuthenticated && user?.email !== "mishaberman@gmail.com") {
      navigate("/dashboard");
      return;
    }
    if (user?.email === "mishaberman@gmail.com") {
      fetchAdminData();
    }
  }, [user, isAuthenticated, navigate]);

  const fetchAdminData = async () => {
    setLoadingAdminData(true);
    setError(null);
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
      setError("Failed to load admin data. Please try again.");
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
      setError("Failed to update transfer status.");
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

      if (error) throw error;

      // Refresh admin data
      fetchAdminData();
    } catch (error) {
      console.error("Error deleting transfer:", error);
      setError("Failed to delete transfer. Please try again.");
    }
  };

  const triggerTicketmasterSync = async () => {
    try {
      setLoadingAdminData(true);
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get_ticketmaster_events`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
        },
      );

      const result = await response.json();
      if (result.success) {
        alert(
          `Successfully synced ${result.totalInserted} events from Ticketmaster!`,
        );
      } else {
        throw new Error(result.error || "Failed to sync events");
      }
    } catch (error) {
      console.error("Error syncing Ticketmaster events:", error);
      alert("Failed to sync Ticketmaster events. Please try again.");
    } finally {
      setLoadingAdminData(false);
    }
  };

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

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated || user?.email !== "mishaberman@gmail.com") {
    return (
      <Layout>
        <div className="container py-12">
          <div className="max-w-md mx-auto bg-card p-6 rounded-lg shadow-md text-center">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="text-muted-foreground mb-6">
              You don't have permission to access this page.
            </p>
            <Button asChild>
              <Link to="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-red-600">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Manage all ticket transfers and system operations
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchAdminData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button
              onClick={triggerTicketmasterSync}
              disabled={loadingAdminData}
            >
              {loadingAdminData ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Sync Ticketmaster Events
            </Button>
          </div>
        </div>

        {error && (
          <Alert className="mb-6 bg-red-50 border-red-200">
            <AlertTitle className="text-red-800">Error</AlertTitle>
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        {adminStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {adminStats.totalTransfers}
                </div>
                <p className="text-sm text-muted-foreground">Total Transfers</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-yellow-600">
                  {adminStats.pendingTransfers}
                </div>
                <p className="text-sm text-muted-foreground">Pending</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">
                  {adminStats.completedTransfers}
                </div>
                <p className="text-sm text-muted-foreground">Completed</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-purple-600">
                  ${adminStats.totalRevenue.toFixed(2)}
                </div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Transfers List */}
        <Card>
          <CardHeader>
            <CardTitle>All Transfers</CardTitle>
            <CardDescription>
              Manage and update transfer statuses
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingAdminData ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading transfers...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {allTransfers.map((transfer) => (
                  <div
                    key={transfer.id}
                    className="border rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">{transfer.event_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {transfer.venue} •{" "}
                          {new Date(transfer.event_date).toLocaleDateString()}
                        </p>
                      </div>
                      {getStatusBadge(transfer.status)}
                    </div>
                    <div className="grid md:grid-cols-3 gap-4 text-sm mb-4">
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
                          {new Date(transfer.created_at).toLocaleDateString()}
                        </p>
                        <p>
                          <strong>Payment Verified:</strong>{" "}
                          {transfer.payment_verified ? "Yes" : "No"}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/transfer/${transfer.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
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
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
                {allTransfers.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No transfers found.</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Admin;
