// === Imports and Types ===
import { supabase } from "@/lib/supabase";
import { Database } from "@/types/supabase";

type TicketTransferInsert =
  Database["public"]["Tables"]["ticket_transfers"]["Insert"];
type TicketTransferUpdate =
  Database["public"]["Tables"]["ticket_transfers"]["Update"];

// === (Mock data and other existing APIs above here...) ===

// === Exported utility APIs ===

// 1. getDistinctTicketmasterEvents
export const getDistinctTicketmasterEvents = async () => {
  try {
    const { data, error } = await supabase
      .from("ticketmaster_events")
      .select("name, venues, dates, images, price_ranges, url")
      .order("name");
    if (error) throw error;

    const uniqueEvents = new Map<string, any>();
    data?.forEach((event) => {
      if (!uniqueEvents.has(event.name)) {
        uniqueEvents.set(event.name, {
          name: event.name,
          venue: event.venues?.[0]?.name || "Unknown Venue",
          city: event.venues?.[0]?.city?.name || "Unknown City",
          state: event.venues?.[0]?.state?.stateCode || "",
          date: (event.dates as any)?.start?.localDate || "",
          time: (event.dates as any)?.start?.localTime || "",
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

// 2. searchTicketmasterEvents
export const searchTicketmasterEvents = async (query: string) => {
  try {
    let qb = supabase.from("ticketmaster_events").select("*").limit(20);

    if (query.length >= 2) {
      qb = qb.ilike("name", `%${query}%`);
    }

    const { data, error } = await qb;
    if (error) throw error;

    const unique = new Map<string, any>();
    data?.forEach((event) => {
      if (!unique.has(event.name)) {
        unique.set(event.name, {
          id: event.id,
          name: event.name,
          venue: event.venues?.[0]?.name || "Unknown Venue",
          city: event.venues?.[0]?.city?.name || "Unknown City",
          state: event.venues?.[0]?.state?.stateCode || "",
          date: (event.dates as any)?.start?.localDate || "",
          time: (event.dates as any)?.start?.localTime || "",
          url: event.url,
          images: event.images || [],
          priceRanges: event.price_ranges || [],
        });
      }
    });

    return { data: Array.from(unique.values()), error: null };
  } catch (error) {
    console.error("Error searching Ticketmaster events:", error);
    return { data: [], error };
  }
};

// 3. archiveAllExistingTransfers
export const archiveAllExistingTransfers = async () => {
  try {
    const { error } = await supabase
      .from("ticket_transfers")
      .update({
        archived: true,
        updated_at: new Date().toISOString(),
      })
      .eq("archived", false);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error("Error archiving transfers:", error);
    return { success: false, error };
  }
};

// === Your createTicketTransfer, createTransaction, createDocuSignAgreement, createEmailNotification ===

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
    
    // Validate required fields
    if (!transferData.event_name || !transferData.buyer_email || !transferData.seller_email) {
      throw new Error("Missing required fields: event_name, buyer_email, or seller_email");
    }
    
    // Ensure proper ISO format
    const asDate = new Date(transferData.event_date);
    if (isNaN(asDate.getTime())) {
      throw new Error(`Invalid event_date format: ${transferData.event_date}`);
    }
    const formattedEventDate = asDate.toISOString();

    const now = new Date().toISOString();
    const transferWithDefaults: Partial<TicketTransferInsert> = {
      contract_id: `contract-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`,
      buyer_name: transferData.buyer_name,
      buyer_email: transferData.buyer_email,
      seller_name: transferData.seller_name,
      seller_email: transferData.seller_email,
      event_name: transferData.event_name,
      event_date: formattedEventDate,
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
      .insert(transferWithDefaults)
      .select("*")
      .single();

    if (error) throw error;
    console.log("Ticket transfer created successfully:", data);
    return { data, error: null };
  } catch (error) {
    console.error("Error creating ticket transfer:", error);
    return { data: null, error };
  }
};

export const createTransaction = async (transactionData: any) => {
  try {
    console.log("Creating transaction:", transactionData);
    const now = new Date().toISOString();

    // Ensure seller exists - use upsert to handle existing users
    if (transactionData.seller_id) {
      const { error: userErr } = await supabase
        .from("users")
        .upsert({
          id: transactionData.seller_id,
          email: transactionData.seller_email || "unknown@example.com",
          full_name: transactionData.seller_name || "Unknown User",
          updated_at: now,
        }, {
          onConflict: 'id'
        });
      if (userErr) throw userErr;
    }

    if (transactionData.buyer_id) {
      const { error: buyerErr } = await supabase
        .from("users")
        .upsert({
          id: transactionData.buyer_id,
          email: transactionData.buyer_email || "unknown@example.com",
          full_name: transactionData.buyer_name || "Unknown User",
          updated_at: now,
        }, {
          onConflict: 'id'
        });
      if (buyerErr) throw buyerErr;
    }

    const { data, error } = await supabase
      .from("ticket_transfers")
      .insert({
        ...transactionData,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (error) throw error;
    console.log("Transaction created:", data);
    return { data, error: null };
  } catch (error) {
    console.error("Error creating transaction:", error);
    return { data: null, error };
  }
};

export const createDocuSignAgreement = async (agreementData: any) => {
  try {
    const { data, error } = await supabase
      .from("docusign_agreements")
      .insert(agreementData)
      .select()
      .single();
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error creating DocuSign agreement:", error);
    return { data: null, error };
  }
};

export const createEmailNotification = async (emailData: any) => {
  try {
    const { data, error } = await supabase
      .from("email_notifications")
      .insert(emailData)
      .select()
      .single();
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error creating email notification:", error);
    return { data: null, error };
  }
};

// === getUserTransactions function ===
export const getUserTransactions = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("ticket_transfers")
      .select("*")
      .or(`seller_id.eq.${userId},buyer_id.eq.${userId}`)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error fetching user transactions:", error);
    return { data: [], error };
  }
};

// === Additional missing functions ===
export const getListings = async () => {
  try {
    const { data, error } = await supabase
      .from("ticket_transfers")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error fetching listings:", error);
    return { data: [], error };
  }
};

export const getListingById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from("ticket_transfers")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error fetching listing:", error);
    return { data: null, error };
  }
};

export const createListing = async (listingData: any) => {
  try {
    const { data, error } = await supabase
      .from("ticket_transfers")
      .insert(listingData)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error creating listing:", error);
    return { data: null, error };
  }
};

export const updateListing = async (id: string, updates: any) => {
  try {
    const { data, error } = await supabase
      .from("ticket_transfers")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error updating listing:", error);
    return { data: null, error };
  }
};

export const getTransactionById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from("ticket_transfers")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error fetching transaction:", error);
    return { data: null, error };
  }
};

export const updateTransaction = async (id: string, updates: Partial<TicketTransferUpdate>) => {
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

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error updating transaction:", error);
    return { data: null, error };
  }
};

export const deleteTransfer = async (id: string) => {
  try {
    const { error } = await supabase
      .from("ticket_transfers")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error("Error deleting transfer:", error);
    return { success: false, error };
  }
};

export const getAllTransfers = async () => {
  try {
    const { data, error } = await supabase
      .from("ticket_transfers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error fetching all transfers:", error);
    return { data: [], error };
  }
};
