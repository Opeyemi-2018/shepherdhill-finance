/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import HeaderContent from "@/components/HeaderContent";
import { useState, useEffect, JSX } from "react";
import {
  Search,
  MoreVertical,
  GitPullRequest,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import { IoIosPeople } from "react-icons/io";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/context/user";
import { getServiceRequests } from "@/actions/requestService";
import StatCard from "@/components/HeaderCard";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ServiceRequest {
  id: number;
  service_name: string;
  client: { name: string };
  staff_count: string;
  status: string;
  start_date: string;
}

function TableSkeleton(): JSX.Element {
  return (
    <>
      {[...Array(5)].map((_, index) => (
        <tr key={index} className="animate-pulse">
          {[...Array(6)].map((_, j) => (
            <td key={j} className="py-4 whitespace-nowrap">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

const ITEMS_PER_PAGE = 5;

const ServiceRequests = () => {
  const { token } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("All Requests");
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const tabs = ["All Requests", "Pending", "Active"];

  useEffect(() => {
    const fetchServiceRequests = async () => {
      if (!token) {
        setError("Please log in to view service requests");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const result = await getServiceRequests(token);

      if (result.success) {
        const mapped: ServiceRequest[] = result.data.map((item: any) => ({
          id: item.id,
          service_name: item.service_name || "—",
          client: { name: item.client?.name || "Unknown" },
          staff_count: item.staff_count || "—",
          status: item.status || "unknown",
          start_date: item.start_date
            ? new Date(item.start_date).toLocaleDateString("en-GB")
            : "—",
        }));

        setRequests(mapped);
      } else {
        setError(result.message || "Failed to load service requests");
      }

      setLoading(false);
    };

    fetchServiceRequests();
  }, [token]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeTab]);

  // Stats
  const totalRequested = requests.length;
  const totalPending = requests.filter(
    (r) => r.status?.toLowerCase() === "pending",
  ).length;
  const totalActive = requests.filter(
    (r) => r.status?.toLowerCase() === "active",
  ).length;

  const getStatusBadge = (status: string) => {
    const isActive = status?.toLowerCase() === "active";
    return (
      <div className="flex items-center gap-2">
        <span
          className={`w-2 h-2 rounded-full ${isActive ? "bg-green-500" : "bg-[#FF5B5B]"}`}
        />
        <span
          className={`text-sm ${isActive ? "text-green-600" : "text-[#FF5B5B] dark:text-[#FF5B5B]"}`}
        >
          {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
        </span>
      </div>
    );
  };

  const filteredByTab = requests.filter((req) => {
    if (activeTab === "All Requests") return true;
    if (activeTab === "Pending") return req.status?.toLowerCase() === "pending";
    if (activeTab === "Active") return req.status?.toLowerCase() === "active";
    return true;
  });

  const filteredRequests = filteredByTab.filter(
    (req) =>
      req.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.service_name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalItems = filteredRequests.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentItems = filteredRequests.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleRowClick = (req: ServiceRequest) => {
    router.push(`/service-request/${req.id}`);
  };

  return (
    <div>
      <HeaderContent
        title="Service Requests"
        description="Start with a clear overview of what matters most"
      />

      <div className="flex justify-between overflow-x-auto gap-4 pt-6">
        <StatCard
          icon={IoIosPeople}
          label="Total Service Requested"
          value={totalRequested.toString()}
        />
        <StatCard
          icon={GitPullRequest}
          label="Total Pending"
          value={totalPending.toString()}
        />
        <StatCard
          icon={ShieldCheck}
          label="Total Active"
          value={totalActive.toString()}
        />
      </div>

      <div className="bg-primary-foreground shadow-lg pt-6 mt-6">
        <div className="p-3">
          <div className="flex justify-between items-center">
            <div className="hidden lg:flex items-center justify-between">
              <div className="flex gap-6">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-1 xl:px-1 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab
                        ? "border-[#DC9E2E] dark:text-white"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex lg:items-center flex-col-reverse md:flex-row justify-between w-full lg:w-auto gap-4 py-4">
              <div className="relative w-full lg:w-64 2xl:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search by client or service"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 placeholder:text-[13px] placeholder:text-gray-400"
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full my-6">
            <thead className="bg-white dark:bg-black/10">
              <tr>
                <th className="py-3 pl-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                  Service Name
                </th>
                <th className="py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                  Client
                </th>
                <th className="py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                  No of Staff Requested
                </th>
                <th className="py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                  Status
                </th>
                <th className="py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                  Start Date
                </th>
                <th className="py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#979797]/30">
              {loading ? (
                <TableSkeleton />
              ) : error ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-destructive">
                    {error}
                  </td>
                </tr>
              ) : currentItems.length > 0 ? (
                currentItems.map((req) => (
                  <tr
                    key={req.id}
                    className="dark:hover:!bg-black transition-colors cursor-pointer"
                    onClick={() => handleRowClick(req)}
                  >
                    <td className="py-4 pl-3 whitespace-nowrap text-[12px] sm:text-[14px] font-medium text-[#3A3A3A] dark:text-[#979797]">
                      {req.service_name}
                    </td>
                    <td className="py-4 whitespace-nowrap text-[12px] sm:text-[14px] font-medium text-[#3A3A3A] dark:text-[#979797]">
                      {req.client.name}
                    </td>
                    <td className="py-4 text-left whitespace-nowrap text-[12px] sm:text-[14px] font-medium text-[#3A3A3A] dark:text-[#979797]">
                      {req.staff_count}
                    </td>
                    <td className="py-4 whitespace-nowrap">
                      {getStatusBadge(req.status)}
                    </td>
                    <td className="py-4 whitespace-nowrap text-[12px] sm:text-[14px] font-medium text-[#3A3A3A] dark:text-[#979797]">
                      {req.start_date}
                    </td>
                    <td className="py-4 whitespace-nowrap">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-4 w-4 text-orange-400" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRowClick(req);
                            }}
                          >
                            View Details
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="py-8 text-center text-gray-500 dark:text-[#979797]"
                  >
                    {requests.length === 0
                      ? "No service request data available"
                      : "No requests match your search criteria"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && !error && totalItems > 0 && (
          <div className="px-6 pb-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t pt-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Showing {startIndex + 1}–{Math.min(endIndex, totalItems)} of{" "}
              {totalItems}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Prev
              </Button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <Button
                    key={page}
                    variant={page === currentPage ? "default" : "outline"}
                    size="sm"
                    className={
                      page === currentPage
                        ? "bg-[#DC9E2E] hover:bg-[#DC9E2E]/90"
                        : ""
                    }
                    onClick={() => goToPage(page)}
                  >
                    {page}
                  </Button>
                ),
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              service request and remove its data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ServiceRequests;
