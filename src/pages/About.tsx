import React from "react";
import Layout from "@/components/layout/Layout";
import { Shield } from "lucide-react";

const About = () => {
  return (
    <Layout>
      <div className="container py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">About HoldMyTix</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our mission is to make peer-to-peer ticket exchanges safe, secure,
            and fair for everyone
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-3xl font-bold mb-4">Our Story</h2>
            <p className="text-lg text-muted-foreground mb-4">
              HoldMyTix was founded in 2023 by a group of concert and sports
              enthusiasts who were tired of the rampant scams and excessive fees
              in the secondary ticket market.
            </p>
            <p className="text-lg text-muted-foreground mb-4">
              After experiencing firsthand the frustration of being scammed when
              buying tickets online, our founders set out to create a platform
              that would eliminate the trust issues inherent in peer-to-peer
              ticket sales.
            </p>
            <p className="text-lg text-muted-foreground">
              By acting as a trusted intermediary that verifies both sides of
              the transaction, HoldMyTix has quickly become the safest way to
              buy and sell tickets directly between fans.
            </p>
          </div>
          <div className="relative">
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
            <img
              src="https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80"
              alt="Concert crowd"
              className="rounded-lg shadow-2xl w-full object-cover"
            />
          </div>
        </div>

        <div className="bg-muted p-8 rounded-lg mb-16">
          <h2 className="text-2xl font-bold mb-6 text-center">Our Values</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-background p-6 rounded-lg">
              <div className="mb-4 p-3 bg-primary/10 w-fit rounded-full">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Trust & Security</h3>
              <p className="text-muted-foreground">
                We believe that every transaction should be secure and
                transparent. Our verification system ensures that both buyers
                and sellers can trust the process.
              </p>
            </div>

            <div className="bg-background p-6 rounded-lg">
              <div className="mb-4 p-3 bg-primary/10 w-fit rounded-full">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Fair Pricing</h3>
              <p className="text-muted-foreground">
                We're committed to keeping fees low so that tickets remain
                affordable. We believe that excessive fees hurt both buyers and
                sellers.
              </p>
            </div>

            <div className="bg-background p-6 rounded-lg">
              <div className="mb-4 p-3 bg-primary/10 w-fit rounded-full">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Community First</h3>
              <p className="text-muted-foreground">
                We're building a community of honest fans who want to help each
                other attend events they love. Our platform is designed to
                foster trust between fans.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Meet Our Founder</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
            HoldMyTix was founded by Misha Berman, a passionate advocate for
            secure and fair ticket exchanges.
          </p>

          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="aspect-square rounded-full overflow-hidden mb-4 mx-auto w-40 h-40">
                <img
                  src="https://media.licdn.com/dms/image/v2/C4E03AQHQqVQzjQzQzA/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1516240902330?e=1740009600&v=beta&t=8KVQzjQzQzA"
                  alt="Misha Berman"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://api.dicebear.com/7.x/avataaars/svg?seed=misha";
                  }}
                />
              </div>
              <h3 className="font-bold text-2xl mb-2">Misha Berman</h3>
              <p className="text-lg text-muted-foreground mb-4">
                Founder & CEO
              </p>
              <a
                href="https://www.linkedin.com/in/mishaberman"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Connect on LinkedIn
              </a>
            </div>

            <div className="bg-background p-6 rounded-lg text-left">
              <h4 className="font-bold text-lg mb-3">Mission Statement</h4>
              <p className="text-muted-foreground leading-relaxed">
                "My mission is to empower people to securely find buyers and
                sellers on their own and transfer tickets without paying
                ridiculous fees. After experiencing the frustration and
                financial burden of excessive fees and scam risks in the
                secondary ticket market, I founded HoldMyTix to create a
                platform where fans can connect directly with each other in a
                safe, secure environment. We believe that ticket exchanges
                should be about connecting fans with events they love, not about
                enriching middlemen with outrageous fees."
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                "HoldMyTix serves as a trusted intermediary that verifies
                transactions without the markup, giving power back to the fans
                and ensuring that more money goes toward the actual experience
                rather than unnecessary fees."
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default About;
