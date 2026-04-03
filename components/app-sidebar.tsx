"use client";

import {
  LayoutDashboard,
  Briefcase,
  NotepadText,
  LogOut,
  HandCoins,
  Banknote,
  BookText,
  Settings,
} from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { useAuth } from "@/context/user";

interface MenuItem {
  title: string;
  icon: React.ElementType;
  url: string;
}

const items: MenuItem[] = [
  {
    title: "Dashboard",
    url: "/overview",
    icon: LayoutDashboard,
  },
  {
    title: "Service",
    url: "/services",
    icon: Briefcase,
  },
  {
    title: "Invoices",
    url: "/invoices",
    icon: Briefcase,
  },
  {
    title: "Service Requests",
    url: "/service-request",
    icon: Briefcase,
  },
  {
    title: "Banking",
    url: "/banking",
    icon: NotepadText,
  },
  {
    title: "Receivable",
    url: "/receiviable",
    icon: HandCoins,
  },
  {
    title: "Payable",
    url: "/payable",
    icon: Banknote,
  },
  {
    title: "Report",
    url: "/report",
    icon: BookText,
  },
  // {
  //   title: "SOP Generator",
  //   url: "/sop",
  //   icon: Settings,
  // },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const isActive = (url: string) => pathname === url;

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="flex flex-col justify-between">
        {/* TOP SECTION */}
        <SidebarGroup>
          <SidebarHeader className="flex items-center justify-center">
            <SidebarMenu>
              <SidebarMenuItem className="flex items-center justify-center">
                <Link href="/dashboard/overview" onClick={onLinkClick}>
                  <Image
                    src="/shepherdhill.svg"
                    width={100}
                    height={100}
                    alt="logo"
                  />
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>

          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={`transition-all duration-200 hover:bg-[#FAB435]/30 hover:text-[#DC9E2E] hover:font-semibold dark:hover:bg-black dark:hover:text-[#FAB435] ${
                      isActive(item.url)
                        ? "bg-[#FAB435]/30 text-[#DC9E2E] font-semibold dark:bg-black dark:text-[#FAB435]"
                        : ""
                    }`}
                  >
                    <Link href={item.url} onClick={onLinkClick}>
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* BOTTOM SECTION */}
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem className="px-3">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <SidebarMenuButton className="mb-4 transition-all duration-200 hover:bg-[#FAB435]/30 hover:text-[#DC9E2E] hover:font-semibold dark:hover:bg-black dark:hover:text-[#FAB435]">
                    <LogOut className="w-5 h-5" />
                    <span className="text-[16px]">Logout Account</span>
                  </SidebarMenuButton>
                </AlertDialogTrigger>

                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action will log you out of the system
                    </AlertDialogDescription>
                  </AlertDialogHeader>

                  <AlertDialogFooter className="flex justify-center gap-2">
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        logout();
                        router.push("/sign-in");
                      }}
                      className="bg-red-600 text-white dark:hover:text-black"
                    >
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarContent>
    </Sidebar>
  );
}
