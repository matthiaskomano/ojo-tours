"use client";

import { useState, useEffect } from "react";
import { getTouristWishlist, removeFromWishlist } from "@/actions/touristActions";
import { Heart, Trash2, Map, Home, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type WishlistItem = {
  id: string;
  itemId: string;
  itemType: string;
  createdAt: Date;
};

export default function TouristWishlistPage() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      setLoading(true);
      try {
        const data = await getTouristWishlist();
        setWishlist(data);
      } catch (error) {
        console.error("Failed to fetch wishlist:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, []);

  const handleRemove = async (id: string) => {
    try {
      await removeFromWishlist(id);
      const data = await getTouristWishlist();
      setWishlist(data);
    } catch (error) {
      console.error("Failed to remove from wishlist:", error);
      alert("Failed to remove item. Please try again.");
    }
  };

  const getItemIcon = (itemType: string) => {
    switch (itemType) {
      case "Tour":
        return <Map className="h-5 w-5" />;
      case "Lodge":
        return <Home className="h-5 w-5" />;
      case "Journal":
        return <BookOpen className="h-5 w-5" />;
      default:
        return <Heart className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            My Wishlist
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Saved experiences and destinations
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="text-sm text-gray-500 mt-4">Loading wishlist...</p>
        </div>
      ) : wishlist.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Heart className="h-8 w-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Your wishlist is empty
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            Save your favorite experiences by clicking the heart icon
          </p>
          <Button
            onClick={() => (window.location.href = "/tours")}
            className="bg-gradient-to-r from-[#d4af37] to-[#d3b673] hover:opacity-90 text-white cursor-pointer"
          >
            Explore Tours
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow border-gray-100">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#e9d5ff] to-[#c084fc] flex items-center justify-center text-[#7e22ce] shadow-sm">
                      {getItemIcon(item.itemType)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {item.itemType}
                      </h3>
                      <p className="text-xs text-gray-500">ID: {item.itemId}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleRemove(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-xs text-gray-400">
                  Added{" "}
                  {new Date(item.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
