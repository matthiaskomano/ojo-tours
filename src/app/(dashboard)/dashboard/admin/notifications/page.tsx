"use client";

import { useState, useEffect } from "react";
import {
  getTouristNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from "@/actions/touristActions";
import {
  Bell,
  Check,
  Trash2,
  Calendar,
  CheckCircle2,
  Wifi,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useNotifications } from "@/contexts/notification-context";
import { useRealtimeNotifications } from "@/hooks/use-realtime-notifications";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: Date;
};

export default function AdminNotificationsPage() {
  const [loading, setLoading] = useState(true);
  const {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    deleteNotification: deleteNotif,
  } = useNotifications();
  const { refreshNotifications } = useRealtimeNotifications();

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const data = await getTouristNotifications();
        // Sync with context
        await refreshNotifications();
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, [refreshNotifications]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      await refreshNotifications();
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsRead();
      await refreshNotifications();
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id);
      await refreshNotifications();
    } catch (error) {
      console.error("Failed to delete notification:", error);
      alert("Failed to delete notification. Please try again.");
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "booking":
        return <Calendar className="h-5 w-5" />;
      case "payment":
        return <CheckCircle2 className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "booking":
        return "from-blue-500 to-blue-600";
      case "payment":
        return "from-emerald-500 to-emerald-600";
      case "trip":
        return "from-purple-500 to-purple-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            Notifications
          </h1>
          <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
            Stay updated on system events and activities
            {isConnected ? (
              <span className="flex items-center gap-1 text-green-600 text-xs">
                <Wifi className="h-3 w-3" />
                Live
              </span>
            ) : (
              <span className="flex items-center gap-1 text-gray-400 text-xs">
                <Wifi className="h-3 w-3" />
                Offline
              </span>
            )}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            onClick={handleMarkAllAsRead}
            variant="outline"
            className="cursor-pointer text-black"
          >
            Mark all as read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="text-sm text-gray-500 mt-4">Loading notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Bell className="h-8 w-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No notifications yet
          </h3>
          <p className="text-sm text-gray-500">
            We'll notify you about system events and updates
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`hover:shadow-md transition-shadow border-gray-100 ${
                !notification.isRead ? "bg-blue-50/50" : ""
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-lg bg-linear-to-br ${getNotificationColor(
                      notification.type,
                    )} flex items-center justify-center text-white shadow-sm shrink-0`}
                  >
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {notification.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(notification.createdAt).toLocaleString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {!notification.isRead && (
                          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200">
                            New
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="cursor-pointer"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Mark as read
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(notification.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
