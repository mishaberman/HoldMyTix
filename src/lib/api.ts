
import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/supabase";

type TicketTransfer = Database['public']['Tables']['ticket_transfers']['Row'];
type TicketTransferInsert = Database['public']['Tables']['ticket_transfers']['Insert'];
type TicketTransferUpdate = Database['public']['Tables']['ticket_transfers']['Update'];

// Listings API - using ticket_transfers table as the source
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
      query = query.or(`event_name.ilike.%${filters.searchQuery}%,venue.ilike.%${filters.searchQuery}%`);
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
      throw error;
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error("Error fetching listings:", error);
    return { data: null, error };
  }
};

export const getListingById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from("ticket_transfers")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error(`Error fetching listing ${id}:`, error);
    return { data: null, error };
  }
};

export const createListing = async (listingData: Partial<TicketTransferInsert>) => {
  try {
    const now = new Date().toISOString();
    const newListing: TicketTransferInsert = {
      contract_id: `contract-${Date.now()}`,
      event_name: listingData.event_name || "",
      event_date: listingData.event_date || new Date().toISOString(),
      venue: listingData.venue || "",
      price: listingData.price || 0,
      ticket_quantity: listingData.ticket_quantity || 1,
      status: "active",
      seller_id: listingData.seller_id,
      seller_name: listingData.seller_name,
      seller_email: listingData.seller_email,
      seat_details: listingData.seat_details,
      payment_method: listingData.payment_method,
      ticket_provider: listingData.ticket_provider,
      ticket_notes: listingData.ticket_notes,
      created_at: now,
      updated_at: now,
      ...listingData,
    };

    const { data, error } = await supabase
      .from("ticket_transfers")
      .insert(newListing)
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

export const updateListing = async (id: string, updates: Partial<TicketTransferUpdate>) => {
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
      throw error;
    }

    return { data, error: null };
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
      .or(`seller_id.eq.${userId},buyer_id.eq.${userId}`)
      .order("created_at", { ascending: false });

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
    const { data, error } = await supabase
      .from("ticket_transfers")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error(`Error fetching transaction ${id}:`, error);
    return { data: null, error };
  }
};

export const createTransaction = async (transactionData: Partial<TicketTransferInsert>) => {
  try {
    const now = new Date().toISOString();
    const expirationTime = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour from now
    
    const newTransaction: TicketTransferInsert = {
      contract_id: `contract-${Date.now()}`,
      event_name: transactionData.event_name || "",
      event_date: transactionData.event_date || new Date().toISOString(),
      venue: transactionData.venue || "",
      price: transactionData.price || 0,
      ticket_quantity: transactionData.ticket_quantity || 1,
      status: "pending",
      payment_verified: false,
      tickets_verified: false,
      time_remaining: 60,
      expiration_time: expirationTime,
      created_at: now,
      updated_at: now,
      ...transactionData,
    };

    const { data, error } = await supabase
      .from("ticket_transfers")
      .insert(newTransaction)
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

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error(`Error updating transaction ${id}:`, error);
    return { data: null, error };
  }
};

// DocuSign Agreements API
export const createDocuSignAgreement = async (agreementData: any) => {
  try {
    const { data, error } = await supabase
      .from("docusign_agreements")
      .insert({
        ...agreementData,
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
    console.error("Error creating DocuSign agreement:", error);
    return { data: null, error };
  }
};

export const updateDocuSignAgreement = async (id: string, updates: any) => {
  try {
    const { data, error } = await supabase
      .from("docusign_agreements")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error(`Error updating DocuSign agreement ${id}:`, error);
    return { data: null, error };
  }
};

// Email Notifications API
export const createEmailNotification = async (emailData: any) => {
  try {
    const { data, error } = await supabase
      .from("email_notifications")
      .insert({
        ...emailData,
        created_at: new Date().toISOString(),
      })
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
  try {
    const { data, error } = await supabase
      .from("email_notifications")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error(`Error updating email notification ${id}:`, error);
    return { data: null, error };
  }
};

export const createTicketTransfer = async (transferData: Partial<TicketTransferInsert>) => {
  return createTransaction(transferData);
};
