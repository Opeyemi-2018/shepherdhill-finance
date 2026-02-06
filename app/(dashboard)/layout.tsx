"use client";
import { ReactNode, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import Navbar from "@/components/Navbar";

const DashboardLayoutContent = ({ children }: { children: ReactNode }) => {
  const { setOpenMobile, toggleSidebar } = useSidebar();
  const pathname = usePathname();
  const mainRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleLinkClick = () => {
    setOpenMobile(false);
  };

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }

    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }

    window.scrollTo(0, 0);

    const scrollContainers = document.querySelectorAll(
      "[data-scroll-container]"
    );
    scrollContainers.forEach((container) => {
      container.scrollTop = 0;
    });
  }, [pathname]);

  return (
    <>
      <AppSidebar onLinkClick={handleLinkClick} />
      <main
        ref={mainRef}
        className="w-full bg-background lg:px-5 overflow-auto"
        data-scroll-container
      >
        <Navbar />
        <div
          ref={contentRef}
          className="px-3 h-screen overflow-auto"
          data-scroll-container
        >
          {children}
        </div>
      </main>
    </>
  );
};

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  return (
    <SidebarProvider defaultOpen={true}>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </SidebarProvider>
  );
};

export default DashboardLayout;
