"use client";

import { Clock } from "lucide-react";

interface AuditLog {
  id: number;
  action: string;
  description: string;
  timestamp: string;
  ipAddress: string;
  device: string;
}

const dummyAuditLogs: AuditLog[] = [
  {
    id: 1,
    action: "Profile Updated",
    description: "Updated phone number and residential address",
    timestamp: "2026-04-02 14:35:22",
    ipAddress: "102.89.45.112",
    device: "Chrome on Windows 11",
  },
  {
    id: 2,
    action: "Password Changed",
    description: "Successfully changed account password",
    timestamp: "2026-03-28 09:12:05",
    ipAddress: "197.210.58.67",
    device: "Safari on iPhone 15",
  },
  {
    id: 3,
    action: "Login",
    description: "Successful login from new location",
    timestamp: "2026-03-25 18:45:10",
    ipAddress: "105.112.34.89",
    device: "Firefox on macOS",
  },
  {
    id: 4,
    action: "Two-Factor Authentication Enabled",
    description: "Enabled 2FA for added security",
    timestamp: "2026-03-20 11:20:33",
    ipAddress: "102.89.45.112",
    device: "Chrome on Windows 11",
  },
  {
    id: 5,
    action: "Profile Viewed",
    description: "Viewed own profile information",
    timestamp: "2026-03-18 16:55:47",
    ipAddress: "197.210.58.67",
    device: "Safari on iPhone 15",
  },
];

export default function AuditLogsTab() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#3A3A3A] dark:text-white">
          Audit Logs
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Last 30 days • 5 activities shown
        </p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/10">
                <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Action
                </th>
                <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Description
                </th>
                <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  IP Address
                </th>
                <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Device
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/10">
              {dummyAuditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                  <td className="py-4 px-6 font-medium">{log.action}</td>
                  <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
                    {log.description}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="py-4 px-6 font-mono text-sm text-gray-500 dark:text-gray-400">
                    {log.ipAddress}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-500 dark:text-gray-400">
                    {log.device}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-center text-xs text-gray-400 mt-6">
        Showing recent account activities • Audit logs are retained for 90 days
      </p>
    </div>
  );
}