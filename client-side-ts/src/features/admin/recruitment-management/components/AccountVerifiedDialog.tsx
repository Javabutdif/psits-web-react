import { CheckCircle2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface VerifiedAccountResult {
  name: string;
  role: string;
  username: string;
  tempPassword: string;
}

function isOfficerRole(role: string) {
  return role.toLowerCase().includes("officer");
}

function downloadCredentials(result: VerifiedAccountResult) {
  const contents = `Name: ${result.name}\nUsername: ${result.username}\nTemp. Password: ${result.tempPassword}`;
  const blob = new Blob([contents], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${result.username}-credentials.txt`;
  link.click();
  URL.revokeObjectURL(url);
}

interface AccountVerifiedDialogProps {
  result: VerifiedAccountResult | null;
  onClose: () => void;
}

export const AccountVerifiedDialog = ({
  result,
  onClose,
}: AccountVerifiedDialogProps) => {
  if (!result) return null;

  const showCredentials = isOfficerRole(result.role);

  return (
    <Dialog open={!!result} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm rounded-2xl text-center">
        <DialogHeader className="items-center">
          <CheckCircle2 className="h-10 w-10 text-[#1c9dde]" />
          <DialogTitle className="mt-2 text-lg">
            {showCredentials ? "Officer Account Created!" : "Account Approved"}
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-slate-500">
          {showCredentials
            ? `A PSITS Volunteer Account has been auto-generated for ${result.name}. Login credentials will be sent to their email after approving.`
            : "You have successfully completed the review and approved the volunteer's account. The login credentials will be sent to the volunteer's email."}
        </p>

        {showCredentials && (
          <div className="mt-3 space-y-2 rounded-xl bg-slate-50 p-3 text-left text-sm">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs text-slate-400">Username</p>
                <p className="truncate font-medium text-slate-800">
                  {result.username}
                </p>
              </div>
              <button
                type="button"
                aria-label="Download username"
                onClick={() => downloadCredentials(result)}
                className="cursor-pointer rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs text-slate-400">Temp. Password</p>
                <p className="truncate font-medium text-slate-800">
                  {result.tempPassword}
                </p>
              </div>
              <button
                type="button"
                aria-label="Download password"
                onClick={() => downloadCredentials(result)}
                className="cursor-pointer rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        <Button
          type="button"
          onClick={onClose}
          className="mt-4 h-9 w-full rounded-full bg-[#1c9dde] hover:bg-[#168bc7]"
        >
          Done
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default AccountVerifiedDialog;
