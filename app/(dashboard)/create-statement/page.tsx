/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/user";

// Shadcn Select imports
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Client, useClients } from "@/hooks/useClient";

// Dummy Bank List (you can later fetch from API if needed)
const BANKS = [
  "Access Bank",
  "First Bank Nigeria",
  "GTBank",
  "Zenith Bank",
  "UBA",
  "Fidelity Bank",
  "Stanbic IBTC",
  "Ecobank",
  "Polaris Bank",
  "Union Bank",
  "Sterling Bank",
  "Wema Bank",
  "Heritage Bank",
  "Keystone Bank",
];

export default function CreateStatementPage() {
  const router = useRouter();
  const { token } = useAuth();
  const { clients, isLoading: clientsLoading, error: clientsError } = useClients();

  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [selectedBank, setSelectedBank] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("Authentication required. Please log in.");
      return;
    }

    if (!selectedClientId) {
      toast.error("Please select a client");
      return;
    }

    if (!selectedBank) {
      toast.error("Please select a bank");
      return;
    }

    if (!file) {
      toast.error("Please upload a statement file");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("client_id", selectedClientId);
      formData.append("bank", selectedBank);           // ← Added Bank
      formData.append("file", file);
      if (description.trim()) {
        formData.append("description", description.trim());
      }

      const apiBase = process.env.NEXT_PUBLIC_API_URL || "";
      if (!apiBase) throw new Error("API base URL not configured");

      const res = await fetch(`${apiBase}/statement/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Upload failed: ${res.status}`);
      }

      const json = await res.json();

      if (!json.status) {
        throw new Error(json.message || "Failed to upload statement");
      }

      toast.success(json.message || "Statement uploaded successfully!");

      router.push("/banking");
    } catch (err: any) {
      console.error("Statement upload error:", err);
      toast.error(err.message || "Could not upload statement");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="pt-2 pb-8">
      <div className="flex items-center gap-4 mb-6">
        <Button
          size="icon"
          variant="outline"
          onClick={() => router.back()}
          className="bg-primary-foreground hover:text-white text-black dark:text-white dark:hover:text-black"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-[20px] md:text-[25px] font-semibold font-clash text-[#2F2F2F]">
            Create New Statement
          </h1>
          <p className="text-[14px] md:text-[16px] text-[#9E9A9A] font-dm-sans">
            Upload a statement for a client
          </p>
        </div>
      </div>

      <div className="bg-primary-foreground shadow-lg rounded-lg p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Client Selection */}
          {/* <div className="space-y-2">
            <Label htmlFor="client">Select Client *</Label>
            {clientsLoading ? (
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading clients...
              </div>
            ) : clientsError ? (
              <p className="text-red-600">{clientsError}</p>
            ) : clients.length === 0 ? (
              <p className="text-gray-500">No clients available</p>
            ) : (
              <Select
                value={selectedClientId}
                onValueChange={setSelectedClientId}
                required
              >
                <SelectTrigger className="w-full h-12">
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client: Client) => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.name} {client.email ? `(${client.email})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div> */}

          {/* Bank Selection - NEW */}
          <div className="space-y-2">
            <Label htmlFor="bank">Select Bank *</Label>
            <Select
              value={selectedBank}
              onValueChange={setSelectedBank}
              required
            >
              <SelectTrigger className="w-full h-12">
                <SelectValue placeholder="Select Bank" />
              </SelectTrigger>
              <SelectContent>
                {BANKS.map((bank) => (
                  <SelectItem key={bank} value={bank}>
                    {bank}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="attachment">Upload Statement File *</Label>
            <Input
              id="attachment"
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileChange}
              required
              className="h-12"
            />
            <p className="text-xs text-gray-500">
              Supported formats: PDF, PNG, JPG, JPEG
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add any notes or context about this statement..."
              className="min-h-[120px]"
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={uploading || clientsLoading}
              className="bg-[#FAB435]/30 text-[#E89500] px-8 py-6"
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload Statement"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}