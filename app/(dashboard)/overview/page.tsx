"use client";
import StatCard from "@/components/HeaderCard";
import HeaderContent from "@/components/HeaderContent";
import { Search, Plus, MoreVertical, User } from "lucide-react";
import { FaUserAlt } from "react-icons/fa";
import { useRouter } from "next/navigation";
import RecentActivities from "@/components/RecentActivity";

const Overview = () => {
  const router = useRouter();
  return (
    <div className="">
      <HeaderContent
        title="Dashboard"
        description="Start with a clear overview of what matters most"
      />
      <div className="flex justify-between overflow-x-auto gap-4 pt-6">
        <StatCard icon={User} label="Total Receivables" value={"2,400,234"} />
        <StatCard icon={User} label="Total Payables" value={"2,400,234"} />
        <StatCard
          icon={User}
          label="Outstanding Invoices"
          value={"2,400,234"}
        />
        <StatCard icon={User} label="Cash Received" value={"2,400,234"} />
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <button
          onClick={() => router.push("/create-invoice")}
          className="bg-primary-foreground shadow-lg p-3 rounded-lg flex flex-col items-center justify-center md:h-[100px]"
        >
          <FaUserAlt color="#FAB435" />
          <h2 className="md:font-bold md:text-[24px]">Create Invoice</h2>
        </button>
        <div className="bg-primary-foreground shadow-lg p-3 rounded-lg flex flex-col items-center justify-center md:h-[100px]">
          <FaUserAlt color="#FAB435" />
          <h2 className="md:font-bold md:text-[24px]">Upload Statement</h2>
        </div>
        <div className="bg-primary-foreground shadow-lg p-3 rounded-lg flex flex-col items-center justify-center md:h-[100px]">
          <FaUserAlt color="#FAB435" />
          <h2 className="md:font-bold md:text-[24px]">Record Payment</h2>
        </div>
        <div className="bg-primary-foreground shadow-lg p-3 rounded-lg flex flex-col items-center justify-center md:h-[100px]">
          <FaUserAlt color="#FAB435" />
          <h2 className="md:font-bold md:text-[24px]">Generate Report</h2>
        </div>
      </div>

      <div className="mt-4">
        <RecentActivities />
      </div>
    </div>
  );
};

export default Overview;
