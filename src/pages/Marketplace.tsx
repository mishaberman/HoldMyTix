import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Clock, ArrowRight, Loader2 } from "lucide-react";
import { trackSearch, trackViewContent, getEnhancedUserData } from "@/lib/facebook-pixel";
import { useAuth0 } from "@auth0/auth0-react";

const Marketplace = () => {
  const { user, isAuthenticated } = useAuth0();
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userData = isAuthenticated ? getEnhancedUserData(user) : getEnhancedUserData();

  useEffect(() => {
    fetchTicketmasterEvents();
  }, []);

  const fetchTicketmasterEvents = async () => {
    try {
      setLoading(true);
      const { getDistinctTicketmasterEvents } = await import("@/lib/api");
      const { data, error } = await getDistinctTicketmasterEvents();

      if (error) {
        console.error("Error fetching events:", error);
        setError("Failed to load events");
      } else {
        // Transform Ticketmaster events for display
        const transformedEvents = (data || [])
          .slice(0, 6)
          .map((event, index) => ({
            id: `tm-${index}`,
            name: event.name,
            date: event.date || new Date().toISOString().split("T")[0],
            venue: `${event.venue}, ${event.city}${event.state ? `, ${event.state}` : ""}`,
            imageUrl:
              event.images?.[0]?.url ||
              "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&q=80",
            listingsCount: Math.floor(Math.random() * 30) + 5,
            priceRange: `${Math.floor(Math.random() * 200) + 50} - ${Math.floor(Math.random() * 800) + 200}`,
          }));
        setUpcomingEvents(transformedEvents);
      }
    } catch (err) {
      console.error("Error fetching Ticketmaster events:", err);
      setError("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = () => {
    // Track search event
    if (searchTerm.trim()) {
      trackSearch(searchTerm, userData);
    }

    // Implement search functionality
    console.log("Searching for:", searchTerm);
  };

  useEffect(() => {
    // Track page view
    if (typeof fbq !== 'undefined') {
      fbq('track', 'PageView', {
        content_name: 'Marketplace',
        content_category: 'marketplace'
      });
    }
  }, []);

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Ticket Marketplace</h1>
            <p className="text-muted-foreground">
              Browse and purchase tickets securely from other fans.
            </p>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex items-center justify-center bg-yellow-100 rounded-full p-3">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-xl font-bold text-yellow-800">Coming Soon</h2>
              <p className="text-yellow-700">
                Our full marketplace is under development. For now, you can use
                our secure single ticket transfer service.
              </p>
            </div>
            <Button asChild className="whitespace-nowrap">
              <Link to="/single-ticket-transfer">Try Single Transfer</Link>
            </Button>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-4">Preview: Popular Events</h2>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-lg">Loading events...</span>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={fetchTicketmasterEvents} variant="outline">
              Try Again
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((event) => (
              <Card
                key={event.id}
                className="overflow-hidden"
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src={event.imageUrl}
                    alt={event.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{event.name}</CardTitle>
                  <CardDescription>
                    {new Date(event.date).toLocaleDateString()} • {event.venue}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex justify-between items-center">
                    <Badge variant="outline" className="bg-muted">
                      {event.listingsCount} listings
                    </Badge>
                    <span className="text-sm font-medium">
                      {event.priceRange}
                    </span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" disabled>
                    <span className="flex items-center gap-2">
                      Coming Soon <ArrowRight className="h-4 w-4" />
                    </span>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Marketplace;