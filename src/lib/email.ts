import { Resend } from "resend";

// Use environment variable for Resend API key in production
const resend = new Resend("re_RTudWpro_EVjknDQHVnPaLXFyWqjszAU7");

interface EmailData {
  to: string;
  subject: string;
  body: string;
}

export const sendEmail = async (
  data: EmailData,
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  try {
    const result = await resend.emails.send({
      from: "info@holdmytix.com",
      to: data.to,
      subject: data.subject,
      html: data.body,
    });

    if (result.error) {
      console.error("Resend error:", result.error);
      return {
        success: false,
        error: result.error.message || "Failed to send email",
      };
    }

    return {
      success: true,
      messageId: result.data?.id,
    };
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      success: false,
      error: "Failed to send email",
    };
  }
};

export const sendSellerInstructions = async (
  sellerEmail: string,
  buyerName: string,
  eventName: string,
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  return sendEmail({
    to: sellerEmail,
    subject: `HoldMyTix: Instructions for transferring your ${eventName} ticket`,
    body: `
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
    `,
  });
};

export const sendBuyerInstructions = async (
  buyerEmail: string,
  sellerName: string,
  eventName: string,
  amount: number,
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  return sendEmail({
    to: buyerEmail,
    subject: `HoldMyTix: Payment instructions for ${eventName} ticket`,
    body: `
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
          <p style="color: #1e40af; font-size: 24px; font-weight: bold; margin: 0;">${amount.toFixed(2)}</p>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h3 style="color: #1f2937;">💳 Payment Instructions</h3>
          <p style="color: #374151; margin-bottom: 15px;">To complete your purchase, please follow these steps:</p>
          
          <ol style="color: #374151; line-height: 1.8; padding-left: 20px;">
            <li>Log in to your HoldMyTix account</li>
            <li>Go to your Transaction Dashboard</li>
            <li>Find the transaction for <strong>${eventName}</strong></li>
            <li>Click on "Make Payment"</li>
            <li>Complete the payment of <strong>${amount.toFixed(2)}</strong></li>
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
    `,
  });
};

export const sendAdminNotification = async (
  eventName: string,
  sellerEmail: string,
  buyerEmail: string,
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  return sendEmail({
    to: "info@holdmytix.com",
    subject: `🎫 New HoldMyTix Transfer: ${eventName}`,
    body: `
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
    `,
  });
};

// New function to send ticket transfer request to info@holdmytix.com
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
  console.log("Sending ticket transfer request email to info@holdmytix.com");
  return sendEmail({
    to: "info@holdmytix.com",
    subject: `🎫 Ticket Transfer Request: ${eventName}`,
    body: `
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
              <td style="padding: 8px 0; color: #1f2937; font-weight: bold; font-size: 18px;">${price.toFixed(2)}</td>
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
    `,
  });
};
