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
import { updatePromoCode } from "../api/promo.api";
import { fetchStudentName } from "@/features/admin/api/admin";
import { activePublishMerchandise } from "@/features/admin/api/admin";
import { TEAM_ROLES } from "../types/promo.types";
import type { SelectedMerchandise, PromoListRow } from "../types/promo.types";

const normalizeType = (type: string): string => {
  if (type === "All Students" || type === "Specific") return "Students";
  return type;
};

interface PromoEditModalProps {
  data: PromoListRow;
  onClose: () => void;
}

export const PromoEditModal = ({ data, onClose }: PromoEditModalProps) => {
  const [form, setForm] = useState({
    promoName: data.promo_name,
    type: normalizeType(data.type),
    studentType: data.type,
    limitType: data.limit_type,
    singleStudent: data.one_person_limit ? "yes" : "no",
    selectedStudents: data.selected_specific_students || [],
    selectedMembers: data.selected_audience || [],
    selectedMerchandise: data.selected_merchandise || [],
    startDate: new Date(data.start_date).toISOString().split("T")[0],
    endDate: new Date(data.end_date).toISOString().split("T")[0],
    quantity: data.quantity || 0,
    discount: data.discount || 0,
    selectedCategories: data.selected_categories || [],
    promoScope:
      (data.promo_scope as "Merchandise" | "Category" | "Both") ||
      "Merchandise",
  });
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
          const dataResult = (result as any).data || result;
          const existingIds = new Set(
            (form.selectedMerchandise as SelectedMerchandise[]).map(
              (m: any) => m._id
            )
          );
          const merged = [
            ...(form.selectedMerchandise || []),
            ...(Array.isArray(dataResult) ? dataResult : []).filter(
              (m: any) => !existingIds.has(m._id)
            ),
          ];
          setActiveMerchandise(merged);
          if (Array.isArray(dataResult)) {
            const cats = Array.from(
              new Set(
                dataResult
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
    const exists = form.selectedMerchandise.some(
      (m: any) => m._id === item._id
    );
    if (exists) {
      updateField(
        "selectedMerchandise",
        form.selectedMerchandise.filter((m: any) => m._id !== item._id)
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

  const handleSubmit = async () => {
    if (form.promoName.trim() === "") {
      showToast("error", "Promo name cannot be empty.");
      return;
    }
    if (!form.type) {
      showToast("error", "Type is required.");
      return;
    }
    if (form.discount <= 0) {
      showToast("error", "Discount must be greater than 0.");
      return;
    }

    const audience =
      form.type === "Members"
        ? form.selectedMembers
        : form.studentType === "Specific"
          ? form.selectedStudents
          : form.type === "All Students"
            ? "All Students"
            : form.selectedStudents;

    const formData = new FormData();
    formData.append("promoId", data._id);
    formData.append("promoName", form.promoName);
    formData.append("type", form.type);
    formData.append("limitType", form.limitType);
    formData.append("singleStudent", form.singleStudent);
    formData.append("selectedAudience", JSON.stringify(audience));
    formData.append(
      "selectedMerchandise",
      JSON.stringify(form.selectedMerchandise)
    );
    formData.append(
      "selectedCategories",
      JSON.stringify(form.selectedCategories)
    );
    formData.append("promoScope", form.promoScope);
    formData.append("discount", String(form.discount));
    formData.append("startDate", form.startDate);
    formData.append("endDate", form.endDate);
    formData.append("quantity", String(form.quantity));

    setIsSubmitting(true);
    const result = await updatePromoCode(formData);
    setIsSubmitting(false);
    if (result) {
      onClose();
    }
  };

  const Chip = ({
    value,
    onRemove,
  }: {
    value: string;
    onRemove: () => void;
  }) => (
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

  return (
    <div className="p-6">
      <DialogHeader className="mb-5">
        <div className="flex items-start justify-between">
          <DialogTitle className="text-lg font-semibold">
            Edit Promo Code
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
        {/* Promo Name - disabled */}
        <div>
          <Label className="text-xs font-medium">Promo Name</Label>
          <Input
            value={form.promoName}
            disabled
            className="mt-1 h-10 rounded-lg border-[#eeeeee] bg-gray-50"
          />
        </div>

        {/* Type */}
        <div>
          <Label className="text-xs font-medium">Type</Label>
          <Select
            value={form.type}
            onValueChange={(v) => updateField("type", v)}
          >
            <SelectTrigger className="mt-1 h-10 w-full rounded-lg border-[#eeeeee]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Members">Members</SelectItem>
              <SelectItem value="Students">Students</SelectItem>
              <SelectItem value="All Students">All Students</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {form.type === "Students" && (
          <div>
            <Label className="text-xs font-medium">Type of Students</Label>
            <Select
              value={form.studentType}
              onValueChange={(v) => updateField("studentType", v)}
            >
              <SelectTrigger className="mt-1 h-10 w-full rounded-lg border-[#eeeeee]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Specific">Specific</SelectItem>
                <SelectItem value="All Students">All Students</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

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
            </div>
          </div>
        )}

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

        {form.limitType === "Limited" && (
          <>
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
            <div>
              <Label className="text-xs font-medium">Quantity</Label>
              <Input
                type="number"
                value={form.quantity}
                onChange={(e) =>
                  updateField("quantity", parseInt(e.target.value) || 0)
                }
                className="mt-1 h-10 rounded-lg border-[#eeeeee]"
              />
            </div>
          </>
        )}

        {/* Dates & Discount */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <Label className="text-xs font-medium">Start Date</Label>
            <Input
              type="date"
              value={form.startDate}
              onChange={(e) => updateField("startDate", e.target.value)}
              className="mt-1 h-10 rounded-lg border-[#eeeeee]"
            />
          </div>
          <div>
            <Label className="text-xs font-medium">End Date</Label>
            <Input
              type="date"
              value={form.endDate}
              onChange={(e) => updateField("endDate", e.target.value)}
              className="mt-1 h-10 rounded-lg border-[#eeeeee]"
            />
          </div>
          <div>
            <Label className="text-xs font-medium">Discount (%)</Label>
            <Input
              type="number"
              value={form.discount}
              onChange={(e) =>
                updateField("discount", parseFloat(e.target.value) || 0)
              }
              className="mt-1 h-10 rounded-lg border-[#eeeeee]"
            />
          </div>
        </div>

        {/* Scope */}
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
                      (m: any) => m._id === item._id
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
          {isSubmitting ? "Saving..." : "Update Promo Code"}
        </Button>
      </DialogFooter>
    </div>
  );
};
