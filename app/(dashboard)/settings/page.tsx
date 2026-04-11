/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { User, Lock, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import HeaderContent from "@/components/HeaderContent";

import ProfileDetailsTab from "./chunks/ProfileDetailsTab";
import UpdateProfileTab from "./chunks/UpdateProfileTab";
import PasswordSettingsTab from "./chunks/PasswordSettingsTab";
import AuditLogsTab from "./chunks/AuditTab";

type Tab = "details" | "update" | "password" | "audit";

export default function SettingsPersonalInfo() {
  const [activeTab, setActiveTab] = useState<Tab>("details");

  return (
    <div>
      <HeaderContent
        title="Settings"
        description="Manage your Personal Information"
      />

      <div className="bg-primary-foreground shadow-lg rounded-xl p-4 md:p-6 mt-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1 space-y-1 lg:space-y-2">
            <button
              onClick={() => setActiveTab("details")}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors",
                activeTab === "details"
                  ? "bg-[#FAB435]/20 text-[#E89500] font-medium"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800 text-[#3A3A3A] dark:text-gray-300",
              )}
            >
              <User className="h-5 w-5" />
              <div className="flex flex-col">
                <span>Profile Details</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  View your profile details
                </span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab("update")}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors",
                activeTab === "update"
                  ? "bg-[#FAB435]/20 text-[#E89500] font-medium"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800 text-[#3A3A3A] dark:text-gray-300",
              )}
            >
              <User className="h-5 w-5" />
              <div className="flex flex-col">
                <span>Update Profile</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Update your profile details
                </span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab("password")}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors",
                activeTab === "password"
                  ? "bg-[#FAB435]/20 text-[#E89500] font-medium"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800 text-[#3A3A3A] dark:text-gray-300",
              )}
            >
              <Lock className="h-5 w-5" />
              <div className="flex flex-col">
                <span>Password Settings</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Update or Reset Password
                </span>
              </div>
            </button>

            {/* <button
              onClick={() => setActiveTab("audit")}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors",
                activeTab === "audit"
                  ? "bg-[#FAB435]/20 text-[#E89500] font-medium"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800 text-[#3A3A3A] dark:text-gray-300",
              )}
            >
              <Clock className="h-5 w-5" />
              <div className="flex flex-col">
                <span>Audit Logs</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  View account activity
                </span>
              </div>
            </button> */}
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {activeTab === "details" && <ProfileDetailsTab />}
            {activeTab === "update" && <UpdateProfileTab />}
            {activeTab === "password" && <PasswordSettingsTab />}
            {/* {activeTab === "audit" && <AuditLogsTab />} */}
          </div>
        </div>
      </div>
    </div>
  );
}
