/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Loader2 } from "lucide-react";
import { toast } from "sonner";
import HeaderContent from "@/components/HeaderContent";
import { useClients } from "@/hooks/useClient";

export default function CreateSOPBasicInfo() {
  const router = useRouter();
  const { token } = useAuth();
  const {
    clients,
    isLoading: clientsLoading,
    error: clientsError,
  } = useClients();

  const [formData, setFormData] = useState({
    title: "", // renamed to match backend
    client_id: "", // will store the numeric ID
    location: "",
    start_date: "", // renamed to match backend (use YYYY-MM-DD)
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleClientSelect = (value: string) => {
    // value = client.id.toString() from SelectItem
    setFormData((prev) => ({ ...prev, client_id: value }));
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) return toast.error("SOP Title is required");
    if (!formData.client_id) return toast.error("Please select a client");
    if (!formData.location.trim()) return toast.error("Location is required");
    if (!formData.start_date) return toast.error("Effective date is required");

    if (!token) {
      toast.error("Authentication required. Please log in.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title: formData.title.trim(),
        client_id: formData.client_id, // string but backend usually accepts it
        location: formData.location.trim(),
        start_date: formData.start_date, // expect YYYY-MM-DD
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_CLIENT_URL}/client/sop/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || `Server error (${response.status})`);
      }

      const result = await response.json();

      if (!result.status) {
        throw new Error(result.message || "Failed to create SOP");
      }

      toast.success("SOP created successfully!");
      router.push("/sop"); // or "/sops" — adjust to your route
    } catch (err: any) {
      console.error("SOP creation error:", err);
      toast.error(err.message || "Failed to create SOP. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  // Show loading / error state for clients
  if (clientsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-3">Loading clients...</span>
      </div>
    );
  }

  if (clientsError || !clients.length) {
    return (
      <div className="text-center py-12 text-red-600">
        {clientsError || "No clients found. Please add clients first."}
      </div>
    );
  }

  return (
    <div>
      <HeaderContent
        title="SOP Setup"
        description="Create standard operating procedure"
      />

      <div className="bg-primary-foreground p-4 md:p-6 mt-3">
        <h1 className="text-[#3A3A3A] dark:text-white text-[18px] md:text-[22px] font-bold mb-6">
          SOP Basic Information
        </h1>

        <div className="space-y-6 ">
          {/* SOP Title */}
          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-medium">
              SOP Title <span className="text-red-500">*</span>
            </label>
            <Input
              id="title"
              name="title"
              placeholder="Best of them all"
              value={formData.title}
              onChange={handleTextChange}
              disabled={isSubmitting}
            />
          </div>

          {/* Client / Site */}
          <div className="space-y-2">
            <label htmlFor="client" className="block text-sm font-medium">
              Client <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.client_id}
              onValueChange={handleClientSelect}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem
                    key={client.id}
                    value={client.id.toString()} // important: send as string
                  >
                    {client.name}
                    {client.location && ` — ${client.location}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label htmlFor="location" className="block text-sm font-medium">
              Location <span className="text-red-500">*</span>
            </label>
            <Input
              id="location"
              name="location"
              placeholder="Lagos"
              value={formData.location}
              onChange={handleTextChange}
              disabled={isSubmitting}
            />
          </div>

          {/* Effective Date (start_date) */}
          <div className="space-y-2">
            <label htmlFor="start_date" className="block text-sm font-medium">
              Effective Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input
                id="start_date"
                name="start_date"
                type="date" // ← native date picker
                value={formData.start_date}
                onChange={handleTextChange}
                className="pl-10"
                disabled={isSubmitting}
              />
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-8 border-t mt-10">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create SOP"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
