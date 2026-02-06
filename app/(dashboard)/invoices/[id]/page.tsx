"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { IoChevronBackOutline } from "react-icons/io5";
import { FaUserLarge } from "react-icons/fa6";

interface Invoice {
  id: string;
  invoiceId: string;
  clientName: string;
  clientEmail: string;
  phone: string;
  description: string;
  invoiceDate: string;
  amount: number;
  status: "Paid" | "Sent" | "Draft" | "Overdue";
}

const invoiceData: Invoice[] = [
  {
    id: "1",
    invoiceId: "INV-1024",
    clientName: "ABC Logistics",
    clientEmail: "abclogistics@gmail.com",
    phone: "08011223868",
    description: "Field Service",
    invoiceDate: "2026-01-12",
    amount: 250000,
    status: "Paid",
  },
  {
    id: "2",
    invoiceId: "INV-1024",
    clientName: "ABC Logistics",
    clientEmail: "abclogistics@gmail.com",
    phone: "08011223868",
    description: "Field Service",
    invoiceDate: "2026-01-12",
    amount: 250000,
    status: "Paid",
  },
  {
    id: "3",
    invoiceId: "INV-1024",
    clientName: "ABC Logistics",
    clientEmail: "abclogistics@gmail.com",
    phone: "08011223868",
    description: "Field Service",
    invoiceDate: "2026-01-12",
    amount: 250000,
    status: "Paid",
  },
  {
    id: "4",
    invoiceId: "INV-1025",
    clientName: "GreenField Ltd",
    clientEmail: "greenfield@gmail.com",
    phone: "08011223869",
    description: "Security Service",
    invoiceDate: "2026-01-14",
    amount: 250000,
    status: "Sent",
  },
  {
    id: "5",
    invoiceId: "INV-1026",
    clientName: "MedPlus Services",
    clientEmail: "medplus@gmail.com",
    phone: "08011223870",
    description: "Medical Service",
    invoiceDate: "2026-01-15",
    amount: 250000,
    status: "Draft",
  },
  {
    id: "6",
    invoiceId: "INV-1027",
    clientName: "Swift Supplies",
    clientEmail: "swift@gmail.com",
    phone: "08011223871",
    description: "Supply Service",
    invoiceDate: "2026-01-17",
    amount: 250000,
    status: "Overdue",
  },
];

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.id as string;

  const invoice = invoiceData.find((inv) => inv.id === invoiceId);

  if (!invoice) {
    return (
      <div className="pt-2">
        <div className="mt-6 text-center">
          <p className="text-destructive mb-4">Invoice not found</p>
          <Button onClick={() => router.back()} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "text-green-700";
      case "Sent":
        return "text-blue-700";
      case "Draft":
        return "text-gray-700";
      case "Overdue":
        return "text-red-700";
      default:
        return "text-gray-700";
    }
  };

  return (
    <div className="pt-2 pb-8">
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
              <h1 className="md:text-[20px] font-medium">{invoice.clientName}</h1>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-[14px] text-gray-500">
                  {invoice.invoiceId} • {invoice.clientEmail}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="whitespace-nowrap">
            Download Invoice
          </Button>
          <Button className="bg-[#FAB435] hover:bg-[#E89500] text-black hover:text-white whitespace-nowrap">
            Send Invoice
          </Button>
        </div>
      </div>

      <div className="bg-primary-foreground shadow-lg rounded-lg p-6">
        <h2 className="font-bold text-[16px] dark:text-white text-[#3A3A3A] pb-3 border-b border-[#979797]/30 mb-6">
          Invoice Summary
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-1">
            <p className="text-[12px] text-muted-foreground">Name</p>
            <p className="font-medium text-[14px]">{invoice.clientName}</p>
          </div>

          <div className="space-y-1">
            <p className="text-[12px] text-muted-foreground">Email</p>
            <p className="font-medium text-[14px]">{invoice.clientEmail}</p>
          </div>

          <div className="space-y-1">
            <p className="text-[12px] text-muted-foreground">Invoice ID</p>
            <p className="font-medium text-[14px]">{invoice.invoiceId}</p>
          </div>

          <div className="space-y-1">
            <p className="text-[12px] text-muted-foreground">Invoice Date</p>
            <p className="font-medium text-[14px]">
              {new Date(invoice.invoiceDate).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-[12px] text-muted-foreground">Description</p>
            <p className="font-medium text-[14px]">{invoice.description}</p>
          </div>

          <div className="space-y-1">
            <p className="text-[12px] text-muted-foreground">Amount</p>
            <p className="font-medium text-[14px]">
              ₦{invoice.amount.toLocaleString()}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-[12px] text-muted-foreground">Phone</p>
            <p className="font-medium text-[14px]">{invoice.phone}</p>
          </div>

          <div className="space-y-1">
            <p className="text-[12px] text-muted-foreground">Status</p>
            <p className={`font-medium text-[14px] ${getStatusColor(invoice.status)}`}>
              • {invoice.status}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}