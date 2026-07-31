import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Search, Upload, ArrowUpDown, ChevronUp, ChevronDown, X, HelpCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { getEventById } from "../../events/api/eventService";
import { getEventAttendeesRaw, updateStudentEligibility, uploadEligibilityFile } from "../api/certificate.api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Event } from "../../events/types/event.types";
import type { AttendeeRaw } from "../types/certificate.types";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface EventCertificateManagementViewProps {
  eventId: string;
  onBack: () => void;
}

const toTitleCase = (str?: string): string => {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => {
      if (!word) return "";
      return word
        .split("-")
        .map((part) => (part ? part.charAt(0).toUpperCase() + part.slice(1) : ""))
        .join("-");
    })
    .join(" ");
};

export const EventCertificateManagementView: React.FC<EventCertificateManagementViewProps> = ({ eventId, onBack }) => {
  const [event, setEvent] = useState<Event | null>(null);
  const [attendees, setAttendees] = useState<AttendeeRaw[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(50);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [sortField, setSortField] = useState<"id_number" | "name" | "course" | "status" | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const [importResults, setImportResults] = useState<{ studentId: string; name: string; isAttendee: boolean; status: string }[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isFileProcessing, setIsFileProcessing] = useState(false);
  const [refetchTrigger, setRefetchTrigger] = useState(0);
  const [dialogSearchQuery, setDialogSearchQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const eligibleIds = React.useMemo(() => {
    return new Set(event?.eligibleStudentsForCertificate || []);
  }, [event?.eligibleStudentsForCertificate]);

  const handleSort = (field: "id_number" | "name" | "course" | "status") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsFileProcessing(true);
    const toastId = toast.loading("Processing file...");
    const res = await uploadEligibilityFile(eventId, file);
    setIsFileProcessing(false);
    
    if (res && res.success) {
      setImportResults(res.results || []);
      setDialogSearchQuery("");
      setShowConfirmModal(true);
      toast.dismiss(toastId);
    } else {
      toast.error("Failed to parse file.", { id: toastId });
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleConfirmImport = async () => {
    const validStudentIds = importResults
      .filter((r) => r.isAttendee)
      .map((r) => r.studentId);

    if (validStudentIds.length === 0) {
      toast.error("No valid event attendees found in the imported file.");
      setShowConfirmModal(false);
      return;
    }

    setIsUpdating(true);
    const toastId = toast.loading("Eligibilizing students...");
    const updatedList = await updateStudentEligibility(eventId, validStudentIds, true);
    setIsUpdating(false);

    if (updatedList) {
      setEvent((prev) =>
        prev ? { ...prev, eligibleStudentsForCertificate: updatedList } : null
      );
      toast.success(`Successfully eligibilized ${validStudentIds.length} students!`, {
        id: toastId,
        style: {
          background: "#ecfdf5",
          color: "#047857",
          border: "1px solid #a7f3d0"
        }
      });
      setShowConfirmModal(false);
      // Refetch attendees list to reflect changes
      setRefetchTrigger((prev) => prev + 1);
    } else {
      toast.error("Failed to update eligibility status.", {
        id: toastId,
        style: {
          background: "#fef2f2",
          color: "#b91c1c",
          border: "1px solid #fca5a5"
        }
      });
    }
  };

  const filteredImportResults = React.useMemo(() => {
    if (!dialogSearchQuery) return importResults;
    const lowerQuery = dialogSearchQuery.toLowerCase();
    return importResults.filter(
      (r) =>
        r.name.toLowerCase().includes(lowerQuery) ||
        r.studentId.toLowerCase().includes(lowerQuery)
    );
  }, [importResults, dialogSearchQuery]);



  const renderSortIcon = (field: "id_number" | "name" | "course" | "status") => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 inline" />;
    }
    return sortOrder === "asc" ? (
      <ChevronUp className="w-3.5 h-3.5 text-blue-600 inline" />
    ) : (
      <ChevronDown className="w-3.5 h-3.5 text-blue-600 inline" />
    );
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPageNumber(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const eventRes = await getEventById(eventId);
        if (eventRes !== false) {
          setEvent(eventRes);
        }
      } catch (error) {
        console.error("Failed to load event details:", error);
      }
    };
    fetchEvent();
  }, [eventId]);

  useEffect(() => {
    const fetchAttendees = async () => {
      try {
        setLoading(true);
        const res = await getEventAttendeesRaw(
          eventId,
          pageNumber,
          pageSize,
          debouncedSearch,
          sortField || "",
          sortOrder
        );
        if (res) {
          setAttendees(res.items || []);
          setTotalCount(res.totalCount || 0);
          setTotalPages(res.totalPages || 1);
        } else {
          setAttendees([]);
          setTotalCount(0);
          setTotalPages(1);
        }
        setSelectedIds([]);
      } catch (error) {
        console.error("Failed to load attendees:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendees();
  }, [eventId, pageNumber, pageSize, debouncedSearch, sortField, sortOrder, refetchTrigger]);


  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(attendees.map((a) => a.id_number));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (idNumber: string) => {
    setSelectedIds((prev) =>
      prev.includes(idNumber)
        ? prev.filter((id) => id !== idNumber)
        : [...prev, idNumber]
    );
  };

  const selectedEligibleCount = selectedIds.filter((id) =>
    eligibleIds.has(id)
  ).length;
  const selectedIneligibleCount = selectedIds.filter(
    (id) => !eligibleIds.has(id)
  ).length;

  const handleUpdateEligibility = async (isEligible: boolean) => {
    const targetIds = selectedIds.filter((id) =>
      isEligible ? !eligibleIds.has(id) : eligibleIds.has(id)
    );
    if (targetIds.length === 0) return;

    setIsUpdating(true);
    const toastId = toast.loading("Eligibilizing...");
    const updatedList = await updateStudentEligibility(
      eventId,
      targetIds,
      isEligible
    );
    setIsUpdating(false);

    if (updatedList) {
      setEvent((prev) =>
        prev ? { ...prev, eligibleStudentsForCertificate: updatedList } : null
      );
      toast.success(
        isEligible
          ? targetIds.length === 1
            ? "Student eligibilized!"
            : "Students eligibilized!"
          : targetIds.length === 1
          ? "Student ineligibilized!"
          : "Students ineligibilized!",
        {
          id: toastId,
          style: {
            background: "#ecfdf5",
            color: "#047857",
            border: "1px solid #a7f3d0"
          }
        }
      );
      setSelectedIds([]);
    } else {
      toast.error("Failed to update student eligibility", {
        id: toastId,
        style: {
          background: "#fef2f2",
          color: "#b91c1c",
          border: "1px solid #fca5a5"
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="heading-3">{event?.eventName || "Loading Event..."}</h2>
          <p className="text-sm text-muted-foreground">Manage Certificate Eligibility</p>
        </div>
      </div>

      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="flex items-center gap-2">
          <div className="relative w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or ID..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {sortField && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSortField(null);
                setSortOrder("asc");
              }}
              className="h-9 px-3 text-xs text-gray-500 hover:text-red-600 flex items-center gap-1.5"
              title="Clear active sorting"
            >
              <X className="w-3.5 h-3.5" />
              Reset Sort
            </Button>
          )}
        </div>

        <div className="flex gap-2 items-center">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv,.xlsx,.xls"
            className="hidden"
          />
          <Button variant="outline" onClick={handleImportClick} disabled={isFileProcessing}>
            <Upload className="w-4 h-4 mr-2" />
            {isFileProcessing ? "Processing..." : "Import via CSV/XLSX"}
          </Button>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                  <HelpCircle className="w-4.5 h-4.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs p-3 bg-gray-900 text-gray-100 border border-gray-800 shadow-md" side="bottom">
                <div className="space-y-1.5 text-xs">
                  <h4 className="font-semibold text-white">Guidelines for CSV/XLSX Import</h4>
                  <ul className="list-disc pl-4 space-y-1 text-gray-300">
                    <li>The sheet must contain student IDs in the first column, matching attendees of this event.</li>
                    <li>
                      Students from other UC branches require suffixes (e.g., <code className="text-yellow-400 bg-gray-800 px-1 py-0.5 rounded font-mono">-ucpt</code> for UC Pardo/Talisay). Main campus students do not need a suffix.
                    </li>
                  </ul>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Button
            className="bg-green-600 hover:bg-green-700 text-white"
            disabled={selectedIneligibleCount === 0 || isUpdating}
            onClick={() => handleUpdateEligibility(true)}
          >
            Eligibilize {selectedIneligibleCount > 0 && `(${selectedIneligibleCount})`}
          </Button>
          <Button
            variant="destructive"
            disabled={selectedEligibleCount === 0 || isUpdating}
            onClick={() => handleUpdateEligibility(false)}
          >
            Uneligibilize {selectedEligibleCount > 0 && `(${selectedEligibleCount})`}
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50 select-none">
            <tr>
              <th className="px-4 py-3 w-12">
                <Checkbox
                  checked={
                    attendees.length > 0 &&
                    attendees.every((a) => selectedIds.includes(a.id_number))
                  }
                  onCheckedChange={(checked) => handleSelectAll(!!checked)}
                  aria-label="Select all attendees"
                />
              </th>
              <th 
                className="px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort("id_number")}
              >
                <div className="flex items-center gap-1.5">
                  Student ID
                  {renderSortIcon("id_number")}
                </div>
              </th>
              <th 
                className="px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center gap-1.5">
                  Name
                  {renderSortIcon("name")}
                </div>
              </th>
              <th 
                className="px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort("course")}
              >
                <div className="flex items-center gap-1.5">
                  Course & Year
                  {renderSortIcon("course")}
                </div>
              </th>
              <th 
                className="px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort("status")}
              >
                <div className="flex items-center gap-1.5">
                  Status
                  {renderSortIcon("status")}
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 8 }, (_, index) => (
                <tr key={index} className="border-b">
                  {Array.from({ length: 5 }, (_, cell) => (
                    <td key={cell} className="px-4 py-3">
                      <Skeleton className="h-4 w-full rounded-full" />
                    </td>
                  ))}
                </tr>
              ))
            ) : attendees.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  No attendees found.
                </td>
              </tr>
            ) : (
              attendees.map((attendee) => {
                const isEligible = eligibleIds.has(attendee.id_number);
                return (
                  <tr
                    key={attendee.id_number}
                    className="border-b hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleSelectRow(attendee.id_number)}
                    role="checkbox"
                    aria-checked={selectedIds.includes(attendee.id_number)}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleSelectRow(attendee.id_number);
                      }
                    }}
                  >
                    <td
                      className="px-4 py-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        checked={selectedIds.includes(attendee.id_number)}
                        onCheckedChange={() => handleSelectRow(attendee.id_number)}
                        aria-label={`Select ${attendee.name}`}
                      />
                    </td>
                    <td className="px-4 py-3 font-medium">{attendee.id_number}</td>
                    <td className="px-4 py-3">{toTitleCase(attendee.name)}</td>
                    <td className="px-4 py-3">{attendee.course} - {attendee.year_level}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${isEligible ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {isEligible ? 'Eligible' : 'Not Eligible'}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

          {!loading && totalCount > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-gray-100">
              <p className="text-xs text-muted-foreground">
                Showing <span className="font-medium">{attendees.length}</span> of{" "}
                <span className="font-medium">{totalCount}</span> attendees
              </p>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (pageNumber > 1) setPageNumber(pageNumber - 1);
                      }}
                      className={
                        pageNumber <= 1 ? "pointer-events-none opacity-50" : ""
                      }
                    />
                  </PaginationItem>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pageNumber <= 3) {
                      pageNum = i + 1;
                    } else if (pageNumber >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = pageNumber - 2 + i;
                    }
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setPageNumber(pageNum);
                          }}
                          isActive={pageNumber === pageNum}
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  {totalPages > 5 && pageNumber < totalPages - 2 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}
                  {totalPages > 5 && pageNumber < totalPages - 2 && (
                    <PaginationItem>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setPageNumber(totalPages);
                        }}
                      >
                        {totalPages}
                      </PaginationLink>
                    </PaginationItem>
                  )}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (pageNumber < totalPages) setPageNumber(pageNumber + 1);
                      }}
                      className={
                        pageNumber >= totalPages
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      {/* Import Confirmation Dialog */}
      <Dialog open={showConfirmModal} onOpenChange={(open) => !isUpdating && setShowConfirmModal(open)}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Verify Imported Students</DialogTitle>
            <DialogDescription>
              We found {importResults.length} records in the uploaded file.
            </DialogDescription>
          </DialogHeader>

          <div className="relative my-2">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search imported students by name or ID..."
              className="pl-9"
              value={dialogSearchQuery}
              onChange={(e) => setDialogSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex-1 overflow-y-auto my-2 border rounded-md p-3 divide-y max-h-[40vh]">
            {filteredImportResults.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-6">No matching students found.</p>
            ) : (
              filteredImportResults.map((result, idx) => (
                <div key={idx} className="flex justify-between items-center py-2.5 text-sm">
                  <div>
                    <p className="font-semibold text-gray-800">{toTitleCase(result.name)}</p>
                    <p className="text-xs text-muted-foreground">ID: {result.studentId}</p>
                  </div>
                  <div>
                    {result.isAttendee ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                        Valid Attendee
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700" title="This student ID is not in the event attendees list.">
                        Not Registered
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="bg-yellow-50 border border-yellow-100 rounded-md p-3 text-xs text-yellow-800 mb-4">
            <strong>Notice:</strong> Only valid attendees (marked in green) will be set as eligible. Unregistered IDs will be skipped. This action will not remove eligibility from existing students.
          </div>

          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowConfirmModal(false)} disabled={isUpdating}>
              Cancel
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={handleConfirmImport}
              disabled={importResults.filter((r) => r.isAttendee).length === 0 || isUpdating}
            >
              Confirm & Mark Eligible
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
