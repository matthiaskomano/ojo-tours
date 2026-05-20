import React from "react";
import { getTours } from "@/actions/tourActions";
import { getJournals } from "@/actions/journalActions";
import { getLodges } from "@/actions/lodgeActions";
import { getBookings } from "@/actions/bookingActions";
import { getGalleryImages } from "@/actions/galleryActions";
import { getTeam } from "@/actions/teamActions"; // 🚀 NEW: Import team actions!
import AdminClient from "./AdminClient";

// Forces Next.js to always fetch fresh data when you load the admin page
export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  // 🚀 ADVANCED PERFORMANCE UPGRADE: 
  // Fetch all SIX database tables simultaneously instead of making them wait in line.
  const [tours, journals, lodges, bookings, gallery, team] = await Promise.all([
    getTours(),
    getJournals(),
    getLodges(),
    getBookings(),
    getGalleryImages(),
    getTeam() // 🚀 NEW: Fetch the team!
  ]);

  // Pass all the data to your interactive Client Component
  return (
    <AdminClient 
      tours={tours} 
      journals={journals} 
      lodges={lodges} 
      bookings={bookings} 
      gallery={gallery} 
      team={team} // 
    />
  );
}