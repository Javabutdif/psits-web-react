import { useState } from "react";
import { ChevronLeft, ChevronRight, Filter, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useLogsData } from "../hooks/useLogsData";
import { LogEventOptions } from "../types/logs.types";
import type { AdminLog } from "../types/logs.types";

const pageRange = (currentPage: number, totalPages: number) => {
  if (totalPages <= 6) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }
  const pages = new Set([1, totalPages, currentPage]);
  if (currentPage > 1) pages.add(currentPage - 1);
  if (currentPage < totalPages) pages.add(currentPage + 1);
  return Array.from(pages).sort((left, right) => left - right);
};

interface LogsFilterState {
  action: string;
  fromDate: string;
  toDate: string;
}

interface LogsFilterPopoverProps {
  filters: LogsFilterState;
  onApply: (filters: LogsFilterState) => void;
}

const emptyLogsFilters: LogsFilterState = {
  action: "",
  fromDate: "",
  toDate: "",
};

const LogsFilterPopover = ({ filters, onApply }: LogsFilterPopoverProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState(filters);
  const hasActiveFilters = Object.values(filters).some(Boolean);

  const update = (field: keyof LogsFilterState, value: string) =>
    setDraft((current) => ({ ...current, [field]: value }));

  const handleCancel = () => {
    setDraft(filters);
    setIsOpen(false);
  };

  const handleApply = () => {
    onApply(draft);
    setIsOpen(false);
  };

  const clearAppliedFilters = () => {
    setDraft(emptyLogsFilters);
    onApply(emptyLogsFilters);
    setIsOpen(false);
  };

  return (
    <div className="flex items-center gap-2">
      <Popover
        open={isOpen}
        onOpenChange={(open) => {
          if (open) setDraft(filters);
          setIsOpen(open);
        }}
      >
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="h-9 shrink-0 rounded-full border-[#e8e8e8] bg-white px-3 hover:bg-white sm:px-4"
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filter</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          side="bottom"
          sideOffset={8}
          collisionPadding={24}
          className="w-80 rounded-2xl p-5 shadow-xl"
        >
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-base font-medium">Filter</h2>
            <button
              type="button"
              className="cursor-pointer text-xs text-red-500"
              onClick={() => setDraft(emptyLogsFilters)}
            >
              Reset Filter
            </button>
          </div>

          <div className="max-h-[420px] space-y-4 overflow-y-auto pr-1">
            <div>
              <Label className="mb-1.5 block text-xs font-medium">Event</Label>
              <Select
                value={draft.action}
                onValueChange={(v) => update("action", v)}
              >
                <SelectTrigger className="h-9 w-full rounded-lg border-[#ececec]">
                  <SelectValue placeholder="All Events" />
                </SelectTrigger>
                <SelectContent>
                  {LogEventOptions.map((label) => (
                    <SelectItem key={label} value={label}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="mb-1.5 block text-xs font-medium">From</Label>
                <Input
                  type="date"
                  value={draft.fromDate}
                  onChange={(e) => update("fromDate", e.target.value)}
                  className="h-9 rounded-lg border-[#ececec]"
                />
              </div>
              <div>
                <Label className="mb-1.5 block text-xs font-medium">To</Label>
                <Input
                  type="date"
                  value={draft.toDate}
                  onChange={(e) => update("toDate", e.target.value)}
                  className="h-9 rounded-lg border-[#ececec]"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              className="h-9 px-4"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="h-9 rounded-full bg-[#1c9dde] px-5 hover:bg-[#168bc7]"
              onClick={handleApply}
            >
              Apply Filter
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {hasActiveFilters && (
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Clear filters"
          title="Clear filters"
          className="h-9 w-9 rounded-full border-[#e8e8e8] bg-white text-red-500 hover:bg-red-50 hover:text-red-600"
          onClick={clearAppliedFilters}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

interface LogDetailsPopoverProps {
  log: AdminLog;
  getAdminName: (log: AdminLog) => string;
  formatTimestamp: (value: string) => string;
  children: React.ReactNode;
}

const LogDetailsPopover = ({
  log,
  getAdminName,
  formatTimestamp,
  children,
}: LogDetailsPopoverProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="cursor-pointer text-left underline-offset-2 hover:underline"
        >
          {children}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side="bottom"
        sideOffset={8}
        className="w-72 rounded-2xl p-4 shadow-xl"
      >
        <h3 className="mb-3 text-sm font-medium">Log details</h3>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between gap-3">
            <span className="text-[#8a8a8a]">Admin</span>
            <span className="text-right">{getAdminName(log)}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-[#8a8a8a]">Event</span>
            <span className="text-right text-[#1c9dde]">{log.action}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-[#8a8a8a]">Date & time</span>
            <span className="text-right">{formatTimestamp(log.timestamp)}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-[#8a8a8a]">Target</span>
            <span className="text-right">{log.target || "-"}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-[#8a8a8a]">Target model</span>
            <span className="text-right">{log.target_model || "-"}</span>
          </div>
          <div className="flex justify-between gap-3 border-t border-[#ededed] pt-2">
            <span className="text-[#8a8a8a]">Log ID</span>
            <span className="text-right font-mono text-xs">{log._id}</span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export const LogsView = () => {
  const {
    error,
    getAdminName,
    formatTimestamp,
    isLoading,
    page,
    pagedLogs,
    search,
    actionFilter,
    fromDate,
    toDate,
    setPage,
    setSearch,
    setActionFilter,
    setFromDate,
    setToDate,
    total,
    totalPages,
    pageSize,
  } = useLogsData();

  const visiblePages = pageRange(page, totalPages);

  return (
    <div className="bg-background flex min-h-full flex-1 flex-col text-[#333] [&_button:not(:disabled)]:cursor-pointer">
      <header className="px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <h1 className="text-2xl font-bold sm:text-3xl">Logs</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          Track admin activity across the system
        </p>
      </header>

      <div className="px-4 pb-8 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="rounded-[22px] border border-[#e5e5e5] bg-white px-4 py-5 sm:px-6">
          <div className="mb-5 flex items-center gap-2 sm:justify-between sm:gap-3">
            <div className="relative min-w-0 flex-1 sm:max-w-[260px]">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#9b9b9b]" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search logs"
                className="h-9 rounded-full border-[#e8e8e8] pl-9 text-sm"
              />
            </div>

            <LogsFilterPopover
              filters={{ action: actionFilter, fromDate, toDate }}
              onApply={({ action, fromDate: from, toDate: to }) => {
                setActionFilter(action);
                setFromDate(from);
                setToDate(to);
              }}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] table-fixed border-collapse text-sm">
              <thead>
                <tr className="rounded-md bg-[#efefef] text-[#2f2f2f]">
                  <th className="rounded-l-md px-2 py-2 text-left align-middle font-medium">
                    Admin
                  </th>
                  <th className="px-2 py-2 text-left align-middle font-medium">
                    Date &amp; Time
                  </th>
                  <th className="px-2 py-2 text-left align-middle font-medium">
                    Event
                  </th>
                  <th className="px-2 py-2 text-left align-middle font-medium">
                    Target
                  </th>
                  <th className="rounded-r-md px-2 py-2 text-left align-middle font-medium">
                    Target Model
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 8 }, (_, index) => (
                    <tr key={index} className="border-b border-[#ededed]">
                      {Array.from({ length: 5 }, (_, cell) => (
                        <td key={cell} className="px-2 py-3">
                          <Skeleton className="h-4 w-full rounded-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : pagedLogs.length > 0 ? (
                  pagedLogs.map((log) => (
                    <tr
                      key={log._id}
                      className="border-b border-[#ededed] text-[#303030]"
                    >
                      <td className="px-2 py-3 text-left align-middle">
                        <LogDetailsPopover
                          log={log}
                          getAdminName={getAdminName}
                          formatTimestamp={formatTimestamp}
                        >
                          {getAdminName(log)}
                        </LogDetailsPopover>
                      </td>
                      <td className="px-2 py-3 text-left align-middle text-xs text-[#5f5f5f]">
                        {formatTimestamp(log.timestamp)}
                      </td>
                      <td className="px-2 py-3 text-left align-middle">
                        <span className="inline-flex rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-[#1c9dde]">
                          {log.action}
                        </span>
                      </td>
                      <td className="truncate px-2 py-3 text-left align-middle">
                        {log.target || "-"}
                      </td>
                      <td className="truncate px-2 py-3 text-left align-middle">
                        {log.target_model || "-"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-3 py-16 text-center text-sm text-[#777]"
                    >
                      No logs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-7 flex flex-col items-center justify-between gap-3 text-xs text-[#8a8a8a] sm:flex-row">
            <span>
              Showing {total > 0 ? (page - 1) * pageSize + 1 : 0} to{" "}
              {Math.min(page * pageSize, total)} of {total}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="flex cursor-pointer items-center gap-1 rounded-full px-2 py-1 disabled:cursor-not-allowed disabled:text-[#c9c9c9]"
                disabled={page <= 1}
                onClick={() => setPage(Math.max(1, page - 1))}
              >
                <ChevronLeft className="h-3 w-3" />
                Previous
              </button>
              {visiblePages.map((item, index) => (
                <div
                  key={`${item}-${index}`}
                  className="flex items-center gap-1"
                >
                  {index > 0 && item - visiblePages[index - 1] > 1 && (
                    <span className="px-1">...</span>
                  )}
                  <button
                    type="button"
                    onClick={() => setPage(item)}
                    className={cn(
                      "h-7 min-w-7 cursor-pointer rounded-full px-2",
                      item === page
                        ? "bg-[#1c9dde] text-white"
                        : "border border-[#eeeeee] bg-white text-[#696969]"
                    )}
                  >
                    {item}
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="flex cursor-pointer items-center gap-1 rounded-full px-2 py-1 disabled:cursor-not-allowed disabled:text-[#c9c9c9]"
                disabled={page >= totalPages}
                onClick={() => setPage(Math.min(totalPages, page + 1))}
              >
                Next
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
