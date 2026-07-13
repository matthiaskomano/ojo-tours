"use client";

import { useState, useEffect } from "react";
import { getTouristReviews, deleteReview } from "@/actions/touristActions";
import { Star, Trash2, Map, Home, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Review = {
  id: string;
  itemId: string;
  itemType: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export default function TouristReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const data = await getTouristReviews();
        setReviews(data);
      } catch (error) {
        console.error("Failed to fetch reviews:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this review?")) {
      try {
        await deleteReview(id);
        const data = await getTouristReviews();
        setReviews(data);
      } catch (error) {
        console.error("Failed to delete review:", error);
        alert("Failed to delete review. Please try again.");
      }
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const getItemIcon = (itemType: string) => {
    switch (itemType) {
      case "Tour":
        return <Map className="h-5 w-5" />;
      case "Lodge":
        return <Home className="h-5 w-5" />;
      default:
        return <Calendar className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            My Reviews
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Share your experiences with our tours and lodges
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="text-sm text-gray-500 mt-4">Loading reviews...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Star className="h-8 w-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No reviews yet
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            Share your experience after completing a trip
          </p>
          <Button
            onClick={() => (window.location.href = "/tours")}
            className="bg-gradient-to-r from-[#d4af37] to-[#d3b673] hover:opacity-90 text-white cursor-pointer"
          >
            Explore Tours
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((review) => (
            <Card key={review.id} className="hover:shadow-lg transition-shadow border-gray-100">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#e9d5ff] to-[#c084fc] flex items-center justify-center text-[#7e22ce] shadow-sm">
                      {getItemIcon(review.itemType)}
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        {review.itemType}
                      </CardTitle>
                      <p className="text-xs text-gray-500">ID: {review.itemId}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDelete(review.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>{renderStars(review.rating)}</div>
                {review.comment && (
                  <p className="text-sm text-gray-600">{review.comment}</p>
                )}
                <div className="text-xs text-gray-400">
                  Reviewed{" "}
                  {new Date(review.createdAt).toLocaleDateString("en-US", {
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
