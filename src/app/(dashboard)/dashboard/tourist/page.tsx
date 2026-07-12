import { getTouristBookings } from "@/actions/touristActions";
import { getTouristWishlist } from "@/actions/touristActions";
import { getUnreadNotificationCount } from "@/actions/touristActions";
import TouristOverview from "@/components/tourist/tourist-overview";

export const dynamic = "force-dynamic";

export default async function TouristDashboardPage() {
  const [bookings, wishlist, unreadCount] = await Promise.all([
    getTouristBookings(),
    getTouristWishlist(),
    getUnreadNotificationCount(),
  ]);

  return (
    <TouristOverview
      bookings={bookings}
      wishlistCount={wishlist.length}
      unreadNotifications={unreadCount}
    />
  );
}
