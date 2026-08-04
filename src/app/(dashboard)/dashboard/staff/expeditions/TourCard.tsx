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

interface TourCardProps {
  tour: {
    id: string;
    title: string;
    location: string;
    duration: string;
    price: string;
    image: string;
    description?: string;
    category?: string;
    difficulty?: string;
    groupSize?: string;
    rating?: number;
    included?: string[];
    excluded?: string[];
    itinerary?: any[];
    faqs?: any[];
  };
}

export function TourCard({ tour }: TourCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="aspect-video bg-gray-200 relative">
        <img
          src={tour.image}
          alt={tour.title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2">{tour.title}</h3>
        <p className="text-sm text-gray-500 mb-3">{tour.location}</p>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-900">
            {tour.price}
          </span>
          <span className="text-xs text-gray-500">{tour.duration}</span>
        </div>
        <div className="mt-3">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="w-full text-black">
                <InfoIcon className="w-4 h-4 mr-2" />
                View Details
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg md:max-w-2xl h-[500px]">
              <DialogHeader>
                <DialogTitle>{tour.title}</DialogTitle>
                <DialogDescription>{tour.location}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 overflow-y-auto h-[380px] pr-2">
                <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={tour.image}
                    alt={tour.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {tour.description && (
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900 mb-2">
                      Description
                    </h4>
                    <p className="text-sm text-gray-600">{tour.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {tour.category && (
                    <div>
                      <h4 className="font-semibold text-sm text-gray-900 mb-1">
                        Category
                      </h4>
                      <p className="text-sm text-gray-600">{tour.category}</p>
                    </div>
                  )}
                  {tour.difficulty && (
                    <div>
                      <h4 className="font-semibold text-sm text-gray-900 mb-1">
                        Difficulty
                      </h4>
                      <p className="text-sm text-gray-600">{tour.difficulty}</p>
                    </div>
                  )}
                  {tour.groupSize && (
                    <div>
                      <h4 className="font-semibold text-sm text-gray-900 mb-1">
                        Group Size
                      </h4>
                      <p className="text-sm text-gray-600">{tour.groupSize}</p>
                    </div>
                  )}
                  {tour.rating && (
                    <div>
                      <h4 className="font-semibold text-sm text-gray-900 mb-1">
                        Rating
                      </h4>
                      <p className="text-sm text-gray-600">{tour.rating} / 5</p>
                    </div>
                  )}
                </div>

                {tour.included && tour.included.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900 mb-2">
                      Included
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {tour.included.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          {typeof item === 'string' ? item : String(item || '')}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {tour.excluded && tour.excluded.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900 mb-2">
                      Not Included
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {tour.excluded.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-red-500 mr-2">✗</span>
                          {typeof item === 'string' ? item : String(item || '')}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {tour.itinerary && tour.itinerary.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900 mb-2">
                      Itinerary
                    </h4>
                    <div className="space-y-2">
                      {tour.itinerary.map((day: any, index: number) => {
                        const dayTitle = day.day || day.title || `Day ${index + 1}`;
                        const dayDesc = typeof day === 'string' 
                          ? day 
                          : (day.desc || day.description || '');
                        return (
                          <div key={index} className="text-sm text-gray-600">
                            <span className="font-medium">{dayTitle}:</span>
                            <span className="ml-2">{String(dayDesc || '')}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {tour.faqs && tour.faqs.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900 mb-2">
                      FAQs
                    </h4>
                    <div className="space-y-2">
                      {tour.faqs.map((faq: any, index: number) => {
                        const question = typeof faq === 'string' 
                          ? faq 
                          : (faq.question || '');
                        const answer = typeof faq === 'string' 
                          ? null 
                          : (faq.answer || null);
                        return (
                          <div key={index} className="text-sm">
                            <p className="font-medium text-gray-900">
                              {String(question || '')}
                            </p>
                            {answer && (
                              <p className="text-gray-600 mt-1">{String(answer)}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t">
                  <div>
                    <span className="text-sm text-gray-500">Price</span>
                    <span className="ml-2 text-lg font-semibold text-gray-900">
                      {tour.price}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Duration</span>
                    <span className="ml-2 text-sm font-medium text-gray-900">
                      {tour.duration}
                    </span>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
