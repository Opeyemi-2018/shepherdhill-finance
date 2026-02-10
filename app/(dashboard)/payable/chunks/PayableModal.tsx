/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Download, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/user";
import Image from "next/image";

interface PayableDetail {
  id: number;
  vendor_id: string;
  amount: string;
  description: string | null;
  attachment: string | null;
  status: string;
  expense_date: string;
  payment_date: string | null;
  payment_details: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  vendor: {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
  };
  creator: any | null;
}

interface PayableDetailModalProps {
  payableId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange?: () => void; // optional callback to refresh table
}

export function PayableDetailModal({
  payableId,
  open,
  onOpenChange,
  onStatusChange,
}: PayableDetailModalProps) {
  const { token } = useAuth();
  const [payable, setPayable] = useState<PayableDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [approving, setApproving] = useState(false);

  // Fetch payable details when modal opens and ID changes
  useEffect(() => {
    if (!open || !payableId || !token) {
      setPayable(null);
      setError(null);
      return;
    }

    const fetchPayable = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/payables/view/${payableId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          },
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch payable (${response.status})`);
        }

        const json = await response.json();

        if (!json.status || !json.data) {
          throw new Error(json.message || "Invalid payable response");
        }

        setPayable(json.data);
      } catch (err: any) {
        const msg = err.message || "Could not load payable details";
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchPayable();
  }, [open, payableId, token]);

  const handleApprove = async () => {
    if (!payableId || !token || payable?.status === "approved") return;

    setApproving(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/payables/update-status`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: "approved",
            payment_id: payableId.toString(),
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to update status (${response.status})`);
      }

      const json = await response.json();

      if (!json.status) {
        throw new Error(json.message || "Failed to approve payable");
      }

      toast.success("Payable approved successfully!");
      onOpenChange(false);
      if (onStatusChange) onStatusChange(); // refresh table
    } catch (err: any) {
      toast.error(err.message || "Failed to approve payable");
    } finally {
      setApproving(false);
    }
  };

  const getAttachmentUrl = (path: string | null) => {
    if (!path) return null;

    let baseUrl = process.env.NEXT_PUBLIC_API_URL || "";

    // Remove /api/finance (or any /api* suffix) from base URL for static files
    baseUrl = baseUrl.replace(/\/api(\/finance)?\/?$/, ""); // removes /api or /api/finance
    baseUrl = baseUrl.replace(/\/$/, ""); // remove trailing slash if any

    // If path already has http(s) (unlikely), return as-is
    if (path.startsWith("http")) return path;

    // Build clean URL: base + / + path (remove leading slash if path has it)
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    return `${baseUrl}/${cleanPath}`;
  };

  const isImage = (url: string | null) => {
    if (!url) return false;
    return /\.(jpg|jpeg|png)$/i.test(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Payable Details #{payableId}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-[#FAB435]" />
            <p className="text-muted-foreground">Loading details...</p>
          </div>
        ) : error ? (
          <div className="py-12 text-center text-red-600">
            <p className="text-lg font-medium">{error}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </div>
        ) : !payable ? (
          <div className="py-12 text-center text-muted-foreground">
            No details available
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Vendor */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Vendor</p>
                <p className="font-medium">
                  {payable.vendor?.name || "Unknown"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="font-medium text-lg">
                  ₦{Number(payable.amount).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Status */}
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge
                variant={
                  payable.status === "approved"
                    ? "default"
                    : payable.status === "pending"
                      ? "secondary"
                      : "destructive"
                }
                className="mt-1 text-base px-4 py-1"
              >
                {payable.status.charAt(0).toUpperCase() +
                  payable.status.slice(1)}
              </Badge>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Expense Date</p>
                <p className="font-medium">
                  {payable.expense_date && payable.expense_date !== "0000-00-00"
                    ? new Date(payable.expense_date).toLocaleDateString("en-GB")
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment Date</p>
                <p className="font-medium">
                  {payable.payment_date
                    ? new Date(payable.payment_date).toLocaleDateString("en-GB")
                    : "Not paid yet"}
                </p>
              </div>
            </div>

            {/* Payment Details */}
            {payable.payment_details && (
              <div>
                <p className="text-sm text-muted-foreground">Payment Details</p>
                <p className="font-medium mt-1">{payable.payment_details}</p>
              </div>
            )}

            {/* Description */}
            {payable.description && (
              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="font-medium mt-1">{payable.description}</p>
              </div>
            )}

            {/* Attachment */}
            {payable.attachment && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Attachment</p>
                <div className="border rounded-lg overflow-hidden bg-muted/30">
                  {isImage(getAttachmentUrl(payable.attachment)) ? (
                    <div className="relative h-64 w-full">
                      <Image
                        src={getAttachmentUrl(payable.attachment)!}
                        alt="Attachment"
                        fill
                        className="object-contain"
                        unoptimized // for external images
                      />
                    </div>
                  ) : (
                    <div className="h-32 flex flex-col items-center justify-center gap-3">
                      <p className="text-muted-foreground">
                        File: {payable.attachment.split("/").pop()}
                      </p>
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={getAttachmentUrl(payable.attachment)!}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Approve Button – only if not approved */}
            {payable.status !== "approved" && (
              <div className="pt-4">
                <Button
                  onClick={handleApprove}
                  disabled={approving}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  {approving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Approving...
                    </>
                  ) : (
                    "Approve Payable"
                  )}
                </Button>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
