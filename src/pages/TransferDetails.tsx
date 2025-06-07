import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";
import {
  Loader2,
  ArrowLeft,
  Calendar,
  MapPin,
  User,
  DollarSign,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const TransferDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [transfer, setTransfer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (id) {
      fetchTransferDetails(id);
    }
  }, [id]);

  const fetchTransferDetails = async (transferId: string) => {
    setLoading(true);
    setError(null);

    try {
      // Fetch transfer details
      const { data: transferData, error: transferError } = await supabase
        .from("ticket_transfers")
        .select("*")
        .eq("id", transferId)
        .single();

      if (transferError) throw transferError;
      setTransfer(transferData);

      // Fetch related logs (email notifications, docusign agreements, etc.)
      const { data: emailLogs, error: emailError } = await supabase
        .from("email_notifications")
        .select("*")
        .eq("transaction_id", transferId)
        .order("created_at", { ascending: false });

      const { data: docusignLogs, error: docusignError } = await supabase
        .from("docusign_agreements")
        .select("*")
        .eq("transaction_id", transferId)
        .order("created_at", { ascending: false });

      // Combine logs with more detailed information
      const combinedLogs = [
        ...(emailLogs || []).map((log) => ({
          ...log,
          type: "email",
          description: `Email sent: ${log.email_type}`,
          details: {
            recipient: log.recipient_id,
            messageId: log.message_id,
            emailType: log.email_type,
          },
        })),
        ...(docusignLogs || []).map((log) => ({
          ...log,
          type: "docusign",
          description: `DocuSign agreement: ${log.status}`,
          details: {
            envelopeId: log.envelope_id,
            documentUrl: log.document_url,
            sellerStatus: log.seller_status,
            buyerStatus: log.buyer_status,
          },
        })),
        {
          id: "created",
          type: "system",
          description: "Transfer created",
          created_at: transferData.created_at,
          status: "completed",
          details: {
            contractId: transferData.contract_id,
            initialStatus: "pending",
            price: transferData.price,
            ticketQuantity: transferData.ticket_quantity,
          },
        },
        // Add status change logs if admin notes exist
        ...(transferData.admin_notes
          ? [
              {
                id: "admin_update",
                type: "admin",
                description: "Admin update",
                created_at: transferData.updated_at,
                status: "completed",
                details: {
                  notes: transferData.admin_notes,
                  currentStatus: transferData.status,
                },
              },
            ]
          : []),
      ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      setLogs(combinedLogs);
    } catch (err) {
      console.error(`Error fetching transfer details ${id}:`, err);
      setError(`Failed to load transfer details. Please try again later.`);
    } finally {
      setLoading(false);
    }
  };

  const updateTransferStatus = async (newStatus: string) => {
    try {
      const { error } = await supabase
        .from("ticket_transfers")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      // Refresh transfer details
      fetchTransferDetails(id);
    } catch (error) {
      console.error("Error updating transfer status:", error);
      setError("Failed to update transfer status.");
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

  const getLogIcon = (type: string) => {
    switch (type) {
      case "email":
        return "📧";
      case "docusign":
        return "📄";
      case "system":
        return "⚙️";
      case "admin":
        return "👨‍💼";
      default:
        return "📝";
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8 flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-lg">Loading transfer details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="container py-8 flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-lg">Loading transfer details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !transfer) {
    return (
      <Layout>
        <div className="container py-8">
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error || "Transfer not found"}</AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  const isAdmin = user?.email === "mishaberman@gmail.com";

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            onClick={() => navigate(isAdmin ? "/admin" : "/dashboard")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to {isAdmin ? "Admin" : "Dashboard"}
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Transfer Details</h1>
            <p className="text-muted-foreground">ID: {transfer.id}</p>
          </div>
          {getStatusBadge(transfer.status)}
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="logs">Activity Logs</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Event Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Event Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {transfer.event_name}
                    </h3>
                    <p className="text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {transfer.venue}
                    </p>
                    <p className="text-muted-foreground">
                      {new Date(transfer.event_date).toLocaleDateString()}
                      {transfer.event_time && ` at ${transfer.event_time}`}
                    </p>
                  </div>
                  {transfer.seat_details && (
                    <div>
                      <p className="font-medium">Seat Details</p>
                      <p>{transfer.seat_details}</p>
                    </div>
                  )}
                  <div>
                    <p className="font-medium">Quantity</p>
                    <p>{transfer.ticket_quantity} ticket(s)</p>
                  </div>
                </CardContent>
              </Card>

              {/* Financial Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Financial Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Total Price:</span>
                    <span className="font-bold text-lg">
                      ${transfer.price?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Price per ticket:</span>
                    <span>
                      $
                      {(
                        (transfer.price || 0) / (transfer.ticket_quantity || 1)
                      ).toFixed(2)}
                    </span>
                  </div>
                  {transfer.payment_method && (
                    <div className="flex justify-between items-center">
                      <span>Payment method:</span>
                      <span>{transfer.payment_method}</span>
                    </div>
                  )}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Payment Received:</span>
                      <Badge
                        variant={
                          transfer.payment_received ? "default" : "secondary"
                        }
                      >
                        {transfer.payment_received ? "Yes" : "No"}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Payment Sent:</span>
                      <Badge
                        variant={
                          transfer.payment_sent ? "default" : "secondary"
                        }
                      >
                        {transfer.payment_sent ? "Yes" : "No"}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Ticket Received:</span>
                      <Badge
                        variant={
                          transfer.ticket_received ? "default" : "secondary"
                        }
                      >
                        {transfer.ticket_received ? "Yes" : "No"}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Ticket Sent:</span>
                      <Badge
                        variant={transfer.ticket_sent ? "default" : "secondary"}
                      >
                        {transfer.ticket_sent ? "Yes" : "No"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Parties Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Seller Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <p className="font-medium">Name:</p>
                    <p>{transfer.seller_name || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="font-medium">Email:</p>
                    <p>{transfer.seller_email || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="font-medium">Ticketmaster Email:</p>
                    <p>
                      {transfer.seller_ticketmaster_email || "Not provided"}
                    </p>
                  </div>
                  {transfer.seller_id && (
                    <div>
                      <p className="font-medium">User ID:</p>
                      <p className="text-xs text-muted-foreground">
                        {transfer.seller_id}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Buyer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <p className="font-medium">Name:</p>
                    <p>{transfer.buyer_name || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="font-medium">Email:</p>
                    <p>{transfer.buyer_email || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="font-medium">Ticketmaster Email:</p>
                    <p>{transfer.buyer_ticketmaster_email || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="font-medium">Payment Details:</p>
                    <p>{transfer.payment_method_details || "Not provided"}</p>
                  </div>
                  {transfer.buyer_id && (
                    <div>
                      <p className="font-medium">User ID:</p>
                      <p className="text-xs text-muted-foreground">
                        {transfer.buyer_id}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="logs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Activity Timeline</CardTitle>
                <CardDescription>
                  Complete history of actions and events for this transfer
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {logs.map((log, index) => (
                    <div
                      key={log.id || index}
                      className="flex gap-4 p-4 border rounded-lg"
                    >
                      <div className="text-2xl">{getLogIcon(log.type)}</div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{log.description}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(log.created_at).toLocaleString()}
                            </p>
                          </div>
                          {log.status && (
                            <Badge variant="outline" className="ml-2">
                              {log.status}
                            </Badge>
                          )}
                        </div>
                        {log.details && (
                          <div className="mt-2 text-xs text-muted-foreground space-y-1">
                            {log.details.messageId && (
                              <p>Message ID: {log.details.messageId}</p>
                            )}
                            {log.details.envelopeId && (
                              <p>Envelope ID: {log.details.envelopeId}</p>
                            )}
                            {log.details.contractId && (
                              <p>Contract ID: {log.details.contractId}</p>
                            )}
                            {log.details.notes && (
                              <p className="bg-blue-50 p-2 rounded text-blue-800">
                                <strong>Admin Notes:</strong>{" "}
                                {log.details.notes}
                              </p>
                            )}
                            {log.details.emailType && (
                              <p>Email Type: {log.details.emailType}</p>
                            )}
                            {log.details.price && (
                              <p>Amount: ${log.details.price.toFixed(2)}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {logs.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        No activity logs found.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actions" className="space-y-4">
            {isAdmin && (
              <Card>
                <CardHeader>
                  <CardTitle>Admin Actions</CardTitle>
                  <CardDescription>
                    Update transfer status and manage the transaction
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      onClick={() => updateTransferStatus("completed")}
                      disabled={transfer.status === "completed"}
                    >
                      Mark Complete
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => updateTransferStatus("cancelled")}
                      disabled={transfer.status === "cancelled"}
                    >
                      Cancel Transfer
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => updateTransferStatus("pending")}
                      disabled={transfer.status === "pending"}
                    >
                      Reset to Pending
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Transfer Information</CardTitle>
                <CardDescription>
                  Technical details and metadata
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Contract ID:</p>
                    <p className="text-muted-foreground">
                      {transfer.contract_id}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Created:</p>
                    <p className="text-muted-foreground">
                      {new Date(transfer.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Last Updated:</p>
                    <p className="text-muted-foreground">
                      {new Date(transfer.updated_at).toLocaleString()}
                    </p>
                  </div>
                  {transfer.expiration_time && (
                    <div>
                      <p className="font-medium">Expiration:</p>
                      <p className="text-muted-foreground">
                        {new Date(transfer.expiration_time).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default TransferDetails;
