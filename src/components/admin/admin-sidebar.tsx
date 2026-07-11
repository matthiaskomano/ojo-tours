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
  FileChartColumnIcon,
  HomeIcon,
  Map,
  Camera,
  CalendarIcon,
  Users,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard/admin",
      icon: <LayoutDashboardIcon />,
    },
    {
      title: "Bookings",
      url: "/dashboard/admin/bookings",
      icon: <CalendarIcon />,
    },
  ],
  documents: [
    {
      name: "Expeditions",
      icon: <Map />,
      url: "/dashboard/admin/expeditions",
    },
    {
      name: "Properties",
      icon: <HomeIcon />,
      url: "/dashboard/admin/properties",
    },
    {
      name: "Gallery",
      icon: <Camera />,
      url: "/dashboard/admin/gallery",
    },
    {
      name: "Team Members",
      url: "/dashboard/admin/team",
      icon: <Users />,
    },
    {
      name: "Editorial",
      url: "/dashboard/admin/editorial",
      icon: <BookOpen />,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/dashboard/admin/settings",
      icon: <Settings2Icon />,
    },
    {
      title: "Reports",
      url: "/dashboard/admin/reports",
      icon: <FileChartColumnIcon />,
    },
  ],
};

export function AdminSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user?: {
    fullName?: string | null;
    email: string;
    avatar?: string | null;
  };
}) {
  const userData = user
    ? {
        name: user.fullName || user.email.split("@")[0],
        email: user.email,
        avatar: user.avatar || "/avatars/shadcn.jpg",
      }
    : data.user;

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
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}
