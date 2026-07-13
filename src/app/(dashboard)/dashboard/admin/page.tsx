import React from "react";
import { getBookings } from "@/actions/bookingActions";
import { getTours } from "@/actions/tourActions";
import { getJournals } from "@/actions/journalActions";
import { getLodges } from "@/actions/lodgeActions";
import { getGalleryImages } from "@/actions/galleryActions";
import { getTeam } from "@/actions/teamActions";
import AdminOverview from "./AdminOverview";

// Forces Next.js to always fetch fresh data when you load the admin page
export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  // Fetch all data for the overview dashboard
  const [bookings, tours, journals, lodges, gallery, team] = await Promise.all([
    getBookings(),
    getTours(),
    getJournals(),
    getLodges(),
    getGalleryImages(),
    getTeam(),
  ]);

  return (
    <AdminOverview
      bookings={bookings}
      tours={tours}
      journals={journals}
      lodges={lodges}
      gallery={gallery}
      team={team}
    />
  );
}
