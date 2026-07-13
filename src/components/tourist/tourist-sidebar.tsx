"use client";

import * as React from "react";

import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  LayoutDashboardIcon,
  Settings2Icon,
  CalendarIcon,
  Map,
  Heart,
  CreditCardIcon,
  Bell,
  Star,
  User,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { TouristNavMain } from "./tourist-nav-main";
import { useNotifications } from "@/contexts/notification-context";
import { Badge } from "@/components/ui/badge";

const data = {
  user: {
    name: "Tourist",
    email: "tourist@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard/tourist",
      icon: <LayoutDashboardIcon />,
    },
    {
      title: "My Bookings",
      url: "/dashboard/tourist/bookings",
      icon: <CalendarIcon />,
    },
    {
      title: "My Trips",
      url: "/dashboard/tourist/trips",
      icon: <Map />,
    },
  ],
  documents: [
    {
      name: "Wishlist",
      icon: <Heart />,
      url: "/dashboard/tourist/wishlist",
    },
    {
      name: "Reviews",
      url: "/dashboard/tourist/reviews",
      icon: <Star />,
    },
    {
      name: "Payments",
      url: "/dashboard/tourist/payments",
      icon: <CreditCardIcon />,
    },
    {
      name: "Notifications",
      url: "/dashboard/tourist/notifications",
      icon: <Bell />,
    },
  ],
  navSecondary: [
    {
      title: "Profile",
      url: "/dashboard/tourist/profile",
      icon: <User />,
    },
    {
      title: "Settings",
      url: "/dashboard/tourist/settings",
      icon: <Settings2Icon />,
    },
    {
      title: "Support",
      url: "/dashboard/tourist/support",
      icon: <HelpCircle />,
    },
  ],
};

export function TouristSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user?: {
    fullName?: string | null;
    email: string;
    avatar?: string | null;
  };
}) {
  const role = "TOURIST";
  const { unreadCount } = useNotifications();

  const userData = user
    ? {
        name: user.fullName || user.email.split("@")[0],
        email: user.email,
        avatar: user.avatar || "/avatars/shadcn.jpg",
      }
    : data.user;

  // Update documents with badge for notifications
  const documentsWithBadge = data.documents.map((doc) => {
    if (doc.name === "Notifications") {
      return {
        ...doc,
        badge: unreadCount > 0 ? unreadCount : undefined,
      };
    }
    return doc;
  });

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href="/">
                <Image
                  src="/ojo-logo.png"
                  alt="Ojo Tours"
                  width={32}
                  height={32}
                />
                <span className="text-base font-semibold">Ojo Tours</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <TouristNavMain items={data.navMain} />
        <NavDocuments items={documentsWithBadge} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} role={role} />
      </SidebarFooter>
    </Sidebar>
  );
}
