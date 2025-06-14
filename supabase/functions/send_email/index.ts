/*
# Enhanced Email Notifications

Improved email templates with better formatting and clear action links.
*/

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface EmailRequest {
  emailType: string;
  data: any;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { emailType, data }: EmailRequest = await req.json();

    let emailContent;
    let subject;
    let to;

    switch (emailType) {
      case 'ticket_transfer_request':
        emailContent = generateTransferRequestEmail(data);
        subject = `🎫 New Ticket Transfer Request - ${data.eventName}`;
        to = 'info@holdmytix.com';
        break;
      
      case 'seller_instructions':
        emailContent = generateSellerInstructionsEmail(data);
        subject = `🎫 Action Required: Transfer Your Tickets - ${data.eventName}`;
        to = data.sellerEmail;
        break;
      
      case 'buyer_instructions':
        emailContent = generateBuyerInstructionsEmail(data);
        subject = `🎫 Action Required: Complete Your Payment - ${data.eventName}`;
        to = data.buyerEmail;
        break;
      
      case 'admin_notification':
        emailContent = generateAdminNotificationEmail(data);
        subject = `🎫 New Transfer Initiated - ${data.eventName}`;
        to = 'info@holdmytix.com';
        break;
      
      default:
        throw new Error(`Unknown email type: ${emailType}`);
    }

    // Send email using Resend
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'HoldMyTix <noreply@holdmytix.com>',
        to: [to],
        subject: subject,
        html: emailContent,
      }),
    });

    if (!resendResponse.ok) {
      const errorText = await resendResponse.text();
      throw new Error(`Email sending failed: ${errorText}`);
    }

    const result = await resendResponse.json();

    return new Response(
      JSON.stringify({
        success: true,
        messageId: result.id,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Email sending error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function generateTransferRequestEmail(data: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Ticket Transfer Request</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #007B8A; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .event-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007B8A; }
        .action-button { display: inline-block; background: #007B8A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        .status-badge { background: #FFA500; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎫 New Ticket Transfer Request</h1>
          <p>A new secure ticket transfer has been initiated</p>
        </div>
        
        <div class="content">
          <p><strong>👨‍💼 Admin Action Required</strong></p>
          <p>A new ticket transfer request has been submitted and requires your attention.</p>
          
          <div class="event-details">
            <h3>📅 Event Details</h3>
            <p><strong>Event:</strong> ${data.eventName}</p>
            <p><strong>Date:</strong> ${data.eventDate}</p>
            <p><strong>Venue:</strong> ${data.venue}</p>
            <p><strong>Tickets:</strong> ${data.ticketDetails}</p>
            <p><strong>Total Price:</strong> $${data.price.toFixed(2)}</p>
          </div>
          
          <div class="event-details">
            <h3>👥 Parties Involved</h3>
            <p><strong>Seller:</strong> ${data.sellerName} (${data.sellerEmail})</p>
            <p><strong>Buyer:</strong> ${data.buyerName} (${data.buyerEmail})</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <span class="status-badge">⏳ PENDING ADMIN REVIEW</span>
          </div>
          
          <div style="text-align: center;">
            <a href="https://www.holdmytix.com/admin" class="action-button">
              🔧 Review in Admin Panel
            </a>
          </div>
          
          <div class="footer">
            <p>This is an automated notification from HoldMyTix</p>
            <p>Secure ticket transfers made simple</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateSellerInstructionsEmail(data: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Transfer Your Tickets - Action Required</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #007B8A; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .event-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007B8A; }
        .action-button { display: inline-block; background: #007B8A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        .urgent { background: #FF6B6B; color: white; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; }
        .steps { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .step { margin: 15px 0; padding: 10px; border-left: 3px solid #007B8A; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎫 Action Required: Transfer Your Tickets</h1>
          <p>Your buyer is ready to complete the purchase</p>
        </div>
        
        <div class="content">
          <div class="urgent">
            <h3>⚡ URGENT: Transfer Required</h3>
            <p>Please transfer your tickets to complete this secure transaction</p>
          </div>
          
          <p>Hello <strong>${data.sellerName || 'Seller'}</strong>,</p>
          <p>Great news! ${data.buyerName} is ready to purchase your tickets for <strong>${data.eventName}</strong>.</p>
          
          <div class="event-details">
            <h3>📅 Event Details</h3>
            <p><strong>Event:</strong> ${data.eventName}</p>
            <p><strong>Buyer:</strong> ${data.buyerName}</p>
            <p><strong>Amount:</strong> $${data.amount?.toFixed(2) || 'TBD'}</p>
          </div>
          
          <div class="steps">
            <h3>📋 Next Steps for You:</h3>
            <div class="step">
              <strong>1.</strong> Log into your Ticketmaster account
            </div>
            <div class="step">
              <strong>2.</strong> Transfer tickets to: <strong>tickets@holdmytix.com</strong>
            </div>
            <div class="step">
              <strong>3.</strong> We'll verify and release payment to you
            </div>
          </div>
          
          <div style="text-align: center;">
            <a href="https://www.holdmytix.com/dashboard" class="action-button">
              📊 View Transfer Status
            </a>
          </div>
          
          <div style="background: #E8F5E8; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>🔒 Your Protection:</strong></p>
            <p>• Payment is held securely until tickets are verified<br>
            • You'll receive payment once transfer is confirmed<br>
            • Full transaction protection through HoldMyTix</p>
          </div>
          
          <div class="footer">
            <p>Questions? Reply to this email or contact support@holdmytix.com</p>
            <p>HoldMyTix - Secure ticket transfers made simple</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateBuyerInstructionsEmail(data: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Complete Your Payment - Action Required</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #007B8A; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .event-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007B8A; }
        .action-button { display: inline-block; background: #007B8A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        .urgent { background: #FF6B6B; color: white; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; }
        .steps { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .step { margin: 15px 0; padding: 10px; border-left: 3px solid #007B8A; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎫 Action Required: Complete Your Payment</h1>
          <p>Your tickets are being prepared for transfer</p>
        </div>
        
        <div class="content">
          <div class="urgent">
            <h3>⚡ URGENT: Payment Required</h3>
            <p>Please send payment to secure your tickets</p>
          </div>
          
          <p>Hello <strong>${data.buyerName || 'Buyer'}</strong>,</p>
          <p>Excellent! ${data.sellerName} is ready to transfer your tickets for <strong>${data.eventName}</strong>.</p>
          
          <div class="event-details">
            <h3>📅 Event Details</h3>
            <p><strong>Event:</strong> ${data.eventName}</p>
            <p><strong>Seller:</strong> ${data.sellerName}</p>
            <p><strong>Total Amount:</strong> $${data.amount?.toFixed(2) || 'TBD'}</p>
          </div>
          
          <div class="steps">
            <h3>💳 Payment Instructions:</h3>
            <div class="step">
              <strong>1.</strong> Send $${data.amount?.toFixed(2) || 'TBD'} via your preferred payment method
            </div>
            <div class="step">
              <strong>2.</strong> Include reference: "HoldMyTix - ${data.eventName}"
            </div>
            <div class="step">
              <strong>3.</strong> We'll verify payment and release tickets to you
            </div>
          </div>
          
          <div style="text-align: center;">
            <a href="https://www.holdmytix.com/dashboard" class="action-button">
              📊 View Transfer Status
            </a>
          </div>
          
          <div style="background: #E8F5E8; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>🔒 Your Protection:</strong></p>
            <p>• Tickets are verified before you pay<br>
            • Full refund if tickets aren't delivered<br>
            • Secure transaction protection through HoldMyTix</p>
          </div>
          
          <div class="footer">
            <p>Questions? Reply to this email or contact support@holdmytix.com</p>
            <p>HoldMyTix - Secure ticket transfers made simple</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateAdminNotificationEmail(data: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Transfer Initiated</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #007B8A; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .event-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007B8A; }
        .action-button { display: inline-block; background: #007B8A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎫 New Transfer Initiated</h1>
          <p>Monitor and manage this transaction</p>
        </div>
        
        <div class="content">
          <p><strong>Admin Notification</strong></p>
          <p>A new ticket transfer has been initiated between:</p>
          
          <div class="event-details">
            <h3>📋 Transfer Summary</h3>
            <p><strong>Event:</strong> ${data.eventName}</p>
            <p><strong>Seller:</strong> ${data.sellerEmail}</p>
            <p><strong>Buyer:</strong> ${data.buyerEmail}</p>
            <p><strong>Status:</strong> Initiated</p>
          </div>
          
          <div style="text-align: center;">
            <a href="https://www.holdmytix.com/admin" class="action-button">
              🔧 Manage in Admin Panel
            </a>
          </div>
          
          <div class="footer">
            <p>HoldMyTix Admin Notification System</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}