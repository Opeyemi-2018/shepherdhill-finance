/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useServices.ts
"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/user";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface Service {
  id: number;
  name: string;
  rate: number;
  // Add any other fields you need (status, etc.)
}

export function useServices() {
  const { token } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = async () => {
    if (!token) {
      setError("No authentication token");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/services`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch services");

      const data = await res.json();

      if (data.status && Array.isArray(data.data)) {
        const formatted = data.data.map((item: any) => ({
          ...item,
          rate: parseFloat(item.rate || "0"),
        }));
        setServices(formatted);
      } else {
        throw new Error(data.message || "Invalid response");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load services");
      toast.error("Failed to load service items");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [token]);

  return { services, isLoading, error, refetch: fetchServices };
}