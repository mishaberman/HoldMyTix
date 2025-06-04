import { supabase } from "@/lib/supabase";

// API functions using Supabase for real data persistence

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
export const getListings = async (filters?: any) => {
  try {
    // Fetch from Supabase first
    let query = supabase.from("listings").select("*").eq("status", "active");

    // Apply search filter
    if (filters?.searchQuery) {
      const searchQuery = filters.searchQuery.toLowerCase();
      query = query.or(
        `event_name.ilike.%${searchQuery}%,venue.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%`,
      );
    }

    // Apply event type filter
    if (filters?.eventType && filters.eventType !== "all") {
      query = query.ilike("event_name", `%${filters.eventType}%`);
    }

    // Apply sorting
    if (filters?.sortBy) {
      switch (filters.sortBy) {
        case "date":
          query = query.order("event_date", { ascending: true });
          break;
        case "price-low":
          query = query.order("price", { ascending: true });
          break;
        case "price-high":
          query = query.order("price", { ascending: false });
          break;
        default:
          query = query.order("created_at", { ascending: false });
      }
    } else {
      query = query.order("created_at", { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      console.warn("Supabase error, falling back to mock data:", error);
      // Fallback to mock data if Supabase fails
      let filteredListings = [...mockListings];

      // Apply filters to mock data
      if (filters) {
        if (filters.eventType && filters.eventType !== "all") {
          filteredListings = filteredListings.filter((listing) =>
            listing.event_name
              .toLowerCase()
              .includes(filters.eventType.toLowerCase()),
          );
        }

        if (filters.searchQuery) {
          const query = filters.searchQuery.toLowerCase();
          filteredListings = filteredListings.filter(
            (listing) =>
              listing.event_name.toLowerCase().includes(query) ||
              listing.venue.toLowerCase().includes(query) ||
              listing.location.toLowerCase().includes(query),
          );
        }

        // Apply sorting
        if (filters.sortBy) {
          switch (filters.sortBy) {
            case "date":
              filteredListings.sort(
                (a, b) =>
                  new Date(a.event_date).getTime() -
                  new Date(b.event_date).getTime(),
              );
              break;
            case "price-low":
              filteredListings.sort((a, b) => a.price - b.price);
              break;
            case "price-high":
              filteredListings.sort((a, b) => b.price - a.price);
              break;
          }
        }
      }

      return { data: filteredListings, error: null };
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error("Error fetching listings:", error);
    return { data: mockListings, error: null };
  }
};

export const getListingById = async (id: string) => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const listing = mockListings.find((l) => l.id === id);
    if (!listing) {
      throw new Error("Listing not found");
    }

    return { data: listing, error: null };
  } catch (error) {
    console.error(`Error fetching listing ${id}:`, error);
    return { data: null, error };
  }
};

export const createListing = async (listingData: any) => {
  try {
    // Insert into Supabase
    const { data, error } = await supabase
      .from("listings")
      .insert({
        ...listingData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

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
    if (listingIndex === -1) {
      throw new Error("Listing not found");
    }

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
    // Fetch from Supabase
    const { data, error } = await supabase
      .from("ticket_transfers")
      .select("*")
      .or(`seller_id.eq.${userId},buyer_id.eq.${userId}`);

    if (error) {
      throw error;
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error(`Error fetching transactions for user ${userId}:`, error);
    return { data: null, error };
  }
};

export const getTransactionById = async (id: string) => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const transaction = mockTransactions.find((tx) => tx.id === id);
    if (!transaction) {
      throw new Error("Transaction not found");
    }

    return { data: transaction, error: null };
  } catch (error) {
    console.error(`Error fetching transaction ${id}:`, error);
    return { data: null, error };
  }
};

export const createTransaction = async (transactionData: any) => {
  try {
    // Insert into Supabase ticket_transfers table
    const { data, error } = await supabase
      .from("ticket_transfers")
      .insert({
        ...transactionData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error("Error creating transaction:", error);
    return { data: null, error };
  }
};

export const updateTransaction = async (id: string, updates: any) => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const transactionIndex = mockTransactions.findIndex((tx) => tx.id === id);
    if (transactionIndex === -1) {
      throw new Error("Transaction not found");
    }

    mockTransactions[transactionIndex] = {
      ...mockTransactions[transactionIndex],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    return { data: [mockTransactions[transactionIndex]], error: null };
  } catch (error) {
    console.error(`Error updating transaction ${id}:`, error);
    return { data: null, error };
  }
};

// Mock functions for other entities
export const createDocuSignAgreement = async (agreementData: any) => {
  try {
    const { data, error } = await supabase
      .from("docusign_agreements")
      .insert(agreementData)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error("Error creating DocuSign agreement:", error);
    return { data: null, error };
  }
};

export const updateDocuSignAgreement = async (id: string, updates: any) => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return { data: { id, ...updates }, error: null };
};

export const createEmailNotification = async (emailData: any) => {
  try {
    const { data, error } = await supabase
      .from("email_notifications")
      .insert(emailData)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error("Error creating email notification:", error);
    return { data: null, error };
  }
};

export const updateEmailNotification = async (id: string, updates: any) => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return { data: { id, ...updates }, error: null };
};

export const createTicketTransfer = async (transferData: any) => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return {
    data: { id: `transfer-${Date.now()}`, ...transferData },
    error: null,
  };
};

export const updateTicketTransfer = async (id: string, updates: any) => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return { data: { id, ...updates }, error: null };
};

export const createPaymentRecord = async (paymentData: any) => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return { data: { id: `payment-${Date.now()}`, ...paymentData }, error: null };
};

export const updatePaymentRecord = async (id: string, updates: any) => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return { data: { id, ...updates }, error: null };
};
