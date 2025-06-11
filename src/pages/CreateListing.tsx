import React from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Clock, ArrowRight } from "lucide-react";

const CreateListing = () => {
  return (
    <Layout>
      <div className="container py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Create Listing</h1>
            <p className="text-muted-foreground">
              List your tickets for sale on our secure marketplace.
            </p>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex items-center justify-center bg-yellow-100 rounded-full p-3">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-xl font-bold text-yellow-800">Coming Soon</h2>
              <p className="text-yellow-700">
                Our full marketplace listing feature is under development. For
                now, you can use our secure single ticket transfer service.
              </p>
            </div>
            <Button asChild className="whitespace-nowrap">
              <Link to="/single-ticket-transfer">Try Single Transfer</Link>
            </Button>
          </div>
        </div>

        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Preview: Create a Listing</CardTitle>
              <CardDescription>
                This is a preview of our upcoming listing creation feature.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 opacity-70 pointer-events-none">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Event</label>
                  <div className="h-10 bg-muted rounded-md"></div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Date</label>
                    <div className="h-10 bg-muted rounded-md"></div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Time</label>
                    <div className="h-10 bg-muted rounded-md"></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Venue</label>
                  <div className="h-10 bg-muted rounded-md"></div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Section</label>
                    <div className="h-10 bg-muted rounded-md"></div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Row</label>
                    <div className="h-10 bg-muted rounded-md"></div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Seats</label>
                    <div className="h-10 bg-muted rounded-md"></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Price per Ticket
                  </label>
                  <div className="h-10 bg-muted rounded-md"></div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Upload Ticket Images
                  </label>
                  <div className="h-24 bg-muted rounded-md border-2 border-dashed border-muted-foreground/20 flex items-center justify-center">
                    <span className="text-muted-foreground">
                      Drag & drop or click to upload
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" disabled>
                <span className="flex items-center gap-2">
                  Coming Soon <ArrowRight className="h-4 w-4" />
                </span>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default CreateListing;