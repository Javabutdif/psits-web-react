import { useState, useEffect } from "react";
import {
  X,
  Search,
  Plus,
  ListOrdered,
  Tags,
  Package,
  Layers,
} from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import {
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { showToast } from "@/utils/alertHelper";
import { updatePromoCode, type UpdatePromoPayload } from "../api/promo.api";
import { fetchStudentName } from "@/features/admin/api/admin";
import { activePublishMerchandise } from "@/features/admin/api/admin";
import { TEAM_ROLES } from "../types/promo.types";
import type { SelectedMerchandise, PromoListRow } from "../types/promo.types";
import { MdAllInclusive } from "react-icons/md";

const normalizeType = (type: string): string => {
  if (type === "All Students" || type === "Specific") return "Students";
  return type;
};

interface PromoEditModalProps {
  data: PromoListRow;
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
  const [step, setStep] = useState<"details" | "merchandise">("details");
  const [validationErrors, setValidationErrors] = useState<
    Record<string, boolean>
  >({});
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
                  .filter(
                    (m: any) => m.category && typeof m.category === "string"
                  )
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    setValidationErrors((prev) => ({ ...prev, merchandise: false }));
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

  // Validates step 1 — type, discount, dates, quantity. Scope/Categories/
  // Merchandise all live on step 2, validated in handleSubmit instead.
  const validateDetails = () => {
    const errors: Record<string, boolean> = {};
    if (!form.type) errors.type = true;
    if (form.discount <= 0) errors.discount = true;
    if (!form.startDate) errors.startDate = true;
    if (!form.endDate) errors.endDate = true;
    if (form.startDate && form.endDate && form.startDate > form.endDate)
      errors.dateOrder = true;
    if (form.limitType === "Limited" && form.quantity <= 0)
      errors.quantity = true;

    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) {
      const messages = [];
      if (errors.type) messages.push("Type is required");
      if (errors.discount) messages.push("Discount must be greater than 0");
      if (errors.startDate) messages.push("Start date is required");
      if (errors.endDate) messages.push("End date is required");
      if (errors.dateOrder) messages.push("Start date must be before end date");
      if (errors.quantity)
        messages.push("Quantity is required for limited promos");
      showToast("error", messages.join(". "));
      return false;
    }
    return true;
  };

  // Called by the footer "Next" button on step 1
  const handleNext = () => {
    if (!validateDetails()) return;
    setValidationErrors({});
    setStep("merchandise");
  };

  const handleSubmit = async () => {
    const errors: Record<string, boolean> = {};
    if (
      form.promoScope !== "Merchandise" &&
      form.selectedCategories.length === 0
    ) {
      errors.categories = true;
    }
    if (
      form.promoScope !== "Category" &&
      form.selectedMerchandise.length === 0
    ) {
      errors.merchandise = true;
    }

    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) {
      const messages = [];
      if (errors.categories) messages.push("Select at least one category");
      if (errors.merchandise) messages.push("Select at least one merchandise");
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

    const payload: UpdatePromoPayload = {
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
      promoId: data._id,
    };

    setIsSubmitting(true);
    const result = await updatePromoCode(payload);
    setIsSubmitting(false);
    if (result) {
      onClose();
    }
  };

  return (
    <div className="p-5">
      <DialogHeader className="mb-4">
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

      {step === "details" && (
        <div className="space-y-2">
          {/* Promo Name - disabled */}
          <div className="relative">
            <Input
              value={form.promoName}
              disabled
              placeholder=" "
              className="peer h-10 rounded-xl border-[#eeeeee] bg-gray-50 px-3"
            />
            <label className="pointer-events-none absolute top-0 left-3 -translate-y-1/2 bg-white px-1 text-xs text-gray-400 transition-all">
              Promo Name
            </label>
          </div>

          {/* Type + Discount — side by side */}
          <div className="grid grid-cols-2 gap-4">
            <div className="relative mt-2">
              <label
                className={`pointer-events-none absolute left-3 z-10 bg-white px-1 transition-all ${
                  form.type ? "top-0 -translate-y-2 text-xs" : "hidden"
                }`}
              >
                Type
              </label>

              <Select
                value={form.type}
                onValueChange={(v) => {
                  updateField("type", v);
                  setValidationErrors((prev) => ({ ...prev, type: false }));
                }}
              >
                <SelectTrigger
                  className={`h-12 w-full rounded-xl border-[#eeeeee] ${
                    validationErrors.type ? "border-red-500" : ""
                  }`}
                >
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
            <div className="relative">
              <Input
                type="number"
                min={0}
                max={100}
                value={form.discount === 0 ? "" : form.discount}
                onChange={(e) => {
                  const value = e.target.value;

                  if (value === "") {
                    updateField("discount", 0);
                    return;
                  }

                  const num = Math.min(100, Math.max(0, Number(value)));

                  updateField("discount", num);
                  setValidationErrors((prev) => ({
                    ...prev,
                    discount: false,
                  }));
                }}
                placeholder=" "
                className={`peer mt-2 h-9 rounded-xl border-[#eeeeee] bg-transparent pr-10 ${
                  validationErrors.discount ? "border-red-500" : ""
                }`}
              />
              <label
                className={`pointer-events-none absolute left-3 bg-white px-1 transition-all ${
                  form.discount > 0
                    ? "text-black-500 -translate-y- top-0 text-xs"
                    : "top-1/2 -translate-y-2 text-base text-gray-400"
                }`}
              >
                Discount
              </label>

              {/* Percent Sign */}
              <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-2 text-gray-500">
                %
              </span>
            </div>
          </div>

          {/* Student Type sub-field + Specific Students — side by side */}
          {form.type === "Students" && (
            <div
              className={`grid gap-4 ${
                form.studentType === "Specific" ? "grid-cols-2" : "grid-cols-1"
              }`}
            >
              <div className="relative">
                <label
                  className={`pointer-events-none absolute left-3 z-10 mt-4 bg-white px-1 transition-all ${
                    form.studentType ? "top-0 -translate-y-2 text-xs" : "hidden"
                  }`}
                >
                  Select Student Type
                </label>
                <Select
                  value={form.studentType}
                  onValueChange={(v) => updateField("studentType", v)}
                >
                  <SelectTrigger className="mt-4 h-10 w-full rounded-lg border-[#eeeeee]">
                    <SelectValue placeholder="Select student type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Specific">Specific</SelectItem>
                    <SelectItem value="All Students">All Students</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {form.studentType === "Specific" && (
                <div className="mt-4">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        value={searchStudentId}
                        onChange={(e) => setSearchStudentId(e.target.value)}
                        placeholder=" "
                        className="peer h-9 rounded-lg border-[#eeeeee]"
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleSearchStudent()
                        }
                      />
                      <label className="pointer-events-none absolute top-0 left-3 max-w-[calc(100%-1.5rem)] -translate-y-1/2 truncate bg-white px-1 text-xs text-black transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:text-black">
                        Enter Student ID Number
                      </label>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      className="bg-[#1c9dde] hover:bg-[#168bc7]"
                      disabled={isSearching}
                      onClick={handleSearchStudent}
                    >
                      <Search className="h-5 w-4" />
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
                </div>
              )}
            </div>
          )}

          {/* Selected students chips — full width, below the row */}
          {form.studentType === "Specific" && (
            <div className="flex flex-wrap gap-2">
              {form.selectedStudents.map((s: string) => (
                <Chip
                  key={s}
                  value={s}
                  onRemove={() =>
                    updateField(
                      "selectedStudents",
                      form.selectedStudents.filter((x: string) => x !== s)
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
          )}

          {/* Members Selection */}
          {form.type === "Members" && (
            <div>
              <Label className="text-xs font-medium">Sub Members</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {TEAM_ROLES.map((role) => {
                  const isSelected = form.selectedMembers.includes(role);
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          updateField(
                            "selectedMembers",
                            form.selectedMembers.filter(
                              (r: string) => r !== role
                            )
                          );
                        } else {
                          updateField("selectedMembers", [
                            ...form.selectedMembers,
                            role,
                          ]);
                        }
                      }}
                      className={`rounded-full border px-4 py-0.5 text-sm font-medium capitalize transition-colors ${
                        isSelected
                          ? "border-[#1c9dde] bg-[#1c9dde] text-white"
                          : "border-[#eeeeee] bg-white text-[#303030] hover:bg-gray-50"
                      }`}
                    >
                      {role}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Limit Type — segmented toggle */}
          <div>
            <Label className="text-xs font-medium">Limit Type</Label>
            <div className="mt-2 flex rounded-full bg-[#f2f2f2] p-0.5">
              {[
                {
                  value: "Limited",
                  label: (
                    <span className="flex items-center justify-center gap-2">
                      <ListOrdered className="h-4 w-5" />
                      Limited
                    </span>
                  ),
                },
                {
                  value: "Unlimited",
                  label: (
                    <span className="flex items-center justify-center gap-1.5">
                      <MdAllInclusive className="h-5 w-5" />
                      Unlimited
                    </span>
                  ),
                },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => updateField("limitType", opt.value)}
                  className={`flex-1 rounded-full px-4 py-1 text-sm font-medium transition-colors ${
                    form.limitType === opt.value
                      ? "bg-white text-[#303030] shadow-sm"
                      : "text-[#777]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity + Once Per Student — grouped card */}
          {form.limitType === "Limited" && (
            <div className="rounded-xl border border-[#eeeeee] p-4">
              <Label className="text-xs font-medium">Quantity</Label>
              <Input
                type="number"
                value={form.quantity === 0 ? "" : form.quantity}
                onChange={(e) => {
                  updateField("quantity", parseInt(e.target.value) || 0);
                  setValidationErrors((prev) => ({ ...prev, quantity: false }));
                }}
                placeholder="0"
                className={`mt-1 h-7 rounded-lg border-[#eeeeee] ${validationErrors.quantity ? "border-red-500" : ""}`}
              />
              <div className="mt-2 flex items-center justify-start gap-2">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Once per student</span>
                </div>
                <Switch
                  checked={form.singleStudent === "yes"}
                  onCheckedChange={(checked) =>
                    updateField("singleStudent", checked ? "yes" : "no")
                  }
                />
              </div>
              <p className="mt-1 text-xs text-[#8b8b8b]">
                Each student can redeem this promo code only once.
              </p>
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-xs font-medium">Start Date</Label>
              <Input
                type="date"
                value={form.startDate}
                onChange={(e) => {
                  updateField("startDate", e.target.value);
                  setValidationErrors((prev) => ({
                    ...prev,
                    startDate: false,
                    endDate: false,
                    dateOrder: false,
                  }));
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
                  setValidationErrors((prev) => ({
                    ...prev,
                    startDate: false,
                    endDate: false,
                    dateOrder: false,
                  }));
                }}
                className={`mt-1 h-10 rounded-lg border-[#eeeeee] ${validationErrors.endDate ? "border-red-500" : ""}`}
              />
            </div>
          </div>
        </div>
      )}

      {step === "merchandise" && (
        <div className="space-y-2">
          {/* Scope Type — segmented toggle, same pattern as Limit Type */}
          <div>
            <Label className="text-xs font-medium">Scope Type</Label>
            <div className="mt-2 flex rounded-full bg-[#f2f2f2] p-0.5">
              {[
                {
                  value: "Merchandise",
                  icon: Package,
                  label: "Merchandise",
                },
                {
                  value: "Category",
                  icon: Tags,
                  label: "Category",
                },
                {
                  value: "Both",
                  icon: Layers,
                  label: "Both",
                },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    updateField("promoScope", opt.value);
                    setValidationErrors((prev) => ({
                      ...prev,
                      categories: false,
                      merchandise: false,
                    }));
                  }}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                    form.promoScope === opt.value
                      ? "bg-white text-[#303030] shadow-sm"
                      : "text-[#777]"
                  }`}
                >
                  <opt.icon className="h-4 w-4" />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Categories */}
          {form.promoScope !== "Merchandise" && (
            <div>
              <Label className="text-xs font-medium">Categories</Label>
              <p className="mt-1 text-xs text-[#8b8b8b]">
                Promo applies to all merchandise in selected categories.
              </p>
              {availableCategories.length > 0 ? (
                <div
                  className={`mt-2 max-h-40 overflow-y-auto rounded-lg border p-2 ${
                    validationErrors.categories
                      ? "border-red-500"
                      : "border-[#eeeeee]"
                  }`}
                >
                  {availableCategories.map((cat) => (
                    <label
                      key={cat}
                      className="flex items-center gap-2 py-1 text-sm"
                    >
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
                              form.selectedCategories.filter(
                                (x: string) => x !== cat
                              )
                            );
                          }
                          setValidationErrors((prev) => ({
                            ...prev,
                            categories: false,
                          }));
                        }}
                        className="data-[state=checked]:border-[#1c9dde] data-[state=checked]:bg-[#1c9dde]"
                      />
                      <span>{cat}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-xs text-gray-400 italic">
                  No categories available.
                </p>
              )}
            </div>
          )}

          {/* Applied Merchandise */}
          {form.promoScope !== "Category" && (
            <div>
              <Label className="text-xs font-medium">Applied Merchandise</Label>
              <p className="mt-1 text-xs text-[#8b8b8b]">
                Select which merchandise this promo code applies to.
              </p>
              {activeMerchandise.length > 0 ? (
                <div
                  className={`mt-2 max-h-40 overflow-y-auto rounded-lg border p-2 ${
                    validationErrors.merchandise
                      ? "border-red-500"
                      : "border-[#eeeeee]"
                  }`}
                >
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
              ) : (
                <p className="mt-2 text-xs text-gray-400 italic">
                  No merchandise available.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      <DialogFooter className="mt-6">
        {step === "merchandise" ? (
          <>
            <Button
              type="button"
              variant="outline"
              className="rounded-full px-8"
              onClick={() => setStep("details")}
            >
              Back
            </Button>
            <Button
              type="button"
              disabled={isSubmitting}
              className="rounded-full bg-[#1c9dde] px-8 hover:bg-[#168bc7]"
              onClick={handleSubmit}
            >
              {isSubmitting ? "Saving..." : "Update Promo Code"}
            </Button>
          </>
        ) : (
          <>
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
              onClick={handleNext}
            >
              Next
            </Button>
          </>
        )}
      </DialogFooter>
    </div>
  );
};
