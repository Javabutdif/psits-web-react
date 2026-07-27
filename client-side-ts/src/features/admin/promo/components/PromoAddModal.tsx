import { useState, useEffect } from "react";
import { X, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { showToast } from "@/utils/alertHelper";
import { createPromoCode, type CreatePromoPayload } from "../api/promo.api";
import { fetchStudentName } from "@/features/admin/api/admin";
import { activePublishMerchandise } from "@/features/admin/api/admin";
import { TEAM_ROLES } from "../types/promo.types";
import type { SelectedMerchandise } from "../types/promo.types";

const initialFormValues = {
  promoName: "",
  type: "" as string,
  studentType: "" as string,
  limitType: "Limited" as string,
  singleStudent: "no" as string,
  selectedStudents: [] as string[],
  selectedMembers: [] as string[],
  selectedMerchandise: [] as SelectedMerchandise[],
  startDate: new Date().toISOString().split("T")[0],
  endDate: new Date().toISOString().split("T")[0],
  quantity: 0,
  discount: 0,
  selectedCategories: [] as string[],
  promoScope: "Merchandise" as "Merchandise" | "Category" | "Both",
};

interface PromoAddModalProps {
  onClose: () => void;
}

const Chip = ({ value, onRemove }: { value: string; onRemove: () => void }) => (
  <span className="flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700">
    {value}
    <button
      type="button"
      onClick={onRemove}
      className="ml-1 text-blue-400 hover:text-blue-600"
    >
      <X className="h-3 w-3" />
    </button>
  </span>
);

export const PromoAddModal = ({ onClose }: PromoAddModalProps) => {
  const [form, setForm] = useState(initialFormValues);
  const [activeMerchandise, setActiveMerchandise] = useState<
    SelectedMerchandise[]
  >([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [searchStudentId, setSearchStudentId] = useState("");
  const [studentSearched, setStudentSearched] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadMerch = async () => {
      try {
        const result = await activePublishMerchandise();
        if (result) {
          const data = (result as any).data || result;
          setActiveMerchandise(Array.isArray(data) ? data : []);
          if (Array.isArray(data)) {
            const cats = Array.from(
              new Set(
                data
                  .filter((m: any) => m.category && typeof m.category === "string")
                  .map((m: any) => m.category)
              )
            ).sort();
            setAvailableCategories(cats);
          }
        }
      } catch (error) {
        console.error(error);
      }
    };
    loadMerch();
  }, []);

  const updateField = (
    field: string,
    value: string | number | string[] | SelectedMerchandise[]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleMerchandise = (item: SelectedMerchandise) => {
    const exists = form.selectedMerchandise.some((m) => m._id === item._id);
    if (exists) {
      updateField(
        "selectedMerchandise",
        form.selectedMerchandise.filter((m) => m._id !== item._id)
      );
    } else {
      updateField("selectedMerchandise", [...form.selectedMerchandise, item]);
    }
  };

  const handleSearchStudent = async () => {
    if (!searchStudentId.trim()) return;
    setIsSearching(true);
    try {
      const result = await fetchStudentName(searchStudentId);
      if (result?.data) {
        setStudentSearched(result.data);
      } else {
        showToast("error", "No student found.");
        setStudentSearched(null);
      }
    } catch (error) {
      console.error(error);
      showToast("error", "Failed to search student.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddStudent = () => {
    if (!studentSearched?.id_number) return;
    if (form.selectedStudents.includes(studentSearched.id_number)) {
      showToast("error", "Student already added.");
      setSearchStudentId("");
      setStudentSearched(null);
      return;
    }
    updateField("selectedStudents", [
      ...form.selectedStudents,
      studentSearched.id_number,
    ]);
    setSearchStudentId("");
    setStudentSearched(null);
    showToast("success", "Student added.");
  };

  const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({});

  const handleSubmit = async () => {
    const errors: Record<string, boolean> = {};
    if (!form.promoName.trim()) errors.promoName = true;
    if (!form.type) errors.type = true;
    if (form.discount <= 0) errors.discount = true;
    if (!form.startDate) errors.startDate = true;
    if (!form.endDate) errors.endDate = true;
    if (form.startDate && form.endDate && form.startDate > form.endDate) errors.dateOrder = true;
    if (form.limitType === "Limited" && form.quantity <= 0) errors.quantity = true;
    if (
      form.promoScope !== "Category" &&
      form.selectedMerchandise.length === 0 &&
      form.selectedCategories.length === 0
    ) {
      errors.merchandise = true;
    }
    if (form.promoScope === "Category" && form.selectedCategories.length === 0) {
      errors.categories = true;
    }

    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) {
      const messages = [];
      if (errors.promoName) messages.push("Promo name is required");
      if (errors.type) messages.push("Type is required");
      if (errors.discount) messages.push("Discount must be greater than 0");
      if (errors.startDate) messages.push("Start date is required");
      if (errors.endDate) messages.push("End date is required");
      if (errors.dateOrder) messages.push("Start date must be before end date");
      if (errors.quantity) messages.push("Quantity is required for limited promos");
      if (errors.merchandise) messages.push("Select at least one merchandise");
      if (errors.categories) messages.push("Select at least one category");
      showToast("error", messages.join(". "));
      return;
    }

    setValidationErrors({});

    const audience =
      form.type === "Members"
        ? form.selectedMembers
        : form.studentType === "Specific"
          ? form.selectedStudents
          : form.type === "All Students"
            ? "All Students"
            : form.selectedStudents;

    const payload: CreatePromoPayload = {
      promoName: form.promoName,
      type: form.type,
      limitType: form.limitType,
      singleStudent: form.singleStudent,
      selectedAudience: audience,
      selectedMerchandise: form.selectedMerchandise,
      selectedCategories: form.selectedCategories,
      promoScope: form.promoScope,
      discount: form.discount,
      startDate: form.startDate,
      endDate: form.endDate,
      quantity: form.limitType === "Limited" ? form.quantity : 0,
    };

    setIsSubmitting(true);
    const result = await createPromoCode(payload);
    setIsSubmitting(false);
    if (result) {
      onClose();
    }
  };

  return (
    <div className="p-6">
      <DialogHeader className="mb-5">
        <div className="flex items-start justify-between">
          <DialogTitle className="text-lg font-semibold">
            Add Promo Code
          </DialogTitle>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full border border-[#eeeeee] text-[#777] hover:bg-gray-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </DialogHeader>

      <div className="space-y-5">
        {/* Promo Name */}
        <div>
          <Label className="text-xs font-medium">Promo Name</Label>
          <Input
            value={form.promoName}
            onChange={(e) => updateField("promoName", e.target.value)}
            placeholder="Enter promo name"
            className={`mt-1 h-10 rounded-lg border-[#eeeeee] ${validationErrors.promoName ? "border-red-500" : ""}`}
          />
        </div>

        {/* Type */}
        <div>
          <Label className="text-xs font-medium">Type</Label>
          <Select
            value={form.type}
            onValueChange={(v) => { updateField("type", v); setValidationErrors((prev) => ({ ...prev, type: false })); }}
          >
            <SelectTrigger className={`mt-1 h-10 w-full rounded-lg border-[#eeeeee] ${validationErrors.type ? "border-red-500" : ""}`}>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Members">Members</SelectItem>
              <SelectItem value="Students">Students</SelectItem>
              <SelectItem value="All Students">All Students</SelectItem>
              <SelectItem value="Membership">Membership</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Student Type sub-field */}
        {form.type === "Students" && (
          <div>
            <Label className="text-xs font-medium">Type of Students</Label>
            <Select
              value={form.studentType}
              onValueChange={(v) => updateField("studentType", v)}
            >
              <SelectTrigger className="mt-1 h-10 w-full rounded-lg border-[#eeeeee]">
                <SelectValue placeholder="Select student type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Specific">Specific</SelectItem>
                <SelectItem value="All Students">All Students</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Specific Students */}
        {form.studentType === "Specific" && (
          <div>
            <Label className="text-xs font-medium">Specific Students</Label>
            <div className="mt-1 flex gap-2">
              <Input
                value={searchStudentId}
                onChange={(e) => setSearchStudentId(e.target.value)}
                placeholder="Student ID number"
                className="h-10 rounded-lg border-[#eeeeee]"
                onKeyDown={(e) => e.key === "Enter" && handleSearchStudent()}
              />
              <Button
                type="button"
                size="sm"
                className="bg-[#1c9dde] hover:bg-[#168bc7]"
                disabled={isSearching}
                onClick={handleSearchStudent}
              >
                <Search className="h-4 w-4" />
              </Button>
              {studentSearched?.id_number && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAddStudent}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {form.selectedStudents.map((s) => (
                <Chip
                  key={s}
                  value={s}
                  onRemove={() =>
                    updateField(
                      "selectedStudents",
                      form.selectedStudents.filter((x) => x !== s)
                    )
                  }
                />
              ))}
              {studentSearched?.id_number &&
                !form.selectedStudents.includes(studentSearched.id_number) && (
                  <span className="text-xs text-gray-500">
                    Found: {studentSearched.name} | ID:{" "}
                    {studentSearched.id_number}
                  </span>
                )}
            </div>
          </div>
        )}

        {/* Members checkboxes */}
        {form.type === "Members" && (
          <div>
            <Label className="text-xs font-medium">Sub Members</Label>
            <div className="mt-2 flex flex-wrap gap-3">
              {TEAM_ROLES.map((role) => (
                <label key={role} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={form.selectedMembers.includes(role)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        updateField("selectedMembers", [
                          ...form.selectedMembers,
                          role,
                        ]);
                      } else {
                        updateField(
                          "selectedMembers",
                          form.selectedMembers.filter((r) => r !== role)
                        );
                      }
                    }}
                    className="data-[state=checked]:border-[#1c9dde] data-[state=checked]:bg-[#1c9dde]"
                  />
                  <span className="capitalize">{role}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Limit Type */}
        <div>
          <Label className="text-xs font-medium">Limit Type</Label>
          <div className="mt-2 flex gap-4">
            {["Limited", "Unlimited"].map((opt) => (
              <label key={opt} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={form.limitType === opt}
                  onCheckedChange={(checked) => {
                    if (checked) updateField("limitType", opt);
                  }}
                  className="data-[state=checked]:border-[#1c9dde] data-[state=checked]:bg-[#1c9dde]"
                />
                {opt}
              </label>
            ))}
          </div>
        </div>

        {/* Single Student Limit */}
        {form.limitType === "Limited" && (
          <div>
            <Label className="text-xs font-medium">One Per Student?</Label>
            <Select
              value={form.singleStudent}
              onValueChange={(v) => updateField("singleStudent", v)}
            >
              <SelectTrigger className="mt-1 h-10 w-full rounded-lg border-[#eeeeee]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Quantity */}
        {form.limitType === "Limited" && (
          <div>
              <Label className="text-xs font-medium">Quantity</Label>
              <Input
                type="number"
                value={form.quantity}
                onChange={(e) => {
                  updateField("quantity", parseInt(e.target.value) || 0);
                  setValidationErrors((prev) => ({ ...prev, quantity: false }));
                }}
                placeholder="Enter quantity"
                className={`mt-1 h-10 rounded-lg border-[#eeeeee] ${validationErrors.quantity ? "border-red-500" : ""}`}
              />
          </div>
        )}

        {/* Dates & Discount */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <Label className="text-xs font-medium">Start Date</Label>
            <Input
              type="date"
              value={form.startDate}
              onChange={(e) => {
                updateField("startDate", e.target.value);
                setValidationErrors((prev) => ({ ...prev, startDate: false, endDate: false, dateOrder: false }));
              }}
              className={`mt-1 h-10 rounded-lg border-[#eeeeee] ${validationErrors.startDate ? "border-red-500" : ""}`}
            />
          </div>
          <div>
            <Label className="text-xs font-medium">End Date</Label>
            <Input
              type="date"
              value={form.endDate}
              onChange={(e) => {
                updateField("endDate", e.target.value);
                setValidationErrors((prev) => ({ ...prev, startDate: false, endDate: false, dateOrder: false }));
              }}
              className={`mt-1 h-10 rounded-lg border-[#eeeeee] ${validationErrors.endDate ? "border-red-500" : ""}`}
            />
          </div>
          <div>
              <Label className="text-xs font-medium">Discount (%)</Label>
              <Input
                type="number"
                value={form.discount}
                onChange={(e) => {
                  updateField("discount", parseFloat(e.target.value) || 0);
                  setValidationErrors((prev) => ({ ...prev, discount: false }));
                }}
                placeholder="Enter discount"
                className={`mt-1 h-10 rounded-lg border-[#eeeeee] ${validationErrors.discount ? "border-red-500" : ""}`}
              />
          </div>
        </div>

        {/* Scope Type + Categories/Merch */}
        <div>
          <Label className="text-xs font-medium">Scope Type</Label>
          <div className="mt-2 flex gap-4">
            {(["Merchandise", "Category", "Both"] as const).map((scope) => (
              <label key={scope} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={form.promoScope === scope}
                  onCheckedChange={(checked) => {
                    if (checked) updateField("promoScope", scope);
                  }}
                  className="data-[state=checked]:border-[#1c9dde] data-[state=checked]:bg-[#1c9dde]"
                />
                {scope}
              </label>
            ))}
          </div>
        </div>

        {form.promoScope !== "Category" && (
          <div>
            <Label className="text-xs font-medium">Applied Merchandise</Label>
            <div className="mt-2 max-h-40 overflow-y-auto rounded-lg border border-[#eeeeee] p-2">
              {activeMerchandise.map((item) => (
                <label
                  key={item._id}
                  className="flex items-center gap-2 py-1 text-sm"
                >
                  <Checkbox
                    checked={form.selectedMerchandise.some(
                      (m) => m._id === item._id
                    )}
                    onCheckedChange={() => toggleMerchandise(item)}
                    className="data-[state=checked]:border-[#1c9dde] data-[state=checked]:bg-[#1c9dde]"
                  />
                  <span className="truncate">{item.name}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {form.promoScope !== "Merchandise" && (
          <div>
            <Label className="text-xs font-medium">Categories</Label>
            <p className="mt-1 text-xs text-[#8b8b8b]">
              Promo applies to all merchandise in selected categories.
            </p>
            {availableCategories.length > 0 ? (
              <div className="mt-2 max-h-40 overflow-y-auto rounded-lg border border-[#eeeeee] p-2">
                {availableCategories.map((cat) => (
                  <label key={cat} className="flex items-center gap-2 py-1 text-sm">
                    <Checkbox
                      checked={form.selectedCategories.includes(cat)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateField("selectedCategories", [
                            ...form.selectedCategories,
                            cat,
                          ]);
                        } else {
                          updateField(
                            "selectedCategories",
                            form.selectedCategories.filter((x) => x !== cat)
                          );
                        }
                      }}
                      className="data-[state=checked]:border-[#1c9dde] data-[state=checked]:bg-[#1c9dde]"
                    />
                    <span>{cat}</span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-xs text-gray-400 italic">No categories available.</p>
            )}
          </div>
        )}
      </div>

      <DialogFooter className="mt-7">
        <Button
          type="button"
          variant="outline"
          className="rounded-full px-8"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          type="button"
          disabled={isSubmitting}
          className="rounded-full bg-[#1c9dde] px-8 hover:bg-[#168bc7]"
          onClick={handleSubmit}
        >
          {isSubmitting ? "Creating..." : "Create Promo Code"}
        </Button>
      </DialogFooter>
    </div>
  );
};
