import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { PromoListRow } from "../types/promo.types";

const formatDate = (date: string) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString();
};

interface PromoViewModalProps {
  data: PromoListRow;
  onClose: () => void;
}

export const PromoViewModal = ({ data, onClose }: PromoViewModalProps) => {
  const [activeTab, setActiveTab] = useState<"overview" | "merch">("overview");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredMerchandise = useMemo(() => {
    if (!data.selected_merchandise) return [];
    return data.selected_merchandise.map((merch) => ({
      ...merch,
      items:
        (merch as any).items?.filter((item: any) =>
          item.id_number.toLowerCase().includes(searchTerm.toLowerCase())
        ) || [],
    }));
  }, [data.selected_merchandise, searchTerm]);

  return (
    <>
      <DialogHeader className="mb-5">
        <DialogTitle className="text-lg font-semibold">
          Promo Details
        </DialogTitle>
      </DialogHeader>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "overview" | "merch")} className="mb-5">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="merch">Selected Items</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs font-medium text-[#8b8b8b]">Promo Name</p>
              <p className="font-medium">{data.promo_name}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-[#8b8b8b]">Type</p>
              <p>{data.type}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-[#8b8b8b]">Scope</p>
              <p>{data.promo_scope}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-[#8b8b8b]">Limit Type</p>
              <p>{data.limit_type}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-[#8b8b8b]">
                One Per Student
              </p>
              <p>{data.one_person_limit ? "Yes" : "No"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-[#8b8b8b]">Discount</p>
              <p className="font-semibold text-[#1c9dde]">{data.discount}%</p>
            </div>
            <div>
              <p className="text-xs font-medium text-[#8b8b8b]">Quantity</p>
              <p>
                {data.limit_type === "Unlimited" ? "Unlimited" : data.quantity}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-[#8b8b8b]">Status</p>
              <p>{data.status}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-[#8b8b8b]">Start Date</p>
              <p>{formatDate(data.start_date)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-[#8b8b8b]">End Date</p>
              <p>{formatDate(data.end_date)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-[#8b8b8b]">Created By</p>
              <p>{data.created_by || "-"}</p>
            </div>
          </div>

          {data.selected_audience && data.selected_audience.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium text-[#8b8b8b]">
                Audience
              </p>
              <div className="flex flex-wrap gap-2">
                {data.selected_audience.map((aud, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700"
                  >
                    {aud}
                  </span>
                ))}
              </div>
            </div>
          )}

          {data.selected_specific_students &&
            data.selected_specific_students.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium text-[#8b8b8b]">
                  Specific Students
                </p>
                <ul className="list-inside list-disc space-y-0.5 text-sm text-gray-700">
                  {data.selected_specific_students.map((stud, i) => (
                    <li key={i}>{stud}</li>
                  ))}
                </ul>
              </div>
            )}

          {data.selected_categories && data.selected_categories.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium text-[#8b8b8b]">
                Categories
              </p>
              <div className="flex flex-wrap gap-2">
                {data.selected_categories.map((cat, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Merch Tab */}
      {activeTab === "merch" && (
        <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-2">
          <div>
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search student ID..."
              className="h-9 rounded-lg border-[#eeeeee]"
            />
          </div>

          {filteredMerchandise && filteredMerchandise.length > 0 ? (
            filteredMerchandise.map((merch: any) => (
              <div
                key={merch._id}
                className="rounded-xl border border-[#eeeeee] p-3"
              >
                <p className="text-sm font-semibold text-gray-800">
                  {merch.name}
                </p>
                <p className="mt-1 text-xs text-[#8b8b8b]">
                  Students who used this promo:
                </p>
                <ul className="mt-1 ml-4 list-disc text-sm text-gray-600">
                  {(merch.items || []).length > 0 ? (
                    merch.items.map((item: any) => (
                      <li key={item._id}>
                        <span className="font-medium">{item.id_number}</span> —{" "}
                        {item.promo_used
                          ? formatDate(item.promo_used)
                          : "Not used yet"}
                      </li>
                    ))
                  ) : (
                    <li className="text-xs text-gray-400 italic">
                      No usage yet
                    </li>
                  )}
                </ul>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No merchandise selected.</p>
          )}
        </div>
      )}

      <DialogFooter className="mt-5">
        <Button variant="outline" className="rounded-full" onClick={onClose}>
          Close
        </Button>
      </DialogFooter>
    </>
  );
};
