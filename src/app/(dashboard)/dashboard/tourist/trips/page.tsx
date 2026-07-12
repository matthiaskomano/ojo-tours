"use client";

import { useState, useEffect } from "react";
import { getTouristBookings } from "@/actions/touristActions";
import { Map, Calendar, Users, DollarSign, Clock, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Booking = {
  id: string;
  itemName: string;
  itemType: string;
  customerName: string;
  customerEmail: string;
  date: string;
  guests: string;
  totalPrice: string;
  status: string;
  createdAt: Date;
};

export default function TouristTripsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const data = await getTouristBookings();
        setBookings(data);
      } catch (error) {
        console.error("Failed to fetch bookings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  // Filter for confirmed bookings (trips)
  const trips = bookings.filter((b) => b.status === "Confirmed");

  const parsePrice = (priceStr: string) => {
    if (!priceStr) return 0;
    const cleanStr = priceStr.toString().replace(/[^0-9.-]+/g, "");
    return parseFloat(cleanStr) || 0;
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            My Trips
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Your upcoming and completed adventures
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="text-sm text-gray-500 mt-4">Loading trips...</p>
        </div>
      ) : trips.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Map className="h-8 w-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No confirmed trips yet
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            Your confirmed adventures will appear here
          </p>
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            {bookings.filter((b) => b.status === "Pending").length} pending bookings
          </Badge>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <Card key={trip.id} className="hover:shadow-lg transition-shadow border-gray-100">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base">{trip.itemName}</CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {trip.itemType}
                    </CardDescription>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200">
                    Confirmed
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>{trip.date}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span>{trip.guests} guests</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">{trip.totalPrice}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
