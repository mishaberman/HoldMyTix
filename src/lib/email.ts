import { supabase } from "@/lib/supabase";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const sendEmail = async (emailType: string, data: any) => {
  try {
    console.log("Sending email:", { emailType, data });

    const response = await fetch(`${SUPABASE_URL}/functions/v1/send_email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        emailType,
        data,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Email API error:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      throw new Error(
        `Email API error: ${response.status} ${response.statusText}`,
      );
    }

    const result = await response.json();
    console.log("Email sent successfully:", result);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: error.message };
  }
};

export const sendSellerInstructions = async (
  sellerEmail: string,
  buyerName: string,
  eventName: string,
) => {
  return await sendEmail("seller_instructions", {
    sellerEmail,
    buyerName,
    eventName,
  });
};

export const sendBuyerInstructions = async (
  buyerEmail: string,
  sellerName: string,
  eventName: string,
  price: number,
) => {
  return await sendEmail("buyer_instructions", {
    buyerEmail,
    sellerName,
    eventName,
    price,
  });
};

export const sendTicketTransferRequest = async (
  eventName: string,
  eventDateTime: string,
  venue: string,
  ticketDetails: string,
  totalPrice: number,
  sellerName: string,
  sellerEmail: string,
  buyerName: string,
  buyerEmail: string,
) => {
  return await sendEmail("ticket_transfer_request", {
    eventName,
    eventDateTime,
    venue,
    ticketDetails,
    totalPrice,
    sellerName,
    sellerEmail,
    buyerName,
    buyerEmail,
  });
};

export const sendAdminNotification = async (
  eventName: string,
  sellerEmail: string,
  buyerEmail: string,
) => {
  return await sendEmail("admin_notification", {
    eventName,
    sellerEmail,
    buyerEmail,
  });
};

export const sendTransferRequestEmails = async (transferData: any) => {
  try {
    const baseUrl = window.location.origin;
    const transferId = transferData.id;

    // Send confirmation email to buyer
    const buyerResult = await sendEmail("buyer_confirmation", {
      buyerEmail: transferData.buyer_email,
      eventName: transferData.event_name,
      sellerName: transferData.seller_name,
      amount: transferData.price,
      confirmationLink: `${baseUrl}/transfer/${transferId}?role=buyer`,
    });

    // Send confirmation email to seller
    const sellerResult = await sendEmail("seller_confirmation", {
      sellerEmail: transferData.seller_email,
      eventName: transferData.event_name,
      buyerName: transferData.buyer_name,
      confirmationLink: `${baseUrl}/transfer/${transferId}?role=seller`,
    });

    return {
      success: buyerResult.success && sellerResult.success,
      buyerResult,
      sellerResult,
    };
  } catch (error) {
    console.error("Error sending transfer request emails:", error);
    return { success: false, error: error.message };
  }
};
