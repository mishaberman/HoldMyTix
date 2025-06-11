import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE",
  "Access-Control-Max-Age": "86400",
};

// Facebook Conversions API endpoint
const FACEBOOK_API_VERSION = "v18.0";
const FACEBOOK_PIXEL_ID = Deno.env.get("FACEBOOK_PIXEL_ID") || "YOUR_PIXEL_ID";
const FACEBOOK_ACCESS_TOKEN =
  Deno.env.get("FACEBOOK_ACCESS_TOKEN") || "YOUR_ACCESS_TOKEN";

// Enhanced event validation
const VALID_EVENTS = [
  'PageView',
  'ViewContent',
  'Search',
  'Lead',
  'InitiateCheckout',
  'AddPaymentInfo',
  'Purchase',
  'CompleteRegistration',
  'Subscribe',
  'StartTrial',
  'Contact',
  'CustomizeProduct',
  'Donate',
  'FindLocation',
  'Schedule',
  'SubmitApplication',
  'AddToCart',
  'AddToWishlist'
];

interface FacebookEvent {
  event_name: string;
  event_time: number;
  event_id?: string;
  action_source: string;
  event_source_url?: string;
  user_data: {
    em?: string; // email (hashed)
    ph?: string; // phone (hashed)
    fn?: string; // first name (hashed)
    ln?: string; // last name (hashed)
    external_id?: string; // user ID (hashed)
    client_ip_address?: string;
    client_user_agent?: string;
    fbc?: string; // Facebook click ID
    fbp?: string; // Facebook browser ID
  };
  custom_data?: Record<string, any>;
}

// Hash function for PII data
const hashData = async (data: string): Promise<string> => {
  if (!data) return "";

  // Normalize data
  let normalized = data.toLowerCase().trim();

  // For phone numbers, remove all non-digits and add country code if missing
  if (data.match(/^[\d\s\-\(\)\+]+$/)) {
    normalized = data.replace(/\D/g, "");
    if (normalized.length === 10 && !normalized.startsWith("1")) {
      normalized = "1" + normalized; // Add US country code
    }
  }

  // Create SHA-256 hash
  const encoder = new TextEncoder();
  const data_buffer = encoder.encode(normalized);
  const hash_buffer = await crypto.subtle.digest("SHA-256", data_buffer);
  const hash_array = Array.from(new Uint8Array(hash_buffer));
  const hash_hex = hash_array
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return hash_hex;
};

// Process and hash user data
const processUserData = async (userData: any): Promise<any> => {
  const processed: any = {};

  if (userData.em) {
    processed.em = await hashData(userData.em);
  }

  if (userData.ph) {
    processed.ph = await hashData(userData.ph);
  }

  if (userData.fn) {
    processed.fn = await hashData(userData.fn);
  }

  if (userData.ln) {
    processed.ln = await hashData(userData.ln);
  }

  if (userData.external_id) {
    processed.external_id = await hashData(userData.external_id);
  }

  // These don't need hashing
  if (userData.client_ip_address) {
    processed.client_ip_address = userData.client_ip_address;
  }

  if (userData.client_user_agent) {
    processed.client_user_agent = userData.client_user_agent;
  }

  if (userData.fbc) {
    processed.fbc = userData.fbc;
  }

  if (userData.fbp) {
    processed.fbp = userData.fbp;
  }

  return processed;
};

// Get client IP from request
const getClientIP = (req: Request): string => {
  const forwarded = req.headers.get("x-forwarded-for");
  const realIP = req.headers.get("x-real-ip");
  const cfConnectingIP = req.headers.get("cf-connecting-ip");

  return cfConnectingIP || realIP || forwarded?.split(",")[0] || "";
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
      status: 200,
    });
  }

  try {
    console.log("Received Facebook CAPI request:", req.method);

    const requestBody = await req.text();
    console.log("Request body:", requestBody);

    let eventData;
    try {
      eventData = JSON.parse(requestBody);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      throw new Error("Invalid JSON in request body");
    }

    // Validate required fields
    if (!eventData.event_name) {
      throw new Error("event_name is required");
    }

    // Validate event name
    if (!VALID_EVENTS.includes(eventData.event_name)) {
      console.warn(`Unknown event type: ${eventData.event_name}. Proceeding anyway.`);
    }

    // Add client IP if not provided
    if (eventData.user_data && !eventData.user_data.client_ip_address) {
      eventData.user_data.client_ip_address = getClientIP(req);
    }

    // Process and hash user data
    const processedUserData = eventData.user_data
      ? await processUserData(eventData.user_data)
      : {};

    // Construct Facebook event
    const facebookEvent: FacebookEvent = {
      event_name: eventData.event_name,
      event_time: eventData.event_time || Math.floor(Date.now() / 1000),
      event_id: eventData.event_id,
      action_source: eventData.action_source || "website",
      event_source_url: eventData.event_source_url,
      user_data: processedUserData,
      custom_data: eventData.custom_data || {},
    };

    console.log("Sending to Facebook CAPI:", {
      ...facebookEvent,
      user_data: { ...facebookEvent.user_data, em: "[HASHED]", ph: "[HASHED]" },
    });

    // Send to Facebook Conversions API
    const facebookResponse = await fetch(
      `https://graph.facebook.com/${FACEBOOK_API_VERSION}/${FACEBOOK_PIXEL_ID}/events`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: [facebookEvent],
          access_token: FACEBOOK_ACCESS_TOKEN,
          test_event_code: Deno.env.get("FACEBOOK_TEST_EVENT_CODE"), // Optional for testing
        }),
      },
    );

    const facebookResult = await facebookResponse.json();
    console.log("Facebook CAPI response:", facebookResult);

    if (!facebookResponse.ok) {
      console.error("Facebook CAPI error:", facebookResult);
      throw new Error(
        facebookResult.error?.message || "Facebook CAPI request failed",
      );
    }

    // Log successful event for monitoring with more details
    console.log(
      `Successfully sent ${eventData.event_name} event to Facebook CAPI`,
      {
        event_name: eventData.event_name,
        event_time: eventData.event_time,
        has_user_data: !!eventData.user_data,
        custom_data_keys: eventData.custom_data ? Object.keys(eventData.custom_data) : [],
        action_source: eventData.action_source
      }
    );

    return new Response(
      JSON.stringify({
        success: true,
        facebook_response: facebookResult,
        event_id: eventData.event_id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error in Facebook CAPI function:", error);
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
