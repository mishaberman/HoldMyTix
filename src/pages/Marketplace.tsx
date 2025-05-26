import React from "react";
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
import { Clock, ArrowRight } from "lucide-react";

const Marketplace = () => {
  // Mock data for upcoming events
  const upcomingEvents = [
    {
      id: "ev-1",
      name: "Taylor Swift | The Eras Tour",
      date: "2023-08-15",
      venue: "SoFi Stadium, Los Angeles",
      imageUrl:
        "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&q=80",
      listingsCount: 24,
      priceRange: "$250 - $1,200",
    },
    {
      id: "ev-2",
      name: "Beyoncé | Renaissance World Tour",
      date: "2023-09-02",
      venue: "MetLife Stadium, New Jersey",
      imageUrl:
        "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80",
      listingsCount: 18,
      priceRange: "$180 - $950",
    },
    {
      id: "ev-3",
      name: "Bad Bunny | Most Wanted Tour",
      date: "2023-10-14",
      venue: "T-Mobile Arena, Las Vegas",
      imageUrl:
        "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&q=80",
      listingsCount: 12,
      priceRange: "$150 - $800",
    },
  ];

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcomingEvents.map((event) => (
            <Card key={event.id} className="overflow-hidden">
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
      </div>
    </Layout>
  );
};

export default Marketplace;
