/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/user";

interface ProfileData {
  fullName: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  lastLogin: string;
}

export default function ProfileDetailsTab() {
  const { token } = useAuth();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("Not authenticated. Please log in.");
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_CLIENT_URL}/profile`,
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
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const json = await response.json();

        if (!json.status || !json.data?.user) {
          throw new Error(json.message || "Invalid profile response");
        }

        const user = json.data.user;

        setProfile({
          fullName: user.name || "—",
          email: user.email || "—",
          phone: user.phone ?? "Not provided",          // null → "Not provided"
          role: user.type || "—",                        // "type" is the role field
          department: "—",                               // not in response
          lastLogin: user.last_login
            ? new Date(user.last_login).toLocaleString("en-US", {
                dateStyle: "medium",
                timeStyle: "short",
              })
            : "Never",
        });
      } catch (err: any) {
        console.error("Profile fetch error:", err);
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  const getInitials = (name: string): string => {
    if (!name.trim() || name === "—") return "?";
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] || "";
    const second = parts[1]?.[0] || "";
    return (first + second).toUpperCase();
  };

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
        <Loader2 className="h-8 w-8 animate-spin mb-3" />
        <p>Loading profile details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center text-red-600 dark:text-red-400 font-medium">
        {error}
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="py-12 text-center text-gray-500 dark:text-gray-400">
        No profile data available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-[#FAB435]/20 flex items-center justify-center text-[#E89500] text-2xl font-bold">
            {getInitials(profile.fullName)}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-[#3A3A3A] dark:text-white">
              {profile.fullName}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {profile.role} • {profile.email}
            </p>
          </div>
        </div>

        <Button className="bg-[#FAB435]/20 hover:bg-[#FAB435]/30 text-[#E89500] border-none rounded-lg px-6">
          Edit Profile
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
        <h3 className="text-lg font-semibold mb-6 text-[#3A3A3A] dark:text-white">
          Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
            <p className="font-medium mt-1">{profile.fullName}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
            <p className="font-medium mt-1">{profile.email}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
            <p className="font-medium mt-1">{profile.phone}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Role</p>
            <p className="font-medium mt-1">{profile.role}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Department</p>
            <p className="font-medium mt-1">{profile.department}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Last Login</p>
            <p className="font-medium mt-1">{profile.lastLogin}</p>
          </div>
        </div>
      </div>
    </div>
  );
}