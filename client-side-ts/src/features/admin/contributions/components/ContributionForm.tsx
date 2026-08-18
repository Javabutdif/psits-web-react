import { useEffect, useRef, useState } from "react";
import { Check, Loader2, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { showToast } from "@/utils/alertHelper";
import type {
  AdminOption,
  Contribution,
  StudentOption,
} from "../types/contribution.types";

interface ContributionFormProps {
  contribution?: Contribution | null;
  isSubmitting: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: {
    idNumber: string;
    type: "developer" | "media" | "volunteer";
    description: string;
    date: string;
  }) => Promise<boolean>;
  onUpdate: (
    id: string,
    values: { description?: string; date?: string }
  ) => Promise<boolean>;
  type: "developer" | "media" | "volunteer";
  adminOptions: AdminOption[];
  searchStudents: (query: string) => Promise<StudentOption[]>;
}

export const ContributionForm = ({
  contribution,
  isSubmitting,
  open,
  onOpenChange,
  onSubmit,
  onUpdate,
  type,
  adminOptions,
  searchStudents,
}: ContributionFormProps) => {
  const isEdit = Boolean(contribution);
  const useStudentPicker = type !== "developer";
  const [idNumber, setIdNumber] = useState(contribution?.idNumber || "");
  const [studentQuery, setStudentQuery] = useState("");
  const [studentResults, setStudentResults] = useState<StudentOption[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedStudent, setSelectedStudent] =
    useState<StudentOption | null>(null);
  const [description, setDescription] = useState(
    contribution?.description || ""
  );
  const [date, setDate] = useState(
    contribution?.date
      ? new Date(contribution.date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0]
  );
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pickerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    setIdNumber(contribution?.idNumber || "");
    setDescription(contribution?.description || "");
    setDate(
      contribution?.date
        ? new Date(contribution.date).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0]
    );
    if (useStudentPicker) {
      setStudentQuery("");
      setStudentResults([]);
      setSelectedStudent(null);
      setShowResults(false);
    }
  }, [open, contribution, useStudentPicker]);

  useEffect(() => {
    if (!open || !useStudentPicker || isEdit) return;
    if (searchTimer.current) clearTimeout(searchTimer.current);
    const trimmed = studentQuery.trim();
    if (!trimmed) {
      setStudentResults([]);
      setShowResults(false);
      return;
    }
    searchTimer.current = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchStudents(trimmed);
      setStudentResults(results);
      setShowResults(true);
      setIsSearching(false);
    }, 300);
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [studentQuery, open, useStudentPicker, isEdit, searchStudents]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectStudent = (student: StudentOption) => {
    setSelectedStudent(student);
    setIdNumber(student.id_number);
    setStudentQuery(
      `${student.first_name} ${student.middle_name || ""} ${student.last_name}`.replace(/\s+/g, " ").trim()
    );
    setShowResults(false);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!idNumber.trim() || !description.trim() || !date) {
      showToast("error", "All fields are required");
      return;
    }
    if (isEdit && contribution) {
      const success = await onUpdate(contribution._id, { description, date });
      if (success) onOpenChange(false);
    } else {
      const success = await onSubmit({
        idNumber: idNumber.trim(),
        type,
        description: description.trim(),
        date,
      });
      if (success) {
        setIdNumber("");
        setDescription("");
        setDate(new Date().toISOString().split("T")[0]);
        onOpenChange(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[480px] rounded-[20px] p-0"
        showCloseButton={false}
      >
        <form onSubmit={handleSubmit} className="p-6">
          <DialogHeader className="mb-5">
            <div className="flex items-start justify-between">
              <DialogTitle className="text-base">
                {isEdit
                  ? "Edit Contribution"
                  : `Add ${type === "developer" ? "Developer" : type === "media" ? "Media" : "Volunteer"} Contribution`}
              </DialogTitle>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[#eeeeee] text-[#777]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="text-xs font-medium">
                {useStudentPicker ? "Member (Student)" : "Member (Officer)"}
              </Label>
              {useStudentPicker ? (
                <div ref={pickerRef} className="relative mt-1">
                  <div className="relative">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#9b9b9b]" />
                    <Input
                      value={studentQuery}
                      onChange={(e) => {
                        setStudentQuery(e.target.value);
                        if (selectedStudent) {
                          setSelectedStudent(null);
                          setIdNumber("");
                        }
                      }}
                      onFocus={() => {
                        if (studentQuery.trim() && studentResults.length > 0) {
                          setShowResults(true);
                        }
                      }}
                      className="h-10 rounded-lg border-[#eeeeee] bg-[#f8f8f8] pl-9"
                      placeholder="Search name or ID number..."
                      disabled={isEdit}
                      autoComplete="off"
                    />
                  </div>
                  {isSearching && (
                    <div className="mt-1 flex items-center gap-2 text-xs text-[#888]">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Searching...
                    </div>
                  )}
                  {showResults && !isSearching && (
                    <div className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-[#e5e5e5] bg-white shadow-lg">
                      {studentResults.length > 0 ? (
                        studentResults.map((student) => (
                          <button
                            type="button"
                            key={student._id}
                            onClick={() => handleSelectStudent(student)}
                            className="flex w-full items-center justify-between gap-2 border-b border-[#f0f0f0] px-3 py-2.5 text-left text-sm hover:bg-[#f5f8ff]"
                          >
                            <div className="min-w-0">
                              <div className="truncate font-medium text-[#303030]">
                                {student.first_name} {student.middle_name || ""}{" "}
                                {student.last_name}
                              </div>
                              <div className="text-xs text-[#888]">
                                {student.id_number}
                                {student.course
                                  ? ` — ${student.course} ${student.year || ""}`
                                  : ""}
                              </div>
                            </div>
                            {selectedStudent?.id_number ===
                              student.id_number && (
                              <Check className="h-4 w-4 shrink-0 text-[#1c9dde]" />
                            )}
                          </button>
                        ))
                      ) : (
                        <div className="px-3 py-3 text-sm text-[#999]">
                          No students found
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <Select
                  value={idNumber}
                  onValueChange={(value) => setIdNumber(value)}
                  disabled={isEdit}
                >
                  <SelectTrigger className="mt-1 h-10 w-full rounded-lg border-[#eeeeee]">
                    <SelectValue placeholder="Select an officer..." />
                  </SelectTrigger>
                  <SelectContent>
                    {adminOptions.map((admin) => (
                      <SelectItem key={admin._id} value={admin.id_number}>
                        {admin.name} — {admin.id_number}
                        {admin.position ? ` (${admin.position})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div>
              <Label className="text-xs font-medium">Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 h-[150px] w-full resize-none overflow-y-auto rounded-lg border-[#eeeeee]"
                style={{
                  whiteSpace: "pre-wrap",
                  overflowWrap: "break-word",
                  wordBreak: "break-word",
                }}
                placeholder="What did they contribute?"
                required
              />
            </div>

            <div>
              <Label className="text-xs font-medium">Date</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 h-10 rounded-lg border-[#eeeeee]"
                required
              />
            </div>
          </div>

          <DialogFooter className="mt-7">
            <Button
              type="button"
              variant="outline"
              className="rounded-full px-8"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full bg-[#1c9dde] px-8 hover:bg-[#168bc7]"
            >
              {isEdit ? "Save changes" : "Add Contribution"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
