import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { getPromoLogs } from "../api/promo.api";
import type { PromoLogEntry } from "../types/promo.types";

const PAGE_SIZE = 10;

export const PromoLogModal = ({ onClose }: { onClose: () => void }) => {
  const [logs, setLogs] = useState<PromoLogEntry[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getPromoLogs();
      setLogs(result || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const totalPages = Math.ceil(logs.length / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const pageLogs = logs.slice(startIndex, startIndex + PAGE_SIZE);

  return (
    <>
      <DialogHeader className="mb-5">
        <DialogTitle className="text-lg font-semibold">
          Cleanup Promo Logs
        </DialogTitle>
      </DialogHeader>

      {isLoading ? (
        <div className="py-8 text-center text-sm text-gray-500">
          Loading logs...
        </div>
      ) : logs.length > 0 ? (
        <>
          <Table>
            <TableHeader>
              <TableRow className="bg-[#efefef]">
                <TableHead className="w-12">#</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageLogs.map((log, index) => (
                <TableRow key={log._id} className="border-b border-[#ededed]">
                  <TableCell className="text-center text-sm text-gray-600">
                    {startIndex + index + 1}
                  </TableCell>
                  <TableCell className="text-sm">{log.description}</TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {new Date(log.date).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="h-8 rounded-full px-3"
              >
                <ChevronLeft className="mr-1 h-3 w-3" />
                Prev
              </Button>
              <span className="text-xs text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="h-8 rounded-full px-3"
              >
                Next
                <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="py-8 text-center text-sm text-gray-500">
          No logs found.
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
