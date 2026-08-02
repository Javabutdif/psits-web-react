import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MembershipPanelProps {
  membershipPrice: number;
  priceDraft: string;
  setPriceDraft: (v: string) => void;
  priceEditMode: boolean;
  setPriceEditMode: (v: boolean) => void;
  confirmPrice: boolean;
  setConfirmPrice: (v: boolean) => void;
  confirmRevoke: boolean;
  setConfirmRevoke: (v: boolean) => void;
  isPriceAdminAccess: boolean; // renamed from isAdminAccess
  onSavePrice: () => void;
  onRevoke: () => void;
}

export const MembershipPanel = ({
  membershipPrice,
  priceDraft,
  setPriceDraft,
  priceEditMode,
  setPriceEditMode,
  confirmPrice,
  setConfirmPrice,
  confirmRevoke,
  setConfirmRevoke,
  isPriceAdminAccess, // renamed from isAdminAccess
  onSavePrice,
  onRevoke,
}: MembershipPanelProps) => (
  <div className="space-y-6">
    {/* Price Section */}
    <section className="rounded-xl border border-[#e5e5e5] bg-white p-5">
      <h3 className="mb-4 text-base font-medium">Membership Fee</h3>
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <Label className="mb-1.5 block text-xs font-medium">Fee (PHP)</Label>
          <Input
            type="number"
            value={priceEditMode ? priceDraft : String(membershipPrice)}
            onChange={(e) => setPriceDraft(e.target.value)}
            disabled={!priceEditMode}
            className="h-10 rounded-lg border-[#ececec]"
          />
        </div>
        {!priceEditMode ? (
          <Button
            onClick={() => isPriceAdminAccess && setPriceEditMode(true)}
            disabled={!isPriceAdminAccess}
            className="h-10 rounded-full bg-[#1c9dde] hover:bg-[#168bc7]"
          >
            Edit
          </Button>
        ) : (
          <>
            <Button
              variant="outline"
              onClick={() => {
                setPriceEditMode(false);
                setPriceDraft(String(membershipPrice));
              }}
              className="h-10 min-w-[80px] rounded-full"
            >
              Cancel
            </Button>
            <Button
              onClick={() => setConfirmPrice(true)}
              className="h-10 min-w-[80px] rounded-full bg-green-600 hover:bg-green-700"
            >
              Save
            </Button>
          </>
        )}
      </div>
    </section>

    {/* Reset Membership Section */}
    <section className="rounded-xl border border-[#e5e5e5] bg-white p-5">
      <h3 className="mb-2 text-base font-medium">Reset Membership</h3>
      <p className="mb-4 text-sm text-[#8a8a8a]">
        This will revoke all active student memberships. Use with caution.
      </p>
       <Button
         onClick={() => isPriceAdminAccess && setConfirmRevoke(true)}
        disabled={!isPriceAdminAccess}
        variant="destructive"
        className="rounded-full"
      >
        Reset Membership
      </Button>
    </section>

    {/* Confirm Price Dialog */}
    <Dialog open={confirmPrice} onOpenChange={(open) => !open && setConfirmPrice(false)}>
      <DialogContent className="max-w-[400px] rounded-[24px] border-0 p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Confirm Price Change</DialogTitle>
          <DialogDescription>Save the new membership price?</DialogDescription>
        </DialogHeader>
        <div className="p-8">
          <h2 className="mb-3 text-lg font-medium">Update membership fee?</h2>
          <p className="mb-6 text-sm text-[#8a8a8a]">
            The membership fee will be changed to{" "}
            <span className="font-medium">PHP {Number(priceDraft).toLocaleString()}</span>.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              variant="outline"
              className="h-10 rounded-full"
              onClick={() => setConfirmPrice(false)}
            >
              Cancel
            </Button>
            <Button
              className="h-10 rounded-full bg-[#1c9dde] hover:bg-[#168bc7]"
              onClick={onSavePrice}
            >
              Confirm
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* Confirm Revoke Dialog */}
    <Dialog open={confirmRevoke} onOpenChange={(open) => !open && setConfirmRevoke(false)}>
      <DialogContent className="max-w-[400px] rounded-[24px] border-0 p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Confirm Membership Reset</DialogTitle>
          <DialogDescription>Revoke all active memberships?</DialogDescription>
        </DialogHeader>
        <div className="p-8">
          <h2 className="mb-3 text-lg font-medium">Reset all active memberships?</h2>
          <p className="mb-6 text-sm text-[#8a8a8a]">
            This action cannot be undone. All active student memberships will be revoked.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              variant="outline"
              className="h-10 rounded-full"
              onClick={() => setConfirmRevoke(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="h-10 rounded-full"
              onClick={onRevoke}
            >
              Confirm Reset
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </div>
);
