import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, CreditCardIcon, Loader2 } from "lucide-react";
import ListingCard from "./ListingCard";
import { supabase } from "@/lib/supabase";

interface Listing {
  id: string;
  eventName: string;
  eventDate: string;
  venue: string;
  location: string;
  price: number;
  quantity: number;
  section: string;
  row: string;
  seats: string;
  sellerRating: number;
  paymentMethods: string[];
  verified: boolean;
  imageUrl: string;
}

interface ListingGridProps {
  listings?: Listing[];
  onFilterChange?: (filters: any) => void;
  onSearch?: (query: string) => void;
}

const ListingGrid = ({
  listings: propListings,
  onFilterChange,
  onSearch,
}: ListingGridProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [eventType, setEventType] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If listings are provided as props, use those
    if (propListings) {
      setListings(propListings);
      return;
    }

    // Otherwise fetch from API
    fetchEvents();
  }, [propListings, eventType, sortBy, searchQuery]);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);

    try {
      const { getDistinctTicketmasterEvents } = await import("@/lib/api");
      const { data, error } = await getDistinctTicketmasterEvents();

      if (error) {
        console.error("Error fetching events:", error);
        setError("Failed to load events. Please try again later.");
        setListings([]);
      } else {
        // Transform Ticketmaster events to listing format
        const transformedListings = (data || [])
          .slice(0, 12)
          .map((event: any, index: number) => ({
            id: `tm-${index}`,
            eventName: event.name,
            eventDate: event.date
              ? `${event.date}T20:00:00`
              : new Date().toISOString(),
            venue: event.venue || "Unknown Venue",
            location: `${event.city}${event.state ? `, ${event.state}` : ""}`,
            price: Math.floor(Math.random() * 300) + 50, // Random price for demo
            quantity: Math.floor(Math.random() * 4) + 1,
            section: "TBD",
            row: "TBD",
            seats: "TBD",
            sellerRating: 4.5 + Math.random() * 0.5,
            paymentMethods: ["Venmo", "PayPal"],
            verified: true,
            imageUrl:
              event.images?.[0]?.url ||
              "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&q=80",
          }));
        setListings(transformedListings);
      }
    } catch (err) {
      console.error("Error fetching events:", err);
      setError("Failed to load events. Please try again later.");
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (onSearch) {
      onSearch(query);
    } else {
      // If no onSearch prop, handle search internally
      // Debounce the search to avoid too many API calls
      const timeoutId = setTimeout(() => fetchEvents(), 500);
      return () => clearTimeout(timeoutId);
    }
  };

  const handleEventTypeChange = (value: string) => {
    setEventType(value);
    if (onFilterChange) {
      onFilterChange({ eventType: value, sortBy });
    }
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    if (onFilterChange) {
      onFilterChange({ eventType, sortBy: value });
    }
  };

  return (
    <div className="w-full bg-background p-4 md:p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Available Tickets</h2>
        <p className="text-muted-foreground">
          Browse secure ticket listings from verified sellers
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search events, artists, or venues"
            className="pl-10"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>

        <div className="flex gap-2">
          <Select value={eventType} onValueChange={handleEventTypeChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Event Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              <SelectItem value="concerts">Concerts</SelectItem>
              <SelectItem value="sports">Sports</SelectItem>
              <SelectItem value="theater">Theater</SelectItem>
              <SelectItem value="festivals">Festivals</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date: Soonest</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Seller Rating</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="all" className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="nearby">Nearby</TabsTrigger>
          <TabsTrigger value="this-weekend">This Weekend</TabsTrigger>
        </TabsList>

        <div className="flex gap-2 mt-4 flex-wrap">
          <Badge variant="outline" className="cursor-pointer hover:bg-accent">
            <Filter className="h-3 w-3 mr-1" /> Filters
          </Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-accent">
            Verified Sellers
          </Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-accent">
            Instant Transfer
          </Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-accent">
            Multiple Tickets
          </Badge>
        </div>
      </Tabs>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading events...</span>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500">{error}</p>
          <button
            onClick={fetchEvents}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {listings.length > 0 ? (
            listings.map((listing) => (
              <ListingCard
                key={listing.id}
                id={listing.id}
                title={listing.eventName}
                date={listing.eventDate}
                location={`${listing.venue}, ${listing.location}`}
                price={listing.price}
                image={listing.imageUrl}
                seller={{
                  name: `Seller ${listing.id}`,
                  rating: listing.sellerRating,
                  avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=seller${listing.id}`,
                }}
                paymentMethods={listing.paymentMethods.map((method) => ({
                  name: method,
                  icon: <CreditCardIcon className="h-4 w-4" />,
                }))}
                verified={listing.verified}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <h3 className="text-lg font-medium">Coming Soon</h3>
              <p className="text-muted-foreground mt-2">
                The marketplace will be available soon. For now, use our secure
                single ticket transfer service.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Default mock data for development and preview
const defaultListings: Listing[] = [
  {
    id: "1",
    eventName: "Taylor Swift - The Eras Tour",
    eventDate: "2023-08-15T19:00:00",
    venue: "SoFi Stadium",
    location: "Los Angeles, CA",
    price: 350,
    quantity: 2,
    section: "134",
    row: "G",
    seats: "12-13",
    sellerRating: 4.9,
    paymentMethods: ["Venmo", "PayPal"],
    verified: true,
    imageUrl:
      "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&q=80",
  },
  {
    id: "2",
    eventName: "Lakers vs. Warriors",
    eventDate: "2023-08-20T18:30:00",
    venue: "Crypto.com Arena",
    location: "Los Angeles, CA",
    price: 175,
    quantity: 4,
    section: "217",
    row: "C",
    seats: "5-8",
    sellerRating: 4.7,
    paymentMethods: ["Venmo", "Zelle"],
    verified: true,
    imageUrl:
      "https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=800&q=80",
  },
  {
    id: "3",
    eventName: "Hamilton",
    eventDate: "2023-09-05T19:30:00",
    venue: "Pantages Theatre",
    location: "Los Angeles, CA",
    price: 225,
    quantity: 2,
    section: "Orchestra",
    row: "J",
    seats: "101-102",
    sellerRating: 4.5,
    paymentMethods: ["PayPal", "Zelle"],
    verified: true,
    imageUrl:
      "https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&q=80",
  },
  {
    id: "4",
    eventName: "Coachella Music Festival",
    eventDate: "2023-04-14T12:00:00",
    venue: "Empire Polo Club",
    location: "Indio, CA",
    price: 450,
    quantity: 1,
    section: "GA",
    row: "",
    seats: "",
    sellerRating: 4.8,
    paymentMethods: ["Venmo", "PayPal", "Zelle"],
    verified: true,
    imageUrl:
      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80",
  },
  {
    id: "5",
    eventName: "Bad Bunny - World's Hottest Tour",
    eventDate: "2023-09-30T20:00:00",
    venue: "SoFi Stadium",
    location: "Los Angeles, CA",
    price: 280,
    quantity: 3,
    section: "230",
    row: "D",
    seats: "15-17",
    sellerRating: 4.6,
    paymentMethods: ["Venmo", "Zelle"],
    verified: false,
    imageUrl:
      "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&q=80",
  },
  {
    id: "6",
    eventName: "Dodgers vs. Giants",
    eventDate: "2023-08-25T19:10:00",
    venue: "Dodger Stadium",
    location: "Los Angeles, CA",
    price: 85,
    quantity: 2,
    section: "Loge",
    row: "125",
    seats: "5-6",
    sellerRating: 4.3,
    paymentMethods: ["PayPal"],
    verified: true,
    imageUrl:
      "https://images.unsplash.com/photo-1562771379-eafdca7a02f8?w=800&q=80",
  },
];

export default ListingGrid;
