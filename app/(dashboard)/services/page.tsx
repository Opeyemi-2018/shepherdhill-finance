/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  Download,
  Check,
  X,
  Loader2,
} from "lucide-react";
import HeaderContent from "@/components/HeaderContent";
import { toast } from "sonner";
import { useAuth } from "@/context/user";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface ServiceItem {
  id: number;
  name: string;
  rate: number | string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

const TableSkeleton = () => (
  <>
    {[1, 2, 3, 4, 5].map((i) => (
      <tr key={i}>
        <td colSpan={4} className="py-5">
          <div className="flex gap-4 animate-pulse px-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/5" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6" />
          </div>
        </td>
      </tr>
    ))}
  </>
);

const PAGE_SIZE = 10;

export default function ServiceItemsPage() {
  const { token } = useAuth();
  const [items, setItems] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<ServiceItem | null>(null); // Inline add row state
  const [showAddRow, setShowAddRow] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRate, setNewRate] = useState("");
  const [savingAdd, setSavingAdd] = useState(false);

  // Inline edit state
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editRate, setEditRate] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete state (still dummy)
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Helper function for authenticated fetch
  const authFetch = async (url: string, options: RequestInit = {}) => {
    if (!token) {
      toast.error("You are not authenticated. Please login again.");
      return null;
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // ← Token added here
        ...options.headers,
      },
    });

    return response;
  };

  // ── Fetch Services ───────────────────────────────────────────────────────
  const fetchServices = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await authFetch(`${API_URL}/services`);

      if (!res) return;

      if (!res.ok) throw new Error("Failed to fetch services");

      const data = await res.json();

      if (data.status && Array.isArray(data.data)) {
        const formatted = data.data.map((item: any) => ({
          ...item,
          rate: parseFloat(item.rate || "0"),
        }));
        setItems(formatted);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load services. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [token]); // Re-fetch when token changes

  // ── Filtered & Paginated Data ─────────────────────────────────────────────
  const filtered = items.filter((i) =>
    i.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const goToPage = (p: number) => {
    if (p < 1 || p > totalPages) return;
    setCurrentPage(p);
  };

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  // ── Add New Service ──────────────────────────────────────────────────────
  const handleAdd = async () => {
    if (!newName.trim()) return toast.error("Service name is required");
    if (!newRate || isNaN(Number(newRate)) || Number(newRate) < 0)
      return toast.error("Enter a valid rate");

    setSavingAdd(true);

    try {
      const res = await authFetch(`${API_URL}/service/create`, {
        method: "POST",
        body: JSON.stringify({
          name: newName.trim(),
          rate: newRate,
        }),
      });

      if (!res) return;

      const data = await res.json();

      if (data.status) {
        toast.success("Service created successfully");
        setNewName("");
        setNewRate("");
        setShowAddRow(false);
        await fetchServices();
      } else {
        toast.error(data.message || "Failed to create service");
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    } finally {
      setSavingAdd(false);
    }
  };

  // ── Start Edit ───────────────────────────────────────────────────────────
  const startEdit = (item: ServiceItem) => {
    setEditId(item.id);
    setEditName(item.name);
    setEditRate(String(item.rate));
  };

  // ── Save Edit ────────────────────────────────────────────────────────────
  const handleEdit = async () => {
    if (!editName.trim()) return toast.error("Service name is required");
    if (!editRate || isNaN(Number(editRate)) || Number(editRate) < 0)
      return toast.error("Enter a valid rate");
    if (!editId) return;

    setSavingEdit(true);

    try {
      const res = await authFetch(`${API_URL}/service/edit/${editId}`, {
        method: "POST",
        body: JSON.stringify({
          name: editName.trim(),
          rate: editRate,
        }),
      });

      if (!res) return;

      const data = await res.json();

      if (data.status) {
        toast.success("Service updated successfully");
        setEditId(null);
        await fetchServices();
      } else {
        toast.error(data.message || "Failed to update service");
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    } finally {
      setSavingEdit(false);
    }
  };

  // ── Delete Service ───────────────────────────────────────────────────────
  const handleDelete = async (id: number) => {
    setDeletingId(id);

    try {
      const res = await authFetch(`${API_URL}/service/delete/${id}`, {
        method: "POST",
      });

      if (!res) return;

      const data = await res.json();

      if (data.status) {
        toast.success("Service deleted successfully");
        await fetchServices();
      } else {
        toast.error(data.message || "Failed to delete service");
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  // ── Download CSV ─────────────────────────────────────────────────────────
  const handleDownload = () => {
    if (items.length === 0) return toast.error("No data to download");

    const header = ["ID", "Service Name", "Rate (₦)"].join(",");
    const rows = items.map((i) => `${i.id},"${i.name}",${i.rate}`).join("\n");
    const csv = `${header}\n${rows}`;

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `service-items-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded successfully");
  };

  return (
    <div>
      <HeaderContent
        title="Service Items"
        description="Manage your service catalogue and rates for seamless invoice creation"
      />

      <div className="bg-primary-foreground shadow-lg rounded-lg p-4 mt-4 md:p-6">
        {/* Top Bar */}
        <div className="flex flex-col justify-between mb-4 sm:flex-row gap-3">
          <div className="mb-1">
            <h2 className="text-[14px] font-bold text-[#3A3A3A] dark:text-white font-dm-sans border-b-2 border-[#FAB435] inline-block pb-1">
              Service Items & Rates
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full flex items-center sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search service items..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FAB435] w-full"
              />
            </div>

            <Button
              variant="outline"
              className="gap-1.5 text-[13px]"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4" />
              Download
            </Button>

            <Button
              className="bg-[#FAB435]/30 text-[#E89500] hover:bg-[#FAB435]/50 gap-1.5 text-[13px]"
              onClick={() => {
                setShowAddRow(true);
                setEditId(null);
              }}
              disabled={showAddRow}
            >
              <Plus className="h-4 w-4" />
              Add Item
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white dark:bg-black/10">
              <tr>
                <th className="py-3 pl-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider w-12">
                  #
                </th>
                <th className="py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                  Service Name
                </th>
                <th className="py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider whitespace-nowrap">
                  Rate (₦)
                </th>
                <th className="py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#979797]/30">
              {/* Inline Add Row */}
              {showAddRow && (
                <tr className="bg-[#FAB435]/5">
                  <td className="py-3 pl-3 text-[13px] text-gray-400">—</td>
                  <td className="py-3 pr-3">
                    <Input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="e.g. Armed Police Escort"
                      className="h-9 text-[13px] bg-white dark:bg-gray-800 border-[#E5E7EB]"
                      onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                    />
                  </td>
                  <td className="py-3 pr-3">
                    <Input
                      value={newRate}
                      onChange={(e) => setNewRate(e.target.value)}
                      type="number"
                      min={0}
                      placeholder="45000"
                      className="h-9 text-[13px] bg-white dark:bg-gray-800 border-[#E5E7EB] w-36"
                      onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                    />
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleAdd}
                        disabled={savingAdd}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-[#FAB435] text-white text-[12px] font-medium hover:bg-[#DC9E2E] disabled:opacity-60 transition-colors"
                      >
                        {savingAdd ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Check className="h-3.5 w-3.5" />
                        )}
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setShowAddRow(false);
                          setNewName("");
                          setNewRate("");
                        }}
                        className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )}

              {loading && <TableSkeleton />}

              {!loading && paginated.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="py-12 text-center text-[#9E9A9A] font-dm-sans text-[13px]"
                  >
                    {searchQuery
                      ? "No service items match your search"
                      : "No service items yet. Click 'Add Item' to get started."}
                  </td>
                </tr>
              )}

              {!loading &&
                paginated.map((item, idx) =>
                  editId === item.id ? (
                    <tr key={item.id} className="bg-[#FAB435]/5">
                      <td className="py-3 pl-3 text-[13px] text-gray-400">
                        {(currentPage - 1) * PAGE_SIZE + idx + 1}
                      </td>
                      <td className="py-3 pr-3">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="h-9 text-[13px] bg-white dark:bg-gray-800 border-[#E5E7EB]"
                          onKeyDown={(e) => e.key === "Enter" && handleEdit()}
                        />
                      </td>
                      <td className="py-3 pr-3">
                        <Input
                          value={editRate}
                          onChange={(e) => setEditRate(e.target.value)}
                          type="number"
                          min={0}
                          className="h-9 text-[13px] bg-white dark:bg-gray-800 border-[#E5E7EB] w-36"
                          onKeyDown={(e) => e.key === "Enter" && handleEdit()}
                        />
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleEdit}
                            disabled={savingEdit}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-[#FAB435] text-white text-[12px] font-medium hover:bg-[#DC9E2E] disabled:opacity-60"
                          >
                            {savingEdit ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Check className="h-3.5 w-3.5" />
                            )}
                            Update
                          </button>
                          <button
                            onClick={() => setEditId(null)}
                            className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr
                      key={item.id}
                      className="transition-colors hover:bg-gray-50 dark:hover:bg-white/5"
                    >
                      <td className="py-5 pl-4 text-[13px] sm:text-[15px] text-[#2F2F2F] dark:text-[#979797]">
                        {(currentPage - 1) * PAGE_SIZE + idx + 1}
                      </td>
                      <td className="py-5 text-[13px] sm:text-[15px] font-medium text-[#2F2F2F] dark:text-[#979797]">
                        {item.name}
                      </td>
                      <td className="py-5 text-[13px] sm:text-[15px] text-[#2F2F2F] dark:text-[#979797]">
                        ₦{Number(item.rate).toLocaleString()}
                      </td>
                      <td className="py-5">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => startEdit(item)}
                            className="p-1.5 rounded-md text-gray-400 hover:text-[#FAB435] hover:bg-[#FAB435]/10 transition-colors"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <button
                                onClick={() => setDeleteTarget(item)}
                                className="p-1.5 rounded-md text-gray-400 hover:text-red-500"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </DialogTrigger>

                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Delete Service</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to delete{" "}
                                  <span className="font-medium text-black dark:text-white">
                                    {deleteTarget?.name}
                                  </span>
                                  ? This action cannot be undone.
                                </DialogDescription>
                              </DialogHeader>

                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={() => setDeleteTarget(null)}
                                >
                                  Cancel
                                </Button>

                                <Button
                                  className="bg-red-500 hover:bg-red-600 text-white"
                                  disabled={deletingId === deleteTarget?.id}
                                  onClick={async () => {
                                    if (!deleteTarget) return;

                                    await handleDelete(deleteTarget.id);

                                    setDeleteTarget(null);
                                  }}
                                >
                                  {deletingId === deleteTarget?.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    "Delete"
                                  )}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </td>
                    </tr>
                  ),
                )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && (
          <div className="flex items-center justify-center sm:justify-end gap-2 mt-8">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={currentPage === 1}
              onClick={() => goToPage(currentPage - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-1">
              {pageNumbers.map((p) => (
                <Button
                  key={p}
                  variant="outline"
                  size="sm"
                  className={`h-8 w-8 text-[13px] ${
                    p === currentPage
                      ? "bg-[#FAB435]/30 text-[#FAB435] border-none"
                      : ""
                  }`}
                  onClick={() => goToPage(p)}
                >
                  {p}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={currentPage === totalPages}
              onClick={() => goToPage(currentPage + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
