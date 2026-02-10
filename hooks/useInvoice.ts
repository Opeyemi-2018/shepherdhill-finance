/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useInvoice.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/user";
import {
  fetchInvoices,
  fetchInvoiceDetailAction,
  FetchInvoicesResult,
  FetchInvoiceDetailResult,
} from "@/actions/invoice";
import { toast } from "sonner";

export function useInvoices() {
  const { token } = useAuth();

  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  

  const loadInvoices = useCallback(async () => {
    if (!token) {
      setError("Please log in to view invoices");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const result: FetchInvoicesResult = await fetchInvoices(token);

    if (!result.success) {
      setError(result.error || "Failed to load invoices");
      toast.error(result.error || "Failed to load invoices");
      setLoading(false);
      return;
    }

    // We take the "all" array
    setInvoices(result.data?.data?.all || []);
    setLoading(false);
  }, [token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadInvoices();
  }, [loadInvoices]);

  return {
    invoices,
    loading,
    error,
    refetch: loadInvoices,
  };
}

export function useInvoiceDetail(invoiceId: string | number) {
  const { token } = useAuth();

  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadInvoice = useCallback(async () => {
    if (!token) {
      setError("Please log in to view this invoice");
      setLoading(false);
      return;
    }

    if (!invoiceId) {
      setError("Invoice ID is missing");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const result: FetchInvoiceDetailResult = await fetchInvoiceDetailAction(
      invoiceId,
      token,
    );

    if (!result.success) {
      setError(result.error || "Failed to load invoice details");
      toast.error(result.error || "Failed to load invoice");
      setLoading(false);
      return;
    }

    setInvoice(result.data);
    setLoading(false);
  }, [token, invoiceId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadInvoice();
  }, [loadInvoice]);

  return {
    invoice,
    loading,
    error,
    refetch: loadInvoice,
  };
}