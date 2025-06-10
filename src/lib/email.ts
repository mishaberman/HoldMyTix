// Client-side email functions that call our serverless API
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

interface EmailData {
  to: string;
  subject: string;
  body: string;
}

const callEmailAPI = async (
  emailType: string,
  data: any,
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  try {
    console.log("Calling email API with:", { emailType, data });

    if (!SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      throw new Error("Missing Supabase configuration for email API");
    }

    const response = await fetch(`${SUPABASE_URL}/functions/v1/send_email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        emailType,
        data,
      }),
    });

    console.log("Email API response status:", response.status);

    const result = await response.json();
    console.log("Email API result:", result);

    if (!response.ok) {
      console.error("Email API error:", result);
      throw new Error(result.error || "Failed to send email");
    }

    return result;
  } catch (error) {
    console.error("Error calling email API:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    };
  }
};

export const sendEmail = async (
  data: EmailData,
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  // This function is deprecated in favor of specific email functions
  console.warn(
    "sendEmail is deprecated. Use specific email functions instead.",
  );
  return { success: false, error: "Function deprecated" };
};

export const sendSellerInstructions = async (
  sellerEmail: string,
  buyerName: string,
  eventName: string,
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  return callEmailAPI("seller_instructions", {
    sellerEmail,
    buyerName,
    eventName,
  });
};

export const sendBuyerInstructions = async (
  buyerEmail: string,
  sellerName: string,
  eventName: string,
  amount: number,
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  return callEmailAPI("buyer_instructions", {
    buyerEmail,
    sellerName,
    eventName,
    amount,
  });
};

export const sendAdminNotification = async (
  eventName: string,
  sellerEmail: string,
  buyerEmail: string,
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  return callEmailAPI("admin_notification", {
    eventName,
    sellerEmail,
    buyerEmail,
  });
};

export const sendTicketTransferRequest = async (
  eventName: string,
  eventDate: string,
  venue: string,
  ticketDetails: string,
  price: number,
  sellerName: string,
  sellerEmail: string,
  buyerName: string,
  buyerEmail: string,
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  return callEmailAPI("ticket_transfer_request", {
    eventName,
    eventDate,
    venue,
    ticketDetails,
    price,
    sellerName,
    sellerEmail,
    buyerName,
    buyerEmail,
  });
};

export const sendContactUsEmail = async (
  name: string,
  email: string,
  phone: string,
  subject: string,
  message: string,
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  return callEmailAPI("contact_us", {
    name,
    email,
    phone,
    subject,
    message,
  });
};
