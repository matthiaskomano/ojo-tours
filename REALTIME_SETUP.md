# Real-time Notification System Setup

This document describes the real-time notification system implemented using Supabase Realtime.

## Environment Variables

The following environment variables are required for the real-time notification system to work:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Supabase Realtime Configuration

To enable real-time functionality in Supabase:

1. Go to your Supabase project dashboard
2. Navigate to Database > Replication
3. Enable Realtime for the following tables:
   - `Notification`
   - `Booking`
   - `Payment`

4. Alternatively, you can enable Realtime via SQL:

```sql
-- Enable realtime for notifications
alter publication supabase_realtime add table notification;

-- Enable realtime for bookings
alter publication supabase_realtime add table booking;

-- Enable realtime for payments
alter publication supabase_realtime add table payment;
```

## Architecture

### Files Created

**Core Infrastructure:**

- `src/lib/supabase-client.ts` - Client-side Supabase client
- `src/lib/realtime.ts` - Realtime utilities and WebSocket management

**State Management:**

- `src/contexts/notification-context.tsx` - Notification context provider
- `src/hooks/use-realtime-notifications.ts` - Custom hook for realtime notifications

**API Routes:**

- `src/app/api/tourist/notifications/route.ts` - GET notifications
- `src/app/api/tourist/notifications/read/route.ts` - Mark as read
- `src/app/api/tourist/notifications/read-all/route.ts` - Mark all as read
- `src/app/api/tourist/notifications/delete/route.ts` - Delete notification

### Files Modified

- `src/app/(dashboard)/dashboard/tourist/layout.tsx` - Added NotificationProvider
- `src/components/tourist/tourist-sidebar.tsx` - Real-time badge updates
- `src/components/nav-documents.tsx` - Badge support
- `src/app/(dashboard)/dashboard/tourist/notifications/page.tsx` - Real-time updates

## Features

### Real-time Notification Updates

- Notifications appear instantly when created in the database
- No page refresh required
- WebSocket-based for low latency

### Live Booking Status Changes

- Subscribes to booking status updates
- Triggers notifications when booking status changes
- Supports status: Pending, Confirmed, Declined, Cancelled

### Instant Notification Badge Updates

- Sidebar notification badge updates in real-time
- Shows unread count with red badge
- Displays "99+" for counts over 99

### Connection Status Indicator

- Shows "Live" status when connected to Supabase Realtime
- Shows "Offline" status when disconnected
- Visual feedback in notifications page

## Usage

### Using the Notification Context

```tsx
import { useNotifications } from "@/contexts/notification-context";

function MyComponent() {
  const {
    notifications,
    unreadCount,
    isConnected,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  return (
    <div>
      <p>Unread: {unreadCount}</p>
      <p>Status: {isConnected ? "Live" : "Offline"}</p>
    </div>
  );
}
```

### Using the Realtime Hook

```tsx
import { useRealtimeNotifications } from "@/hooks/use-realtime-notifications";

function MyComponent() {
  const { notifications, unreadCount, isConnected, refreshNotifications } =
    useRealtimeNotifications();

  // Component automatically subscribes to realtime updates
  return <div>{/* Your UI */}</div>;
}
```

## WebSocket Connection Management

The `RealtimeManager` class handles:

- Automatic connection establishment
- Subscription management
- Connection status tracking
- Cleanup on unmount
- Error handling

### Manual Subscription

```tsx
import { subscribeToNotifications } from "@/lib/realtime";

const channel = subscribeToNotifications(userId, (payload) => {
  console.log("Notification change:", payload);
});

// Cleanup
channel.unsubscribe();
```

## Troubleshooting

### Notifications not updating in real-time

1. Check Supabase Realtime is enabled for the tables
2. Verify environment variables are set correctly
3. Check browser console for WebSocket errors
4. Ensure user is authenticated
5. Run the diagnostic script: `npx tsx scripts/diagnose-realtime.ts`

### Connection status shows "Offline"

1. Check Supabase project URL is correct
2. Verify ANON_KEY is valid
3. Check network connectivity
4. Ensure Supabase project is active
5. Run SQL commands in Supabase SQL Editor to enable Realtime

### Badge not updating

1. Verify NotificationProvider is wrapping the component tree
2. Check that useNotifications hook is being used
3. Ensure userId is available in the context

### Notifications not being created on booking status change

1. Check that the booking has a userId associated with it
2. Verify the user is authenticated when creating the booking
3. Check server logs for notification creation errors
4. Ensure the updateBookingStatus function is being called correctly

### Test the notification system

Run the test script to verify notifications are working:

```bash
npx tsx scripts/test-notifications.ts <userId>
```

This will:

- Check current notification count
- Create a test notification
- Verify the notification was created
- Clean up the test notification

### Diagnose Realtime connection

Run the diagnostic script to check Supabase Realtime:

```bash
npx tsx scripts/diagnose-realtime.ts
```

This will:

- Check Supabase client configuration
- Verify database connection
- Test table existence
- Test Realtime connection
- Provide SQL commands to enable Realtime

## Future Enhancements

- Real-time support chat
- Push notifications for mobile
- Notification preferences
- Notification grouping
- Sound notifications
- Desktop notifications (browser API)
