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

interface JournalCardProps {
  journal: {
    id: string;
    title: string;
    category: string;
    author: string;
    readTime: string;
    image: string;
    excerpt?: string;
    content?: string;
    slug?: string;
    status?: string;
    featured?: boolean;
    gallery?: string[];
  };
}

export function JournalCard({ journal }: JournalCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="aspect-video bg-gray-200 relative">
        <img
          src={journal.image}
          alt={journal.title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2">
          {journal.title}
        </h3>
        <p className="text-sm text-gray-500 mb-3">{journal.category}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">{journal.author}</span>
          <span className="text-xs text-gray-500">
            {journal.readTime}
          </span>
        </div>
        <div className="mt-3">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="w-full text-black">
                <InfoIcon className="w-4 h-4 mr-2" />
                View Details
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg h-[500px]">
              <DialogHeader>
                <DialogTitle>{journal.title}</DialogTitle>
                <DialogDescription>{journal.category}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 overflow-y-auto h-[380px] pr-2">
                <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={journal.image}
                    alt={journal.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {journal.excerpt && (
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900 mb-2">
                      Excerpt
                    </h4>
                    <p className="text-sm text-gray-600">{journal.excerpt}</p>
                  </div>
                )}

                {journal.content && (
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900 mb-2">
                      Content
                    </h4>
                    <div className="text-sm text-gray-600 whitespace-pre-wrap">
                      {journal.content}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900 mb-1">
                      Author
                    </h4>
                    <p className="text-sm text-gray-600">{journal.author}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900 mb-1">
                      Read Time
                    </h4>
                    <p className="text-sm text-gray-600">{journal.readTime}</p>
                  </div>
                  {journal.status && (
                    <div>
                      <h4 className="font-semibold text-sm text-gray-900 mb-1">
                        Status
                      </h4>
                      <p className="text-sm text-gray-600">{journal.status}</p>
                    </div>
                  )}
                  {journal.slug && (
                    <div>
                      <h4 className="font-semibold text-sm text-gray-900 mb-1">
                        Slug
                      </h4>
                      <p className="text-sm text-gray-600 truncate">{journal.slug}</p>
                    </div>
                  )}
                </div>

                {journal.gallery && journal.gallery.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900 mb-2">
                      Gallery
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      {journal.gallery.map((image, index) => (
                        <div
                          key={index}
                          className="aspect-square rounded-lg overflow-hidden bg-gray-100"
                        >
                          <img
                            src={image}
                            alt={`Gallery ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t">
                  <div>
                    <span className="text-sm text-gray-500">Category</span>
                    <span className="ml-2 text-sm font-medium text-gray-900">
                      {journal.category}
                    </span>
                  </div>
                  {journal.featured && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                      Featured
                    </span>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
