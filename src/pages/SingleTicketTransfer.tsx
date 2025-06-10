import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateTransferAgreement } from "@/lib/docusign";
import {
  sendSellerInstructions,
  sendBuyerInstructions,
  sendTicketTransferRequest,
  sendAdminNotification,
} from "@/lib/email";
import { createTicketTransfer } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import {
  AlertCircle,
  CheckCircle,
  Search,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

const SingleTicketTransfer = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("seller");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);
  const [eventSearchOpen, setEventSearchOpen] = useState(false);
  const [eventSearchResults, setEventSearchResults] = useState([]);
  const [searchingEvents, setSearchingEvents] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [initialEvents, setInitialEvents] = useState([]);

  // Load initial events when component mounts
  useEffect(() => {
    loadInitialEvents();
  }, []);

  const loadInitialEvents = async () => {
    try {
      const { getDistinctTicketmasterEvents } = await import("@/lib/api");
      const { data, error } = await getDistinctTicketmasterEvents();

      if (!error && data) {
        setInitialEvents(data.slice(0, 10)); // Show first 10 events
        setEventSearchResults(data.slice(0, 10));
      }
    } catch (error) {
      console.error("Error loading initial events:", error);
    }
  };

  // Form state - load from localStorage if available
  const [formData, setFormData] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const savedData = localStorage.getItem("ticketTransferForm");
        if (savedData) {
          return JSON.parse(savedData);
        }
      } catch (e) {
        console.error("Error parsing saved form data:", e);
      }
    }

    // Default placeholder data for easy testing
    return {
      // Event details
      eventName: "Taylor Swift - The Eras Tour",
      eventDate: "2024-08-15",
      eventTime: "19:00",
      venue: "SoFi Stadium, Los Angeles",
      ticketCount: "2",
      ticketSection: "134",
      ticketRow: "G",
      ticketSeat: "12-13",
      ticketProvider: "ticketmaster",
      ticketNotes: "Mobile transfer available, great view of the stage!",

      // Price details
      price: "350",

      // Seller details (when user is buyer)
      sellerName: "John Doe",
      sellerEmail: "john.doe@example.com",

      // Buyer details (when user is seller)
      buyerName: "Jane Smith",
      buyerEmail: "jane.smith@example.com",
    };
  });

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("ticketTransferForm", JSON.stringify(formData));
      } catch (e) {
        console.warn("Could not save form data to localStorage:", e);
      }
    }
  }, [formData]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const searchEvents = async (query: string) => {
    if (query.length < 2) {
      setEventSearchResults(initialEvents);
      return;
    }

    setSearchingEvents(true);
    try {
      const { searchTicketmasterEvents } = await import("@/lib/api");
      const { data, error } = await searchTicketmasterEvents(query);

      if (error) {
        console.error("Error searching events:", error);
        setEventSearchResults(initialEvents);
      } else {
        setEventSearchResults(data || []);
      }
    } catch (error) {
      console.error("Error searching events:", error);
      setEventSearchResults(initialEvents);
    } finally {
      setSearchingEvents(false);
    }
  };

  const selectEvent = (event: any) => {
    setFormData((prev) => ({
      ...prev,
      eventName: event.name,
      venue: `${event.venue}, ${event.city}${event.state ? `, ${event.state}` : ""}`,
      eventDate: event.date || prev.eventDate,
      eventTime: event.time || prev.eventTime,
    }));
    setEventSearchOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setDateError(null);

    try {
      // Validate required fields
      if (!formData.eventName || !formData.eventDate || !formData.eventTime) {
        throw new Error("Please fill in all required event details");
      }

      if (!formData.venue || !formData.ticketCount || !formData.price) {
        throw new Error("Please fill in all required ticket and price details");
      }

      // Validate date format and check if it's in the future
      let testDate;
      try {
        // Ensure we have both date and time
        if (!formData.eventDate || !formData.eventTime) {
          setDateError("Event date and time are required");
          throw new Error("Event date and time are required");
        }

        // Create date string in ISO format
        // Handle both HH:MM and HH:MM:SS time formats
        const timeWithSeconds =
          formData.eventTime.includes(":") &&
          formData.eventTime.split(":").length === 2
            ? `${formData.eventTime}:00`
            : formData.eventTime;
        const dateTimeString = `${formData.eventDate}T${timeWithSeconds}`;
        testDate = new Date(dateTimeString);

        // Check if the date is valid
        if (isNaN(testDate.getTime())) {
          setDateError("Please enter a valid date and time");
          throw new Error("Please enter a valid date and time");
        }

        // Check if event date is in the future (with some buffer for timezone differences)
        const now = new Date();
        const bufferTime = 30 * 60 * 1000; // 30 minutes buffer
        if (testDate.getTime() <= now.getTime() - bufferTime) {
          setDateError(
            "Event date must be in the future. Please select a future date and time.",
          );
          throw new Error(
            "Event date must be in the future. Please select a future date and time.",
          );
        }
      } catch (error) {
        if (!dateError) {
          setDateError("Invalid event date or time format");
        }
        throw error;
      }
      // Determine if user is seller or buyer based on active tab
      const isSeller = activeTab === "seller";

      // Import API functions
      const {
        createTransaction,
        createDocuSignAgreement,
        createEmailNotification,
      } = await import("@/lib/api");

      // Prepare data for transaction with ALL form fields
      const transactionData = {
        contract_id: `TIX-${Math.floor(Math.random() * 100000)}`,
        seller_id: isSeller ? user?.sub : null,
        buyer_id: isSeller ? null : user?.sub,

        // Event information
        event_name: formData.eventName,
        event_date: testDate.toISOString(),
        event_time: formData.eventTime,
        venue: formData.venue,

        // Ticket information
        ticket_quantity: parseInt(formData.ticketCount),
        ticket_section: formData.ticketSection,
        ticket_row: formData.ticketRow,
        ticket_seat: formData.ticketSeat,
        seat_details:
          `${formData.ticketSection ? `Section ${formData.ticketSection}, ` : ""}${formData.ticketRow ? `Row ${formData.ticketRow}, ` : ""}${formData.ticketSeat ? `Seats ${formData.ticketSeat}` : ""}`.trim() ||
          "General Admission",
        ticket_provider: formData.ticketProvider,
        ticket_notes: formData.ticketNotes,

        // Price and payment
        price: parseFloat(formData.price) * parseInt(formData.ticketCount),
        payment_method: isSeller ? "TBD" : "Venmo",

        // Status tracking
        status: "pending",
        payment_verified: false,
        tickets_verified: false,
        time_remaining: 60,
        expiration_time: new Date(Date.now() + 60 * 60 * 1000).toISOString(),

        // Seller information
        seller_name: isSeller ? user?.name || "" : formData.sellerName,
        seller_email: isSeller ? user?.email || "" : formData.sellerEmail,

        // Buyer information
        buyer_name: isSeller ? formData.buyerName : user?.name || "",
        buyer_email: isSeller ? formData.buyerEmail : user?.email || "",
      };

      // Ensure current user exists in users table first
      if (user?.sub) {
        console.log("Ensuring user exists in database:", user.sub);
        const { error: upsertUserError } = await supabase.from("users").upsert(
          {
            id: user.sub,
            email: user.email || "unknown@example.com",
            full_name: user.name || "Unknown User",
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "id",
          },
        );

        if (upsertUserError) {
          console.error("Error upserting current user:", upsertUserError);
          throw new Error("Failed to create/update user record");
        }
      }

      // Create transaction
      const { data: transaction, error: transactionError } =
        await createTransaction(transactionData);

      if (transactionError) {
        throw new Error(
          `Failed to create transaction: ${transactionError.message || "Unknown error"}`,
        );
      }

      // Prepare data for DocuSign agreement
      const agreementData = {
        sellerName: isSeller ? user?.name || "" : formData.sellerName,
        sellerEmail: isSeller ? user?.email || "" : formData.sellerEmail,
        buyerName: isSeller ? formData.buyerName : user?.name || "",
        buyerEmail: isSeller ? formData.buyerEmail : user?.email || "",
        eventName: formData.eventName,
        eventDate: formData.eventDate,
        ticketCount: parseInt(formData.ticketCount),
        ticketPrice: parseFloat(formData.price),
        totalAmount:
          parseInt(formData.ticketCount) * parseFloat(formData.price),
      };

      // Generate DocuSign agreement using the mock function
      const agreementResult = await generateTransferAgreement(agreementData);

      if (!agreementResult.success) {
        throw new Error("Failed to generate transfer agreement");
      }

      // Store DocuSign agreement
      const docusignData = {
        transaction_id: transaction.id,
        envelope_id: agreementResult.data.envelopeId,
        status: "sent",
        document_url: agreementResult.data.documentUrl,
        seller_status: "sent",
        buyer_status: "sent",
      };

      //  await createDocuSignAgreement(docusignData);

      // Send emails using the serverless functions
      if (isSeller) {
        // Send instructions to buyer
        const buyerEmailResult = await sendBuyerInstructions(
          formData.buyerEmail,
          user?.name || "Seller",
          formData.eventName,
          parseFloat(formData.price),
        );

        // Store email notification
        await createEmailNotification({
          transaction_id: transaction.id,
          recipient_id: null,
          email_type: "buyer_instructions",
          status: "sent",
          message_id: buyerEmailResult.messageId,
        });
      } else {
        // Send instructions to seller
        const sellerEmailResult = await sendSellerInstructions(
          formData.sellerEmail,
          user?.name || "Buyer",
          formData.eventName,
        );

        // Store email notification
        await createEmailNotification({
          transaction_id: transaction.id,
          recipient_id: null,
          email_type: "seller_instructions",
          status: "sent",
          message_id: sellerEmailResult.messageId,
        });
      }

      // Send admin notification
      await sendAdminNotification(
        formData.eventName,
        isSeller ? user?.email || "" : formData.sellerEmail,
        isSeller ? formData.buyerEmail : user?.email || "",
      );

      // Send detailed ticket transfer request to info@holdmytix.com
      console.log("About to send ticket transfer request email");
      const emailResult = await sendTicketTransferRequest(
        formData.eventName,
        `${formData.eventDate} at ${formData.eventTime}`,
        formData.venue,
        `${formData.ticketCount} ticket(s) - ${transactionData.seat_details}`,
        parseFloat(formData.price) * parseInt(formData.ticketCount),
        isSeller ? user?.name || "" : formData.sellerName,
        isSeller ? user?.email || "" : formData.sellerEmail,
        isSeller ? formData.buyerName : user?.name || "",
        isSeller ? formData.buyerEmail : user?.email || "",
      );

      console.log("Email result:", emailResult);

      if (!emailResult.success) {
        console.warn("Failed to send email notification:", emailResult.error);
        // Don't fail the entire process if email fails
      }
      // Save to database
      console.log("Form data:", formData);

      const transferResult = await createTicketTransfer({
        buyer_name: formData.buyerName,
        buyer_email: formData.buyerEmail,
        seller_name: formData.sellerName,
        seller_email: formData.sellerEmail,
        event_name: formData.eventName,
        event_date: formData.eventDate,
        venue: formData.venue,
        ticket_details: formData.ticketNotes,
        price: parseFloat(formData.price),
        payment_method: "Venmo", // TODO: Fix this
        status: "pending",
      });

      if (transferResult.error) {
        console.error(
          "Failed to save transfer to database:",
          transferResult.error,
        );
        // toast({
        //   title: "Database Error",
        //   description: "Transfer was initiated but failed to save to database. Please contact support.",
        //   variant: "destructive",
        // })
      } else {
        console.log("Transfer saved to database:", transferResult.data);
      }

      // Show success message and redirect after delay
      setSuccess(true);
      window.scrollTo(0, 0);
      setTimeout(() => {
        navigate("/dashboard");
      }, 3000);
    } catch (err) {
      console.error("Error creating ticket transfer:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to create ticket transfer. Please try again.");
      }
      // Scroll to top to show error
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="container py-12">
          <div className="max-w-md mx-auto bg-card p-6 rounded-lg shadow-md text-center">
            <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
            <p className="text-muted-foreground mb-6">
              Please sign in to initiate a ticket transfer.
            </p>
            <Button asChild>
              <a href="/sign-in">Sign In</a>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  if (success) {
    return (
      <Layout>
        <div className="container py-12">
          <div className="max-w-md mx-auto">
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Success!</AlertTitle>
              <AlertDescription className="text-green-700">
                Your ticket transfer has been initiated. You will be redirected
                to your dashboard.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center sm:text-left mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
              Initiate Ticket Transfer
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              Securely transfer tickets between buyers and sellers with
              HoldMyTix as your trusted middleman.
            </p>
          </div>

          {error && (
            <Alert className="mb-6 bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-800">Error</AlertTitle>
              <AlertDescription className="text-red-700">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {dateError && (
            <Alert className="mb-6 bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-800">
                Date Validation Error
              </AlertTitle>
              <AlertDescription className="text-red-700">
                {dateError}
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Ticket Transfer Details</CardTitle>
              <CardDescription>
                Fill out the information below to initiate a secure ticket
                transfer.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs
                defaultValue="seller"
                className="w-full"
                onValueChange={setActiveTab}
              >
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="seller">I'm the Seller</TabsTrigger>
                  <TabsTrigger value="buyer">I'm the Buyer</TabsTrigger>
                </TabsList>

                <form onSubmit={handleSubmit}>
                  <div className="space-y-6 sm:space-y-8">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Event Information</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="eventName">Event Name *</Label>
                          <div className="space-y-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setShowEventModal(true)}
                              className="w-full justify-between text-left overflow-hidden"
                            >
                              <span className="truncate">
                                {formData.eventName ||
                                  "🎫 Search Ticketmaster Events"}
                              </span>
                              <Search className="ml-2 h-4 w-4 flex-shrink-0" />
                            </Button>
                            <Input
                              id="eventName"
                              name="eventName"
                              value={formData.eventName}
                              onChange={handleChange}
                              placeholder="Or type event name manually"
                              className="w-full"
                            />
                            <p className="text-xs text-muted-foreground">
                              💡 Click the search button above to find
                              Ticketmaster events, or type your event name
                              manually below
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="venue">Venue *</Label>
                          <Input
                            id="venue"
                            name="venue"
                            value={formData.venue}
                            onChange={handleChange}
                            placeholder="e.g. SoFi Stadium, Los Angeles"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor="eventDate"
                            className={dateError ? "text-red-600" : ""}
                          >
                            Event Date *
                          </Label>
                          <Input
                            id="eventDate"
                            name="eventDate"
                            value={formData.eventDate}
                            onChange={(e) => {
                              handleChange(e);
                              if (dateError) setDateError(null);
                            }}
                            type="date"
                            required
                            className={
                              dateError
                                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                                : ""
                            }
                          />
                          {dateError && (
                            <p className="text-xs text-red-600 mt-1">
                              {dateError}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="eventTime"
                            className={dateError ? "text-red-600" : ""}
                          >
                            Event Time *
                          </Label>
                          <Input
                            id="eventTime"
                            name="eventTime"
                            value={formData.eventTime}
                            onChange={(e) => {
                              handleChange(e);
                              if (dateError) setDateError(null);
                            }}
                            type="time"
                            required
                            className={
                              dateError
                                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                                : ""
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">
                        Ticket Information
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="ticketCount">
                            Number of Tickets *
                          </Label>
                          <Select
                            name="ticketCount"
                            value={formData.ticketCount}
                            onValueChange={(value) =>
                              handleSelectChange("ticketCount", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1</SelectItem>
                              <SelectItem value="2">2</SelectItem>
                              <SelectItem value="3">3</SelectItem>
                              <SelectItem value="4">4</SelectItem>
                              <SelectItem value="5">5</SelectItem>
                              <SelectItem value="6">6</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="ticketSection">Section</Label>
                          <Input
                            id="ticketSection"
                            name="ticketSection"
                            value={formData.ticketSection}
                            onChange={handleChange}
                            placeholder="e.g. 100"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="ticketRow">Row</Label>
                          <Input
                            id="ticketRow"
                            name="ticketRow"
                            value={formData.ticketRow}
                            onChange={handleChange}
                            placeholder="e.g. A"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="ticketSeat">Seat(s)</Label>
                          <Input
                            id="ticketSeat"
                            name="ticketSeat"
                            value={formData.ticketSeat}
                            onChange={handleChange}
                            placeholder="e.g. 1, 2"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="ticketProvider">
                          Ticket Provider *
                        </Label>
                        <Select
                          name="ticketProvider"
                          value={formData.ticketProvider}
                          onValueChange={(value) =>
                            handleSelectChange("ticketProvider", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select provider" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ticketmaster">
                              Ticketmaster
                            </SelectItem>
                            <SelectItem value="stubhub">StubHub</SelectItem>
                            <SelectItem value="seatgeek">SeatGeek</SelectItem>
                            <SelectItem value="axs">AXS</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="ticketNotes">Additional Notes</Label>
                        <Textarea
                          id="ticketNotes"
                          name="ticketNotes"
                          value={formData.ticketNotes}
                          onChange={handleChange}
                          placeholder="Any additional information about the tickets"
                          rows={3}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Price</h3>

                      <div className="space-y-2">
                        <Label htmlFor="price">Price per Ticket (USD) *</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5">$</span>
                          <Input
                            id="price"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            type="number"
                            min="0"
                            step="0.01"
                            className="pl-7"
                            placeholder="0.00"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Conditional fields based on role */}
                    {activeTab === "seller" ? (
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">
                          Buyer Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="buyerName">Buyer's Name *</Label>
                            <Input
                              id="buyerName"
                              name="buyerName"
                              value={formData.buyerName}
                              onChange={handleChange}
                              placeholder="Full name"
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="buyerEmail">Buyer's Email *</Label>
                            <Input
                              id="buyerEmail"
                              name="buyerEmail"
                              value={formData.buyerEmail}
                              onChange={handleChange}
                              type="email"
                              placeholder="email@example.com"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">
                          Seller Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="sellerName">Seller's Name *</Label>
                            <Input
                              id="sellerName"
                              name="sellerName"
                              value={formData.sellerName}
                              onChange={handleChange}
                              placeholder="Full name"
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="sellerEmail">
                              Seller's Email *
                            </Label>
                            <Input
                              id="sellerEmail"
                              name="sellerEmail"
                              value={formData.sellerEmail}
                              onChange={handleChange}
                              type="email"
                              placeholder="email@example.com"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">
                        Terms & Conditions
                      </h3>

                      <div className="bg-muted p-4 rounded-md text-sm">
                        <p className="mb-4">
                          By initiating this ticket transfer, you agree to the
                          following terms:
                        </p>
                        <ul className="list-disc pl-5 space-y-2">
                          <li>
                            HoldMyTix will act as a secure middleman for this
                            transaction.
                          </li>
                          <li>
                            The seller agrees to transfer the ticket(s) within
                            24 hours of payment verification.
                          </li>
                          <li>
                            The buyer agrees to make payment through our secure
                            payment system.
                          </li>
                          <li>
                            HoldMyTix will hold the payment until the ticket
                            transfer is verified.
                          </li>
                          <li>
                            Both parties will receive a DocuSign agreement
                            outlining these terms.
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </form>
              </Tabs>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span> Processing...
                  </>
                ) : (
                  "Initiate Ticket Transfer"
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Event Search Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                  Search Ticketmaster Events
                </h3>
                <button
                  onClick={() => setShowEventModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xl font-bold p-1"
                >
                  ✕
                </button>
              </div>
              <div className="mt-4">
                <input
                  type="text"
                  placeholder="Search for events, artists, or venues..."
                  onChange={(e) => searchEvents(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent"
                  autoFocus
                />
              </div>
            </div>
            <div className="p-4 sm:p-6 overflow-y-auto max-h-96">
              {searchingEvents ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Searching events...
                  </p>
                </div>
              ) : eventSearchResults.length > 0 ? (
                <div className="space-y-2">
                  {eventSearchResults.map((event, index) => (
                    <div
                      key={event.id || index}
                      onClick={() => {
                        selectEvent(event);
                        setShowEventModal(false);
                      }}
                      className="p-3 sm:p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors border-l-4 border-l-transparent hover:border-l-primary"
                    >
                      <div className="font-medium text-base sm:text-lg text-gray-900 dark:text-white truncate">
                        {event.name}
                      </div>
                      <div className="text-sm text-muted-foreground dark:text-gray-400 mt-1 truncate">
                        📍 {event.venue}, {event.city}
                        {event.date &&
                          ` • 📅 ${new Date(event.date).toLocaleDateString()}`}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground dark:text-gray-400">
                    No events found. Try a different search term.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default SingleTicketTransfer;
