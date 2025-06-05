import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import {
  Check,
  ChevronRight,
  CreditCard,
  Calendar,
  MapPin,
  Ticket,
  DollarSign,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  eventName: z
    .string()
    .min(2, { message: "Event name must be at least 2 characters." }),
  eventDate: z.string().min(1, { message: "Event date is required." }),
  venue: z.string().min(2, { message: "Venue name is required." }),
  seatInfo: z.string().min(2, { message: "Seat information is required." }),
  quantity: z.string().min(1, { message: "Quantity is required." }),
  price: z.string().min(1, { message: "Price is required." }),
  description: z.string().optional(),
  paymentMethods: z
    .object({
      venmo: z.boolean().optional(),
      zelle: z.boolean().optional(),
      paypal: z.boolean().optional(),
      cashapp: z.boolean().optional(),
    })
    .refine((data) => Object.values(data).some((value) => value), {
      message: "At least one payment method must be selected",
    }),
});

type FormValues = z.infer<typeof formSchema>;

const ListingForm = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<FormValues>>({
    paymentMethods: {
      venmo: false,
      zelle: false,
      paypal: false,
      cashapp: false,
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      eventName: "Bad Bunny - World's Hottest Tour",
      eventDate: "2024-09-30",
      venue: "SoFi Stadium, Los Angeles",
      seatInfo: "Section 230, Row D, Seats 15-17",
      quantity: "3",
      price: "280",
      description:
        "Three seats together with a great view! Mobile transfer through Ticketmaster.",
      paymentMethods: {
        venmo: true,
        zelle: true,
        paypal: false,
        cashapp: false,
      },
    },
  });

  const nextStep = async () => {
    if (step === 1) {
      const valid = await form.trigger([
        "eventName",
        "eventDate",
        "venue",
        "seatInfo",
        "quantity",
      ]);
      if (valid) {
        const data = form.getValues();
        setFormData({ ...formData, ...data });
        setStep(2);
      }
    } else if (step === 2) {
      const valid = await form.trigger(["price", "paymentMethods"]);
      if (valid) {
        const data = form.getValues();
        setFormData({ ...formData, ...data });
        setStep(3);
      }
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const onSubmit = async (data: FormValues) => {
    // Combine all form data
    const finalData = { ...formData, ...data };
    console.log("Form submitted:", finalData);

    try {
      // Import the API functions
      const { createListing } = await import("@/lib/api");

      // For now, we'll use a mock user ID since we're not using Supabase
      const mockUserId = "user-" + Date.now();

      // Format the data for the API
      const listingData = {
        seller_id: mockUserId,
        event_name: finalData.eventName,
        event_date: new Date(finalData.eventDate).toISOString(),
        venue: finalData.venue,
        location: finalData.venue, // Using venue as location for now
        section: finalData.seatInfo.split(",")[0]?.trim() || "",
        row: finalData.seatInfo.split(",")[1]?.trim() || "",
        seats: finalData.seatInfo.split(",")[2]?.trim() || "",
        quantity: parseInt(finalData.quantity),
        price: parseFloat(finalData.price),
        description: finalData.description || "",
        payment_methods: Object.entries(finalData.paymentMethods)
          .filter(([_, value]) => value)
          .map(([key]) => key.charAt(0).toUpperCase() + key.slice(1)),
        verified: false,
        status: "active",
        image_url:
          "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&q=80",
      };

      // Create the listing
      const { data: newListing, error } = await createListing(listingData);

      if (error) {
        console.error("Error creating listing:", error);
        alert("Failed to create listing. Please try again.");
        return;
      }

      alert("Listing created successfully!");

      // Redirect to the marketplace or listing details page
      window.location.href = "/marketplace";
    } catch (error) {
      console.error("Error creating listing:", error);
      alert("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <Card className="w-full max-w-[600px] bg-white shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Create Ticket Listing
        </CardTitle>
        <CardDescription className="text-center">
          Fill out the details below to list your tickets for sale.
        </CardDescription>
        <div className="flex justify-center mt-4">
          <div className="flex items-center">
            <div
              className={`rounded-full h-8 w-8 flex items-center justify-center ${step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            >
              <Ticket className="h-4 w-4" />
            </div>
            <div
              className={`h-1 w-10 ${step > 1 ? "bg-primary" : "bg-muted"}`}
            ></div>
            <div
              className={`rounded-full h-8 w-8 flex items-center justify-center ${step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            >
              <DollarSign className="h-4 w-4" />
            </div>
            <div
              className={`h-1 w-10 ${step > 2 ? "bg-primary" : "bg-muted"}`}
            ></div>
            <div
              className={`rounded-full h-8 w-8 flex items-center justify-center ${step >= 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            >
              <Check className="h-4 w-4" />
            </div>
          </div>
        </div>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent>
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="eventName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Taylor Swift Concert"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="eventDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Date</FormLabel>
                      <FormControl>
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                          <Input type="date" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="venue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Venue</FormLabel>
                      <FormControl>
                        <div className="flex items-center">
                          <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="e.g. Madison Square Garden"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="seatInfo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Seat Information</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Section 101, Row 10, Seats 5-6"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select quantity" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price per Ticket ($)</FormLabel>
                      <FormControl>
                        <div className="flex items-center">
                          <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Enter the price for each individual ticket.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add any additional details about your tickets here..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <FormLabel className="text-base">
                    Accepted Payment Methods
                  </FormLabel>
                  <FormDescription className="mb-3">
                    Select all payment methods you accept.
                  </FormDescription>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="paymentMethods.venmo"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Venmo</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="paymentMethods.zelle"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Zelle</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="paymentMethods.paypal"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>PayPal</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="paymentMethods.cashapp"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Cash App</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  {form.formState.errors.paymentMethods && (
                    <p className="text-sm font-medium text-destructive mt-2">
                      {form.formState.errors.paymentMethods.message}
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="bg-muted p-4 rounded-md">
                  <h3 className="font-medium text-lg mb-4">Listing Preview</h3>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Event:</span>
                      <span className="font-medium">
                        {form.getValues().eventName}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date:</span>
                      <span className="font-medium">
                        {form.getValues().eventDate}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Venue:</span>
                      <span className="font-medium">
                        {form.getValues().venue}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Seats:</span>
                      <span className="font-medium">
                        {form.getValues().seatInfo}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Quantity:</span>
                      <span className="font-medium">
                        {form.getValues().quantity}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Price per ticket:
                      </span>
                      <span className="font-medium">
                        ${form.getValues().price}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Total price:
                      </span>
                      <span className="font-medium">
                        $
                        {Number(form.getValues().price) *
                          Number(form.getValues().quantity)}
                      </span>
                    </div>

                    <div className="pt-2">
                      <span className="text-muted-foreground">
                        Accepted payment methods:
                      </span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {form.getValues().paymentMethods.venmo && (
                          <span className="bg-primary/10 text-primary px-2 py-1 rounded-md text-xs">
                            Venmo
                          </span>
                        )}
                        {form.getValues().paymentMethods.zelle && (
                          <span className="bg-primary/10 text-primary px-2 py-1 rounded-md text-xs">
                            Zelle
                          </span>
                        )}
                        {form.getValues().paymentMethods.paypal && (
                          <span className="bg-primary/10 text-primary px-2 py-1 rounded-md text-xs">
                            PayPal
                          </span>
                        )}
                        {form.getValues().paymentMethods.cashapp && (
                          <span className="bg-primary/10 text-primary px-2 py-1 rounded-md text-xs">
                            Cash App
                          </span>
                        )}
                      </div>
                    </div>

                    {form.getValues().description && (
                      <div className="pt-2">
                        <span className="text-muted-foreground">
                          Description:
                        </span>
                        <p className="mt-1">{form.getValues().description}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-muted/50 p-4 rounded-md border border-dashed border-muted-foreground/50">
                  <h4 className="font-medium mb-2">Important Notes:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>
                      Your listing will be visible to potential buyers
                      immediately.
                    </li>
                    <li>
                      TixBank will verify your tickets when a buyer initiates a
                      purchase.
                    </li>
                    <li>
                      You'll be notified when someone wants to buy your tickets.
                    </li>
                    <li>
                      You must transfer tickets within 1 hour of accepting a
                      sale.
                    </li>
                  </ul>
                </div>
              </motion.div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between">
            {step > 1 ? (
              <Button type="button" variant="outline" onClick={prevStep}>
                Back
              </Button>
            ) : (
              <div></div>
            )}

            {step < 3 ? (
              <Button type="button" onClick={nextStep}>
                Next <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit">Create Listing</Button>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default ListingForm;
