import { supabase } from "./supabase";

// Listings API
export const getListings = async (filters?: any) => {
  try {
    let query = supabase.from("listings").select("*");

    // Apply filters if provided
    if (filters) {
      if (filters.eventType && filters.eventType !== "all") {
        query = query.ilike("event_name", `%${filters.eventType}%`);
      }

      if (filters.searchQuery) {
        query = query.or(
          `event_name.ilike.%${filters.searchQuery}%,venue.ilike.%${filters.searchQuery}%,location.ilike.%${filters.searchQuery}%`,
        );
      }

      // Apply sorting
      if (filters.sortBy) {
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
      }
    }

    // Only get active listings by default
    query = query.eq("status", "active");

    const { data, error } = await query;

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error("Error fetching listings:", error);
    return { data: null, error };
  }
};

export const getListingById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from("listings")
      .select("*, users!listings_seller_id_fkey(full_name, avatar_url)")
      .eq("id", id)
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error(`Error fetching listing ${id}:`, error);
    return { data: null, error };
  }
};

export const createListing = async (listingData: any) => {
  try {
    const { data, error } = await supabase
      .from("listings")
      .insert([listingData])
      .select();

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
      .from("listings")
      .update(updates)
      .eq("id", id)
      .select();

    if (error) throw error;

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
      .from("transactions")
      .select(
        `
        *,
        seller:seller_id(full_name, avatar_url),
        buyer:buyer_id(full_name, avatar_url),
        listing:listing_id(*),
        docusign_agreements(*),
        ticket_transfers(*),
        payment_records(*)
      `,
      )
      .or(`seller_id.eq.${userId},buyer_id.eq.${userId}`)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error(`Error fetching transactions for user ${userId}:`, error);
    return { data: null, error };
  }
};

export const getTransactionById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from("transactions")
      .select(
        `
        *,
        seller:seller_id(full_name, avatar_url),
        buyer:buyer_id(full_name, avatar_url),
        listing:listing_id(*),
        docusign_agreements(*),
        ticket_transfers(*),
        payment_records(*),
        email_notifications(*)
      `,
      )
      .eq("id", id)
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error(`Error fetching transaction ${id}:`, error);
    return { data: null, error };
  }
};

export const createTransaction = async (transactionData: any) => {
  try {
    const { data, error } = await supabase
      .from("transactions")
      .insert([transactionData])
      .select();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error("Error creating transaction:", error);
    return { data: null, error };
  }
};

export const updateTransaction = async (id: string, updates: any) => {
  try {
    const { data, error } = await supabase
      .from("transactions")
      .update(updates)
      .eq("id", id)
      .select();

    if (error) throw error;

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
      .insert([agreementData])
      .select();

    if (error) throw error;

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
      .update(updates)
      .eq("id", id)
      .select();

    if (error) throw error;

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
      .insert([emailData])
      .select();

    if (error) throw error;

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
      .select();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error(`Error updating email notification ${id}:`, error);
    return { data: null, error };
  }
};

// Ticket Transfers API
export const createTicketTransfer = async (transferData: any) => {
  try {
    const { data, error } = await supabase
      .from("ticket_transfers")
      .insert([transferData])
      .select();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error("Error creating ticket transfer:", error);
    return { data: null, error };
  }
};

export const updateTicketTransfer = async (id: string, updates: any) => {
  try {
    const { data, error } = await supabase
      .from("ticket_transfers")
      .update(updates)
      .eq("id", id)
      .select();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error(`Error updating ticket transfer ${id}:`, error);
    return { data: null, error };
  }
};

// Payment Records API
export const createPaymentRecord = async (paymentData: any) => {
  try {
    const { data, error } = await supabase
      .from("payment_records")
      .insert([paymentData])
      .select();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error("Error creating payment record:", error);
    return { data: null, error };
  }
};

export const updatePaymentRecord = async (id: string, updates: any) => {
  try {
    const { data, error } = await supabase
      .from("payment_records")
      .update(updates)
      .eq("id", id)
      .select();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error(`Error updating payment record ${id}:`, error);
    return { data: null, error };
  }
};
