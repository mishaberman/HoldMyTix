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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { getUserTransactions } from "@/lib/api";
import { Loader2, Plus, Eye, Clock, CheckCircle, XCircle } from "lucide-react";

const Dashboard = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("transfers");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [filteredTransfers, setFilteredTransfers] = useState([]);

  // Save active tab to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("dashboardActiveTab", activeTab);
    } catch (e) {
      // Handle localStorage errors gracefully
      console.warn("Could not save to localStorage:", e);
    }
  }, [activeTab]);

  // Filter transfers based on search and status
  useEffect(() => {
    let filtered = transfers;

    if (searchQuery) {
      filtered = filtered.filter(
        (transfer) =>
          transfer.eventName
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          transfer.venue?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          transfer.counterparty
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()),
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (transfer) => transfer.status === statusFilter,
      );
    }

    setFilteredTransfers(filtered);
  }, [transfers, searchQuery, statusFilter]);

  useEffect(() => {
    if (isAuthenticated && user?.sub) {
      fetchUserTransfers();
    }
  }, [isAuthenticated, user]);

  const fetchUserTransfers = async () => {
    try {
      setLoading(true);
      const { data, error } = await getUserTransactions(user.sub);

      if (error) {
        throw error;
      }

      // Transform the data to match the expected format
      const transformedTransfers = (data || []).map((transfer) => ({
        id: transfer.id,
        contractId: transfer.contract_id,
        eventName: transfer.event_name,
        eventDate: transfer.event_date,
        venue: transfer.venue,
        seatDetails: transfer.seat_details,
        ticketQuantity: transfer.ticket_quantity,
        price: transfer.price,
        paymentMethod: transfer.payment_method,
        status: transfer.status,
        paymentVerified: transfer.payment_verified,
        ticketsVerified: transfer.tickets_verified,
        isSeller: transfer.seller_id === user.sub,
        counterparty:
          transfer.seller_id === user.sub
            ? transfer.buyer_name
            : transfer.seller_name,
        createdAt: transfer.created_at,
        timeRemaining: transfer.time_remaining,
        expirationTime: transfer.expiration_time,
      }));

      setTransfers(transformedTransfers);
    } catch (error) {
      console.error("Error fetching user transfers:", error);
      setError("Failed to load your transfers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
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
        <div className="container py-8 flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-lg">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="max-w-md mx-auto bg-card p-6 rounded-lg shadow-md text-center">
            <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
            <p className="text-muted-foreground mb-6">
              Please sign in to view your dashboard.
            </p>
            <Button asChild>
              <Link to="/sign-in">Sign In</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.name || user?.email}!
            </p>
          </div>
          <Button asChild>
            <Link to="/single-ticket-transfer">
              <Plus className="h-4 w-4 mr-2" />
              New Transfer
            </Link>
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="transfers">My Transfers</TabsTrigger>
            <TabsTrigger value="selling">Selling</TabsTrigger>
            <TabsTrigger value="buying">Buying</TabsTrigger>
          </TabsList>

          <TabsContent value="transfers" className="mt-6">
            {/* Search and Filter Controls */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search transfers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="grid gap-6">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Loading transfers...</span>
                </div>
              ) : filteredTransfers.length > 0 ? (
                filteredTransfers.map((transfer) => (
                  <Card
                    key={transfer.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {getStatusIcon(transfer.status)}
                            {transfer.eventName}
                          </CardTitle>
                          <CardDescription>
                            {transfer.venue} •{" "}
                            {new Date(transfer.eventDate).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        {getStatusBadge(transfer.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Role</p>
                          <p className="font-medium">
                            {transfer.isSeller ? "Seller" : "Buyer"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Price</p>
                          <p className="font-medium">
                            ${transfer.price?.toFixed(2) || "0.00"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Quantity
                          </p>
                          <p className="font-medium">
                            {transfer.ticketQuantity || 1} ticket(s)
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {transfer.isSeller ? "Buyer" : "Seller"}:{" "}
                            {transfer.counterparty || "TBD"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Created:{" "}
                            {new Date(transfer.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/transfer/${transfer.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : transfers.length > 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No transfers match your search criteria.
                  </p>
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <h3 className="text-lg font-semibold mb-2">
                      No transfers yet
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Start your first secure ticket transfer today.
                    </p>
                    <Button asChild>
                      <Link to="/single-ticket-transfer">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Transfer
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="selling" className="mt-6">
            <div className="grid gap-6">
              {transfers.filter((t) => t.isSeller).length > 0 ? (
                transfers
                  .filter((t) => t.isSeller)
                  .map((transfer) => (
                    <Card
                      key={transfer.id}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              {getStatusIcon(transfer.status)}
                              {transfer.eventName}
                            </CardTitle>
                            <CardDescription>
                              Selling to: {transfer.counterparty || "TBD"}
                            </CardDescription>
                          </div>
                          {getStatusBadge(transfer.status)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Price
                            </p>
                            <p className="font-medium text-green-600">
                              +${transfer.price?.toFixed(2) || "0.00"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Venue
                            </p>
                            <p className="font-medium">{transfer.venue}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Date
                            </p>
                            <p className="font-medium">
                              {new Date(
                                transfer.eventDate,
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/transfer/${transfer.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              Manage Sale
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <h3 className="text-lg font-semibold mb-2">
                      No tickets for sale
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      List your tickets for a secure transfer.
                    </p>
                    <Button asChild>
                      <Link to="/single-ticket-transfer">
                        <Plus className="h-4 w-4 mr-2" />
                        Sell Tickets
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="buying" className="mt-6">
            <div className="grid gap-6">
              {transfers.filter((t) => !t.isSeller).length > 0 ? (
                transfers
                  .filter((t) => !t.isSeller)
                  .map((transfer) => (
                    <Card
                      key={transfer.id}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              {getStatusIcon(transfer.status)}
                              {transfer.eventName}
                            </CardTitle>
                            <CardDescription>
                              Buying from: {transfer.counterparty || "TBD"}
                            </CardDescription>
                          </div>
                          {getStatusBadge(transfer.status)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Price
                            </p>
                            <p className="font-medium text-red-600">
                              -${transfer.price?.toFixed(2) || "0.00"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Venue
                            </p>
                            <p className="font-medium">{transfer.venue}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Date
                            </p>
                            <p className="font-medium">
                              {new Date(
                                transfer.eventDate,
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/transfer/${transfer.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Purchase
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <h3 className="text-lg font-semibold mb-2">
                      No ticket purchases
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Browse the marketplace for available tickets.
                    </p>
                    <Button asChild>
                      <Link to="/marketplace">Browse Tickets</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchUserTransfers}
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
