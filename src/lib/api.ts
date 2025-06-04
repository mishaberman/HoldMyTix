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
    const { data, error } = await supabase
      .from("ticket_transfers")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Supabase error in getListingById:", error);
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

    // Ensure required fields are present
    if (!listingData.event_name || !listingData.venue || !listingData.price) {
      throw new Error("Missing required fields: event_name, venue, and price are required");
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
      console.error("Supabase error in updateListing:", error);
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
      console.error("Supabase error in getUserTransactions:", error);
      throw error;
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error(`Error fetching transactions for user ${userId}:`, error);
    return { data: [], error };
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
      console.error("Supabase error in getTransactionById:", error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error(`Error fetching transaction ${id}:`, error);
    return { data: null, error };
  }
};

// Create a new transaction
export const createTransaction = async (transactionData: {
  listing_id: string
  buyer_id: string
  seller_id: string
  amount: number
  status?: 'pending' | 'payment_pending' | 'tickets_pending' | 'completed' | 'cancelled'
  payment_method?: string
  created_at?: string
}) => {
  try {
    console.log('Creating transaction with data:', transactionData)

    const transactionWithDefaults = {
      ...transactionData,
      status: transactionData.status || 'pending',
      created_at: transactionData.created_at || new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert([transactionWithDefaults])
      .select('*')
      .single()

    if (error) {
      console.error('Supabase error creating transaction:', error)
      throw error
    }

    console.log('Transaction created successfully:', data)
    return { data, error: null }
  } catch (error) {
    console.error('Error creating transaction:', error)
    return { data: null, error }
  }
}

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
      console.error("Supabase error in updateTransaction:", error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error(`Error updating transaction ${id}:`, error);
    return { data: null, error };
  }
};

// DocuSign Agreements API
export const createDocuSignAgreement = async (agreementData: {
  transaction_id?: string;
  envelope_id?: string;
  status?: string;
  document_url?: string;
  seller_status?: string;
  buyer_status?: string;
}) => {
  try {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("docusign_agreements")
      .insert({
        transaction_id: agreementData.transaction_id || null,
        envelope_id: agreementData.envelope_id || null,
        status: agreementData.status || 'sent',
        document_url: agreementData.document_url || null,
        seller_status: agreementData.seller_status || 'sent',
        buyer_status: agreementData.buyer_status || 'sent',
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase error in createDocuSignAgreement:", error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error("Error creating DocuSign agreement:", error);
    return { data: null, error };
  }
};

export const updateDocuSignAgreement = async (id: string, updates: {
  transaction_id?: string;
  envelope_id?: string;
  status?: string;
  document_url?: string;
  seller_status?: string;
  buyer_status?: string;
}) => {
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
      console.error("Supabase error in updateDocuSignAgreement:", error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error(`Error updating DocuSign agreement ${id}:`, error);
    return { data: null, error };
  }
};

// Email Notifications API
export const createEmailNotification = async (emailData: {
  transaction_id?: string;
  recipient_id?: string;
  email_type: string;
  status?: string;
  message_id?: string;
}) => {
  try {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("email_notifications")
      .insert({
        transaction_id: emailData.transaction_id || null,
        recipient_id: emailData.recipient_id || null,
        email_type: emailData.email_type,
        status: emailData.status || 'sent',
        message_id: emailData.message_id || null,
        created_at: now,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase error in createEmailNotification:", error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error("Error creating email notification:", error);
    return { data: null, error };
  }
};

export const updateEmailNotification = async (id: string, updates: {
  transaction_id?: string;
  recipient_id?: string;
  email_type?: string;
  status?: string;
  message_id?: string;
}) => {
  try {
    const { data, error } = await supabase
      .from("email_notifications")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase error in updateEmailNotification:", error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error(`Error updating email notification ${id}:`, error);
    return { data: null, error };
  }
};

// Create a new ticket transfer request
export const createTicketTransfer = async (transferData: {
  buyer_name: string
  buyer_email: string
  seller_name: string
  seller_email: string
  event_name: string
  event_date: string
  venue: string
  ticket_details: string
  price: number
  payment_method: string
  status?: string
}) => {
  try {
    console.log('Creating ticket transfer with data:', transferData)

    const transferWithDefaults = {
      ...transferData,
      status: transferData.status || 'pending',
      created_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('ticket_transfers')
      .insert([transferWithDefaults])
      .select('*')
      .single()

    if (error) {
      console.error('Supabase error creating ticket transfer:', error)
      throw error
    }

    console.log('Ticket transfer created successfully:', data)
    return { data, error: null }
  } catch (error) {
    console.error('Error creating ticket transfer:', error)
    return { data: null, error }
  }
}