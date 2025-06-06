import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE",
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
    // Get Ticketmaster API credentials from environment
    const consumerKey = Deno.env.get("TICKETMASTER_CONSUMER_KEY");
    const consumerSecret = Deno.env.get("TICKETMASTER_CONSUMER_SECRET");

    if (!consumerKey) {
      throw new Error(
        "TICKETMASTER_CONSUMER_KEY environment variable is not set",
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_KEY") ?? "";

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Calculate date range for next 2 weeks
    const today = new Date();
    const twoWeeksFromNow = new Date(
      today.getTime() + 14 * 24 * 60 * 60 * 1000,
    );
    const startDateTime = today.toISOString().split("T")[0] + "T00:00:00Z";
    const endDateTime =
      twoWeeksFromNow.toISOString().split("T")[0] + "T23:59:59Z";

    let page = 0;
    let totalPages = 1;
    let allEvents: any[] = [];

    // Fetch events with pagination, filtered for Seattle and next 2 weeks
    while (page < totalPages && page < 10) {
      // Limit to 10 pages for Seattle events
      const ticketmasterUrl = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${consumerKey}&city=Seattle&stateCode=WA&countryCode=US&startDateTime=${startDateTime}&endDateTime=${endDateTime}&size=200&page=${page}`;

      console.log(
        `Fetching page ${page + 1} from Ticketmaster API for Seattle events`,
      );

      const response = await fetch(ticketmasterUrl);

      if (!response.ok) {
        throw new Error(`Ticketmaster API error: ${response.status}`);
      }

      const data = await response.json();

      if (data._embedded && data._embedded.events) {
        // Filter events to only include those in Seattle area
        const seattleEvents = data._embedded.events.filter((event: any) => {
          const venue = event._embedded?.venues?.[0];
          return (
            venue &&
            (venue.city?.name?.toLowerCase().includes("seattle") ||
              venue.state?.stateCode === "WA")
          );
        });
        allEvents = allEvents.concat(seattleEvents);
      }

      // Update pagination info
      if (data.page) {
        totalPages = data.page.totalPages || 1;
        page++;
      } else {
        break;
      }

      // Add a small delay to be respectful to the API
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    console.log(
      `Fetched ${allEvents.length} Seattle events from Ticketmaster for next 2 weeks`,
    );

    // Clear existing events (only Seattle events from the last sync)
    const { error: deleteError } = await supabase
      .from("ticketmaster_events")
      .delete()
      .neq("id", "never_match"); // Delete all records

    if (deleteError) {
      console.error("Error clearing existing events:", deleteError);
    }

    // Transform and insert events
    const eventsToInsert = allEvents.map((event) => ({
      ticketmaster_id: event.id,
      name: event.name,
      url: event.url,
      locale: event.locale || "en-us",
      images: event.images || [],
      sales: event.sales || {},
      dates: event.dates || {},
      classifications: event.classifications || [],
      promoter: event.promoter || {},
      promoters: event.promoters || [],
      price_ranges: event.priceRanges || [],
      products: event.products || [],
      seat_map: event.seatmap || {},
      accessibility: event.accessibility || {},
      ticket_limit: event.ticketLimit || {},
      age_restrictions: event.ageRestrictions || {},
      ticketing: event.ticketing || {},
      venues: event._embedded?.venues || [],
      attractions: event._embedded?.attractions || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    // Insert events in batches
    const batchSize = 100;
    let insertedCount = 0;

    for (let i = 0; i < eventsToInsert.length; i += batchSize) {
      const batch = eventsToInsert.slice(i, i + batchSize);

      const { error: insertError } = await supabase
        .from("ticketmaster_events")
        .insert(batch);

      if (insertError) {
        console.error(
          `Error inserting batch ${Math.floor(i / batchSize) + 1}:`,
          insertError,
        );
      } else {
        insertedCount += batch.length;
        console.log(
          `Inserted batch ${Math.floor(i / batchSize) + 1}, total: ${insertedCount}`,
        );
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully fetched and stored ${insertedCount} Seattle events from Ticketmaster (next 2 weeks)`,
        totalFetched: allEvents.length,
        totalInserted: insertedCount,
        dateRange: `${startDateTime} to ${endDateTime}`,
        location: "Seattle, WA",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error fetching Ticketmaster events:", error);
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
