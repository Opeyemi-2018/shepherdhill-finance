/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Search,
  Plus,
  MoreVertical,
  Loader2,
  FileSignature,
  Trash2,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/user";
import { SignFormView } from "./chunks/Signatories";

interface RetainershipForm {
  id: number;
  code: string;
  issue_date: string;
  client: {
    id: number;
    name: string;
  };
  contacts_count: string;
  services_count: string;
  equipments_count: string;
  created_at: string;
}

// Table Skeleton Component
function TableSkeleton() {
  return (
    <>
      {[...Array(5)].map((_, index) => (
        <tr key={index} className="animate-pulse">
          <td className="py-4 px-4 whitespace-nowrap">
            <div className="h-4 bg-gray-300 rounded w-32"></div>
          </td>
          <td className="py-4 px-4 whitespace-nowrap">
            <div className="h-4 bg-gray-300 rounded w-24"></div>
          </td>
          <td className="py-4 px-4 whitespace-nowrap">
            <div className="h-4 bg-gray-300 rounded w-20"></div>
          </td>
          <td className="py-4 px-4 whitespace-nowrap">
            <div className="h-4 bg-gray-300 rounded w-16"></div>
          </td>
          <td className="py-4 px-4 whitespace-nowrap">
            <div className="h-4 bg-gray-300 rounded w-12"></div>
          </td>
          <td className="py-4 px-4 whitespace-nowrap">
            <div className="h-4 bg-gray-300 rounded w-12"></div>
          </td>
          <td className="py-4 px-4 whitespace-nowrap">
            <div className="h-8 w-8 bg-gray-300 rounded"></div>
          </td>
        </tr>
      ))}
    </>
  );
}

const ITEMS_PER_PAGE = 10;

export default function RetainershipPage() {
  const router = useRouter();
  const { token } = useAuth();

  const [forms, setForms] = useState<RetainershipForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState<RetainershipForm | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  // Sign component state
  const [showSignComponent, setShowSignComponent] = useState(false);
  const [signFormCode, setSignFormCode] = useState<string>("");

  useEffect(() => {
    const fetchForms = async () => {
      if (!token) {
        setError("Please log in");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/retainership/list`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (!res.ok) throw new Error("Failed to fetch forms");

        const json = await res.json();
        if (json.status) {
          setForms(json.data.forms.data || []);
        }
      } catch (err: any) {
        console.error(err);
        toast.error("Could not load retainership forms");
        setError("Failed to load forms");
      } finally {
        setLoading(false);
      }
    };

    fetchForms();
  }, [token]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleViewForm = (code: string) => {
    router.push(`/retainership-form/${code}`);
  };

  const handleDeleteClick = (form: RetainershipForm) => {
    setSelectedForm(form);
    setDeleteAlertOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedForm || !token) return;

    setIsDeleting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/retainership/delete/${selectedForm.code}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const json = await res.json();

      if (json.status) {
        toast.success(`Form ${selectedForm.code} deleted successfully`);
        setForms(forms.filter((f) => f.id !== selectedForm.id));
        setDeleteAlertOpen(false);
        setSelectedForm(null);
      } else {
        throw new Error(json.message || "Failed to delete form");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Could not delete retainership form");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSignClick = (form: RetainershipForm) => {
    setSignFormCode(form.code);
    setShowSignComponent(true);
  };

  const handleCancelSign = () => {
    setShowSignComponent(false);
    setSignFormCode("");
  };

  const handleSignComplete = async () => {
    // Refresh the list after signing
    if (!token) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/retainership/list`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const json = await res.json();
      if (json.status) {
        setForms(json.data.forms.data || []);
        toast.success("Form signed successfully!");
      }
    } catch (err) {
      console.error(err);
    }

    // Auto close after 2 seconds
    setTimeout(() => {
      setShowSignComponent(false);
      setSignFormCode("");
    }, 2000);
  };

  // Filter forms based on search
  const filteredForms = forms.filter(
    (form) =>
      form.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.client.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredForms.length / ITEMS_PER_PAGE);
  const paginatedForms = filteredForms.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  // Show sign component when active
  if (showSignComponent) {
    return (
      <div className="">
        <SignFormView
          formCode={signFormCode}
          onBack={handleCancelSign}
          onSignComplete={handleSignComplete}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <div className="h-9 bg-primary-foreground rounded w-64 animate-pulse"></div>
          <div className="h-10 bg-primary-foreground rounded w-32 animate-pulse"></div>
        </div>
        <div className="bg-primary-foreground shadow-lg rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Form Code</th>
                  <th className="px-4 py-3 text-left">Client Name</th>
                  <th className="px-4 py-3 text-left">Issue Date</th>
                  <th className="px-4 py-3 text-center">Contacts</th>
                  <th className="px-4 py-3 text-center">Services</th>
                  <th className="px-4 py-3 text-center">Equipments</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                <TableSkeleton />
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold ">Retainership Forms</h1>
        <Button
          onClick={() => router.push("/add-retainership-form")}
          className="bg-[#FAB435] hover:bg-[#E89500] text-black flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          New Form
        </Button>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <div className="bg-primary-foreground shadow-lg rounded-lg overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 border-b">
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search by form code or client name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Form Code
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Issue Date
                </th>
                {/* <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacts
                </th> */}
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Services
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Equipments
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="">
              {paginatedForms.length > 0 ? (
                paginatedForms.map((form) => (
                  <tr key={form.id} className=" transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-mono text-sm font-medium">
                        {form.code}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm">{form.client.name}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm">
                        {new Date(form.issue_date).toLocaleDateString("en-GB")}
                      </span>
                    </td>
                    {/* <td className="px-4 py-3 whitespace-nowrap text-center">
                      <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium bg-[#FAB435]/30 dark:text-white text-black rounded-full">
                        {form.contacts_count}
                      </span>
                    </td> */}
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium bg-[#FAB435]/30 dark:text-white text-black rounded-full">
                        {form.services_count}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium bg-[#FAB435]/30 dark:text-white text-black rounded-full">
                        {form.equipments_count}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <MoreVertical className="h-4 w-4 text-orange-400" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => handleViewForm(form.code)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {/* <DropdownMenuItem
                            className="cursor-pointer text-green-600"
                            onClick={() => handleSignClick(form)}
                          >
                            <FileSignature className="h-4 w-4 mr-2" />
                            Sign Form
                          </DropdownMenuItem> */}
                          <DropdownMenuItem
                            className="cursor-pointer text-red-600"
                            onClick={() => handleDeleteClick(form)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    {filteredForms.length === 0 && searchTerm
                      ? "No forms match your search criteria"
                      : "No retainership forms found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && !error && filteredForms.length > 0 && (
          <div className="flex items-center justify-between px-4 py-4 border-t">
            <p className="text-xs text-gray-500">
              Showing{" "}
              <span className="font-medium">
                {(currentPage - 1) * ITEMS_PER_PAGE + 1}
              </span>{" "}
              –{" "}
              <span className="font-medium">
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredForms.length)}
              </span>{" "}
              of <span className="font-medium">{filteredForms.length}</span>{" "}
              forms
            </p>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                ‹
              </Button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    className={`h-8 w-8 p-0 text-xs ${
                      currentPage === page
                        ? "bg-[#FAB435]/30 text-[#E89500] border-[#E89500] hover:bg-[#E89500] hover:text-white"
                        : ""
                    }`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ),
              )}

              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
              >
                ›
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Alert Dialog */}
      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              retainership form
              <span className="block mt-2 p-2 bg-gray-100 rounded font-mono text-sm">
                {selectedForm?.code}
              </span>
              and remove all associated data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
