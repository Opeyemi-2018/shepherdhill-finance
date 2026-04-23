/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAuth } from "@/context/user";
import { useState, useEffect } from "react";



interface StaffResponse {
  status: boolean;
  staff: {
    total: number;
    onfield: number;
    deployed: number;
    inactive: number;
    staff_data: Array<{
      id: number;
      user_id: string;
      name: string;
    }>;
  };
}

export interface StaffDetailsResponse {
  details: {
    payment_cycle: string;
    include_weekends: string;
    designation: any;
    location: any;
    created_at: string | number | Date;
    payroll_type: string;
    deployed: string;
    joined_at: string;
    passport?: string;
    staff_type: string;
    id: number;
    name: string;
    email: string;
    phone: string;
    gender: string;
    dob: string;
    nationality: string;
    nin: string;
    department: { id: any; name: string };
  };
  documents: any[];
  equipment: any[];
  attendance: {
    id: number;
    employee_id: string;
    date: string;
    status: string;
    clock_in: string | null;
    clock_out: string | null;
    late: string | null;
    early_leaving: string | null;
    overtime: string | null;
    created_at: string;
    updated_at: string;
  }[];
  deployment: {
    deployment_duration: string;
    current_deployment: any;
    deployments: any[];
  };
  payment: any;
}

export const useStaff = () => {
  const { token } = useAuth();
  const [staffData, setStaffData] = useState<StaffResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("No authentication token available");
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_CLIENT_URL}/staff`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        if (res.status === 401 || res.status === 403) {
          setError("Unauthorized");
          return;
        }
        if (!res.ok) {
          const errorText = await res.text();
          setError(errorText || "Failed to fetch staff data");
          return;
        }

        const data: StaffResponse = await res.json();
        setStaffData(data);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Failed to load staff data");
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => controller.abort(); // cleanup on unmount / token change
  }, [token]);

  return { staffData, loading, error };
};

export const useStaffDetails = (staffId: string | number) => {
  const { token } = useAuth();
  const [data, setData] = useState<StaffDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!staffId || !token) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_CLIENT_URL}/staff/details/${staffId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        if (res.status === 401 || res.status === 403) {
          setError("Unauthorized");
          return;
        }
        if (!res.ok) {
          const errorText = await res.text();
          setError(errorText || "Failed to fetch staff details");
          return;
        }

        const json = await res.json();
        setData(json.data);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Failed to load staff details");
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, [staffId, token]);

  return { data, loading, error };
};