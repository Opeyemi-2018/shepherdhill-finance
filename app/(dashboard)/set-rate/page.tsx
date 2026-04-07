/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, MoreHorizontal, Pencil, Trash2, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import HeaderContent from "@/components/HeaderContent";

// ─── Types ────────────────────────────────────────────────
interface ServiceRate {
  id: number;
  service: string;
  rate: number;
  created_at: string;
}

const STORAGE_KEY = "shepherd_service_rates";

function loadRates(): ServiceRate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRates(rates: ServiceRate[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rates));
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(value);
}

// ─── Modal ────────────────────────────────────────────────
function ServiceRateModal({
  open,
  onClose,
  onSave,
  existing,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (service: string, rate: number) => void;
  existing?: ServiceRate | null;
}) {
  const [service, setService] = useState("");
  const [rate, setRate] = useState("");
  const [errors, setErrors] = useState<{ service?: string; rate?: string }>({});

  useEffect(() => {
    if (existing) {
      setService(existing.service);
      setRate(existing.rate.toString());
    } else {
      setService("");
      setRate("");
    }
    setErrors({});
  }, [existing, open]);

  const handleSave = () => {
    const newErrors: typeof errors = {};
    if (!service.trim()) newErrors.service = "Service name is required";
    if (!rate || Number(rate) <= 0) newErrors.rate = "Enter a valid rate";
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }
    onSave(service.trim(), Number(rate));
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{existing ? "Edit Service Rate" : "Add Service Rate"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1">
            <Label>Service Name <span className="text-red-500">*</span></Label>
            <Input
              placeholder="e.g. Man Guarding"
              value={service}
              onChange={(e) => {
                setService(e.target.value);
                setErrors((p) => ({ ...p, service: undefined }));
              }}
            />
            {errors.service && <p className="text-red-500 text-xs">{errors.service}</p>}
          </div>

          <div className="space-y-1">
            <Label>Rate (₦) <span className="text-red-500">*</span></Label>
            <Input
              type="number"
              min={0}
              step="0.01"
              placeholder="e.g. 50000"
              value={rate}
              onChange={(e) => {
                setRate(e.target.value);
                setErrors((p) => ({ ...p, rate: undefined }));
              }}
            />
            {errors.rate && <p className="text-red-500 text-xs">{errors.rate}</p>}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleSave}
            className="bg-[#FAB435] hover:bg-[#E89500] text-black"
          >
            {existing ? "Save Changes" : "Add Service"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Page ─────────────────────────────────────────────────
export default function SetRatePage() {
  const [rates, setRates] = useState<ServiceRate[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceRate | null>(null);

  useEffect(() => {
    setRates(loadRates());
  }, []);

  const handleSave = (service: string, rate: number) => {
    let updated: ServiceRate[];

    if (editing) {
      updated = rates.map((r) =>
        r.id === editing.id ? { ...r, service, rate } : r
      );
      toast.success("Service rate updated");
    } else {
      const newRate: ServiceRate = {
        id: Date.now(),
        service,
        rate,
        created_at: new Date().toISOString(),
      };
      updated = [...rates, newRate];
      toast.success("Service rate added");
    }

    setRates(updated);
    saveRates(updated);
    setEditing(null);
  };

  const handleDelete = (id: number) => {
    const updated = rates.filter((r) => r.id !== id);
    setRates(updated);
    saveRates(updated);
    toast.success("Service rate deleted");
  };

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (rate: ServiceRate) => {
    setEditing(rate);
    setModalOpen(true);
  };

  return (
    <div>
      <HeaderContent
        title="Set Rate"
        description="Define service types and their default rates for use in invoices."
      />

      <div className="bg-primary-foreground p-3 md:p-6 mt-4 rounded-xl border border-gray-100 dark:border-white/10 shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-[#C9922A]" />
            <h2 className="text-[16px] md:text-[18px] font-bold text-gray-900 dark:text-white">
              Service Rates
            </h2>
            <span className="ml-1 px-2 py-0.5 rounded-full bg-[#FAB435]/15 text-[#C9922A] text-xs font-semibold">
              {rates.length}
            </span>
          </div>
          <Button
            onClick={openAdd}
            className="bg-[#FAB435]/30 hover:bg-[#DC9E2E] hover:text-white text-[#E89500] h-9 text-sm"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Add Service
          </Button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-100 dark:border-white/10">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/10">
                {["#", "Service Name", "Rate (₦)", "Date Added", "Action"].map((h) => (
                  <th
                    key={h}
                    className="py-3 px-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/10">
              {rates.length > 0 ? (
                rates.map((r, i) => (
                  <tr key={r.id} className="hover:bg-gray-50/60 dark:hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4 text-sm text-gray-400">{i + 1}</td>
                    <td className="py-3.5 px-4 text-sm font-medium text-gray-800 dark:text-gray-200">
                      {r.service}
                    </td>
                    <td className="py-3.5 px-4 text-sm font-semibold text-[#C9922A]">
                      {formatCurrency(r.rate)}
                    </td>
                    <td className="py-3.5 px-4 text-sm text-gray-500">
                      {new Date(r.created_at).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3.5 px-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4 text-[#C9922A]" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="cursor-pointer gap-2"
                            onClick={() => openEdit(r)}
                          >
                            <Pencil className="w-3.5 h-3.5" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer gap-2 text-red-500 focus:text-red-500"
                            onClick={() => handleDelete(r.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-14 text-center text-sm text-gray-400">
                    No service rates yet. Click <span className="font-semibold text-[#C9922A]">Add Service</span> to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ServiceRateModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSave={handleSave}
        existing={editing}
      />
    </div>
  );
}