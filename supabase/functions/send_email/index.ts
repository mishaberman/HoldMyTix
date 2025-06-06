import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE",
  "Access-Control-Max-Age": "86400",
};

// Email templates
const generateSellerInstructionsHTML = (
  buyerName: string,
  eventName: string,
) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #2563eb; margin: 0;">🎫 HoldMyTix</h1>
      <p style="color: #6b7280; margin: 5px 0 0 0;">Secure Ticket Transfer Instructions</p>
    </div>
    
    <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <h2 style="color: #1f2937; margin-top: 0;">Hello!</h2>
      <p style="color: #374151; line-height: 1.6;">Thank you for using HoldMyTix to securely transfer your ticket to <strong>${buyerName}</strong>.</p>
    </div>
    
    <div style="margin-bottom: 30px;">
      <h3 style="color: #1f2937;">📋 Transfer Instructions</h3>
      <p style="color: #374151; margin-bottom: 15px;">Please follow these steps to complete the transfer:</p>
      
      <ol style="color: #374151; line-height: 1.8; padding-left: 20px;">
        <li>Log in to your ticket provider account (Ticketmaster, StubHub, etc.)</li>
        <li>Locate your ticket for <strong>${eventName}</strong></li>
        <li>Select the transfer option</li>
        <li>Enter the following email address: <strong>transfer@holdmytix.com</strong></li>
        <li>Complete the transfer process</li>
      </ol>
    </div>
    
    <div style="background: #ecfdf5; border: 1px solid #d1fae5; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
      <p style="color: #065f46; margin: 0; font-weight: 500;">✅ Once we verify that the ticket has been transferred to our secure account, we will release the payment to you.</p>
    </div>
    
    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 14px;">Questions? Contact us at <a href="mailto:support@holdmytix.com" style="color: #2563eb;">support@holdmytix.com</a></p>
      <p style="color: #6b7280; font-size: 14px; margin-top: 10px;">Thank you,<br>The HoldMyTix Team</p>
    </div>
  </div>
`;

const generateBuyerInstructionsHTML = (
  sellerName: string,
  eventName: string,
  amount: number,
) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #2563eb; margin: 0;">🎫 HoldMyTix</h1>
      <p style="color: #6b7280; margin: 5px 0 0 0;">Secure Ticket Purchase Instructions</p>
    </div>
    
    <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <h2 style="color: #1f2937; margin-top: 0;">Hello!</h2>
      <p style="color: #374151; line-height: 1.6;"><strong>${sellerName}</strong> has initiated a secure ticket transfer to you for <strong>${eventName}</strong> through HoldMyTix.</p>
    </div>
    
    <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <h3 style="color: #1e40af; margin-top: 0;">💰 Payment Amount</h3>
      <p style="color: #1e40af; font-size: 24px; font-weight: bold; margin: 0;">$${amount.toFixed(2)}</p>
    </div>
    
    <div style="margin-bottom: 30px;">
      <h3 style="color: #1f2937;">💳 Payment Instructions</h3>
      <p style="color: #374151; margin-bottom: 15px;">To complete your purchase, please follow these steps:</p>
      
      <ol style="color: #374151; line-height: 1.8; padding-left: 20px;">
        <li>Log in to your HoldMyTix account</li>
        <li>Go to your Transaction Dashboard</li>
        <li>Find the transaction for <strong>${eventName}</strong></li>
        <li>Click on "Make Payment"</li>
        <li>Complete the payment of <strong>$${amount.toFixed(2)}</strong></li>
      </ol>
    </div>
    
    <div style="background: #ecfdf5; border: 1px solid #d1fae5; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
      <p style="color: #065f46; margin: 0; font-weight: 500;">🔒 Once your payment is verified, we will ensure the ticket is transferred to you securely.</p>
    </div>
    
    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 14px;">Questions? Contact us at <a href="mailto:support@holdmytix.com" style="color: #2563eb;">support@holdmytix.com</a></p>
      <p style="color: #6b7280; font-size: 14px; margin-top: 10px;">Thank you,<br>The HoldMyTix Team</p>
    </div>
  </div>
`;

const generateAdminNotificationHTML = (
  eventName: string,
  sellerEmail: string,
  buyerEmail: string,
) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #dc2626; margin: 0;">🚨 Admin Alert</h1>
      <p style="color: #6b7280; margin: 5px 0 0 0;">New Ticket Transfer Initiated</p>
    </div>
    
    <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <h2 style="color: #991b1b; margin-top: 0;">Transfer Details</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #374151; font-weight: 500;">Event:</td>
          <td style="padding: 8px 0; color: #1f2937;"><strong>${eventName}</strong></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #374151; font-weight: 500;">Seller:</td>
          <td style="padding: 8px 0; color: #1f2937;">${sellerEmail}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #374151; font-weight: 500;">Buyer:</td>
          <td style="padding: 8px 0; color: #1f2937;">${buyerEmail}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #374151; font-weight: 500;">Time:</td>
          <td style="padding: 8px 0; color: #1f2937;">${new Date().toLocaleString()}</td>
        </tr>
      </table>
    </div>
    
    <div style="background: #fffbeb; border: 1px solid #fed7aa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
      <p style="color: #92400e; margin: 0; font-weight: 500;">⚠️ Please monitor this transaction in the admin dashboard and ensure both parties complete their required actions.</p>
    </div>
    
    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 14px;">HoldMyTix Admin System</p>
    </div>
  </div>
`;

const generateTicketTransferRequestHTML = (
  eventName: string,
  eventDate: string,
  venue: string,
  ticketDetails: string,
  price: number,
  sellerName: string,
  sellerEmail: string,
  buyerName: string,
  buyerEmail: string,
) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #2563eb; margin: 0;">🎫 HoldMyTix</h1>
      <p style="color: #6b7280; margin: 5px 0 0 0;">New Ticket Transfer Request</p>
    </div>
    
    <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <h2 style="color: #1f2937; margin-top: 0;">Event Information</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #374151; font-weight: 500; width: 30%;">Event:</td>
          <td style="padding: 8px 0; color: #1f2937;"><strong>${eventName}</strong></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #374151; font-weight: 500;">Date:</td>
          <td style="padding: 8px 0; color: #1f2937;">${eventDate}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #374151; font-weight: 500;">Venue:</td>
          <td style="padding: 8px 0; color: #1f2937;">${venue}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #374151; font-weight: 500;">Ticket Details:</td>
          <td style="padding: 8px 0; color: #1f2937;">${ticketDetails}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #374151; font-weight: 500;">Price:</td>
          <td style="padding: 8px 0; color: #1f2937; font-weight: bold; font-size: 18px;">$${price.toFixed(2)}</td>
        </tr>
      </table>
    </div>
    
    <div style="display: flex; gap: 20px; margin-bottom: 20px;">
      <div style="flex: 1; background: #ecfdf5; border: 1px solid #d1fae5; padding: 15px; border-radius: 8px;">
        <h3 style="color: #065f46; margin-top: 0; margin-bottom: 10px;">👤 Seller</h3>
        <p style="color: #065f46; margin: 5px 0;"><strong>Name:</strong> ${sellerName}</p>
        <p style="color: #065f46; margin: 5px 0;"><strong>Email:</strong> ${sellerEmail}</p>
      </div>
      
      <div style="flex: 1; background: #eff6ff; border: 1px solid #bfdbfe; padding: 15px; border-radius: 8px;">
        <h3 style="color: #1e40af; margin-top: 0; margin-bottom: 10px;">👤 Buyer</h3>
        <p style="color: #1e40af; margin: 5px 0;"><strong>Name:</strong> ${buyerName}</p>
        <p style="color: #1e40af; margin: 5px 0;"><strong>Email:</strong> ${buyerEmail}</p>
      </div>
    </div>
    
    <div style="background: #fffbeb; border: 1px solid #fed7aa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
      <p style="color: #92400e; margin: 0; font-weight: 500;">⚠️ Action Required: Please process this ticket transfer request and initiate the secure transaction process.</p>
    </div>
    
    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 14px;">Request submitted at: ${new Date().toLocaleString()}</p>
      <p style="color: #6b7280; font-size: 14px; margin-top: 10px;">HoldMyTix Transfer System</p>
    </div>
  </div>
`;

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
      status: 200,
    });
  }

  try {
    console.log("Received request method:", req.method);
    console.log("Request headers:", Object.fromEntries(req.headers.entries()));

    const requestBody = await req.text();
    console.log("Request body:", requestBody);

    let parsedData;
    try {
      parsedData = JSON.parse(requestBody);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      throw new Error("Invalid JSON in request body");
    }

    const { emailType, data } = parsedData;

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY not found in environment variables");
    }

    let emailData;

    switch (emailType) {
      case "seller_instructions":
        emailData = {
          from: "info@holdmytix.com",
          to: data.sellerEmail,
          subject: `HoldMyTix: Instructions for transferring your ${data.eventName} ticket`,
          html: generateSellerInstructionsHTML(data.buyerName, data.eventName),
        };
        break;

      case "buyer_instructions":
        emailData = {
          from: "info@holdmytix.com",
          to: data.buyerEmail,
          subject: `HoldMyTix: Payment instructions for ${data.eventName} ticket`,
          html: generateBuyerInstructionsHTML(
            data.sellerName,
            data.eventName,
            data.amount,
          ),
        };
        break;

      case "admin_notification":
        emailData = {
          from: "info@holdmytix.com",
          to: "info@holdmytix.com",
          subject: `🎫 New HoldMyTix Transfer: ${data.eventName}`,
          html: generateAdminNotificationHTML(
            data.eventName,
            data.sellerEmail,
            data.buyerEmail,
          ),
        };
        break;

      case "ticket_transfer_request":
        emailData = {
          from: "info@holdmytix.com",
          to: "info@holdmytix.com",
          subject: `🎫 Ticket Transfer Request: ${data.eventName}`,
          html: generateTicketTransferRequestHTML(
            data.eventName,
            data.eventDate,
            data.venue,
            data.ticketDetails,
            data.price,
            data.sellerName,
            data.sellerEmail,
            data.buyerName,
            data.buyerEmail,
          ),
        };
        break;

      default:
        throw new Error(`Unknown email type: ${emailType}`);
    }

    // Send email using Resend API
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to send email");
    }

    return new Response(
      JSON.stringify({
        success: true,
        messageId: result.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
