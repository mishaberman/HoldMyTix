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
    if (!listing) {
      throw new Error("Listing not found");
    }

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

    // Ensure required fields are present
    if (!listingData.event_name || !listingData.venue || !listingData.price) {
      throw new Error(
        "Missing required fields: event_name, venue, and price are required",
      );
    }

    const newListing: TicketTransferInsert = {
      contract_id: `contract-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      event_name: listingData.event_name,
      event_date: listingData.event_date || new Date().toISOString(),
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
    console.log(`Fetching transaction with ID: ${id}`);

    // First try to fetch from ticket_transfers table
    const { data: transfer, error: transferError } = await supabase
      .from("ticket_transfers")
      .select("*")
      .eq("id", id)
      .single();

    if (transferError) {
      console.error("Error fetching from ticket_transfers:", transferError);

      // If not found in ticket_transfers, try transactions table
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

    if (transfer) {
      console.log("Found transfer:", transfer);
      // Transform ticket_transfer data to match expected transaction format
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
    }

    throw new Error("Transaction not found");
  } catch (error) {
    console.error(`Error fetching transaction ${id}:`, error);
    return { data: null, error };
  }
};

export const createTransaction = async (transactionData: any) => {
  try {
    console.log("Creating transaction with data:", transactionData);

    // Ensure user exists in users table before creating transaction
    if (transactionData.seller_id) {
      const { data: existingUser, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("id", transactionData.seller_id)
        .single();

      if (userError && userError.code === "PGRST116") {
        // User doesn't exist, create them
        console.log("Creating missing seller user:", transactionData.seller_id);
        const { error: createUserError } = await supabase.from("users").insert({
          id: transactionData.seller_id,
          email: transactionData.seller_email || "unknown@example.com",
          full_name: transactionData.seller_name || "Unknown User",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (createUserError) {
          console.error("Error creating seller user:", createUserError);
        }
      }
    }

    if (transactionData.buyer_id) {
      const { data: existingUser, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("id", transactionData.buyer_id)
        .single();

      if (userError && userError.code === "PGRST116") {
        // User doesn't exist, create them
        console.log("Creating missing buyer user:", transactionData.buyer_id);
        const { error: createUserError } = await supabase.from("users").insert({
          id: transactionData.buyer_id,
          email: transactionData.buyer_email || "unknown@example.com",
          full_name: transactionData.buyer_name || "Unknown User",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (createUserError) {
          console.error("Error creating buyer user:", createUserError);
        }
      }
    }

    // Insert into Supabase ticket_transfers table with all fields
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
      console.error("Supabase error:", error);
      throw error;
    }

    console.log("Transaction created successfully:", data);
    return { data, error: null };
  } catch (error) {
    console.error("Error creating transaction:", error);
    return { data: null, error };
  }
};

export const updateTransaction = async (
  id: string,
  updates: Partial<TicketTransferUpdate>,
) => {
  try {
    const { data, error } = await supabase
      .from("ticket_transfers")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase error in updateTransaction:", error);
      throw error;
    }

    console.log("Transaction updated successfully:", data);
    return { data, error: null };
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

// Admin functions
export const deleteTransfer = async (id: string) => {
  try {
    const { error } = await supabase
      .from("ticket_transfers")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }

    return { success: true, error: null };
  } catch (error) {
    console.error(`Error deleting transfer ${id}:`, error);
    return { success: false, error };
  }
};

export const getAllTransfers = async () => {
  try {
    const { data, error } = await supabase
      .from("ticket_transfers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error("Error fetching all transfers:", error);
    return { data: [], error };
  }
};

// Search Ticketmaster events
export const searchTicketmasterEvents = async (query: string) => {
  try {
    let queryBuilder = supabase
      .from("ticketmaster_events")
      .select("*")
      .limit(20);

    if (query && query.length >= 2) {
      queryBuilder = queryBuilder.or(
        `name.ilike.%${query}%,venues->>name.ilike.%${query}%`,
      );
    }

    const { data, error } = await queryBuilder;

    if (error) {
      console.error("Error searching events:", error);
      return { data: [], error };
    }

    // Get distinct event names to avoid duplicates
    const uniqueEvents = new Map();
    (data || []).forEach((event) => {
      const eventName = event.name;
      if (!uniqueEvents.has(eventName)) {
        uniqueEvents.set(eventName, {
          id: event.id,
          name: event.name,
          venue: event.venues?.[0]?.name || "Unknown Venue",
          city: event.venues?.[0]?.city?.name || "Unknown City",
          state: event.venues?.[0]?.state?.stateCode || "",
          date: event.dates?.start?.localDate || "",
          time: event.dates?.start?.localTime || "",
          url: event.url,
          images: event.images || [],
          priceRanges: event.price_ranges || [],
        });
      }
    });

    return { data: Array.from(uniqueEvents.values()), error: null };
  } catch (error) {
    console.error("Error searching Ticketmaster events:", error);
    return { data: [], error };
  }
};

export const getDistinctTicketmasterEvents = async () => {
  try {
    const { data, error } = await supabase
      .from("ticketmaster_events")
      .select("name, venues, dates, images, price_ranges, url")
      .order("name");

    if (error) {
      console.error("Error fetching distinct events:", error);
      return { data: [], error };
    }

    // Get distinct event names
    const uniqueEvents = new Map();
    (data || []).forEach((event) => {
      const eventName = event.name;
      if (!uniqueEvents.has(eventName)) {
        uniqueEvents.set(eventName, {
          name: event.name,
          venue: event.venues?.[0]?.name || "Unknown Venue",
          city: event.venues?.[0]?.city?.name || "Unknown City",
          state: event.venues?.[0]?.state?.stateCode || "",
          date: event.dates?.start?.localDate || "",
          time: event.dates?.start?.localTime || "",
          url: event.url,
          images: event.images || [],
          priceRanges: event.price_ranges || [],
        });
      }
    });

    return { data: Array.from(uniqueEvents.values()), error: null };
  } catch (error) {
    console.error("Error fetching distinct Ticketmaster events:", error);
    return { data: [], error };
  }
};

export const archiveAllExistingTransfers = async () => {
  try {
    const { error } = await supabase
      .from("ticket_transfers")
      .update({ archived: true, updated_at: new Date().toISOString() })
      .eq("archived", false);

    if (error) {
      throw error;
    }

    return { success: true, error: null };
  } catch (error) {
    console.error("Error archiving transfers:", error);
    return { success: false, error };
  }
};

// Create a new ticket transfer request
export const createTicketTransfer = async (transferData: {
  buyer_name: string;
  buyer_email: string;
  seller_name: string;
  seller_email: string;
  event_name: string;
  event_date: string;
  venue: string;
  ticket_details: string;
  price: number;
  payment_method: string;
  status?: string;
}) => {
  try {
    console.log("Creating ticket transfer with data:", transferData);

    const now = new Date().toISOString();
    const transferWithDefaults = {
      contract_id: `contract-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      buyer_name: transferData.buyer_name,
      buyer_email: transferData.buyer_email,
      seller_name: transferData.seller_name,
      seller_email: transferData.seller_email,
      event_name: transferData.event_name,
      event_date: transferData.event_date,
      venue: transferData.venue,
      seat_details: transferData.ticket_details,
      price: transferData.price,
      payment_method: transferData.payment_method,
      status: transferData.status || "pending",
      ticket_quantity: 1,
      created_at: now,
      updated_at: now,
    };

    const { data, error } = await supabase
      .from("ticket_transfers")
      .insert([transferWithDefaults])
      .select("*")
      .single();

    if (error) {
      console.error("Supabase error creating ticket transfer:", error);
      throw error;
    }

    console.log("Ticket transfer created successfully:", data);
    return { data, error: null };
  } catch (error) {
    console.error("Error creating ticket transfer:", error);
    return { data: null, error };
  }
};
