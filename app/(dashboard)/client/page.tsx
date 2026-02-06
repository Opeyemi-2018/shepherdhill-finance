/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Upload,
  ChevronLeft,
  ChevronRight,
  X,
  FileText,
} from "lucide-react";
import HeaderContent from "@/components/HeaderContent";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ClientStatement {
  id: string;
  clientName: string;
  uploadedStatements: number;
  status: "Resolved";
  date: string;
}

const dummyClients: ClientStatement[] = [
  {
    id: "1",
    clientName: "ABC Transport",
    uploadedStatements: 5,
    status: "Resolved",
    date: "9/04/2025",
  },
  {
    id: "2",
    clientName: "GreenField Ltd",
    uploadedStatements: 5,
    status: "Resolved",
    date: "9/04/2025",
  },
  {
    id: "3",
    clientName: "MedPlus Services",
    uploadedStatements: 5,
    status: "Resolved",
    date: "9/04/2025",
  },
  {
    id: "4",
    clientName: "Swift Supplies",
    uploadedStatements: 5,
    status: "Resolved",
    date: "9/04/2025",
  },
  {
    id: "5",
    clientName: "ABC Transport",
    uploadedStatements: 5,
    status: "Resolved",
    date: "9/04/2025",
  },
  {
    id: "6",
    clientName: "GreenField Ltd",
    uploadedStatements: 5,
    status: "Resolved",
    date: "9/04/2025",
  },
  {
    id: "7",
    clientName: "MedPlus Services",
    uploadedStatements: 5,
    status: "Resolved",
    date: "9/04/2025",
  },
  {
    id: "8",
    clientName: "Swift Supplies",
    uploadedStatements: 5,
    status: "Resolved",
    date: "9/04/2025",
  },
  {
    id: "9",
    clientName: "ABC Transport",
    uploadedStatements: 5,
    status: "Resolved",
    date: "9/04/2025",
  },
];

const TableSkeleton = () => (
  <>
    {[1, 2, 3, 4, 5].map((i) => (
      <tr key={i}>
        <td colSpan={4} className="py-5">
          <div className="flex gap-4 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
          </div>
        </td>
      </tr>
    ))}
  </>
);

export default function ClientsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading] = useState(false);
  const router = useRouter();

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);
  const [note, setNote] = useState("");
  const [uploading, setUploading] = useState(false);

  const filteredClients = dummyClients.filter((client) =>
    client.clientName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!selectedClientId) {
      toast.error("Please select a client");
      return;
    }
    if (files.length === 0) {
      toast.error("Please select at least one file");
      return;
    }

    setUploading(true);

    await new Promise((resolve) => setTimeout(resolve, 1800));

    toast.success(
      `${files.length} statement${files.length > 1 ? "s" : ""} uploaded!`,
    );

    // Reset
    setFiles([]);
    setNote("");
    setSelectedClientId("");
    setShowUploadModal(false);
    setUploading(false);
  };

  return (
    <div className="">
      <HeaderContent
        title="Clients"
        description="Manage your client statements and uploads"
      />

      <div className="bg-primary-foreground shadow-lg rounded-lg p-4 mt-4 md:p-6">
        <div className="flex flex-col justify-between mb-4 sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A6DC0] w-full"
            />
          </div>

          <Button
            onClick={() => setShowUploadModal(true)}
            className="bg-[#FAB435]/30 text-[#FAB435] whitespace-nowrap flex items-center gap-2 hover:bg-[#FAB435]/40"
          >
            <Upload className="h-4 w-4" />
            Upload a Statement
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white dark:bg-black/10">
              <tr>
                <th className="py-3 pl-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                  Client
                </th>
                <th className="py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-white uppercase whitespace-nowrap tracking-wider">
                  Uploaded statements
                </th>
                <th className="py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-white uppercase whitespace-nowrap tracking-wider">
                  Status
                </th>
                <th className="py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-white uppercase whitespace-nowrap tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#979797]/30">
              {loading ? (
                <TableSkeleton />
              ) : filteredClients.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-12 text-center text-[#9E9A9A] font-dm-sans"
                  >
                    No clients found matching your search
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <tr key={client.id} className="transition-colors" onClick={() => router.push(`/client/${client.id}`)}>
                    <td className="py-5 pl-4 text-[13px] sm:text-[15px] font-medium text-[#2F2F2F] dark:text-[#979797]">
                      {client.clientName}
                    </td>
                    <td className="py-5 text-[13px] sm:text-[15px] text-[#2F2F2F] dark:text-[#979797]">
                      {client.uploadedStatements}
                    </td>
                    <td className="py-5">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        <span className="text-[13px] sm:text-[15px] font-medium text-[#2F2F2F] dark:text-[#979797]">
                          {client.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-5 text-[13px] sm:text-[15px] text-[#2F2F2F] dark:text-[#979797]">
                      {client.date}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center gap-2 mt-8">
          <Button variant="outline" size="icon" className="h-8 w-8" disabled>
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 bg-[#FAB435]/30 text-[#FAB435] border-none"
            >
              1
            </Button>
            <Button variant="outline" size="sm" className="h-8 w-8">
              2
            </Button>
            <Button variant="outline" size="sm" className="h-8 w-8">
              3
            </Button>
            <Button variant="outline" size="sm" className="h-8 w-8">
              4
            </Button>
            <Button variant="outline" size="sm" className="h-8 w-8">
              5
            </Button>
          </div>

          <Button variant="outline" size="icon" className="h-8 w-8">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-4 border-b">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-semibold text-[#2F2F2F]">
                Upload Client Statement
              </DialogTitle>
             
            </div>
            <DialogDescription className="text-sm text-gray-500 mt-1">
              Select a client and upload their financial statement (PDF, Excel,
              images supported)
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 space-y-6">
            {/* Client Selection */}
            <div className="space-y-2">
              <Label htmlFor="client" className="text-sm font-medium">
                Select Client
              </Label>
              <Select
                value={selectedClientId}
                onValueChange={setSelectedClientId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a client..." />
                </SelectTrigger>
                <SelectContent>
                  {dummyClients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.clientName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Upload Statement(s)</Label>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  files.length > 0
                    ? "border-[#0A6DC0] bg-[#0A6DC0]/5"
                    : "border-gray-300 "
                }`}
              >
                <input
                  type="file"
                  multiple
                  accept=".pdf,.xlsx,.xls,.csv,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <span className="text-sm font-medium text-[#3A3A3A]/55">
                    Click to upload or drag & drop
                  </span>
                  <span className="text-xs text-gray-500">
                    PDF, Excel, CSV, PNG, JPG (max 10MB per file)
                  </span>
                </label>
              </div>

              {files.length > 0 && (
                <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 p-3 rounded border"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-[#0A6DC0]" />
                        <div>
                          <p className="text-sm font-medium truncate max-w-[220px]">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="note" className="text-sm font-medium">
                Note / Description (optional)
              </Label>
              <Textarea
                id="note"
                placeholder="Add any comments about this statement..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
          </div>

          <DialogFooter className="p-6 pt-4 border-t flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={() => setShowUploadModal(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              // disabled={uploading || files.length === 0 || !selectedClientId}
              className="bg-[#FAB435]/30 hover:bg-[#FAB435]/30 w-full text-[#E89500] sm:w-auto flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload Statement
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
