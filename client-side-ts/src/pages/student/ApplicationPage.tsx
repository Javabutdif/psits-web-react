import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth";
import {
  listPositions,
  submitApplication,
  getApplicationsForUser,
} from "@/api/recruitment.api";
import type { Application, RecruitmentPosition } from "@/types/recruitment";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Upload, Check, X } from "lucide-react";
import { toast } from "sonner";

const COURSES = ["BSIT", "BSCS"];
const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
const YEAR_MAP: Record<string, string> = {
  "1": "1st Year",
  "2": "2nd Year",
  "3": "3rd Year",
  "4": "4th Year",
};

const OFFICER_SUBPOSITIONS = [
  "President",
  "Vice President - Internal",
  "Vice President - External",
  "Secretary",
];

type StatusStep = {
  key: string;
  label: string;
  description: string;
};

const STATUS_STEPS: StatusStep[] = [
  {
    key: "SUBMITTED",
    label: "Submitted",
    description: "Your application has been received and is pending review.",
  },
  {
    key: "INTERVIEW_SCHEDULED",
    label: "Under review",
    description:
      "Your application is currently being reviewed by the PSITS team.",
  },
  {
    key: "INTERVIEWING",
    label: "Interview",
    description:
      "You have been shortlisted for an interview. Please check your email for details.",
  },
  {
    key: "APPROVED",
    label: "Decision Pending",
    description:
      "Your application is awaiting a final decision. You will be notified once an update is available.",
  },
  {
    key: "DONE",
    label: "Approved",
    description:
      "Congratulations! You have been accepted. Please check your email for further details.",
  },
];

const REJECTED_STEP: StatusStep = {
  key: "REJECTED",
  label: "Rejected",
  description:
    "Thank you for your interest. We encourage you to apply again in the future.",
};

const ApplicationStatus = ({
  application,
  onReapply,
}: {
  application: Application;
  onReapply?: () => void;
}) => {
  const isRejected = application.status === "REJECTED";

  let currentStep = 0;

  switch (application.status) {
    case "SUBMITTED":
      currentStep = 0;
      break;

    case "INTERVIEW_SCHEDULED":
      currentStep = 1;
      break;

    case "INTERVIEWING":
      currentStep = 2;
      break;

    case "APPROVED":
      currentStep = 4;
      break;

    case "REJECTED":
      currentStep = 4;
      break;

    default:
      currentStep = 0;
  }

  const steps = isRejected
    ? [...STATUS_STEPS.slice(0, 4), REJECTED_STEP]
    : STATUS_STEPS;

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-gray-900">Application Status</h2>

      <div className="mt-2 mb-5 h-[1.5px] w-full bg-sky-400" />

      <div className="relative">
        {steps.map((step, index) => {
          const active = index <= currentStep;
          const isCurrent = index === currentStep;
          const rejectedHere = isRejected && isCurrent;

          return (
            <div
              key={step.label}
              className="relative flex items-start gap-3 pb-3 last:pb-0"
            >
              {/* Vertical line */}
              {index !== steps.length - 1 && (
                <div
                  className={`absolute top-6 left-[11px] h-full w-[2px] ${
                    index < currentStep ? "bg-green-500" : "bg-gray-300"
                  }`}
                />
              )}

              {/* Filled circle marker */}
              <div className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center">
                {rejectedHere ? (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 p-[3px]">
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-white p-[2px]">
                      <div className="flex h-full w-full items-center justify-center rounded-full bg-red-500">
                        <X className="h-3 w-3 text-white" strokeWidth={2.5} />
                      </div>
                    </div>
                  </div>
                ) : active ? (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 p-[3px]">
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-white p-[2px]">
                      <div className="flex h-full w-full items-center justify-center rounded-full bg-green-500">
                        <Check
                          className="h-3 w-3 text-white"
                          strokeWidth={2.5}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-300 p-[3px]">
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-white p-[2px]">
                      <div className="h-full w-full rounded-full bg-gray-300" />
                    </div>
                  </div>
                )}
              </div>

              {/* Text */}
              <div className="pt-0.5">
                <p
                  className={`text-base ${
                    isCurrent || rejectedHere
                      ? "font-semibold text-gray-900"
                      : active
                        ? "font-medium text-gray-900"
                        : "font-normal text-gray-400"
                  }`}
                >
                  {step.label}
                </p>

                {(isCurrent || rejectedHere) && step.description && (
                  <p className="mt-0.5 text-sm text-gray-500">
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isRejected && onReapply && (
        <div className="mt-6 flex justify-center border-t border-gray-100 pt-5">
          <Button type="button" onClick={onReapply} className="w-full max-w-xs">
            Apply Again
          </Button>
        </div>
      )}
    </div>
  );
};

export const ApplicationPage = () => {
  const { user } = useAuth();

  const [positions, setPositions] = useState<RecruitmentPosition[]>([]);
  const [positionsLoading, setPositionsLoading] = useState(true);

  const [existingApplication, setExistingApplication] =
    useState<Application | null>(null);
  const [applicationsLoading, setApplicationsLoading] = useState(true);

  // When a rejected applicant chooses to reapply, we keep
  // `existingApplication` around (still REJECTED) but show the form
  // instead of the status page until they submit a new application.
  const [reapplying, setReapplying] = useState(false);

  const [selectedPositionId, setSelectedPositionId] = useState("");
  const [subPosition, setSubPosition] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [resume, setResume] = useState<File | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dragging, setDragging] = useState(false);

  const [form, setForm] = useState({
    studentId: "",
    lastName: "",
    middleName: "",
    firstName: "",
    email: "",
    course: "",
    year: "",
  });

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        studentId: user.idNumber || prev.studentId,
        email: user.email || prev.email,
        course: user.course || prev.course,
        year:
          user.year !== undefined
            ? YEAR_MAP[String(user.year)] || prev.year
            : prev.year,
        ...(user.name
          ? (() => {
              const parts = user.name.trim().split(/\s+/);
              return {
                firstName: parts[0] || prev.firstName,
                lastName:
                  parts.length > 1 ? parts[parts.length - 1] : prev.lastName,
              };
            })()
          : {}),
      }));
    }
  }, [user]);

  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const res = await listPositions({ status: "OPEN" });
        setPositions(res.data.data?.positions || []);
      } catch (err) {
        console.error("Failed to load positions:", err);
        toast.error("Couldn't load open positions. Try refreshing.");
      } finally {
        setPositionsLoading(false);
      }
    };
    fetchPositions();
  }, []);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await getApplicationsForUser();
        const apps: Application[] = res.data.data || [];
        const active = apps.find((a) => a.status !== "WITHDRAWN");
        setExistingApplication(active || null);
      } catch (err) {
        console.error("Failed to load applications:", err);
      } finally {
        setApplicationsLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const selectedPosition = positions.find((p) => p._id === selectedPositionId);
  const isOfficerRole = selectedPosition?.title?.toLowerCase() === "officer";

  const isFormValid =
    selectedPositionId &&
    (!isOfficerRole || subPosition) &&
    acknowledged &&
    resume &&
    form.studentId &&
    form.lastName &&
    form.firstName &&
    form.email &&
    form.course &&
    form.year;

  useEffect(() => {
    const preventDefault = (e: DragEvent) => {
      e.preventDefault();
    };

    window.addEventListener("dragover", preventDefault);
    window.addEventListener("drop", preventDefault);

    return () => {
      window.removeEventListener("dragover", preventDefault);
      window.removeEventListener("drop", preventDefault);
    };
  }, []);

  const handleResume = (file: File) => {
    if (file.type !== "application/pdf") {
      toast.error("Resume must be a PDF file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Resume must be under 5MB.");
      return;
    }

    setResume(file);
    setUploadOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    handleResume(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
  };

  const handleDragEnter = () => {
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    handleResume(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || !resume) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("resume", resume);
      formData.append("studentId", form.studentId);
      formData.append("lastName", form.lastName);
      formData.append("middleName", form.middleName);
      formData.append("firstName", form.firstName);
      formData.append("email", form.email);
      formData.append("course", form.course);
      formData.append("year", form.year);
      if (subPosition) formData.append("subPosition", subPosition);

      const res = await submitApplication(selectedPositionId, formData);
      setExistingApplication(res.data.data);
      setReapplying(false);
      toast.success("Application submitted!");
    } catch (err) {
      console.error("Submission failed:", err);
      toast.error("Application submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (applicationsLoading) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl bg-white p-8 text-center text-gray-500 shadow-sm">
          Loading...
        </div>
      </div>
    );
  }

  // Show the status page whenever there's an existing application, unless
  // it's REJECTED and the student has chosen to reapply (`reapplying`).
  if (existingApplication && !reapplying) {
    return (
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-2xl font-light text-gray-800">
          Submit PSITS membership application
        </h1>
        <ApplicationStatus
          application={existingApplication}
          onReapply={
            existingApplication.status === "REJECTED"
              ? () => setReapplying(true)
              : undefined
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-6 text-2xl font-light text-gray-800">
        Submit PSITS membership application
      </h1>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl bg-white p-8 shadow-sm"
      >
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:divide-x md:divide-gray-100">
          {/* Role Information */}
          <div className="space-y-4 md:pr-8">
            <h2 className="text-lg font-medium text-gray-800">
              Role Information
            </h2>

            <div className="flex gap-3">
              <Select
                value={selectedPositionId}
                onValueChange={(v) => {
                  setSelectedPositionId(v);
                  setSubPosition("");
                }}
                disabled={positionsLoading}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue
                    placeholder={
                      <span>
                        Select role <span className="text-red-500">*</span>
                      </span>
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {positions.map((p) => (
                    <SelectItem key={p._id} value={p._id}>
                      {p.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={subPosition}
                onValueChange={setSubPosition}
                disabled={!isOfficerRole}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Position" />
                </SelectTrigger>
                <SelectContent>
                  {OFFICER_SUBPOSITIONS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="min-h-[180px] rounded-lg border border-gray-200 p-4 text-sm text-gray-500">
              {selectedPosition ? (
                <div className="space-y-3 text-gray-700">
                  <p>{selectedPosition.description}</p>
                  {selectedPosition.requirements?.length > 0 && (
                    <div>
                      <p className="font-semibold">REQUIREMENTS:</p>
                      <ul className="list-disc pl-4">
                        {selectedPosition.requirements.map((req, i) => (
                          <li key={i}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex h-full min-h-[148px] items-center justify-center text-center text-gray-500">
                  Select a role to view role requirements and overview
                </div>
              )}
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-600">
              <Checkbox
                checked={acknowledged}
                onCheckedChange={(v) => setAcknowledged(v === true)}
              />
              I have read and understand the role requirements{" "}
              <span className="text-red-500">*</span>
            </label>

            <div>
              <h3 className="font-medium text-gray-800">Upload resume</h3>
              <p className="mb-2 text-xs text-gray-500">
                Your resume will be analyzed by our system for initial
                screening.
              </p>
              <div className="flex items-center gap-3 rounded-xl border border-gray-200 p-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setUploadOpen(true)}
                  className="gap-1.5 rounded-xl text-sky-500"
                >
                  <Upload className="h-4 w-4 text-sky-500" />
                  Upload File
                </Button>
                <span className="text-sm text-gray-500">
                  {resume ? resume.name : "No file chosen"}
                </span>
              </div>
            </div>
          </div>

          {/* Personal Info */}
          <div className="space-y-4 md:pl-8">
            <h2 className="text-lg font-medium text-gray-800">Personal Info</h2>

            <Input
              placeholder="Student ID Number *"
              value={form.studentId}
              onChange={(e) => setForm({ ...form, studentId: e.target.value })}
            />
            <Input
              placeholder="Last Name *"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            />
            <Input
              placeholder="Middle Name"
              value={form.middleName}
              onChange={(e) => setForm({ ...form, middleName: e.target.value })}
            />
            <Input
              placeholder="First Name *"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            />
            <Input
              type="email"
              placeholder="Email Address *"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />

            <div className="flex gap-3">
              <Select
                value={form.course}
                onValueChange={(v) => setForm({ ...form, course: v })}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue
                    placeholder={
                      <span>
                        Course <span className="text-red-500">*</span>
                      </span>
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {COURSES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={form.year}
                onValueChange={(v) => setForm({ ...form, year: v })}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue
                    placeholder={
                      <span>
                        Year <span className="text-red-500">*</span>
                      </span>
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {YEARS.map((y) => (
                    <SelectItem key={y} value={y}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <Button
            type="submit"
            disabled={!isFormValid || submitting}
            className="w-full max-w-md"
          >
            {submitting ? "Submitting..." : "Submit application"}
          </Button>
        </div>
      </form>

      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="max-w-sm rounded-3xl">
          <DialogHeader>
            <DialogTitle>Upload File</DialogTitle>
          </DialogHeader>
          <label
            className={`flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
              dragging ? "border-sky-500 bg-sky-50" : "border-sky-200"
            }`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <Upload className="h-8 w-8 text-sky-400" />
            <span className="text-sm text-gray-600">Drag & drop or browse</span>
            <span className="text-xs text-gray-400">
              Supports: PDF, max 5MB
            </span>
            <span className="mt-2 rounded-md bg-sky-500 px-4 py-1.5 text-sm text-white">
              Choose File
            </span>
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApplicationPage;
