import React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  CalendarIcon,
  MapPinIcon,
  DollarSignIcon,
  ShieldCheckIcon,
  CreditCardIcon,
} from "lucide-react";

interface PaymentMethod {
  name: string;
  icon: React.ReactNode;
}

interface ListingCardProps {
  id?: string;
  title?: string;
  date?: string;
  location?: string;
  price?: number;
  image?: string;
  seller?: {
    name: string;
    rating: number;
    avatar?: string;
  };
  paymentMethods?: PaymentMethod[];
  verified?: boolean;
  onPurchase?: (id: string) => void;
  onViewDetails?: (id: string) => void;
}

const ListingCard = ({
  id = "123",
  title = "Taylor Swift: The Eras Tour",
  date = "2023-08-15",
  location = "SoFi Stadium, Los Angeles",
  price = 250,
  image = "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&q=80",
  seller = {
    name: "John Doe",
    rating: 4.8,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
  },
  paymentMethods = [
    { name: "Venmo", icon: <CreditCardIcon className="h-4 w-4" /> },
    { name: "PayPal", icon: <CreditCardIcon className="h-4 w-4" /> },
    { name: "Zelle", icon: <CreditCardIcon className="h-4 w-4" /> },
  ],
  verified = true,
  onPurchase = (id) => {
    window.location.href = `/transaction/${id}`;
  },
  onViewDetails = (id) => {
    window.location.href = `/listing/${id}`;
  },
}: ListingCardProps) => {
  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Card className="w-full max-w-[380px] overflow-hidden bg-white hover:shadow-lg transition-shadow duration-300">
      <div className="relative h-40 overflow-hidden">
        <img src={image} alt={title} className="w-full h-full object-cover" />
        {verified && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-green-500 text-white flex items-center gap-1">
              <ShieldCheckIcon className="h-3 w-3" />
              Verified
            </Badge>
          </div>
        )}
      </div>

      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-lg line-clamp-1">{title}</h3>
          <span className="font-bold text-lg text-green-600">${price}</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-2 pb-2">
        <div className="flex items-center text-sm text-gray-600">
          <CalendarIcon className="h-4 w-4 mr-2" />
          <span>{formattedDate}</span>
        </div>

        <div className="flex items-center text-sm text-gray-600">
          <MapPinIcon className="h-4 w-4 mr-2" />
          <span className="line-clamp-1">{location}</span>
        </div>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center">
            <Avatar className="h-6 w-6 mr-2">
              <AvatarImage src={seller.avatar} />
              <AvatarFallback>{seller.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-sm">{seller.name}</span>
          </div>
          <div className="flex items-center">
            <span className="text-sm font-medium mr-1">{seller.rating}</span>
            <span className="text-yellow-500">★</span>
          </div>
        </div>

        <div className="flex items-center gap-1 mt-2">
          <span className="text-xs text-gray-500 mr-1">Accepts:</span>
          <div className="flex gap-1">
            {paymentMethods.map((method, index) => (
              <TooltipProvider key={index}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="p-1 bg-gray-100 rounded-full">
                      {method.icon}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{method.name}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0 flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => onViewDetails(id)}
        >
          View Details
        </Button>
        <Button className="flex-1" onClick={() => onPurchase(id)}>
          Purchase
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ListingCard;
