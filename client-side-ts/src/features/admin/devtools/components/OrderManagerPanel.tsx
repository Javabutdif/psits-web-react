import { useState, useEffect } from "react";
import { getOrders, getOrderDetails } from "../api/devtools.api";
import type { OrderDetail } from "../types/devtools.types";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { showToast } from "@/utils/alertHelper";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, ChevronLeft, ChevronRight, Eye, User, Calendar, MapPin, DollarSign } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "Pending", label: "Pending" },
  { value: "Paid", label: "Paid" },
  { value: "Refunded", label: "Refunded" },
  { value: "Cancelled", label: "Cancelled" },
];

export const OrderManagerPanel = () => {
  const [orders, setOrders] = useState<OrderDetail[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {
        limit: pageSize,
        skip: (page - 1) * pageSize,
      };
      if (searchQuery) params.query = searchQuery;
      if (statusFilter) params.status = statusFilter;

      const data = await getOrders(params);
      setOrders(data.data);
      setTotal(data.total);
    } catch {
      showToast("error", "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [page, searchQuery, statusFilter]);

  const handleViewDetails = async (orderId: string) => {
    try {
      const order = await getOrderDetails(orderId);
      setSelectedOrder(order);
    } catch {
      showToast("error", "Failed to load order details");
    }
  };

  const totalPages = Math.ceil(total / pageSize);
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleString("en-PH", { timeZone: "Asia/Manila" });
  };
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(amount);
  };
  const getStatusBadge = (status: string) => {
    const base = "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium";
    if (status === "Paid") return `${base} bg-green-50 text-green-600`;
    if (status === "Pending") return `${base} bg-orange-50 text-orange-600`;
    if (status === "Refunded") return `${base} bg-blue-50 text-blue-600`;
    if (status === "Cancelled") return `${base} bg-red-50 text-red-600`;
    return `${base} bg-gray-50 text-gray-600`;
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return <p className="py-16 text-center text-sm text-[#777]">No orders found.</p>;
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#858585]" />
          <input
            type="text"
            placeholder="Search by reference, name, ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-full rounded-lg border-[#ececec] bg-white pl-9 pr-3 text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 w-[160px] rounded-lg border-[#ececec] bg-white px-3 text-sm"
        >
          <option value="">All Status</option>
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-full"
          onClick={fetchOrders}
        >
          Refresh
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px] table-fixed border-collapse text-sm">
          <thead>
            <tr className="rounded-md bg-[#efefef] text-[#2f2f2f]">
              <th className="w-[12%] rounded-l-md px-2 py-2 text-left font-medium">Reference</th>
              <th className="w-[15%] px-2 py-2 text-left font-medium">Student</th>
              <th className="w-[10%] px-2 py-2 text-left font-medium">ID Number</th>
              <th className="w-[10%] px-2 py-2 text-left font-medium">Status</th>
              <th className="w-[12%] px-2 py-2 text-left font-medium">Total</th>
              <th className="w-[15%] px-2 py-2 text-left font-medium">Order Date</th>
              <th className="w-[12%] px-2 py-2 text-left font-medium">Transaction Date</th>
              <th className="w-[14%] rounded-r-md px-2 py-2 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id} className="border-b border-[#ededed] text-[#303030] hover:bg-[#fafafa] cursor-pointer">
                <td className="truncate px-2 py-3 font-mono">{order.reference_code}</td>
                <td className="truncate px-2 py-3">{order.student_name}</td>
                <td className="px-2 py-3">{order.id_number}</td>
                <td className="px-2 py-3">
                  <span className={getStatusBadge(order.order_status)}>
                    {order.order_status}
                  </span>
                </td>
                <td className="px-2 py-3">{formatCurrency(order.total)}</td>
                <td className="px-2 py-3">{formatDate(order.order_date)}</td>
                <td className="px-2 py-3">{formatDate(order.transaction_date)}</td>
                <td className="px-2 py-3 text-right">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 rounded-full"
                    onClick={() => handleViewDetails(order._id)}
                  >
                    <Eye className="mr-1 h-4 w-4" />
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-[#8a8a8a]">
            Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, total)} of {total}
          </span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-[#8a8a8a]">Page {page} of {totalPages}</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {selectedOrder && (
        <Dialog open={Boolean(selectedOrder)} onOpenChange={(open) => !open && setSelectedOrder(null)}>
          <DialogContent className="max-w-3xl rounded-[20px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Order Details: {selectedOrder.reference_code}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-[#8a8a8a] uppercase tracking-wide">Reference Code</p>
                  <p className="font-mono text-sm">{selectedOrder.reference_code}</p>
                </div>
                <div>
                  <p className="text-xs text-[#8a8a8a] uppercase tracking-wide">Status</p>
                  <p className="font-medium">
                    <span className={getStatusBadge(selectedOrder.order_status)}>
                      {selectedOrder.order_status}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#8a8a8a] uppercase tracking-wide">Student</p>
                  <p className="flex items-center gap-2">
                    <User className="h-4 w-4 text-[#858585]" />
                    {selectedOrder.student_name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#8a8a8a] uppercase tracking-wide">ID Number</p>
                  <p>{selectedOrder.id_number}</p>
                </div>
                <div>
                  <p className="text-xs text-[#8a8a8a] uppercase tracking-wide">Course / Year</p>
                  <p>{selectedOrder.course} Y{selectedOrder.year}</p>
                </div>
                <div>
                  <p className="text-xs text-[#8a8a8a] uppercase tracking-wide">Campus</p>
                  <p className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-[#858585]" />
                    {selectedOrder.campus}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#8a8a8a] uppercase tracking-wide">Order Date</p>
                  <p className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#858585]" />
                    {formatDate(selectedOrder.order_date)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#8a8a8a] uppercase tracking-wide">Transaction Date</p>
                  <p className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#858585]" />
                    {formatDate(selectedOrder.transaction_date)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#8a8a8a] uppercase tracking-wide">Total</p>
                  <p className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-[#858585]" />
                    {formatCurrency(selectedOrder.total)}
                  </p>
                </div>
                {selectedOrder.admin && (
                  <div>
                    <p className="text-xs text-[#8a8a8a] uppercase tracking-wide">Admin</p>
                    <p>{selectedOrder.admin}</p>
                  </div>
                )}
                {selectedOrder.rfid && (
                  <div>
                    <p className="text-xs text-[#8a8a8a] uppercase tracking-wide">RFID</p>
                    <p className="font-mono text-xs">{selectedOrder.rfid}</p>
                  </div>
                )}
              </div>

              <div className="border-t border-[#ededed] pt-4">
                <p className="text-xs text-[#8a8a8a] uppercase tracking-wide mb-3">Items ({selectedOrder.items.length})</p>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px] text-sm">
                    <thead>
                      <tr className="border-b bg-[#efefef] text-left text-sm text-[#2f2f2f]">
                        <th className="px-2 py-2 font-medium">Product</th>
                        <th className="px-2 py-2 font-medium">Batch</th>
                        <th className="px-2 py-2 font-medium">Sizes</th>
                        <th className="px-2 py-2 font-medium">Variation</th>
                        <th className="px-2 py-2 font-medium text-right">Qty</th>
                        <th className="px-2 py-2 font-medium text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map((item, idx) => (
                        <tr key={idx} className="border-b border-[#ededed]">
                          <td className="px-2 py-2">{item.product_name}</td>
                          <td className="px-2 py-2">{item.batch}</td>
                          <td className="px-2 py-2">{item.sizes.join(", ") || "-"}</td>
                          <td className="px-2 py-2">{item.variation.join(", ") || "-"}</td>
                          <td className="px-2 py-2 text-right">{item.quantity}</td>
                          <td className="px-2 py-2 text-right">{formatCurrency(item.sub_total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};