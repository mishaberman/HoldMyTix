import React, { useState } from "react";
import Layout from "@/components/layout/Layout";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
  sendAdminNotification,
  sendTicketTransferRequest,
} from "@/lib/email";
import { AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const SingleTicketTransfer = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("seller");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    // Event details
    eventName: "",
    eventDate: "",
    eventTime: "",
    venue: "",
    ticketCount: "1",
    ticketSection: "",
    ticketRow: "",
    ticketSeat: "",
    ticketProvider: "ticketmaster",
    ticketNotes: "",

    // Price details
    price: "",

    // Seller details (when user is buyer)
    sellerName: "",
    sellerEmail: "",

    // Buyer details (when user is seller)
    buyerName: "",
    buyerEmail: "",
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Determine if user is seller or buyer based on active tab
      const isSeller = activeTab === "seller";

      // Import API functions
      const {
        createTransaction,
        createDocuSignAgreement,
        createEmailNotification,
      } = await import("@/lib/api");

      // Prepare data for transaction
      const transactionData = {
        contract_id: `TIX-${Math.floor(Math.random() * 100000)}`,
        seller_id: isSeller ? user?.sub : null, // Will be updated with seller's ID if buyer initiates
        buyer_id: isSeller ? null : user?.sub, // Will be updated with buyer's ID if seller initiates
        event_name: formData.eventName,
        event_date: `${formData.eventDate}T${formData.eventTime}:00`,
        venue: formData.venue,
        seat_details: `${formData.ticketSection ? `Section ${formData.ticketSection}, ` : ""}${formData.ticketRow ? `Row ${formData.ticketRow}, ` : ""}${formData.ticketSeat ? `Seats ${formData.ticketSeat}` : ""}`,
        ticket_quantity: parseInt(formData.ticketCount),
        price: parseFloat(formData.price) * parseInt(formData.ticketCount),
        payment_method: isSeller ? "TBD" : "Venmo", // Default to Venmo if buyer initiates
        status: "pending",
        payment_verified: false,
        tickets_verified: false,
        time_remaining: 60, // 1 hour in minutes
        expiration_time: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
      };

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

      await createDocuSignAgreement(docusignData);

      // Send emails using the mock functions
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
      await sendTicketTransferRequest(
        formData.eventName,
        `${formData.eventDate} at ${formData.eventTime}`,
        formData.venue,
        `${formData.ticketCount} ticket(s) - ${formData.ticketSection ? `Section ${formData.ticketSection}, ` : ""}${formData.ticketRow ? `Row ${formData.ticketRow}, ` : ""}${formData.ticketSeat ? `Seats ${formData.ticketSeat}` : "General Admission"}`,
        parseFloat(formData.price) * parseInt(formData.ticketCount),
        isSeller ? user?.name || "" : formData.sellerName,
        isSeller ? user?.email || "" : formData.sellerEmail,
        isSeller ? formData.buyerName : user?.name || "",
        isSeller ? formData.buyerEmail : user?.email || "",
      );

      // Show success message and redirect after delay
      setSuccess(true);
      setTimeout(() => {
        navigate("/dashboard");
      }, 3000);
    } catch (err) {
      console.error("Error creating ticket transfer:", err);
      setError("Failed to create ticket transfer. Please try again.");
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
      <div className="container py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Initiate Ticket Transfer</h1>
          <p className="text-muted-foreground mb-6">
            Securely transfer tickets between buyers and sellers with HoldMyTix
            as your trusted middleman.
          </p>

          {error && (
            <Alert className="mb-6 bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-800">Error</AlertTitle>
              <AlertDescription className="text-red-700">
                {error}
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
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Event Information</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="eventName">Event Name *</Label>
                          <Input
                            id="eventName"
                            name="eventName"
                            value={formData.eventName}
                            onChange={handleChange}
                            placeholder="e.g. Taylor Swift | The Eras Tour"
                            required
                          />
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

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="eventDate">Event Date *</Label>
                          <Input
                            id="eventDate"
                            name="eventDate"
                            value={formData.eventDate}
                            onChange={handleChange}
                            type="date"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="eventTime">Event Time *</Label>
                          <Input
                            id="eventTime"
                            name="eventTime"
                            value={formData.eventTime}
                            onChange={handleChange}
                            type="time"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">
                        Ticket Information
                      </h3>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
    </Layout>
  );
};

export default SingleTicketTransfer;
