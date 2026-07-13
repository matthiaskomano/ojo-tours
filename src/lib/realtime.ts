import { supabase } from "./supabase-client";
import { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js";

export type RealtimeEvent = "INSERT" | "UPDATE" | "DELETE" | "*";

export interface RealtimeSubscriptionOptions {
  table: string;
  filter?: string;
  event?: RealtimeEvent;
  callback: (payload: RealtimePostgresChangesPayload<any>) => void;
}

export class RealtimeManager {
  private channels: Map<string, RealtimeChannel> = new Map();
  private isConnected: boolean = false;

  /**
   * Subscribe to real-time changes on a table
   */
  subscribe(options: RealtimeSubscriptionOptions): RealtimeChannel {
    const { table, filter, event = "*", callback } = options;
    const channelName = `${table}_${filter || "all"}_${event}`;

    // Check if channel already exists
    if (this.channels.has(channelName)) {
      return this.channels.get(channelName)!;
    }

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event,
          schema: "public",
          table,
          filter,
        },
        callback
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          this.isConnected = true;
          console.log(`[Realtime] Subscribed to ${table}`);
        } else if (status === "CLOSED" || status === "CHANNEL_ERROR") {
          this.isConnected = false;
          console.error(`[Realtime] Connection error for ${table}`);
        }
      });

    this.channels.set(channelName, channel);
    return channel;
  }

  /**
   * Unsubscribe from a specific channel
   */
  unsubscribe(channelName: string): void {
    const channel = this.channels.get(channelName);
    if (channel) {
      supabase.removeChannel(channel);
      this.channels.delete(channelName);
      console.log(`[Realtime] Unsubscribed from ${channelName}`);
    }
  }

  /**
   * Unsubscribe from all channels
   */
  unsubscribeAll(): void {
    this.channels.forEach((channel, name) => {
      supabase.removeChannel(channel);
      console.log(`[Realtime] Unsubscribed from ${name}`);
    });
    this.channels.clear();
    this.isConnected = false;
  }

  /**
   * Check if realtime is connected
   */
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  /**
   * Get active channel count
   */
  getActiveChannelCount(): number {
    return this.channels.size;
  }
}

// Singleton instance
export const realtimeManager = new RealtimeManager();

/**
 * Subscribe to notification changes for a specific user
 */
export function subscribeToNotifications(
  userId: string,
  callback: (payload: RealtimePostgresChangesPayload<any>) => void
): RealtimeChannel {
  return realtimeManager.subscribe({
    table: "Notification",
    filter: `userId=eq.${userId}`,
    event: "*",
    callback,
  });
}

/**
 * Subscribe to booking status changes for a specific user
 */
export function subscribeToBookings(
  userId: string,
  callback: (payload: RealtimePostgresChangesPayload<any>) => void
): RealtimeChannel {
  return realtimeManager.subscribe({
    table: "Booking",
    filter: `userId=eq.${userId}`,
    event: "UPDATE",
    callback,
  });
}

/**
 * Subscribe to payment status changes for a specific user
 */
export function subscribeToPayments(
  userId: string,
  callback: (payload: RealtimePostgresChangesPayload<any>) => void
): RealtimeChannel {
  return realtimeManager.subscribe({
    table: "Payment",
    filter: `userId=eq.${userId}`,
    event: "UPDATE",
    callback,
  });
}
