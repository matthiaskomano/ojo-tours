"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InfoIcon } from "lucide-react";

interface LodgeCardProps {
  lodge: {
    id: string;
    name: string;
    location: string;
    price: string;
    image: string;
    description?: string;
    amenities?: string[];
  };
}

export function LodgeCard({ lodge }: LodgeCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="aspect-video bg-gray-200 relative">
        <img
          src={lodge.image}
          alt={lodge.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2">{lodge.name}</h3>
        <p className="text-sm text-gray-500 mb-3">{lodge.location}</p>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-900">
            {lodge.price}
          </span>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-black">
                <InfoIcon className="w-4 h-4 mr-2" />
                View Details
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>{lodge.name}</DialogTitle>
                <DialogDescription>{lodge.location}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={lodge.image}
                    alt={lodge.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {lodge.description && (
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900 mb-2">
                      Description
                    </h4>
                    <p className="text-sm text-gray-600">{lodge.description}</p>
                  </div>
                )}
                {lodge.amenities && lodge.amenities.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900 mb-2">
                      Amenities
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {lodge.amenities.map((amenity, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-sm text-gray-500">Price</span>
                  <span className="text-lg font-semibold text-gray-900">
                    {lodge.price}
                  </span>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
