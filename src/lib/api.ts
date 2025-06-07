import { supabase } from "@/lib/supabase";
import { Database } from "@/types/supabase";

const TIMEZONE = "America/Los_Angeles"; // Not used, but kept for reference

type TicketTransferInsert =
  Database["public"]["Tables"]["ticket_transfers"]["Insert"];
type TicketTransferUpdate =
  Database["public"]["Tables"]["ticket_transfers"]["Update"];

// Mock data for development
const mockListings = [
  {
    id: "1",
    event_name: "Taylor Swift - The Eras Tour",
    event_date: "2023-08-15T19:00:00",
    venue: "SoFi Stadium",
    location: "Los Angeles, CA",
    price: 350,
    quantity: 2,
    section: "134",
    row: "G",
    seats: "12-13",
    payment_methods: ["Venmo", "PayPal"],
    verified: true,
    status: "active",
    image_url:
      "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&q=80",
    seller_id: "user1",
  },
  {
    id: "2",
    event_name: "Lakers vs. Warriors",
    event_date: "2023-08-20T18:30:00",
    venue: "Crypto.com Arena",
    location: "Los Angeles, CA",
    price: 175,
    quantity: 4,
    section: "217",
    row: "C",
    seats: "5-8",
    payment_methods: ["Venmo", "Zelle"],
    verified: true,
    status: "active",
    image_url:
      "https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=800&q=80",
    seller_id: "user2",
  },
];

const mockTransactions = [
  {
    id: "tx-1",
    contract_id: "TIX-12345",
    event_name: "Taylor Swift | The Eras Tour",
    event_date: "2023-08-15T19:00:00",
    venue: "SoFi Stadium, Los Angeles",
    seat_details: "Section 134, Row G, Seats 12-13",
    ticket_quantity: 2,
    price: 700,
    payment_method: "Venmo",
    status: "active",
    payment_verified: false,
    tickets_verified: true,
    seller_id: "user1",
    buyer_id: "user2",
    created_at: "2023-07-20T10:00:00Z",
  },
];

// Listings API
export const getListings = async (filters?: {
  eventType?: string;
  sortBy?: string;
  searchQuery?: string;
}) => {
  try {
    let query = supabase
      .from("ticket_transfers")
      .select("*")
      .eq("status", "active");

    if (filters?.searchQuery) {
      query = query.or(
        `event_name.ilike.%${filters.searchQuery}%,venue.ilike.%${filters.searchQuery}%`,
      );
    }

    if (filters?.sortBy === "price") {
      query = query.order("price", { ascending: true });
    } else if (filters?.sortBy === "date") {
      query = query.order("event_date", { ascending: true });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase error in getListings:", error);
      throw error;
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error("Error fetching listings:", error);
    return { data: [], error };
  }
};

export const getListingById = async (id: string) => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const listing = mockListings.find((l) => l.id === id);
    if (!listing) throw new Error("Listing not found");
    return { data: listing, error: null };
  } catch (error) {
    console.error(`Error fetching listing ${id}:`, error);
    return { data: null, error };
  }
};

export const createListing = async (
  listingData: Partial<TicketTransferInsert>,
) => {
  try {
    const now = new Date().toISOString();

    if (!listingData.event_name || !listingData.venue || !listingData.price) {
      throw new Error(
        "Missing required fields: event_name, venue, and price are required",
      );
    }

    const newListing: TicketTransferInsert = {
      contract_id: `contract-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      event_name: listingData.event_name,
      event_date: listingData.event_date || now,
      venue: listingData.venue,
      price: listingData.price,
      ticket_quantity: listingData.ticket_quantity || 1,
      status: "active",
      seller_id: listingData.seller_id || null,
      seller_name: listingData.seller_name || null,
      seller_email: listingData.seller_email || null,
      seat_details: listingData.seat_details || null,
      payment_method: listingData.payment_method || null,
      ticket_provider: listingData.ticket_provider || null,
      ticket_notes: listingData.ticket_notes || null,
      created_at: now,
      updated_at: now,
    };

    const { data, error } = await supabase
      .from("ticket_transfers")
      .insert(newListing)
      .select()
      .single();

    if (error) {
      console.error("Supabase error in createListing:", error);
      throw error;
    }

    console.log("Successfully created listing:", data);
    return { data, error: null };
  } catch (error) {
    console.error("Error creating listing:", error);
    return { data: null, error };
  }
};

export const updateListing = async (id: string, updates: any) => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const listingIndex = mockListings.findIndex((l) => l.id === id);
    if (listingIndex === -1) throw new Error("Listing not found");

    mockListings[listingIndex] = {
      ...mockListings[listingIndex],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    return { data: [mockListings[listingIndex]], error: null };
  } catch (error) {
    console.error(`Error updating listing ${id}:`, error);
    return { data: null, error };
  }
};

// Transactions API
export const getUserTransactions = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("ticket_transfers")
      .select("*")
      .or(`seller_id.eq.${userId},buyer_id.eq.${userId}`);

    if (error) throw error;

    return { data: data || [], error: null };
  } catch (error) {
    console.error(`Error fetching transactions for user ${userId}:`, error);
    return { data: null, error };
  }
};

export const getTransactionById = async (id: string) => {
  try {
    console.log(`Fetching transaction with ID: ${id}`);

    const { data: transfer, error: transferError } = await supabase
      .from("ticket_transfers")
      .select("*")
      .eq("id", id)
      .single();

    if (transferError) {
      console.error("Error fetching from ticket_transfers:", transferError);

      const { data: transaction, error: transactionError } = await supabase
        .from("transactions")
        .select("*")
        .eq("id", id)
        .single();

      if (transactionError) {
        console.error("Error fetching from transactions:", transactionError);
        throw new Error("Transaction not found in either table");
      }

      return { data: transaction, error: null };
    }

    const transformedData = {
      id: transfer.id,
      contract_id: transfer.contract_id,
      event_name: transfer.event_name,
      event_date: transfer.event_date,
      venue: transfer.venue,
      seat_details: transfer.seat_details,
      ticket_quantity: transfer.ticket_quantity,
      price: transfer.price,
      payment_method: transfer.payment_method,
      status: transfer.status,
      payment_verified: transfer.payment_verified || false,
      tickets_verified: transfer.tickets_verified || false,
      seller_id: transfer.seller_id,
      buyer_id: transfer.buyer_id,
      seller_name: transfer.seller_name,
      seller_email: transfer.seller_email,
      buyer_name: transfer.buyer_name,
      buyer_email: transfer.buyer_email,
      created_at: transfer.created_at,
      updated_at: transfer.updated_at,
      time_remaining: transfer.time_remaining,
      expiration_time: transfer.expiration_time,
    };

    return { data: transformedData, error: null };
  } catch (error) {
    console.error(`Error fetching transaction ${id}:`, error);
    return { data: null, error };
  }
};
