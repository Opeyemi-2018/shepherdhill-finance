/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useClients.ts
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/user"; // your auth context with token
import { toast } from "sonner";

export interface Client {
  id: number;
  name: string;
  email?: string;
  address?: string;
  location?: string;
  service?: string;
  logo?: string | null;
  staff_number?: string;
  start_date?: string;
  end_date?: string;
  is_active?: string;
  // Add more fields if needed later
}

interface UseClientsReturn {
  clients: Client[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useClients(): UseClientsReturn {
  const { token } = useAuth();

  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = async () => {
    if (!token) {
      setError("Authentication required. Please log in.");
      setIsLoading(false);
      toast.error("Please log in to view clients");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_CLIENT_URL}/client/s`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch clients: ${response.status}`);
      }

      const json = await response.json();

      if (!json.status || !json.data?.client_data) {
        throw new Error(json.message || "Invalid response from server");
      }

      setClients(json.data.client_data);
    } catch (err: any) {
      console.error("useClients fetch error:", err);
      const errorMsg = err.message || "Could not load clients";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchClients();
  }, [token]);

  return {
    clients,
    isLoading,
    error,
    refetch: fetchClients, // allows manual refresh if needed
  };
}