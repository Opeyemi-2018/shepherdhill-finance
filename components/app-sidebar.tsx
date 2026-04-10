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
  FileText,
  ChevronRight,
  SlidersHorizontal,
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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

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
  { title: "Dashboard", url: "/overview", icon: LayoutDashboard },
  { title: "Invoice", url: "/invoices", icon: FileText },
  { title: "Service", url: "/services", icon: Briefcase },
  { title: "Service Requests", url: "/service-request", icon: Briefcase },
  { title: "Banking", url: "/banking", icon: NotepadText },
  { title: "Receivable", url: "/receiviable", icon: HandCoins },
  { title: "Payable", url: "/payable", icon: Banknote },
  { title: "Report", url: "/report", icon: BookText },
  { title: "Settings", url: "/settings", icon: Settings },
];

// const invoiceSubItems = [
//   { title: "Invoice", url: "/invoices", icon: FileText },
//   { title: "Set Rate", url: "/set-rate", icon: SlidersHorizontal },
// ];

export function AppSidebar({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const isActive = (url: string) => pathname === url;
  const isInvoiceActive = pathname.startsWith("/invoices");

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

              {/* ── Invoices collapsible ── */}
              {/* <Collapsible
                defaultOpen={isInvoiceActive}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      className={`transition-all duration-200 hover:bg-[#FAB435]/30 hover:text-[#DC9E2E] hover:font-semibold dark:hover:bg-black dark:hover:text-[#FAB435] w-full ${
                        isInvoiceActive
                          ? "bg-[#FAB435]/30 text-[#DC9E2E] font-semibold dark:bg-black dark:text-[#FAB435]"
                          : ""
                      }`}
                    >
                      <Briefcase className="w-5 h-5" />
                      <span>Invoices</span>
                      <ChevronRight className="ml-auto w-4 h-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {invoiceSubItems.map((sub) => (
                        <SidebarMenuSubItem key={sub.title}>
                          <SidebarMenuSubButton
                            asChild
                            className={`transition-all duration-200 hover:bg-[#FAB435]/20 hover:text-[#DC9E2E] ${
                              isActive(sub.url)
                                ? "bg-[#FAB435]/20 text-[#DC9E2E] font-semibold"
                                : "text-gray-500"
                            }`}
                          >
                            <Link href={sub.url} onClick={onLinkClick}>
                              <sub.icon className="w-4 h-4" />
                              <span>{sub.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible> */}
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
