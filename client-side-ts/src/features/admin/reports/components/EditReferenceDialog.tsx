import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { showToast } from "@/utils/alertHelper";
import { updateMembershipReference } from "@/features/admin/api/admin";
import {
  countFollowingRecords,
  countRecordsAfter,
  membershipYearOf,
  parseSequentialCode,
} from "../utils/referenceCode";
import type { MembershipReportRow } from "../types/reports.types";

interface EditReferenceDialogProps {
  row: MembershipReportRow | null;
  rows: MembershipReportRow[];
  onClose: () => void;
  onSaved: () => void;
}

/**
 * Inner form, mounted only while a row is selected and keyed by its id, so the
 * input initialises from the row without syncing props into state via an effect.
 */
const EditReferenceForm = ({
  row,
  rows,
  onClose,
  onSaved,
}: {
  row: MembershipReportRow;
  rows: MembershipReportRow[];
  onClose: () => void;
  onSaved: () => void;
}) => {
  const [value, setValue] = useState(row.reference_code ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [cascade, setCascade] = useState(false);

  const rowYear = useMemo(() => membershipYearOf(row.date), [row.date]);

  // The ceiling on what a cascade could touch, whatever gets typed. Checking it
  // first stops the dialog telling you to enter a sequential code on a row that
  // has nothing behind it to renumber anyway.
  const recordsAfter = useMemo(
    () => countRecordsAfter(rows, row._id, row.date),
    [rows, row._id, row.date]
  );

  // Recomputed as you type: followers only exist once the value being typed is
  // a sequential code for the year this record is dated in.
  const followers = useMemo(
    () => countFollowingRecords(rows, row._id, value, row.date),
    [rows, row._id, value, row.date]
  );

  /** The first free number in this record's year, as a ready-to-use example. */
  const suggestedCode = useMemo(() => {
    if (rowYear === null) return null;
    const highest = rows.reduce((max, r) => {
      const parsed = parseSequentialCode(r.reference_code);
      return parsed && parsed.year === rowYear && parsed.seq > max
        ? parsed.seq
        : max;
    }, 0);
    return `${rowYear}-${String(highest + 1).padStart(6, "0")}`;
  }, [rows, rowYear]);

  // Why the toggle is off, so an old-format record does not just show a dead
  // switch with no explanation.
  const cascadeBlockedReason = useMemo(() => {
    if (followers > 0) return null;
    if (rowYear === null)
      return "This record has no usable date, so it cannot be placed in a sequence.";
    if (recordsAfter === 0)
      return `This is the most recent ${rowYear} record, so nothing follows it to renumber.`;

    const typed = parseSequentialCode(value);
    if (!typed)
      return `Enter a sequential code${suggestedCode ? ` like ${suggestedCode}` : ""} to renumber the ${recordsAfter} record${recordsAfter === 1 ? "" : "s"} dated after this one.`;
    if (rowYear !== typed.year)
      return `This record is dated ${rowYear}, so it can only take a ${rowYear} code.`;
    return "Nothing comes after this record, so there is nothing to renumber.";
  }, [followers, recordsAfter, rowYear, suggestedCode, value]);

  const handleSave = async () => {
    const next = value.trim();
    if (!next) {
      setError("Reference code is required");
      return;
    }
    if (next === row.reference_code) {
      onClose();
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const result = await updateMembershipReference(row._id, next, cascade);
      if (!result.ok) {
        setError(result.error || "Failed to update reference code");
        return;
      }

      const relinked = result.emailsRelinked ?? 0;
      const renumbered = result.renumbered?.length ?? 0;
      const parts = ["Reference code updated"];
      if (renumbered > 0)
        parts.push(
          `${renumbered} future record${renumbered === 1 ? "" : "s"} renumbered`
        );
      if (relinked > 0)
        parts.push(
          `${relinked} receipt email${relinked === 1 ? "" : "s"} re-linked`
        );
      showToast("success", `${parts.join(". ")}.`);

      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Edit Reference Code</DialogTitle>
        <DialogDescription>
          {row.name} — {row.id_number}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-2">
        <Label className="text-xs font-medium text-[#555]">
          Reference Code
        </Label>
        <Input
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") void handleSave();
          }}
          placeholder="e.g. 2026-000241"
          className="rounded-lg font-mono"
          autoFocus
        />
        {error ? (
          <p className="text-xs text-red-500">{error}</p>
        ) : (
          <p className="text-xs text-[#8a8a8a]">
            Any format is accepted. Receipt emails for this record are re-linked
            automatically.
          </p>
        )}
      </div>

      <div className="mt-3 flex items-start gap-3 rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-3">
        <Switch
          checked={cascade && followers > 0}
          disabled={followers === 0}
          onCheckedChange={setCascade}
        />
        <div>
          <label
            className={
              followers === 0 ? "text-sm text-[#b0b0b0]" : "text-sm text-[#555]"
            }
          >
            Also renumber future records
          </label>
          <p className="mt-0.5 text-xs text-[#8a8a8a]">
            {cascadeBlockedReason
              ? cascadeBlockedReason
              : cascade
                ? `${followers} record${followers === 1 ? "" : "s"} dated after this one will be renumbered to follow on from the new code, old-format codes included.`
                : `${followers} record${followers === 1 ? "" : "s"} come${followers === 1 ? "s" : ""} after this one by date. Leave off to change only this record.`}
          </p>
        </div>
      </div>

      <DialogFooter className="mt-4">
        <Button
          type="button"
          variant="outline"
          className="rounded-full"
          onClick={onClose}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button
          type="button"
          className="rounded-full bg-[#1c9dde] hover:bg-[#168bc7]"
          onClick={() => void handleSave()}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save"}
        </Button>
      </DialogFooter>
    </>
  );
};

export const EditReferenceDialog = ({
  row,
  rows,
  onClose,
  onSaved,
}: EditReferenceDialogProps) => (
  <Dialog open={Boolean(row)} onOpenChange={(open) => !open && onClose()}>
    <DialogContent className="max-w-md rounded-[20px]">
      {row ? (
        <EditReferenceForm
          key={row._id}
          row={row}
          rows={rows}
          onClose={onClose}
          onSaved={onSaved}
        />
      ) : null}
    </DialogContent>
  </Dialog>
);
