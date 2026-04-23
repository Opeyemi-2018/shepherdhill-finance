"use client";
import { ReactNode, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/user";
import { useSessionGuard } from "@/hooks/useSessionGuard"; // ← ADD THIS

const DashboardLayoutContent = ({ children }: { children: ReactNode }) => {
  useSessionGuard(); // ← ADD THIS RIGHT HERE
  const { setOpenMobile } = useSidebar();
  const pathname = usePathname();
  const mainRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { token } = useAuth();

  // Rest of your code stays exactly the same...
  useEffect(() => {
    if (!token) {
      window.location.replace("/sign-in");
      return;
    }

    window.history.pushState(null, "", window.location.href);

    const handlePopState = () => {
      if (!token) {
        window.location.replace("/sign-in");
      } else {
        window.history.pushState(null, "", window.location.href);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [token]);

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
      "[data-scroll-container]",
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
