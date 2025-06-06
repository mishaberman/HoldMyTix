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
  const [showArchived, setShowArchived] = useState(false);
  const [ticketmasterEvents, setTicketmasterEvents] = useState([]);
  const [activeView, setActiveView] = useState("transfers");
  const [editingTransfer, setEditingTransfer] = useState(null);
  const [editForm, setEditForm] = useState({ status: "", admin_notes: "" });

  // Check if user is admin
  useEffect(() => {
    if (
      isAuthenticated &&
      user?.email !== "mishaberman@gmail.com" &&
      user?.email !== "austen.dewolf@hover.to"
    ) {
      navigate("/dashboard");
      return;
    }
    if (
      user?.email === "mishaberman@gmail.com" ||
      user?.email === "austen.dewolf@hover.to"
    ) {
      fetchAdminData();
      if (activeView === "events") {
        fetchTicketmasterEvents();
      }
    }
  }, [user, isAuthenticated, navigate, activeView]);

  const fetchAdminData = async () => {
    setLoadingAdminData(true);
    setError(null);
    try {
      // Fetch transfers based on archived filter
      const { data: allTransfersData, error: transfersError } = await supabase
        .from("ticket_transfers")
        .select("*")
        .eq("archived", showArchived)
        .order("created_at", { ascending: false });

      if (transfersError) throw transfersError;
      setAllTransfers(allTransfersData || []);

      // Calculate stats (only for non-archived)
      const { data: allData, error: allError } = await supabase
        .from("ticket_transfers")
        .select("*")
        .eq("archived", false);

      if (!allError) {
        const stats = {
          totalTransfers: allData?.length || 0,
          pendingTransfers:
            allData?.filter((t) => t.status === "pending").length || 0,
          completedTransfers:
            allData?.filter((t) => t.status === "completed").length || 0,
          totalRevenue:
            allData?.reduce((sum, t) => sum + (t.price || 0), 0) || 0,
        };
        setAdminStats(stats);
      }
    } catch (error) {
      console.error("Error fetching admin data:", error);
      setError("Failed to load admin data. Please try again.");
    } finally {
      setLoadingAdminData(false);
    }
  };

  const fetchTicketmasterEvents = async () => {
    setLoadingAdminData(true);
    try {
      const { data, error } = await supabase
        .from("ticketmaster_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setTicketmasterEvents(data || []);
    } catch (error) {
      console.error("Error fetching Ticketmaster events:", error);
      setError("Failed to load Ticketmaster events.");
    } finally {
      setLoadingAdminData(false);
    }
  };

  // Refetch data when showArchived changes
  useEffect(() => {
    if (
      user?.email === "mishaberman@gmail.com" ||
      user?.email === "austen.dewolf@hover.to"
    ) {
      fetchAdminData();
    }
  }, [showArchived]);

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

  const archiveTransfer = async (transferId: string, archive: boolean) => {
    const action = archive ? "archive" : "unarchive";
    if (!confirm(`Are you sure you want to ${action} this transfer?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from("ticket_transfers")
        .update({
          archived: archive,
          updated_at: new Date().toISOString(),
        })
        .eq("id", transferId);

      if (error) throw error;

      // Refresh admin data
      fetchAdminData();
    } catch (error) {
      console.error(`Error ${action}ing transfer:`, error);
      setError(`Failed to ${action} transfer. Please try again.`);
    }
  };

  const updateTransferDetails = async (
    transferId: string,
    updates: { status?: string; admin_notes?: string },
  ) => {
    try {
      const { error } = await supabase
        .from("ticket_transfers")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", transferId);

      if (error) throw error;

      setEditingTransfer(null);
      setEditForm({ status: "", admin_notes: "" });
      fetchAdminData();
    } catch (error) {
      console.error("Error updating transfer details:", error);
      setError("Failed to update transfer details.");
    }
  };

  const startEditing = (transfer: any) => {
    setEditingTransfer(transfer.id);
    setEditForm({
      status: transfer.status,
      admin_notes: transfer.admin_notes || "",
    });
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

  if (
    !isAuthenticated ||
    (user?.email !== "mishaberman@gmail.com" &&
      user?.email !== "austen.dewolf@hover.to")
  ) {
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
            <Button
              onClick={() =>
                activeView === "transfers"
                  ? fetchAdminData()
                  : fetchTicketmasterEvents()
              }
              variant="outline"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            {activeView === "events" && (
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
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-6">
          <Button
            variant={activeView === "transfers" ? "default" : "outline"}
            onClick={() => setActiveView("transfers")}
          >
            Transfers
          </Button>
          <Button
            variant={activeView === "events" ? "default" : "outline"}
            onClick={() => setActiveView("events")}
          >
            Ticketmaster Events
          </Button>
        </div>

        {error && (
          <Alert className="mb-6 bg-red-50 border-red-200">
            <AlertTitle className="text-red-800">Error</AlertTitle>
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards - Only show for transfers view */}
        {activeView === "transfers" && adminStats && (
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
        {activeView === "transfers" && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>
                    {showArchived ? "Archived" : "Active"} Transfers
                  </CardTitle>
                  <CardDescription>
                    Manage and update transfer statuses
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowArchived(!showArchived)}
                >
                  {showArchived ? "Show Active" : "Show Archived"}
                </Button>
              </div>
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
                          <h4 className="font-semibold">
                            {transfer.event_name}
                          </h4>
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
                      {editingTransfer === transfer.id ? (
                        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-1">
                                Status
                              </label>
                              <select
                                value={editForm.status}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    status: e.target.value,
                                  })
                                }
                                className="w-full p-2 border rounded"
                              >
                                <option value="pending">Pending</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">
                                Admin Notes
                              </label>
                              <textarea
                                value={editForm.admin_notes}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    admin_notes: e.target.value,
                                  })
                                }
                                className="w-full p-2 border rounded"
                                rows={2}
                                placeholder="Add notes about payment, tickets, etc."
                              />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() =>
                                updateTransferDetails(transfer.id, editForm)
                              }
                            >
                              Save Changes
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingTransfer(null);
                                setEditForm({ status: "", admin_notes: "" });
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {transfer.admin_notes && (
                            <div className="bg-blue-50 p-2 rounded text-sm">
                              <strong>Admin Notes:</strong>{" "}
                              {transfer.admin_notes}
                            </div>
                          )}
                          <div className="flex gap-2 flex-wrap">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                navigate(`/transfer/${transfer.id}`)
                              }
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => startEditing(transfer)}
                            >
                              Edit Status & Notes
                            </Button>
                            <Button
                              size="sm"
                              variant={showArchived ? "default" : "destructive"}
                              onClick={() =>
                                archiveTransfer(transfer.id, !showArchived)
                              }
                            >
                              {showArchived ? "Unarchive" : "Archive"}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {allTransfers.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        No transfers found.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Ticketmaster Events List */}
        {activeView === "events" && (
          <Card>
            <CardHeader>
              <CardTitle>Ticketmaster Events</CardTitle>
              <CardDescription>
                Events imported from Ticketmaster API
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingAdminData ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Loading events...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {ticketmasterEvents.map((event) => (
                    <div
                      key={event.id}
                      className="border rounded-lg p-4 hover:bg-gray-50"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold">{event.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {event.venues?.[0]?.name || "Unknown Venue"} •{" "}
                            {event.venues?.[0]?.city?.name || "Unknown City"}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {event.dates?.start?.localDate || "No Date"}
                        </Badge>
                      </div>
                      <div className="grid md:grid-cols-3 gap-4 text-sm mb-4">
                        <div>
                          <p>
                            <strong>Date:</strong>{" "}
                            {event.dates?.start?.localDate || "TBD"}
                          </p>
                          <p>
                            <strong>Time:</strong>{" "}
                            {event.dates?.start?.localTime || "TBD"}
                          </p>
                        </div>
                        <div>
                          <p>
                            <strong>Genre:</strong>{" "}
                            {event.classifications?.[0]?.genre?.name ||
                              "Unknown"}
                          </p>
                          <p>
                            <strong>Segment:</strong>{" "}
                            {event.classifications?.[0]?.segment?.name ||
                              "Unknown"}
                          </p>
                        </div>
                        <div>
                          <p>
                            <strong>Price Range:</strong>{" "}
                            {event.price_ranges?.[0]
                              ? `${event.price_ranges[0].min} - ${event.price_ranges[0].max}`
                              : "Not Available"}
                          </p>
                          <p>
                            <strong>Status:</strong>{" "}
                            {event.dates?.status?.code || "Unknown"}
                          </p>
                        </div>
                      </div>
                      {event.url && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(event.url, "_blank")}
                          >
                            View on Ticketmaster
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                  {ticketmasterEvents.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        No Ticketmaster events found.
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Try syncing events using the button above.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Admin;
