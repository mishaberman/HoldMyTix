// Mock API functions for development
// These will be replaced with actual API calls when backend is implemented

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
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    let filteredListings = [...mockListings];

    // Apply filters if provided
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
  } catch (error) {
    console.error("Error fetching listings:", error);
    return { data: null, error };
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
    await new Promise((resolve) => setTimeout(resolve, 500));

    const newListing = {
      id: `listing-${Date.now()}`,
      ...listingData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    mockListings.push(newListing);
    return { data: [newListing], error: null };
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
    await new Promise((resolve) => setTimeout(resolve, 500));

    const userTransactions = mockTransactions.filter(
      (tx) => tx.seller_id === userId || tx.buyer_id === userId,
    );

    return { data: userTransactions, error: null };
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
    await new Promise((resolve) => setTimeout(resolve, 500));

    const newTransaction = {
      id: `tx-${Date.now()}`,
      ...transactionData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    mockTransactions.push(newTransaction);
    return { data: newTransaction, error: null };
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
  await new Promise((resolve) => setTimeout(resolve, 300));
  return {
    data: { id: `agreement-${Date.now()}`, ...agreementData },
    error: null,
  };
};

export const updateDocuSignAgreement = async (id: string, updates: any) => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return { data: { id, ...updates }, error: null };
};

export const createEmailNotification = async (emailData: any) => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return { data: { id: `email-${Date.now()}`, ...emailData }, error: null };
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
