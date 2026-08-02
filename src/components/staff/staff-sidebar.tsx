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
  Home,
  Camera,
  BookOpen,
  Users,
  Bell,
  User,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useNotifications } from "@/contexts/notification-context";

const data = {
  user: {
    name: "Staff",
    email: "staff@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard/staff",
      icon: <LayoutDashboardIcon />,
    },
    {
      title: "Bookings",
      url: "/dashboard/staff/bookings",
      icon: <CalendarIcon />,
    },
  ],
  documents: [
    {
      name: "Expeditions",
      icon: <Map />,
      url: "/dashboard/staff/expeditions",
    },
    {
      name: "Properties",
      icon: <Home />,
      url: "/dashboard/staff/lodges",
    },
    {
      name: "Gallery",
      icon: <Camera />,
      url: "/dashboard/staff/gallery",
    },
    {
      name: "Team Members",
      url: "/dashboard/staff/team",
      icon: <Users />,
    },
    {
      name: "Editorial",
      url: "/dashboard/staff/journals",
      icon: <BookOpen />,
    },
    {
      name: "Notifications",
      url: "/dashboard/staff/notifications",
      icon: <Bell />,
    },
  ],
  navSecondary: [
    {
      title: "Profile",
      url: "/dashboard/staff/profile",
      icon: <User />,
    },
    {
      title: "Settings",
      url: "/dashboard/staff/settings",
      icon: <Settings2Icon />,
    },
  ],
};

export function StaffSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user?: {
    fullName?: string | null;
    email: string;
    avatar?: string | null;
  };
}) {
  const role = "STAFF";
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
        <NavMain items={data.navMain} />
        <NavDocuments items={documentsWithBadge} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} role={role} />
      </SidebarFooter>
    </Sidebar>
  );
}