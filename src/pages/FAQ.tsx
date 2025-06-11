import React, { useEffect } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trackViewContent, getEnhancedUserData } from "@/lib/facebook-pixel";
import { useAuth0 } from "@auth0/auth0-react";
import Layout from "@/components/layout/Layout";

const FAQ = () => {
  const { user, isAuthenticated } = useAuth0();
  const userData = isAuthenticated ? getEnhancedUserData(user) : getEnhancedUserData();

  useEffect(() => {
    // Track page view
    if (typeof fbq !== 'undefined') {
      fbq('track', 'PageView', {
        content_name: 'FAQ',
        content_category: 'support'
      });
    }
  }, []);

  return (
    <Layout>
      <div className="container py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Find answers to common questions about using HoldMyTix
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>
                How does HoldMyTix protect me from scams?
              </AccordionTrigger>
              <AccordionContent>
                HoldMyTix acts as a trusted intermediary between buyers and
                sellers. We verify both the payment from the buyer and the
                ticket transfer from the seller before completing the
                transaction. This dual verification system ensures that neither
                party can scam the other, as we only release tickets to the
                buyer and payment to the seller once both sides of the
                transaction are verified.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger>
                What payment methods are supported?
              </AccordionTrigger>
              <AccordionContent>
                HoldMyTix supports various peer-to-peer payment methods
                including Venmo, PayPal, Zelle, and Cash App. Sellers can
                specify which payment methods they accept when creating a
                listing, and buyers can choose from the available options when
                making a purchase.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger>
                How long do I have to complete a transaction?
              </AccordionTrigger>
              <AccordionContent>
                Once both buyer and seller agree to a transaction, a 1-hour
                window begins. Within this timeframe, the buyer must send
                payment and the seller must transfer the tickets. This time
                limit ensures quick and efficient exchanges without long waiting
                periods.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger>
                What happens if the seller doesn't transfer the tickets?
              </AccordionTrigger>
              <AccordionContent>
                If the seller fails to transfer tickets within the specified
                timeframe, the transaction is automatically cancelled and the
                buyer is notified. If the buyer has already sent payment, we
                provide instructions on how to request a refund through their
                payment platform.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger>
                What happens if the buyer doesn't send payment?
              </AccordionTrigger>
              <AccordionContent>
                If the buyer doesn't send payment within the specified
                timeframe, the transaction is automatically cancelled. Any
                tickets that have already been transferred by the seller are
                returned, and the listing becomes available again in the
                marketplace.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6">
              <AccordionTrigger>
                How does HoldMyTix verify tickets?
              </AccordionTrigger>
              <AccordionContent>
                We verify tickets through direct integration with ticketing
                platforms like Ticketmaster. Sellers transfer tickets to a
                HoldMyTix holding account, which allows us to confirm the
                tickets are legitimate and match the description in the listing
                before transferring them to the buyer.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-7">
              <AccordionTrigger>Does HoldMyTix charge fees?</AccordionTrigger>
              <AccordionContent>
                HoldMyTix charges minimal service fees compared to traditional
                ticket marketplaces. Our fee structure is transparent and
                clearly displayed before finalizing any transaction. We focus on
                providing security and verification rather than maximizing
                profits through high fees.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-8">
              <AccordionTrigger>
                What types of events are supported?
              </AccordionTrigger>
              <AccordionContent>
                HoldMyTix supports tickets for all types of events including
                concerts, sports games, theater performances, festivals, and
                more. As long as the tickets can be electronically transferred,
                they can be sold through our platform.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-9">
              <AccordionTrigger>How do I contact support?</AccordionTrigger>
              <AccordionContent>
                You can reach our support team by emailing support@holdmytix.com
                or through the contact form on our website. We aim to respond to
                all inquiries within 24 hours.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-10">
              <AccordionTrigger>
                Is my personal information secure?
              </AccordionTrigger>
              <AccordionContent>
                Yes, we take data security seriously. HoldMyTix uses
                industry-standard encryption and security practices to protect
                your personal information. We never share your data with third
                parties without your consent, and we only collect information
                that's necessary for facilitating transactions.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </Layout>
  );
};

export default FAQ;