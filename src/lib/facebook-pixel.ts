// Facebook Pixel utility functions

// Enhanced user data collection
export interface FacebookUserData {
  em?: string; // email
  ph?: string; // phone
  fn?: string; // first name
  ln?: string; // last name
  external_id?: string; // user ID
  client_ip_address?: string;
  client_user_agent?: string;
  fbc?: string; // Facebook click ID
  fbp?: string; // Facebook browser ID
}

// Get Facebook click ID from cookie or URL
export const getFacebookClickId = (): string | null => {
  // First try to get from _fbc cookie
  const fbcCookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith("_fbc="))
    ?.split("=")[1];

  if (fbcCookie) {
    return fbcCookie;
  }

  // If no cookie, try to get from URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const fbclid = urlParams.get("fbclid");

  if (fbclid) {
    const fbc = `fb.1.${Date.now()}.${fbclid}`;
    // Set cookie for future use
    document.cookie = `_fbc=${fbc}; path=/; max-age=7776000`; // 90 days
    return fbc;
  }

  return null;
};

// Get Facebook browser ID from cookie
export const getFacebookBrowserId = (): string | null => {
  const fbpCookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith("_fbp="))
    ?.split("=")[1];

  return fbpCookie || null;
};

// Enhanced data collection for authenticated users
export const getEnhancedUserData = (user?: any): FacebookUserData => {
  const userData: FacebookUserData = {
    client_ip_address: "", // Will be set server-side
    client_user_agent: navigator.userAgent,
    fbc: getFacebookClickId(),
    fbp: getFacebookBrowserId(),
  };

  if (user) {
    userData.em = user.email;
    userData.external_id = user.sub || user.id;

    // Extract name if available
    if (user.name) {
      const nameParts = user.name.split(" ");
      userData.fn = nameParts[0];
      userData.ln = nameParts.slice(1).join(" ");
    } else {
      userData.fn = user.given_name;
      userData.ln = user.family_name;
    }

    // Phone if available
    if (user.phone_number) {
      userData.ph = user.phone_number;
    }
  }

  return userData;
};

// Track Facebook Pixel event with enhanced data
export const trackFacebookEvent = (
  eventName: string,
  parameters: Record<string, any> = {},
  userData?: FacebookUserData,
) => {
  if (typeof window !== "undefined" && (window as any).fbq) {
    const enhancedData = userData || getEnhancedUserData();

    // Track with enhanced data
    (window as any).fbq("track", eventName, parameters, {
      eventID: generateEventId(),
      ...enhancedData,
    });
  }

  // Also send to server-side API for deduplication
  sendToConversionsAPI(eventName, parameters, userData);
};

// Generate unique event ID for deduplication
export const generateEventId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Send event to server-side Conversions API
const sendToConversionsAPI = async (
  eventName: string,
  parameters: Record<string, any>,
  userData?: FacebookUserData,
) => {
  try {
    const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
    const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.warn("Supabase configuration missing for Conversions API");
      return;
    }

    const enhancedData = userData || getEnhancedUserData();

    await fetch(
      `${SUPABASE_URL}/functions/v1/supabase-functions-facebook_capi`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          event_id: generateEventId(),
          action_source: "website",
          event_source_url: window.location.href,
          user_data: enhancedData,
          custom_data: parameters,
        }),
      },
    );
  } catch (error) {
    console.error("Error sending to Conversions API:", error);
  }
};

// Predefined event tracking functions
export const trackPageView = (
  pageName?: string,
  userData?: FacebookUserData,
) => {
  trackFacebookEvent(
    "PageView",
    {
      content_name: pageName || document.title,
      content_category: "page_view",
    },
    userData,
  );
};

export const trackSearch = (
  searchTerm: string,
  userData?: FacebookUserData,
) => {
  trackFacebookEvent(
    "Search",
    {
      search_string: searchTerm,
      content_category: "search",
    },
    userData,
  );
};

export const trackLead = (userData?: FacebookUserData) => {
  trackFacebookEvent(
    "Lead",
    {
      content_name: "Contact Form",
      content_category: "lead_generation",
    },
    userData,
  );
};

export const trackInitiateCheckout = (
  value?: number,
  currency = "USD",
  userData?: FacebookUserData,
) => {
  trackFacebookEvent(
    "InitiateCheckout",
    {
      value,
      currency,
      content_name: "Ticket Transfer",
      content_category: "ticket_transfer",
    },
    userData,
  );
};

export const trackPurchase = (
  value: number,
  currency = "USD",
  userData?: FacebookUserData,
) => {
  trackFacebookEvent(
    "Purchase",
    {
      value,
      currency,
      content_name: "Ticket Transfer Completed",
      content_category: "ticket_transfer",
    },
    userData,
  );
};

export const trackViewContent = (
  contentName: string,
  contentCategory: string,
  userData?: FacebookUserData,
) => {
  trackFacebookEvent(
    "ViewContent",
    {
      content_name: contentName,
      content_category: contentCategory,
    },
    userData,
  );
};

// Initialize Facebook Pixel
export const initializeFacebookPixel = () => {
  if (typeof window !== 'undefined' && typeof fbq !== 'undefined') {
    fbq('init', PIXEL_ID);
    fbq('track', 'PageView');
  }
};