"use client";

import { useEffect, useState } from "react";
import { useNotifications } from "@/contexts/notification-context";
import { subscribeToNotifications, subscribeToBookings, subscribeToPayments } from "@/lib/realtime";
import { supabase } from "@/lib/supabase-client";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

export function useRealtimeNotifications() {
  const { notifications, unreadCount, isConnected, refreshNotifications } = useNotifications();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };

    getCurrentUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
      } else {
        setUserId(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Subscribe to notification changes
  useEffect(() => {
    if (!userId) return;

    const channel = subscribeToNotifications(
      userId,
      (payload: RealtimePostgresChangesPayload<any>) => {
        console.log("[Realtime Hook] Notification event:", payload.eventType, payload);
        refreshNotifications();
      }
    );

    return () => {
      channel.unsubscribe();
    };
  }, [userId, refreshNotifications]);

  // Subscribe to booking status changes
  useEffect(() => {
    if (!userId) return;

    const channel = subscribeToBookings(
      userId,
      (payload: RealtimePostgresChangesPayload<any>) => {
        console.log("[Realtime Hook] Booking event:", payload.eventType, payload);
        if (payload.eventType === "UPDATE" && payload.old.status !== payload.new.status) {
          refreshNotifications();
        }
      }
    );

    return () => {
      channel.unsubscribe();
    };
  }, [userId, refreshNotifications]);

  // Subscribe to payment status changes
  useEffect(() => {
    if (!userId) return;

    const channel = subscribeToPayments(
      userId,
      (payload: RealtimePostgresChangesPayload<any>) => {
        console.log("[Realtime Hook] Payment event:", payload.eventType, payload);
        if (payload.eventType === "UPDATE" && payload.old.status !== payload.new.status) {
          refreshNotifications();
        }
      }
    );

    return () => {
      channel.unsubscribe();
    };
  }, [userId, refreshNotifications]);

  return {
    notifications,
    unreadCount,
    isConnected,
    refreshNotifications,
  };
}
