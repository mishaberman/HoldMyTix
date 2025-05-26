// This is a mock email service implementation
// In a real application, you would use a service like SendGrid, Mailgun, etc.

interface EmailData {
  to: string;
  subject: string;
  body: string;
}

export const sendEmail = async (data: EmailData) => {
  try {
    // In a real implementation, this would call an email service API
    console.log("Sending email to:", data.to);
    console.log("Subject:", data.subject);
    console.log("Body:", data.body);

    // Simulate a successful response
    return {
      success: true,
      messageId: `msg-${Math.random().toString(36).substring(2, 15)}`,
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
) => {
  return sendEmail({
    to: sellerEmail,
    subject: `HoldMyTix: Instructions for transferring your ${eventName} ticket`,
    body: `
      Hello,

      Thank you for using HoldMyTix to securely transfer your ticket to ${buyerName}.

      Please follow these steps to complete the transfer:

      1. Log in to your ticket provider account (Ticketmaster, StubHub, etc.)
      2. Locate your ticket for ${eventName}
      3. Select the transfer option
      4. Enter the following email address: transfer@holdmytix.com
      5. Complete the transfer process

      Once we verify that the ticket has been transferred to our secure account, we will release the payment to you.

      If you have any questions, please contact support@holdmytix.com.

      Thank you,
      The HoldMyTix Team
    `,
  });
};

export const sendBuyerInstructions = async (
  buyerEmail: string,
  sellerName: string,
  eventName: string,
  amount: number,
) => {
  return sendEmail({
    to: buyerEmail,
    subject: `HoldMyTix: Payment instructions for ${eventName} ticket`,
    body: `
      Hello,

      ${sellerName} has initiated a secure ticket transfer to you for ${eventName} through HoldMyTix.

      To complete your purchase, please follow these steps:

      1. Log in to your HoldMyTix account
      2. Go to your Transaction Dashboard
      3. Find the transaction for ${eventName}
      4. Click on "Make Payment"
      5. Complete the payment of $${amount.toFixed(2)}

      Once your payment is verified, we will ensure the ticket is transferred to you securely.

      If you have any questions, please contact support@holdmytix.com.

      Thank you,
      The HoldMyTix Team
    `,
  });
};

export const sendAdminNotification = async (
  eventName: string,
  sellerEmail: string,
  buyerEmail: string,
) => {
  return sendEmail({
    to: "mishaberman@gmail.com",
    subject: `New HoldMyTix Transfer: ${eventName}`,
    body: `
      A new ticket transfer has been initiated:

      Event: ${eventName}
      Seller: ${sellerEmail}
      Buyer: ${buyerEmail}

      Please monitor this transaction in the admin dashboard.
    `,
  });
};
