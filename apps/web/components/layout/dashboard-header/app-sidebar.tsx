"use client";

import * as React from "react";
import {
  LayoutDashboard,
  BarChart3,
  MessageSquare,
  Zap,
  Workflow,
  Settings,
} from "lucide-react";

import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import { AppBranding } from "./app-branding";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

const data = {
  user: {
    name: "John Doe",
    email: "john@flowhq.com",
    avatar: "/avatars/user.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      items: [
        {
          title: "Home",
          url: "/dashboard",
        },
        {
          title: "Recent Activity",
          url: "#",
        },
        {
          title: "Quick Actions",
          url: "#",
        },
      ],
    },
    {
      title: "Analytics",
      url: "/dashboard/analytics",
      icon: BarChart3,
      items: [
        {
          title: "Home",
          url: "/dashboard/analytics",
        },
        {
          title: "Performance",
          url: "#",
        },
        {
          title: "Conversations",
          url: "#",
        },
        {
          title: "Reports",
          url: "#",
        },
        {
          title: "Insights",
          url: "#",
        },
      ],
    },
    {
      title: "Chat Interface",
      url: "/dashboard/chat",
      icon: MessageSquare,
      items: [
        {
          title: "Home",
          url: "/dashboard/chat",
        },
        {
          title: "Active Chats",
          url: "#",
        },
        {
          title: "Chat History",
          url: "#",
        },
        {
          title: "Escalations",
          url: "#",
        },
      ],
    },
    {
      title: "Integrations",
      url: "/dashboard/integrations",
      icon: Zap,
      items: [
        {
          title: "Home",
          url: "/dashboard/integrations",
        },
        {
          title: "Connected Apps",
          url: "#",
        },
        {
          title: "Available Apps",
          url: "#",
        },
        {
          title: "API Keys",
          url: "#",
        },
      ],
    },
    {
      title: "Workflow Builder",
      url: "/dashboard/workflows",
      icon: Workflow,
      items: [
        {
          title: "Home",
          url: "/dashboard/workflows",
        },
        {
          title: "My Workflows",
          url: "#",
        },
        {
          title: "Templates",
          url: "#",
        },
        {
          title: "Create New",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: Settings,
      items: [
        {
          title: "Home",
          url: "/dashboard/settings",
        },
        {
          title: "Profile",
          url: "#",
        },
        {
          title: "AI Configuration",
          url: "#",
        },
        {
          title: "Channels",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <AppBranding />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
