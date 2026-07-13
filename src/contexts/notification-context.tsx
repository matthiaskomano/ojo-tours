"use client";

import * as React from "react";
import {
  subscribeToNotifications,
  subscribeToBookings,
  subscribeToPayments,
} from "@/lib/realtime";
import { supabase } from "@/lib/supabase-client";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";

export type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: Date;
};

export type Booking = {
  id: string;
  status: string;
  itemName: string;
  itemType: string;
};

export type Payment = {
  id: string;
  status: string;
  amount: string;
  bookingId?: string;
};

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
}

const NotificationContext = React.createContext<
  NotificationContextType | undefined
>(undefined);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [isConnected, setIsConnected] = React.useState(false);
  const [userId, setUserId] = React.useState<string | null>(null);
  const [userRole, setUserRole] = React.useState<string>("TOURIST");

  // Fetch current user and role
  React.useEffect(() => {
    const getCurrentUser = async () => {
      console.log("[NotificationContext] Fetching user-role from API...");
      try {
        const response = await fetch("/api/auth/user-role");
        if (response.ok) {
          const data = await response.json();
          if (data.userId) {
            setUserRole(data.role || "TOURIST");
            setUserId(data.userId);
          } else {
            console.log(
              "[NotificationContext] No userId in response, user not authenticated",
            );
          }
        } else {
          console.log(
            "[NotificationContext] user-role response not OK:",
            response.status,
          );
        }
      } catch (error) {
        console.error(
          "[NotificationContext] Failed to fetch user role:",
          error,
        );
      }
    };

    getCurrentUser();

    // Poll for user role changes every 30 seconds
    const interval = setInterval(getCurrentUser, 30000);

    return () => clearInterval(interval);
  }, []);

  // Fetch notifications
  const fetchNotifications = React.useCallback(async () => {
    if (!userId) {
      console.error("[NotificationContext] No userId, skipping fetch");
      return;
    }

    try {
      const apiEndpoint =
        userRole === "ADMIN" || userRole === "SUPER_ADMIN"
          ? "/api/admin/notifications"
          : "/api/tourist/notifications";

      const response = await fetch(apiEndpoint);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
        setUnreadCount(data.filter((n: Notification) => !n.isRead).length);
      } else {
        console.error(
          "[NotificationContext] API response not OK:",
          response.status,
        );
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  }, [userId, userRole]);

  // Initial fetch
  React.useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [userId, fetchNotifications]);

  // Subscribe to real-time notifications
  React.useEffect(() => {
    if (!userId) return;

    const notificationChannel = subscribeToNotifications(
      userId,
      (payload: RealtimePostgresChangesPayload<any>) => {
        console.error("[Realtime] Notification change:", payload);

        if (payload.eventType === "INSERT") {
          setNotifications((prev) => [payload.new as Notification, ...prev]);
          if (!payload.new.isRead) {
            setUnreadCount((prev) => prev + 1);
          }
        } else if (payload.eventType === "UPDATE") {
          setNotifications((prev) =>
            prev.map((n) =>
              n.id === payload.new.id ? { ...n, ...payload.new } : n,
            ),
          );
          if (payload.old.isRead !== payload.new.isRead) {
            setUnreadCount((prev) =>
              payload.new.isRead ? prev - 1 : prev + 1,
            );
          }
        } else if (payload.eventType === "DELETE") {
          setNotifications((prev) =>
            prev.filter((n) => n.id !== payload.old.id),
          );
          if (!payload.old.isRead) {
            setUnreadCount((prev) => prev - 1);
          }
        }
      },
    );

    // Subscribe to the channel's subscription status
    const subscription = notificationChannel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        setIsConnected(true);
      } else if (status === "CLOSED" || status === "CHANNEL_ERROR") {
        setIsConnected(false);
      }
    });

    return () => {
      subscription.unsubscribe();
      notificationChannel.unsubscribe();
    };
  }, [userId]);

  const markAsRead = async (id: string) => {
    try {
      const apiEndpoint =
        userRole === "ADMIN" || userRole === "SUPER_ADMIN"
          ? "/api/admin/notifications/read"
          : "/api/tourist/notifications/read";

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const apiEndpoint =
        userRole === "ADMIN" || userRole === "SUPER_ADMIN"
          ? "/api/admin/notifications/read-all"
          : "/api/tourist/notifications/read-all";

      const response = await fetch(apiEndpoint, {
        method: "POST",
      });

      if (response.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const apiEndpoint =
        userRole === "ADMIN" || userRole === "SUPER_ADMIN"
          ? "/api/admin/notifications/delete"
          : "/api/tourist/notifications/delete";

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        const notification = notifications.find((n) => n.id === id);
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        if (notification && !notification.isRead) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    isConnected,
    refreshNotifications: fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = React.useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider",
    );
  }
  return context;
}
