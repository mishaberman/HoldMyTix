
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TermsOfUse = () => {
  return (
    <div className="min-h-screen bg-muted/20 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">
              Terms of Use
            </CardTitle>
            <p className="text-center text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using HoldMyTix ("the Service"), you accept and agree to be bound 
              by the terms and provision of this agreement.
            </p>

            <h2>2. Description of Service</h2>
            <p>
              HoldMyTix is a platform that facilitates the secure transfer of event tickets between 
              users. We provide tools for listing, purchasing, and transferring tickets with legal 
              documentation through electronic signatures.
            </p>

            <h2>3. User Accounts</h2>
            <p>
              To use certain features of the Service, you must register for an account. You are 
              responsible for:
            </p>
            <ul>
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Providing accurate and complete information</li>
              <li>Keeping your information up to date</li>
            </ul>

            <h2>4. Prohibited Uses</h2>
            <p>You may not use the Service to:</p>
            <ul>
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Transmit harmful, fraudulent, or deceptive content</li>
              <li>Attempt to gain unauthorized access to other accounts</li>
              <li>Use automated systems to scrape or harvest data</li>
              <li>Sell counterfeit, stolen, or invalid tickets</li>
            </ul>

            <h2>5. Ticket Transactions</h2>
            <h3>Sellers agree to:</h3>
            <ul>
              <li>Only list tickets they legally own</li>
              <li>Provide accurate ticket and event information</li>
              <li>Transfer tickets promptly after payment</li>
              <li>Honor all agreed-upon terms</li>
            </ul>

            <h3>Buyers agree to:</h3>
            <ul>
              <li>Pay for tickets as agreed</li>
              <li>Provide accurate contact information</li>
              <li>Complete transactions in good faith</li>
            </ul>

            <h2>6. Electronic Signatures</h2>
            <p>
              By using our DocuSign integration, you consent to conduct transactions electronically 
              and agree that electronic signatures have the same legal effect as handwritten signatures.
            </p>

            <h2>7. Fees and Payments</h2>
            <p>
              HoldMyTix may charge fees for certain services. All fees will be clearly disclosed 
              before you incur them. Payments are processed through third-party payment processors.
            </p>

            <h2>8. Intellectual Property</h2>
            <p>
              The Service and its original content, features, and functionality are owned by 
              HoldMyTix and are protected by international copyright, trademark, and other 
              intellectual property laws.
            </p>

            <h2>9. Disclaimers</h2>
            <p>
              THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DO NOT 
              GUARANTEE THE VALIDITY OF TICKETS OR THE PERFORMANCE OF OTHER USERS.
            </p>

            <h2>10. Limitation of Liability</h2>
            <p>
              IN NO EVENT SHALL HOLDMYTIX BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, 
              CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF YOUR USE OF THE SERVICE.
            </p>

            <h2>11. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless HoldMyTix from any claims, damages, 
              losses, or expenses arising from your use of the Service or violation of these terms.
            </p>

            <h2>12. Dispute Resolution</h2>
            <p>
              Any disputes arising from these terms or your use of the Service will be resolved 
              through binding arbitration in accordance with the rules of the American Arbitration Association.
            </p>

            <h2>13. Termination</h2>
            <p>
              We may terminate or suspend your account at any time for any reason, including 
              violation of these terms. You may also terminate your account at any time.
            </p>

            <h2>14. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. We will provide notice of 
              material changes. Your continued use of the Service after changes constitutes acceptance.
            </p>

            <h2>15. Governing Law</h2>
            <p>
              These terms are governed by and construed in accordance with the laws of [Your State/Country], 
              without regard to conflict of law principles.
            </p>

            <h2>16. Contact Information</h2>
            <p>
              If you have questions about these terms, please contact us at:
            </p>
            <p>
              Email: legal@holdmytix.com<br />
              Address: [Your Company Address]
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsOfUse;
