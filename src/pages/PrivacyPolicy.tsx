
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-muted/20 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">
              Privacy Policy
            </CardTitle>
            <p className="text-center text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <h2>1. Information We Collect</h2>
            <p>
              We collect information you provide directly to us, such as when you create an account, 
              list tickets for sale, purchase tickets, or contact us for support.
            </p>
            
            <h3>Personal Information:</h3>
            <ul>
              <li>Name and email address</li>
              <li>Phone number</li>
              <li>Payment information</li>
              <li>Profile information</li>
            </ul>

            <h3>Transaction Information:</h3>
            <ul>
              <li>Ticket details and purchase history</li>
              <li>Communication with other users</li>
              <li>Transfer agreements and signatures</li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send related information</li>
              <li>Send you technical notices and support messages</li>
              <li>Communicate with you about products, services, and events</li>
              <li>Monitor and analyze trends and usage</li>
              <li>Detect, investigate, and prevent fraudulent transactions</li>
            </ul>

            <h2>3. Information Sharing</h2>
            <p>
              We may share your information in the following situations:
            </p>
            <ul>
              <li>With other users as necessary to complete transactions</li>
              <li>With service providers who perform services on our behalf</li>
              <li>When required by law or to respond to legal process</li>
              <li>To protect the rights, property, and safety of HoldMyTix and others</li>
            </ul>

            <h2>4. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your 
              personal information against unauthorized access, alteration, disclosure, or destruction.
            </p>

            <h2>5. Third-Party Services</h2>
            <p>
              Our service integrates with third-party services including:
            </p>
            <ul>
              <li>DocuSign for electronic signatures</li>
              <li>Auth0 for authentication</li>
              <li>Supabase for data storage</li>
              <li>Payment processors for transactions</li>
            </ul>

            <h2>6. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access and update your personal information</li>
              <li>Delete your account and associated data</li>
              <li>Opt out of marketing communications</li>
              <li>Request a copy of your data</li>
            </ul>

            <h2>7. Cookies and Tracking</h2>
            <p>
              We use cookies and similar tracking technologies to collect information about your 
              browsing activities and to provide personalized content and advertising.
            </p>

            <h2>8. Children's Privacy</h2>
            <p>
              Our service is not intended for children under 13 years of age. We do not knowingly 
              collect personal information from children under 13.
            </p>

            <h2>9. Changes to This Policy</h2>
            <p>
              We may update this privacy policy from time to time. We will notify you of any 
              changes by posting the new policy on this page with an updated "Last updated" date.
            </p>

            <h2>10. Contact Us</h2>
            <p>
              If you have any questions about this privacy policy, please contact us at:
            </p>
            <p>
              Email: privacy@holdmytix.com<br />
              Address: [Your Company Address]
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
