"use client";

import * as React from "react";
import { Workflow } from "lucide-react";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function AppBranding() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="hover:bg-transparent cursor-default"
        >
          <div className="bg-blue-600 text-white flex aspect-square size-8 items-center justify-center rounded-lg">
            <Workflow className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold text-base">FlowHQ</span>
            <span className="truncate text-xs text-gray-500">AI Automation</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

