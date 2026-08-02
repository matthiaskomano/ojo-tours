import React from "react";
import { getBookings } from "@/actions/bookingActions";
import { getTours } from "@/actions/tourActions";
import { getJournals } from "@/actions/journalActions";
import { getLodges } from "@/actions/lodgeActions";
import { getGalleryImages } from "@/actions/galleryActions";
import { getTeam } from "@/actions/teamActions";
import StaffOverview from "./StaffOverview";

// Forces Next.js to always fetch fresh data when you load the staff page
export const dynamic = "force-dynamic";

export default async function StaffDashboard() {
  // Fetch data for the staff dashboard (read-only access)
  const [bookings, tours, journals, lodges, gallery, team] = await Promise.all([
    getBookings(),
    getTours(),
    getJournals(),
    getLodges(),
    getGalleryImages(),
    getTeam(),
  ]);

  return (
    <StaffOverview
      bookings={bookings}
      tours={tours}
      journals={journals}
      lodges={lodges}
      gallery={gallery}
      team={team}
    />
  );
}
