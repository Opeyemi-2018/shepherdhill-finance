/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paperclip, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/user"; // adjust path if needed
import { toast } from "sonner"; // if you have sonner installed, otherwise use alert

export default function UpdateProfileTab() {
  const { token } = useAuth();

  const [form, setForm] = useState({
    name: "",
    phone: "",
  });

  const [uploadedPhoto, setUploadedPhoto] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Optional: pre-fill form with current profile (fetch once on mount)
  useEffect(() => {
    const fetchCurrentProfile = async () => {
      if (!token) return;

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_CLIENT_URL}/profile/update`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!res.ok) return;

        const json = await res.json();
        if (json.status && json.data?.user) {
          const user = json.data.user;
          setForm({
            name: user.name || "",
            phone: user.phone || "",
          });
        }
      } catch (err) {
        console.error("Failed to pre-fill profile:", err);
      }
    };

    fetchCurrentProfile();
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file (JPG/JPEG)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be under 5MB");
      return;
    }

    setUploadedPhoto(file);
  };

  const handleSave = async () => {
    if (!token) {
      alert("You must be logged in to update profile");
      return;
    }

    if (!form.name.trim()) {
      alert("Name is required");
      return;
    }

    setIsSaving(true);

    try {
      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("phone", form.phone.trim() || ""); // allow empty

      if (uploadedPhoto) {
        formData.append("photo", uploadedPhoto);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_CLIENT_URL}/profile/update`,
        {
          method: "POST", // or "PATCH" if your backend uses PATCH for updates
          headers: {
            Authorization: `Bearer ${token}`,
            // Do NOT set Content-Type — browser sets multipart/form-data automatically with FormData
          },
          body: formData,
        },
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(
          errData.message || `Update failed (${response.status})`,
        );
      }

      const result = await response.json();

      if (!result.status) {
        throw new Error(result.message || "Update failed");
      }

      toast.success("Profile updated successfully!");
      setUploadedPhoto(null);
    } catch (err: any) {
      console.error("Profile update error:", err);
      toast.error(err.message || "Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({ name: "", phone: "" });
    setUploadedPhoto(null);
  };

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold text-[#3A3A3A] dark:text-white">
        Update Profile
      </h2>

      <div className="space-y-6">
        {/* Name */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#3A3A3A] dark:text-gray-300">
            Full Name <span className="text-red-500">*</span>
          </label>
          <Input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            className="bg-[#F9FAFB] dark:bg-gray-900 border-[#E5E7EB] dark:border-gray-700 h-12 rounded-lg"
          />
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#3A3A3A] dark:text-gray-300">
            Phone Number
          </label>
          <Input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Enter phone number (optional)"
            className="bg-[#F9FAFB] dark:bg-gray-900 border-[#E5E7EB] dark:border-gray-700 h-12 rounded-lg"
          />
        </div>

        {/* Photo Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#3A3A3A] dark:text-gray-300">
            Upload Profile Photo
          </label>
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
              uploadedPhoto
                ? "border-[#FAB435]/50 bg-[#FAB435]/5"
                : "border-gray-300 dark:border-gray-700",
            )}
            onClick={() => document.getElementById("photo-upload")?.click()}
          >
            {uploadedPhoto ? (
              <div className="flex items-center justify-center gap-3">
                <Paperclip className="h-5 w-5 text-[#FAB435]" />
                <span className="font-medium">{uploadedPhoto.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setUploadedPhoto(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <Paperclip className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Upload Image (JPG/JPEG, max 5MB)
                </p>
              </>
            )}
            <input
              type="file"
              id="photo-upload"
              className="hidden"
              accept=".jpg,.jpeg"
              onChange={handlePhotoUpload}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4 pt-6">
          <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
            Cancel
          </Button>

          <Button
            className="px-8 bg-[#FAB435]/30 hover:bg-[#FAB435]/50 text-[#E89500] dark:text-[#FAB435]"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
