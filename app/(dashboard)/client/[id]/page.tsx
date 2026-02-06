/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, FileText } from "lucide-react";
import { toast } from "sonner";
import HeaderContent from "@/components/HeaderContent";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { IoChevronBackOutline } from "react-icons/io5";
import { FaUserLarge } from "react-icons/fa6";

interface StatementDetail {
  id: string;
  clientName: string;
  email: string;
  status: string;
  date: string;
  statementText: string; 
  fileUrl?: string; 
}

const dummyStatement: StatementDetail = {
  id: "1",
  clientName: "ABC Logistics",
  email: "abc@logistics.com",
  status: "Resolved",
  date: "9/04/2025",
  statementText:
    "Lorem ipsum dolor sit amet consectetur. Metus at sed lobortis ipsum sodales elementum. Maecenas tellus urna amet sit donec pulvinar. Nibh feugiat duis dignissim malesuada convallis tempus amet. Nulla nisi laoreet ornare nullam nunc. Pharetra volutpat orci et viverra porttitor sollicitudin. Viverra mattis at rhoncus id vestibulum. Potenti curabitur eget eu felis mauris gravida lectus. In id neque sed urna amet. Augue tortor turpis mauris vestibulum aliquam in. Ipsum ipsum dui donec ultricies arcu egestas cras. Eu nulla malesuada magna faucibus. Porta libero orci velit in metus. Adipiscing condimentum et ipsum libero congue. Amet sed tincidunt eu porttitor et dolor varius dictum. Placerat hac nunc posuere lectus odio nec dictumst ut lorem. Tellus posuere accumsan proin non tempor.",
  fileUrl: "/statements/abc-logistics-09042025.pdf", // placeholder
};

export default function ClientStatementDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  // In real app → fetch by ID
  // For now use dummy
  const statement = dummyStatement; // Replace with real fetch later

  const handleDownload = () => {
    if (!statement.fileUrl) {
      toast.error("No file available for download");
      return;
    }

    // Simulate download (replace with real logic)
    const link = document.createElement("a");
    link.href = statement.fileUrl;
    link.download = `${statement.clientName}-statement.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Download started");
  };

  return (
    <div className="">
      <div className="flex md:items-center flex-col gap-4 md:gap-0 md:flex-row justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            size="icon"
            onClick={() => router.back()}
            className="bg-primary-foreground hover:text-white text-black dark:text-white dark:hover:text-black"
          >
            <IoChevronBackOutline className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <FaUserLarge className="bg-primary-foreground dark:bg-transparent text-[#FAB435] rounded-full p-2 w-12 h-12" />
            <div>
              <h1 className="md:text-[20px] font-medium">
                ${statement.clientName}
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-[14px] text-gray-500">${statement.date}</p>
              </div>
            </div>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          {statement.status}
        </span>
      </div>

      <h2 className="text-[14px] font-bold text-[#3A3A3A] mb-1">Statement</h2>

      <p className="whitespace-pre-wrap text-[13px]">
        {statement.statementText}
      </p>
      <div className="flex items-end justify-end">
        <Button
          onClick={handleDownload}
          className="bg-[#FAB435] hover:bg-[#FAB435]/55 hover:text-black  mt-3 f"
        >
          <Download className="h-4 w-4" />
          Download Statement
        </Button>
      </div>
    </div>
  );
}
