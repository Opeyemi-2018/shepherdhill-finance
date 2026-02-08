/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { IoChevronBackOutline } from "react-icons/io5";
import {  Loader2 } from "lucide-react"; // ← add Loader2
import { toast } from "sonner";
import { useAuth } from "@/context/user";
import { fetchInvoiceDetailAction, sendInvoiceAction } from "@/actions/invoice";
import { FaUserLarge } from "react-icons/fa6";

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuth();

  const invoiceId = params.id as string;

  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Separate loading state for Send button
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const loadInvoice = async () => {
      if (!token) {
        setError("Please log in to view this invoice");
        setLoading(false);
        return;
      }

      const result = await fetchInvoiceDetailAction(invoiceId, token);

      if (!result.success) {
        setError(result.error || "Failed to load invoice");
        setLoading(false);
        return;
      }

      setInvoice(result.data);
      setLoading(false);
    };

    loadInvoice();
  }, [invoiceId, token]);

  const handleSendInvoice = async () => {
    if (!token) {
      toast.error("Please log in to send the invoice");
      return;
    }

    if (!invoice?.id) {
      toast.error("No invoice loaded");
      return;
    }

    setIsSending(true);

    try {
      const result = await sendInvoiceAction(invoice.id, token);

      if (!result.success) {
        toast.error(result.error || "Failed to send invoice");
        return;
      }

      toast.success(result.message || "Invoice sent successfully!");
      
      // Optional: refresh data or page
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "An error occurred while sending");
    } finally {
      setIsSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-[#FAB435]" />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="pt-10 text-center">
        <p className="text-red-600 mb-6">{error || "Invoice not found"}</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "paid": return "text-green-600 dark:text-green-400";
      case "sent":
      case "partial": return "text-blue-600 dark:text-blue-400";
      case "draft": return "text-gray-600 dark:text-gray-400";
      case "overdue": return "text-red-600 dark:text-red-400";
      default: return "text-gray-600 dark:text-gray-400";
    }
  };

  return (
    <div className="pt-2 pb-8">
      <div className="flex md:items-center flex-col gap-4 md:gap-0 md:flex-row justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            size="icon"
            onClick={() => router.back()}
            className="bg-primary-foreground hover:text-white text-black dark:text-white dark:hover:text-black"
          >
            <IoChevronBackOutline className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <FaUserLarge className="bg-primary-foreground dark:bg-transparent text-[#FAB435] rounded-full p-2 w-12 h-12" />
            <div>
              <h1 className="md:text-[20px] font-medium">{invoice.client.name}</h1>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-[14px] text-gray-500">
                  INV-{invoice.id} • {invoice.client.email}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="whitespace-nowrap">
            Download Invoice
          </Button>
          <Button
            className="bg-[#FAB435] hover:bg-[#E89500] text-black hover:text-white whitespace-nowrap"
            onClick={handleSendInvoice}
            disabled={isSending || loading}
          >
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Invoice"
            )}
          </Button>
        </div>
      </div>

      <div className="bg-primary-foreground shadow-lg rounded-lg p-6">
        <h2 className="font-bold text-[16px] dark:text-white text-[#3A3A3A] pb-3 border-b border-[#979797]/30 mb-6">
          Invoice Summary
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-1">
            <p className="text-[12px] text-muted-foreground">Client Name</p>
            <p className="font-medium text-[14px]">{invoice.client.name}</p>
          </div>

          <div className="space-y-1">
            <p className="text-[12px] text-muted-foreground">Client Email</p>
            <p className="font-medium text-[14px]">{invoice.client.email}</p>
          </div>

          <div className="space-y-1">
            <p className="text-[12px] text-muted-foreground">Invoice ID</p>
            <p className="font-medium text-[14px]">INV-{invoice.id}</p>
          </div>

          <div className="space-y-1">
            <p className="text-[12px] text-muted-foreground">Invoice Date</p>
            <p className="font-medium text-[14px]">
              {new Date(invoice.invoice_date).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-[12px] text-muted-foreground">Due Date</p>
            <p className="font-medium text-[14px]">
              {new Date(invoice.due_date).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-[12px] text-muted-foreground">Amount</p>
            <p className="font-medium text-[14px]">
              ₦{Number(invoice.amount).toLocaleString()}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-[12px] text-muted-foreground">Description</p>
            <p className="font-medium text-[14px]">{invoice.description || "—"}</p>
          </div>

          <div className="space-y-1">
            <p className="text-[12px] text-muted-foreground">Status</p>
            <p className={`font-medium text-[14px] ${getStatusColor(invoice.status)}`}>
              • {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}