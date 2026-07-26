import {
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  CirclePercent,
  Clock3,
  Edit3,
  Eye,
  Filter,
  ImagePlus,
  MoreHorizontal,
  Package,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { showToast } from "@/utils/alertHelper";
import type {
  MerchandiseItem,
  PromoCodeItem,
  PromoLogItem,
  PromoMerchandiseItem,
} from "@/features/admin/api/admin";
import {
  EMPTY_PRODUCT_FILTERS,
  EMPTY_PRODUCT_FORM,
  EMPTY_PRODUCT_IMAGES,
  EMPTY_PROMO_FILTERS,
  PRODUCT_AUDIENCES,
  PRODUCT_CATEGORIES,
  PRODUCT_SIZES,
  PRODUCT_TYPES,
  PRODUCT_VARIATIONS,
  PURCHASE_CONTROLS,
  TEAM_ROLES,
  formatCurrency,
  formatPurchaseControl,
  getProductStatus,
  getPromoStatus,
  useMerchandiseData,
} from "../hooks/useMerchandiseData";
import type {
  MerchandiseSection,
  ProductFilters,
  ProductFormValues,
  ProductImageState,
  ProductSortField,
  ProductStatus,
  PromoFilters,
  PromoFormValues,
} from "../types/merchandise.types";

const sectionTabs: Array<{
  key: MerchandiseSection;
  label: string;
  icon: ComponentType<{ className?: string }>;
  href: string;
}> = [
  {
    key: "products",
    label: "Products",
    icon: Package,
    href: "/admin/merchandise/products",
  },
  {
    key: "promo-code",
    label: "Promo Code",
    icon: CirclePercent,
    href: "/admin/merchandise/promo-code",
  },
];

const pageRange = (currentPage: number, totalPages: number) => {
  if (totalPages <= 6) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set([1, totalPages, currentPage]);
  if (currentPage > 1) pages.add(currentPage - 1);
  if (currentPage < totalPages) pages.add(currentPage + 1);

  return Array.from(pages).sort((left, right) => left - right);
};

const formatDate = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatDateRange = (start?: string, end?: string) => {
  const startLabel = formatDate(start);
  const endLabel = formatDate(end);
  if (startLabel === "-" && endLabel === "-") return "-";
  return `${startLabel} - ${endLabel}`;
};

const statusTone = (status: ProductStatus | string) => {
  if (status === "Published" || status === "Active") {
    return "bg-green-100 text-green-600";
  }
  if (status === "Out of Stock" || status === "Expired") {
    return "bg-orange-100 text-orange-600";
  }
  if (status === "Upcoming") return "bg-sky-100 text-sky-600";
  return "bg-[#f2f2f2] text-[#737373]";
};

const fieldClass =
  "h-10 rounded-xl border-[#e9e9e9] bg-white text-sm shadow-none focus-visible:ring-[#1C9DDE]";

interface SortLabelProps {
  field: ProductSortField;
  onSort: (field: ProductSortField) => void;
  children: string;
}

const SortLabel = ({ field, onSort, children }: SortLabelProps) => (
  <button
    type="button"
    className="inline-flex cursor-pointer items-center gap-1 text-left"
    onClick={() => onSort(field)}
  >
    {children}
    <ChevronsUpDown className="h-3 w-3 text-[#7d7d7d]" />
  </button>
);

interface PaginationProps {
  page: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const PaginationBar = ({
  page,
  total,
  totalPages,
  onPageChange,
}: PaginationProps) => {
  const pages = pageRange(page, totalPages);
  const start = total === 0 ? 0 : (page - 1) * 8 + 1;
  const end = Math.min(page * 8, total);

  return (
    <div className="mt-8 flex items-center justify-between text-xs text-[#777777]">
      <p>
        Showing {start} to {end} of {total}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="inline-flex cursor-pointer items-center gap-1 disabled:cursor-not-allowed disabled:text-[#c9c9c9]"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="h-3 w-3" />
          Previous
        </button>
        {pages.map((item, index) => {
          const previous = pages[index - 1];
          return (
            <span key={item} className="inline-flex items-center gap-2">
              {previous && item - previous > 1 && <span>...</span>}
              <button
                type="button"
                className={cn(
                  "h-8 min-w-8 cursor-pointer rounded-full border border-[#ededed] px-2 text-xs",
                  page === item && "border-[#1C9DDE] bg-[#1C9DDE] text-white"
                )}
                onClick={() => onPageChange(item)}
              >
                {item}
              </button>
            </span>
          );
        })}
        <button
          type="button"
          className="inline-flex cursor-pointer items-center gap-1 disabled:cursor-not-allowed disabled:text-[#c9c9c9]"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
          <ChevronRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
};

const ProductSkeleton = () => (
  <div className="space-y-4">
    {Array.from({ length: 8 }, (_, index) => (
      <div key={index} className="grid grid-cols-[34px_1.5fr_0.7fr_0.6fr_1fr_0.8fr_40px] gap-5 px-2">
        <Skeleton className="h-5 w-5 rounded" />
        <Skeleton className="h-12 rounded-xl" />
        <Skeleton className="h-5 rounded-full" />
        <Skeleton className="h-5 rounded-full" />
        <Skeleton className="h-5 rounded-full" />
        <Skeleton className="h-7 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    ))}
  </div>
);

interface ProductFilterProps {
  filters: ProductFilters;
  batches: string[];
  onApply: (filters: ProductFilters) => void;
}

const ProductFilter = ({ filters, batches, onApply }: ProductFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState(filters);
  const hasActiveFilters =
    filters.statuses.length > 0 ||
    filters.controls.length > 0 ||
    filters.batches.length > 0 ||
    Boolean(filters.confirmedOn);

  useEffect(() => {
    setDraft(filters);
  }, [filters]);

  const toggleListValue = (
    key: "statuses" | "controls" | "batches",
    value: string
  ) => {
    setDraft((current) => {
      if (key === "statuses") {
        const statusValue = value as ProductStatus;
        return {
          ...current,
          statuses: current.statuses.includes(statusValue)
            ? current.statuses.filter((item) => item !== statusValue)
            : [...current.statuses, statusValue],
        };
      }

      if (key === "controls") {
        return {
          ...current,
          controls: current.controls.includes(value)
            ? current.controls.filter((item) => item !== value)
            : [...current.controls, value],
        };
      }

      return {
        ...current,
        batches: current.batches.includes(value)
          ? current.batches.filter((item) => item !== value)
          : [...current.batches, value],
      };
    });
  };

  const apply = () => {
    onApply(draft);
    setIsOpen(false);
  };

  const clear = () => {
    setDraft(EMPTY_PRODUCT_FILTERS);
    onApply(EMPTY_PRODUCT_FILTERS);
    setIsOpen(false);
  };

  return (
    <div className="flex items-center gap-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="h-9 cursor-pointer rounded-full border-[#e5e5e5] px-4 text-sm"
          >
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          sideOffset={8}
          className="w-[330px] rounded-2xl border-[#eeeeee] p-5 shadow-xl"
        >
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-base font-medium">Filter</h3>
            <button
              type="button"
              className="cursor-pointer text-xs text-red-500"
              onClick={() => setDraft(EMPTY_PRODUCT_FILTERS)}
            >
              Reset Filter
            </button>
          </div>

          <div className="space-y-5">
            <FilterChipGroup
              label="Status"
              options={["Published", "Inactive", "Out of Stock"]}
              selected={draft.statuses}
              onToggle={(value) => toggleListValue("statuses", value)}
            />
            <FilterChipGroup
              label="Purchase Limit"
              options={PURCHASE_CONTROLS.map((control) => control.value)}
              selected={draft.controls}
              getLabel={formatPurchaseControl}
              onToggle={(value) => toggleListValue("controls", value)}
            />
            <FilterChipGroup
              label="Batch"
              options={batches}
              selected={draft.batches}
              getLabel={(value) => `${value}${/^\d+$/.test(value) ? " Year" : ""}`}
              onToggle={(value) => toggleListValue("batches", value)}
            />
            <div className="space-y-2">
              <p className="text-xs font-medium text-[#555555]">Confirmed on</p>
              <Input
                type="date"
                className={fieldClass}
                value={draft.confirmedOn}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    confirmedOn: event.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button
              variant="ghost"
              className="cursor-pointer rounded-full px-5"
              onClick={() => {
                setDraft(filters);
                setIsOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              className="cursor-pointer rounded-full bg-[#1C9DDE] px-5 hover:bg-[#178ac2]"
              onClick={apply}
            >
              Apply Filter
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      {hasActiveFilters && (
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 cursor-pointer rounded-full border-[#e8e8e8] text-red-500 hover:bg-red-50 hover:text-red-600"
          aria-label="Clear filters"
          title="Clear filters"
          onClick={clear}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

interface FilterChipGroupProps {
  label: string;
  options: string[];
  selected: string[];
  getLabel?: (value: string) => string;
  onToggle: (value: string) => void;
}

const FilterChipGroup = ({
  label,
  options,
  selected,
  getLabel,
  onToggle,
}: FilterChipGroupProps) => (
  <div className="space-y-2">
    <p className="text-xs font-medium text-[#555555]">{label}</p>
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          className={cn(
            "h-8 cursor-pointer rounded-full border border-[#dedede] px-4 text-xs",
            selected.includes(option) &&
              "border-[#1C9DDE] bg-[#e5f5fd] text-[#1C9DDE]"
          )}
          onClick={() => onToggle(option)}
        >
          {getLabel ? getLabel(option) : option}
        </button>
      ))}
    </div>
  </div>
);

interface ProductTableProps {
  canManage: boolean;
  isLoading: boolean;
  page: number;
  products: MerchandiseItem[];
  total: number;
  totalPages: number;
  onDelete: (product: MerchandiseItem) => void;
  onEdit: (product: MerchandiseItem) => void;
  onPageChange: (page: number) => void;
  onPublish: (product: MerchandiseItem) => void;
  onSort: (field: ProductSortField) => void;
  onView: (product: MerchandiseItem) => void;
}

const ProductTable = ({
  canManage,
  isLoading,
  page,
  products,
  total,
  totalPages,
  onDelete,
  onEdit,
  onPageChange,
  onPublish,
  onSort,
  onView,
}: ProductTableProps) => (
  <>
    <div className="overflow-x-auto">
      <table className="w-full min-w-[860px] table-fixed text-sm">
        <colgroup>
          <col className="w-[34px]" />
          <col className="w-[32%]" />
          <col className="w-[13%]" />
          <col className="w-[12%]" />
          <col className="w-[22%]" />
          <col className="w-[14%]" />
          <col className="w-[44px]" />
        </colgroup>
        <thead>
          <tr className="h-8 rounded-lg bg-[#ededed] text-left text-xs font-medium">
            <th className="rounded-l-lg px-2">
              <Checkbox aria-label="Select all products" className="h-4 w-4" />
            </th>
            <th className="px-2">
              <SortLabel field="name" onSort={onSort}>
                Product
              </SortLabel>
            </th>
            <th className="px-2 text-center">
              <SortLabel field="price" onSort={onSort}>
                Price
              </SortLabel>
            </th>
            <th className="px-2 text-center">
              <SortLabel field="batch" onSort={onSort}>
                Batch
              </SortLabel>
            </th>
            <th className="px-2 text-center">
              <SortLabel field="control" onSort={onSort}>
                Purchase Type
              </SortLabel>
            </th>
            <th className="px-2 text-center">
              <SortLabel field="status" onSort={onSort}>
                Status
              </SortLabel>
            </th>
            <th className="rounded-r-lg px-2" />
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={7} className="py-4">
                <ProductSkeleton />
              </td>
            </tr>
          ) : products.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-16 text-center text-[#8c8c8c]">
                No merchandise found.
              </td>
            </tr>
          ) : (
            products.map((product) => {
              const status = getProductStatus(product);
              const primaryImage = product.imageUrl?.[0];
              return (
                <tr key={product._id} className="border-b border-[#eeeeee]">
                  <td className="px-2 py-3 align-middle">
                    <Checkbox aria-label={`Select ${product.name}`} className="h-4 w-4" />
                  </td>
                  <td className="px-2 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                      {primaryImage ? (
                        <img
                          src={primaryImage}
                          alt={product.name}
                          className="h-14 w-16 shrink-0 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="flex h-14 w-16 shrink-0 items-center justify-center rounded-xl bg-[#edf1f5] text-[#a1adba]">
                          <Package className="h-6 w-6" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate font-medium">{product.name}</p>
                        <p className="truncate text-xs text-[#9a9a9a]">
                          {product.type || product.category || "Merchandise"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-3 text-center font-medium text-[#1C9DDE]">
                    {formatCurrency(product.price)}
                  </td>
                  <td className="px-2 py-3 text-center">{product.batch || "-"}</td>
                  <td className="px-2 py-3 text-center">
                    {formatPurchaseControl(product.control)}
                  </td>
                  <td className="px-2 py-3 text-center">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-3 py-1 text-xs font-medium",
                        statusTone(status)
                      )}
                    >
                      {status}
                    </span>
                  </td>
                  <td className="px-2 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 cursor-pointer rounded-full border border-[#eeeeee]"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44 rounded-xl p-1">
                        <DropdownMenuItem
                          className="cursor-pointer gap-2 rounded-lg"
                          onClick={() => onView(product)}
                        >
                          <Eye className="h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        {canManage && (
                          <>
                            <DropdownMenuItem
                              className="cursor-pointer gap-2 rounded-lg"
                              onClick={() => onEdit(product)}
                            >
                              <Edit3 className="h-4 w-4" />
                              Edit Product
                            </DropdownMenuItem>
                            {product.is_active === false ? (
                              <DropdownMenuItem
                                className="cursor-pointer gap-2 rounded-lg"
                                onClick={() => onPublish(product)}
                              >
                                <Check className="h-4 w-4" />
                                Publish Product
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                className="cursor-pointer gap-2 rounded-lg text-red-500 focus:text-red-500"
                                onClick={() => onDelete(product)}
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete Product
                              </DropdownMenuItem>
                            )}
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
    <PaginationBar
      page={page}
      total={total}
      totalPages={totalPages}
      onPageChange={onPageChange}
    />
  </>
);

interface ProductDetailsDialogProps {
  product: MerchandiseItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProductDetailsDialog = ({
  product,
  open,
  onOpenChange,
}: ProductDetailsDialogProps) => {
  if (!product) return null;

  const variations = product.selectedVariations || [];
  const sizes = Object.keys(product.selectedSizes || {});

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[560px] rounded-3xl border-none p-0">
        <DialogTitle className="sr-only">Product details</DialogTitle>
        <DialogDescription className="sr-only">
          Review merchandise details.
        </DialogDescription>
        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              {product.imageUrl?.[0] ? (
                <img
                  src={product.imageUrl[0]}
                  alt={product.name}
                  className="h-14 w-14 shrink-0 rounded-xl object-cover"
                />
              ) : (
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#edf1f5]">
                  <Package className="h-6 w-6 text-[#9da8b3]" />
                </div>
              )}
              <div className="min-w-0">
                <h2 className="truncate text-lg font-semibold">{product.name}</h2>
                <p className="text-sm text-[#9b9b9b]">Merchandise</p>
              </div>
            </div>
            <span className="rounded-full bg-[#e9f6fd] px-3 py-1 text-sm font-semibold text-[#1C9DDE]">
              {formatCurrency(product.price)}
            </span>
          </div>

          <div className="mt-6 grid grid-cols-4 gap-4 border-y border-[#eeeeee] py-5 text-sm">
            <InfoBlock label="Stock" value={String(product.stocks || 0)} />
            <InfoBlock label="Batch" value={String(product.batch || "-")} />
            <InfoBlock label="Audience" value={product.selectedAudience || "All"} />
            <InfoBlock
              label="From / To"
              value={formatDateRange(product.start_date, product.end_date)}
            />
          </div>

          <div className="mt-5">
            <p className="mb-2 text-xs text-[#9a9a9a]">Description</p>
            <p className="text-sm leading-relaxed text-[#4a4a4a]">
              {product.description || "No description provided."}
            </p>
          </div>

          {variations.length > 0 && (
            <TagList
              label="Color"
              values={variations}
              colorValue={variations[0]}
            />
          )}
          {sizes.length > 0 && <TagList label="Size" values={sizes} />}

          <div className="mt-6 flex items-center justify-between border-t border-[#eeeeee] pt-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-300 text-xs font-semibold text-white">
                {(product.created_by || "A").slice(0, 2).toUpperCase()}
              </div>
              <p className="text-sm font-medium">
                {product.created_by || "Admin"}
              </p>
            </div>
            <Button
              variant="outline"
              className="cursor-pointer rounded-full px-6"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const InfoBlock = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="mb-2 text-xs text-[#9a9a9a]">{label}</p>
    <p className="break-words text-sm text-[#2f2f2f]">{value}</p>
  </div>
);

const TagList = ({
  label,
  values,
  colorValue,
}: {
  label: string;
  values: string[];
  colorValue?: string;
}) => (
  <div className="mt-5 border-t border-[#eeeeee] pt-5">
    <p className="mb-2 text-xs text-[#9a9a9a]">{label}</p>
    <div className="flex flex-wrap gap-2">
      {values.map((value) => (
        <span
          key={value}
          className="inline-flex items-center gap-1 rounded-md border border-[#e3e3e3] px-2 py-1 text-xs"
        >
          {colorValue === value && (
            <span className="h-3 w-3 rounded-full bg-purple-500" />
          )}
          {value}
        </span>
      ))}
    </div>
  </div>
);

interface ConfirmationDialogProps {
  action: "delete-product" | "publish-product" | "delete-promo" | null;
  label: string;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmationDialog = ({
  action,
  label,
  loading,
  onClose,
  onConfirm,
}: ConfirmationDialogProps) => {
  const isDelete = action === "delete-product" || action === "delete-promo";

  return (
    <Dialog open={Boolean(action)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[430px] rounded-3xl border-none p-7">
        <DialogTitle className="text-xl font-semibold">
          {isDelete ? "Delete item?" : "Publish product?"}
        </DialogTitle>
        <DialogDescription className="text-sm leading-relaxed text-[#8c8c8c]">
          {isDelete
            ? `${label} will no longer appear as an active record.`
            : `${label} will be visible again to eligible users.`}
        </DialogDescription>
        <div className="mt-6 flex gap-3">
          <Button
            variant={isDelete ? "destructive" : "outline"}
            className="h-10 flex-1 cursor-pointer rounded-full"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant={isDelete ? "outline" : "default"}
            className={cn(
              "h-10 flex-1 cursor-pointer rounded-full",
              !isDelete && "bg-[#1C9DDE] hover:bg-[#178ac2]"
            )}
            disabled={loading}
            onClick={onConfirm}
          >
            {isDelete ? "Delete" : "Publish"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const ProductsPage = () => {
  const navigate = useNavigate();
  const {
    canManageMerchandise,
    deleteProduct,
    error,
    isLoading,
    isMutating,
    productBatches,
    productFilters,
    productPage,
    productRows,
    productSearch,
    productTotalPages,
    filteredProducts,
    publishProduct,
    setProductFilters,
    setProductPage,
    setProductSearch,
    toggleProductSort,
  } = useMerchandiseData();
  const [selectedProduct, setSelectedProduct] = useState<MerchandiseItem | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [confirmAction, setConfirmAction] =
    useState<"delete-product" | "publish-product" | null>(null);
  const [confirmProduct, setConfirmProduct] = useState<MerchandiseItem | null>(null);

  const openConfirm = (
    action: "delete-product" | "publish-product",
    product: MerchandiseItem
  ) => {
    setConfirmAction(action);
    setConfirmProduct(product);
  };

  const handleConfirm = async () => {
    if (!confirmProduct || !confirmAction) return;
    const succeeded =
      confirmAction === "delete-product"
        ? await deleteProduct(confirmProduct._id)
        : await publishProduct(confirmProduct._id);
    if (succeeded) {
      setConfirmAction(null);
      setConfirmProduct(null);
    }
  };

  return (
    <>
      <MerchandiseHeader
        title="Merchandise"
        description="Control merchandise listings and discounts"
        activeSection="products"
        action={
          canManageMerchandise && (
            <Button
              className="h-12 cursor-pointer rounded-full bg-[#1C9DDE] px-7 text-sm hover:bg-[#178ac2]"
              asChild
            >
              <Link to="/admin/merchandise/products/new">
                <Plus className="h-4 w-4" />
                Add a Product
              </Link>
            </Button>
          )
        }
      />
      <div className="rounded-3xl border border-[#e7e7e7] bg-white p-5">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div className="relative w-full max-w-[300px]">
            <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-[#a1a1a1]" />
            <Input
              value={productSearch}
              onChange={(event) => setProductSearch(event.target.value)}
              placeholder="Search"
              className="h-9 rounded-full border-[#e6e6e6] pl-10 text-sm"
            />
          </div>
          <ProductFilter
            filters={productFilters}
            batches={productBatches}
            onApply={setProductFilters}
          />
        </div>
        {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
        <ProductTable
          canManage={canManageMerchandise}
          isLoading={isLoading}
          page={productPage}
          products={productRows}
          total={filteredProducts.length}
          totalPages={productTotalPages}
          onDelete={(product) => openConfirm("delete-product", product)}
          onEdit={(product) =>
            navigate(`/admin/merchandise/products/${product._id}/edit`)
          }
          onPageChange={setProductPage}
          onPublish={(product) => openConfirm("publish-product", product)}
          onSort={toggleProductSort}
          onView={(product) => {
            setSelectedProduct(product);
            setDetailsOpen(true);
          }}
        />
      </div>
      <ProductDetailsDialog
        product={selectedProduct}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
      <ConfirmationDialog
        action={confirmAction}
        label={confirmProduct?.name || "This product"}
        loading={isMutating}
        onClose={() => {
          setConfirmAction(null);
          setConfirmProduct(null);
        }}
        onConfirm={handleConfirm}
      />
    </>
  );
};

interface MerchandiseHeaderProps {
  title: string;
  description: string;
  activeSection: MerchandiseSection;
  action?: ReactNode;
}

const MerchandiseHeader = ({
  title,
  description,
  activeSection,
  action,
}: MerchandiseHeaderProps) => (
  <div className="mb-8">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <h1 className="text-[32px] leading-tight font-semibold tracking-normal text-[#333333]">
          {title}
        </h1>
        <p className="mt-2 text-base text-[#9a9a9a]">{description}</p>
      </div>
      {action}
    </div>
    <div className="mt-7 flex gap-7 border-b border-[#eeeeee]">
      {sectionTabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeSection === tab.key;
        return (
          <Link
            key={tab.key}
            to={tab.href}
            className={cn(
              "inline-flex h-10 items-center gap-2 border-b-2 border-transparent px-1 text-sm text-[#777777]",
              isActive && "border-[#1C9DDE] text-[#1C9DDE]"
            )}
          >
            <Icon className="h-4 w-4" />
            {tab.label}
          </Link>
        );
      })}
    </div>
  </div>
);

interface ProductFormPageProps {
  productId?: string;
}

const ProductFormPage = ({ productId }: ProductFormPageProps) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    getProductFormValues,
    isLoading,
    isMutating,
    products,
    saveProduct,
  } = useMerchandiseData();
  const product = products.find((item) => item._id === productId) || null;
  const isEditing = Boolean(productId);
  const [activeStep, setActiveStep] = useState<"product" | "sessions">("product");
  const [formValues, setFormValues] = useState<ProductFormValues>(EMPTY_PRODUCT_FORM);
  const [imageState, setImageState] =
    useState<ProductImageState>(EMPTY_PRODUCT_IMAGES);

  useEffect(() => {
    if (!isEditing) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormValues({ ...EMPTY_PRODUCT_FORM });
      setImageState({ ...EMPTY_PRODUCT_IMAGES });
      return;
    }

    if (product) {
      setFormValues(getProductFormValues(product));
      setImageState({
        files: [],
        previews: product.imageUrl || [],
        removedUrls: [],
      });
    }
  }, [getProductFormValues, isEditing, product]);

  const setValue = <TKey extends keyof ProductFormValues>(
    key: TKey,
    value: ProductFormValues[TKey]
  ) => {
    setFormValues((current) => ({ ...current, [key]: value }));
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const incoming = Array.from(files);
    if (imageState.files.length + imageState.previews.length + incoming.length > 3) {
      showToast("error", "You can only upload up to 3 images");
      return;
    }

    setImageState((current) => ({
      ...current,
      files: [...current.files, ...incoming],
      previews: [
        ...current.previews,
        ...incoming.map((file) => URL.createObjectURL(file)),
      ],
    }));
  };

  const removeImage = (preview: string, index: number) => {
    setImageState((current) => {
      const isExisting = product?.imageUrl?.includes(preview);
      const previewFilesBeforeIndex = current.previews
        .slice(0, index)
        .filter((item) => !product?.imageUrl?.includes(item)).length;

      return {
        files: isExisting
          ? current.files
          : current.files.filter((_, fileIndex) => fileIndex !== previewFilesBeforeIndex),
        previews: current.previews.filter((_, previewIndex) => previewIndex !== index),
        removedUrls: isExisting
          ? [...current.removedUrls, preview]
          : current.removedUrls,
      };
    });
  };

  const toggleVariation = (value: string) => {
    setFormValues((current) => ({
      ...current,
      selectedVariations: current.selectedVariations.includes(value)
        ? current.selectedVariations.filter((item) => item !== value)
        : [...current.selectedVariations, value],
    }));
  };

  const toggleSize = (size: string) => {
    setFormValues((current) => {
      const nextSizes = { ...current.selectedSizes };
      if (nextSizes[size]) {
        delete nextSizes[size];
      } else {
        nextSizes[size] = {
          custom: false,
          price: current.price || "0",
        };
      }
      return { ...current, selectedSizes: nextSizes };
    });
  };

  const save = async () => {
    if (!formValues.name || !formValues.price || !formValues.stocks) {
      showToast("error", "Product name, price, and stock are required");
      return;
    }
    if (!formValues.category || !formValues.type || !formValues.control) {
      showToast("error", "Category, product type, and purchase type are required");
      return;
    }
    if (!formValues.start_date || !formValues.end_date) {
      showToast("error", "Start date and end date are required");
      return;
    }

    const succeeded = await saveProduct(formValues, imageState, productId);
    if (succeeded) navigate("/admin/merchandise/products");
  };

  const typeOptions = PRODUCT_TYPES[formValues.category] || [];
  const selectedSizes = Object.keys(formValues.selectedSizes);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-[32px] leading-tight font-semibold tracking-normal text-[#333333]">
          {isEditing ? "Edit Product" : "Add Product"}
        </h1>
        <p className="mt-2 text-sm text-[#777777]">
          Control merchandise listings and discounts
        </p>
        <button
          type="button"
          className="mt-7 inline-flex cursor-pointer items-center gap-2 text-sm text-[#9a9a9a] hover:text-[#333333]"
          onClick={() => navigate("/admin/merchandise/products")}
        >
          <ChevronLeft className="h-5 w-5" />
          Back to product list
        </button>
        <div className="mt-7 flex gap-8 border-b border-[#eeeeee]">
          <button
            type="button"
            className={cn(
              "h-10 cursor-pointer border-b-2 border-transparent px-1 text-sm text-[#b5b5b5]",
              activeStep === "product" && "border-[#1C9DDE] text-[#1C9DDE]"
            )}
            onClick={() => setActiveStep("product")}
          >
            Product Info
          </button>
          <button
            type="button"
            className={cn(
              "h-10 cursor-pointer border-b-2 border-transparent px-1 text-sm text-[#b5b5b5]",
              activeStep === "sessions" && "border-[#1C9DDE] text-[#1C9DDE]"
            )}
            onClick={() => setActiveStep("sessions")}
          >
            Session Setup
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-[#e7e7e7] bg-white p-6">
        {isLoading && isEditing ? (
          <ProductSkeleton />
        ) : activeStep === "sessions" ? (
          <SessionSetupForm values={formValues} onChange={setValue} />
        ) : (
          <div className="grid gap-8 lg:grid-cols-[310px_1fr]">
            <div className="space-y-6">
              <section>
                <h2 className="mb-4 text-lg font-medium">Product Image</h2>
                <div
                  className="flex min-h-[150px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#d7d7d7] text-center"
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={(event) => {
                    event.preventDefault();
                    handleFiles(event.dataTransfer.files);
                  }}
                  onDragOver={(event) => event.preventDefault()}
                >
                  {imageState.previews.length > 0 ? (
                    <div className="grid w-full grid-cols-2 gap-2 p-3">
                      {imageState.previews.map((preview, index) => (
                        <div key={preview} className="group relative">
                          <img
                            src={preview}
                            alt="Product preview"
                            className="h-28 w-full rounded-xl object-cover"
                          />
                          <button
                            type="button"
                            className="absolute top-2 right-2 hidden h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-white text-red-500 shadow group-hover:flex"
                            onClick={(event) => {
                              event.stopPropagation();
                              removeImage(preview, index);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                      <ImagePlus className="mb-4 h-6 w-6 text-[#8c8c8c]" />
                      <p className="text-sm font-medium">
                        Choose a file or drag & drop it here
                      </p>
                      <p className="mt-1 text-xs text-[#a0a0a0]">
                        Upload a PNG or JPG to represent this item
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        className="mt-4 h-8 cursor-pointer rounded-full px-5 text-xs"
                      >
                        Browse File
                      </Button>
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(event) => handleFiles(event.target.files)}
                  />
                </div>
              </section>

              <FieldGroup title="Schedule">
                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Start Date">
                    <Input
                      type="date"
                      className={fieldClass}
                      value={formValues.start_date}
                      onChange={(event) =>
                        setValue("start_date", event.target.value)
                      }
                    />
                  </FormField>
                  <FormField label="End Date">
                    <Input
                      type="date"
                      className={fieldClass}
                      value={formValues.end_date}
                      onChange={(event) =>
                        setValue("end_date", event.target.value)
                      }
                    />
                  </FormField>
                </div>
              </FieldGroup>

              <FieldGroup title="Batch Info">
                <FormField label="Batch No.">
                  <Input
                    type="text"
                    className={fieldClass}
                    value={formValues.batch}
                    onChange={(event) => setValue("batch", event.target.value)}
                    placeholder="0"
                  />
                </FormField>
              </FieldGroup>

              <label className="flex cursor-pointer items-center gap-3 text-sm text-[#555555]">
                <button
                  type="button"
                  className={cn(
                    "h-5 w-9 rounded-full border transition-colors",
                    formValues.isEvent
                      ? "border-[#1C9DDE] bg-[#1C9DDE]"
                      : "border-[#d6d6d6] bg-[#eeeeee]"
                  )}
                  onClick={() => setValue("isEvent", !formValues.isEvent)}
                >
                  <span
                    className={cn(
                      "block h-4 w-4 rounded-full bg-white transition-transform",
                      formValues.isEvent && "translate-x-4"
                    )}
                  />
                </button>
                Event-based merchandise?
              </label>
              {formValues.isEvent && (
                <FormField label="Event Date">
                  <Input
                    type="date"
                    className={fieldClass}
                    value={formValues.eventDate}
                    onChange={(event) => setValue("eventDate", event.target.value)}
                  />
                </FormField>
              )}
            </div>

            <div className="space-y-6">
              <FieldGroup title="General Information">
                <div className="space-y-4">
                  <FormField label="Product Name">
                    <Input
                      className={fieldClass}
                      value={formValues.name}
                      placeholder="Name your product"
                      onChange={(event) => setValue("name", event.target.value)}
                    />
                  </FormField>
                  <FormField label="Product Description">
                    <Textarea
                      className="min-h-28 rounded-xl border-[#e9e9e9] text-sm focus-visible:ring-[#1C9DDE]"
                      value={formValues.description}
                      placeholder="Enter a detailed description of the product features..."
                      onChange={(event) =>
                        setValue("description", event.target.value)
                      }
                    />
                  </FormField>
                </div>
              </FieldGroup>

              <FieldGroup title="Pricing & Stock">
                <div className="grid grid-cols-3 gap-3">
                  <FormField label="Price">
                    <Input
                      type="number"
                      className={fieldClass}
                      value={formValues.price}
                      onChange={(event) => setValue("price", event.target.value)}
                      placeholder="0.00"
                    />
                  </FormField>
                  <FormField label="Discount">
                    <Input
                      type="number"
                      className={fieldClass}
                      value={formValues.discount}
                      onChange={(event) =>
                        setValue("discount", event.target.value)
                      }
                      placeholder="0%"
                    />
                  </FormField>
                  <FormField label="Stock">
                    <Input
                      type="number"
                      className={fieldClass}
                      value={formValues.stocks}
                      onChange={(event) => setValue("stocks", event.target.value)}
                      placeholder="0"
                    />
                  </FormField>
                </div>
              </FieldGroup>

              <FieldGroup title="Sales Setup">
                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Product Category">
                    <NativeSelect
                      value={formValues.category}
                      placeholder="Select category"
                      options={PRODUCT_CATEGORIES}
                      onChange={(value) => {
                        setValue("category", value);
                        setValue("type", "");
                      }}
                    />
                  </FormField>
                  <FormField label="Product Type">
                    <NativeSelect
                      value={formValues.type}
                      placeholder="Select product type"
                      options={typeOptions}
                      onChange={(value) => setValue("type", value)}
                    />
                  </FormField>
                  <FormField label="Purchase Type">
                    <NativeSelect
                      value={formValues.control}
                      placeholder="Select purchase audience"
                      options={PURCHASE_CONTROLS}
                      onChange={(value) => setValue("control", value)}
                    />
                  </FormField>
                  <FormField label="Available For">
                    <NativeSelect
                      value={formValues.selectedAudience}
                      placeholder="Select audience"
                      options={PRODUCT_AUDIENCES}
                      onChange={(value) => setValue("selectedAudience", value)}
                    />
                  </FormField>
                </div>
              </FieldGroup>

              <FieldGroup
                title="Variants"
                action={
                  <button
                    type="button"
                    className="cursor-pointer text-xs font-medium"
                    onClick={() => toggleVariation("White")}
                  >
                    + Add variant
                  </button>
                }
              >
                <div className="rounded-2xl border border-[#eeeeee] p-4">
                  <p className="mb-3 text-sm font-medium">Variant 1</p>
                  <div className="space-y-4">
                    <div>
                      <p className="mb-2 text-xs text-[#555555]">Color</p>
                      <div className="flex flex-wrap gap-2">
                        {PRODUCT_VARIATIONS.map((variation) => (
                          <button
                            key={variation}
                            type="button"
                            className={cn(
                              "h-8 cursor-pointer rounded-full border border-[#e0e0e0] px-3 text-xs",
                              formValues.selectedVariations.includes(variation) &&
                                "border-[#1C9DDE] bg-[#e5f5fd] text-[#1C9DDE]"
                            )}
                            onClick={() => toggleVariation(variation)}
                          >
                            {variation}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="mb-2 text-xs text-[#555555]">Size</p>
                      <div className="flex flex-wrap gap-2">
                        {PRODUCT_SIZES.map((size) => (
                          <button
                            key={size}
                            type="button"
                            className={cn(
                              "h-8 cursor-pointer rounded-full border border-[#e0e0e0] px-3 text-xs",
                              selectedSizes.includes(size) &&
                                "border-[#1C9DDE] bg-[#e5f5fd] text-[#1C9DDE]"
                            )}
                            onClick={() => toggleSize(size)}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </FieldGroup>
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-8 left-1/2 z-20 flex -translate-x-1/2 items-center gap-4 rounded-2xl bg-[#2f2f2f] px-5 py-3 text-white shadow-xl">
        <span className="text-sm text-[#cfcfcf]">
          {isEditing ? "Product changes ready." : "New product draft."}
        </span>
        <Button
          variant="outline"
          className="h-9 cursor-pointer rounded-full bg-white px-6 text-[#333333] hover:bg-[#f4f4f4]"
          onClick={() => navigate("/admin/merchandise/products")}
        >
          Cancel
        </Button>
        <Button
          className="h-9 cursor-pointer rounded-full bg-[#1C9DDE] px-6 hover:bg-[#178ac2]"
          disabled={isMutating}
          onClick={save}
        >
          {isEditing ? "Save Changes" : "Add Product"}
        </Button>
      </div>
    </div>
  );
};

const FieldGroup = ({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) => (
  <section>
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-lg font-medium">{title}</h2>
      {action}
    </div>
    <div className="rounded-2xl border border-[#eeeeee] p-4">{children}</div>
  </section>
);

const FormField = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) => (
  <div className="space-y-2">
    <Label className="text-xs font-medium text-[#444444]">{label}</Label>
    {children}
  </div>
);

const NativeSelect = ({
  value,
  options,
  placeholder,
  onChange,
}: {
  value: string;
  options: ReadonlyArray<{ value: string; label: string }>;
  placeholder: string;
  onChange: (value: string) => void;
}) => (
  <div className="relative">
    <select
      className={cn(fieldClass, "w-full appearance-none px-3 text-[#555555]")}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-[#a1a1a1]" />
  </div>
);

const SessionSetupForm = ({
  values,
  onChange,
}: {
  values: ProductFormValues;
  onChange: <TKey extends keyof ProductFormValues>(
    key: TKey,
    value: ProductFormValues[TKey]
  ) => void;
}) => {
  const setSession = (
    key: keyof ProductFormValues["sessionConfig"],
    value: string | boolean
  ) => {
    onChange("sessionConfig", {
      ...values.sessionConfig,
      [key]: value,
    });
  };

  const sessions = [
    {
      label: "Morning Session",
      enabledKey: "isMorningEnabled",
      timeKey: "morningTime",
    },
    {
      label: "Afternoon Session",
      enabledKey: "isAfternoonEnabled",
      timeKey: "afternoonTime",
    },
    {
      label: "Evening Session",
      enabledKey: "isEveningEnabled",
      timeKey: "eveningTime",
    },
  ] as const;

  return (
    <div className="space-y-5">
      {sessions.map((session) => {
        const enabled = Boolean(values.sessionConfig[session.enabledKey]);
        const [startTime = "", endTime = ""] = String(
          values.sessionConfig[session.timeKey]
        ).split(" - ");

        return (
          <div key={session.label} className="rounded-2xl border border-[#eeeeee] p-4">
            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-3 text-sm font-medium">
                <Checkbox
                  checked={enabled}
                  onCheckedChange={(checked) =>
                    setSession(session.enabledKey, checked === true)
                  }
                />
                <Clock3 className="h-4 w-4" />
                {session.label}
              </label>
            </div>
            {enabled && (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <FormField label="Start Time">
                  <Input
                    type="time"
                    className={fieldClass}
                    value={startTime}
                    onChange={(event) =>
                      setSession(
                        session.timeKey,
                        `${event.target.value} - ${endTime || "12:00"}`
                      )
                    }
                  />
                </FormField>
                <FormField label="End Time">
                  <Input
                    type="time"
                    className={fieldClass}
                    value={endTime}
                    onChange={(event) =>
                      setSession(
                        session.timeKey,
                        `${startTime || "07:30"} - ${event.target.value}`
                      )
                    }
                  />
                </FormField>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const PromoPage = () => {
  const {
    canManageMerchandise,
    deletePromo,
    isLoading,
    isMutating,
    promoFilters,
    promoLogs,
    promoMerchandiseOptions,
    promoPage,
    promoRows,
    promoSearch,
    promoTotalPages,
    filteredPromos,
    getPromoFormValues,
    savePromo,
    searchStudent,
    setPromoFilters,
    setPromoPage,
    setPromoSearch,
  } = useMerchandiseData();
  const [activePromo, setActivePromo] = useState<PromoCodeItem | null>(null);
  const [promoFormOpen, setPromoFormOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PromoCodeItem | null>(null);

  return (
    <>
      <MerchandiseHeader
        title="Merchandise"
        description="Control merchandise listings and discounts"
        activeSection="promo-code"
        action={
          canManageMerchandise && (
            <Button
              className="h-12 cursor-pointer rounded-full bg-[#1C9DDE] px-7 text-sm hover:bg-[#178ac2]"
              onClick={() => {
                setActivePromo(null);
                setPromoFormOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Add Promo Code
            </Button>
          )
        }
      />
      <div className="rounded-3xl border border-[#e7e7e7] bg-white p-5">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div className="relative w-full max-w-[300px]">
            <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-[#a1a1a1]" />
            <Input
              value={promoSearch}
              onChange={(event) => setPromoSearch(event.target.value)}
              placeholder="Search"
              className="h-9 rounded-full border-[#e6e6e6] pl-10 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <PromoFilter filters={promoFilters} onApply={setPromoFilters} />
            <Button
              variant="outline"
              className="h-9 cursor-pointer rounded-full border-[#e5e5e5] px-4 text-sm"
              onClick={() => setLogOpen(true)}
            >
              <Clock3 className="h-4 w-4" />
              Logs
            </Button>
          </div>
        </div>
        <PromoTable
          canManage={canManageMerchandise}
          isLoading={isLoading}
          page={promoPage}
          promos={promoRows}
          total={filteredPromos.length}
          totalPages={promoTotalPages}
          onDelete={setDeleteTarget}
          onEdit={(promo) => {
            setActivePromo(promo);
            setPromoFormOpen(true);
          }}
          onPageChange={setPromoPage}
          onView={(promo) => {
            setActivePromo(promo);
            setDetailsOpen(true);
          }}
        />
      </div>
      <PromoFormDialog
        key={activePromo?._id || "new"}
        open={promoFormOpen}
        promo={activePromo}
        initialValues={getPromoFormValues(activePromo)}
        merchandiseOptions={promoMerchandiseOptions}
        loading={isMutating}
        onOpenChange={setPromoFormOpen}
        onSave={savePromo}
        onSearchStudent={searchStudent}
      />
      <PromoDetailsDialog
        open={detailsOpen}
        promo={activePromo}
        onOpenChange={setDetailsOpen}
      />
      <PromoLogDialog
        open={logOpen}
        logs={promoLogs}
        onOpenChange={setLogOpen}
      />
      <ConfirmationDialog
        action={deleteTarget ? "delete-promo" : null}
        label={deleteTarget?.promo_name || "This promo code"}
        loading={isMutating}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          const succeeded = await deletePromo(deleteTarget._id);
          if (succeeded) setDeleteTarget(null);
        }}
      />
    </>
  );
};

const PromoFilter = ({
  filters,
  onApply,
}: {
  filters: PromoFilters;
  onApply: (filters: PromoFilters) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState(filters);
  const hasActiveFilters =
    filters.statuses.length > 0 ||
    filters.types.length > 0 ||
    filters.limitTypes.length > 0;

  useEffect(() => {
    setDraft(filters);
  }, [filters]);

  const toggle = (key: "statuses" | "types" | "limitTypes", value: string) => {
    setDraft((current) => {
      const currentList = current[key];
      return {
        ...current,
        [key]: currentList.includes(value)
          ? currentList.filter((item) => item !== value)
          : [...currentList, value],
      };
    });
  };

  const clear = () => {
    setDraft(EMPTY_PROMO_FILTERS);
    onApply(EMPTY_PROMO_FILTERS);
    setIsOpen(false);
  };

  return (
    <div className="flex items-center gap-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="h-9 cursor-pointer rounded-full border-[#e5e5e5] px-4 text-sm"
          >
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" sideOffset={8} className="w-[310px] rounded-2xl p-5">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-base font-medium">Filter</h3>
            <button
              type="button"
              className="cursor-pointer text-xs text-red-500"
              onClick={() => setDraft(EMPTY_PROMO_FILTERS)}
            >
              Reset Filter
            </button>
          </div>
          <div className="space-y-5">
            <FilterChipGroup
              label="Status"
              options={["Active", "Upcoming", "Expired"]}
              selected={draft.statuses}
              onToggle={(value) => toggle("statuses", value)}
            />
            <FilterChipGroup
              label="Type"
              options={["Members", "Specific", "All Students"]}
              selected={draft.types}
              onToggle={(value) => toggle("types", value)}
            />
            <FilterChipGroup
              label="Limit"
              options={["Limited", "Unlimited"]}
              selected={draft.limitTypes}
              onToggle={(value) => toggle("limitTypes", value)}
            />
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button
              variant="ghost"
              className="cursor-pointer rounded-full px-5"
              onClick={() => {
                setDraft(filters);
                setIsOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              className="cursor-pointer rounded-full bg-[#1C9DDE] px-5 hover:bg-[#178ac2]"
              onClick={() => {
                onApply(draft);
                setIsOpen(false);
              }}
            >
              Apply Filter
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      {hasActiveFilters && (
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 cursor-pointer rounded-full border-[#e8e8e8] text-red-500 hover:bg-red-50 hover:text-red-600"
          onClick={clear}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

const PromoTable = ({
  canManage,
  isLoading,
  page,
  promos,
  total,
  totalPages,
  onDelete,
  onEdit,
  onPageChange,
  onView,
}: {
  canManage: boolean;
  isLoading: boolean;
  page: number;
  promos: PromoCodeItem[];
  total: number;
  totalPages: number;
  onDelete: (promo: PromoCodeItem) => void;
  onEdit: (promo: PromoCodeItem) => void;
  onPageChange: (page: number) => void;
  onView: (promo: PromoCodeItem) => void;
}) => (
  <>
    <div className="overflow-x-auto">
      <table className="w-full min-w-[780px] table-fixed text-sm">
        <colgroup>
          <col className="w-[34px]" />
          <col className="w-[28%]" />
          <col className="w-[16%]" />
          <col className="w-[14%]" />
          <col className="w-[16%]" />
          <col className="w-[18%]" />
          <col className="w-[44px]" />
        </colgroup>
        <thead>
          <tr className="h-8 bg-[#ededed] text-left text-xs font-medium">
            <th className="rounded-l-lg px-2">
              <Checkbox aria-label="Select all promo codes" className="h-4 w-4" />
            </th>
            <th className="px-2">Promo Code</th>
            <th className="px-2 text-center">Type</th>
            <th className="px-2 text-center">Discount</th>
            <th className="px-2 text-center">Stocks</th>
            <th className="px-2 text-center">Status</th>
            <th className="rounded-r-lg px-2" />
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={7} className="py-4">
                <ProductSkeleton />
              </td>
            </tr>
          ) : promos.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-16 text-center text-[#8c8c8c]">
                No promo codes found.
              </td>
            </tr>
          ) : (
            promos.map((promo) => {
              const status = getPromoStatus(promo);
              return (
                <tr key={promo._id} className="border-b border-[#eeeeee]">
                  <td className="px-2 py-4">
                    <Checkbox aria-label={`Select ${promo.promo_name}`} className="h-4 w-4" />
                  </td>
                  <td className="px-2 py-4">
                    <p className="font-medium">{promo.promo_name}</p>
                    <p className="text-xs text-[#999999]">
                      {formatDateRange(promo.start_date, promo.end_date)}
                    </p>
                  </td>
                  <td className="px-2 py-4 text-center">{promo.type}</td>
                  <td className="px-2 py-4 text-center text-[#1C9DDE]">
                    {promo.discount}%
                  </td>
                  <td className="px-2 py-4 text-center">
                    {promo.limit_type === "Unlimited"
                      ? "Unlimited"
                      : promo.quantity <= 0
                        ? "Out of Stock"
                        : promo.quantity}
                  </td>
                  <td className="px-2 py-4 text-center">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-3 py-1 text-xs font-medium",
                        statusTone(status)
                      )}
                    >
                      {status}
                    </span>
                  </td>
                  <td className="px-2 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 cursor-pointer rounded-full border border-[#eeeeee]"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44 rounded-xl p-1">
                        <DropdownMenuItem
                          className="cursor-pointer gap-2 rounded-lg"
                          onClick={() => onView(promo)}
                        >
                          <Eye className="h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        {canManage && (
                          <>
                            <DropdownMenuItem
                              className="cursor-pointer gap-2 rounded-lg"
                              onClick={() => onEdit(promo)}
                            >
                              <Edit3 className="h-4 w-4" />
                              Edit Promo
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="cursor-pointer gap-2 rounded-lg text-red-500 focus:text-red-500"
                              onClick={() => onDelete(promo)}
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete Promo
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
    <PaginationBar
      page={page}
      total={total}
      totalPages={totalPages}
      onPageChange={onPageChange}
    />
  </>
);

const PromoFormDialog = ({
  open,
  promo,
  initialValues,
  merchandiseOptions,
  loading,
  onOpenChange,
  onSave,
  onSearchStudent,
}: {
  open: boolean;
  promo: PromoCodeItem | null;
  initialValues: PromoFormValues;
  merchandiseOptions: PromoMerchandiseItem[];
  loading: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (values: PromoFormValues) => Promise<boolean>;
  onSearchStudent: (
    idNumber: string
  ) => Promise<{ id_number: string; name: string } | null>;
}) => {
  const [values, setValues] = useState<PromoFormValues>(initialValues);
  const [studentId, setStudentId] = useState("");

  const setValue = <TKey extends keyof PromoFormValues>(
    key: TKey,
    value: PromoFormValues[TKey]
  ) => setValues((current) => ({ ...current, [key]: value }));

  const toggleMerch = (item: PromoMerchandiseItem) => {
    setValues((current) => {
      const exists = current.selectedMerchandise.some(
        (merch) => merch._id === item._id
      );
      return {
        ...current,
        selectedMerchandise: exists
          ? current.selectedMerchandise.filter((merch) => merch._id !== item._id)
          : [...current.selectedMerchandise, item],
      };
    });
  };

  const save = async () => {
    if (!values.promoName || !values.audienceType || !values.discount) {
      showToast("error", "Promo name, type, and discount are required");
      return;
    }
    if (values.selectedMerchandise.length === 0) {
      showToast("error", "Select at least one merchandise item");
      return;
    }
    const succeeded = await onSave(values);
    if (succeeded) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-[620px] overflow-y-auto rounded-3xl border-none p-7">
        <DialogTitle className="text-xl font-semibold">
          {promo ? "Edit Promo Code" : "Add Promo Code"}
        </DialogTitle>
        <DialogDescription className="text-sm text-[#8c8c8c]">
          Control discounts and eligible merchandise.
        </DialogDescription>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <FormField label="Promo Name">
            <Input
              className={fieldClass}
              value={values.promoName}
              disabled={Boolean(promo)}
              onChange={(event) => setValue("promoName", event.target.value)}
            />
          </FormField>
          <FormField label="Discount">
            <Input
              type="number"
              className={fieldClass}
              value={values.discount}
              onChange={(event) => setValue("discount", event.target.value)}
            />
          </FormField>
          <FormField label="Audience Type">
            <NativeSelect
              value={values.audienceType}
              placeholder="Select type"
              options={[
                { value: "Members", label: "Members" },
                { value: "Students", label: "Students" },
              ]}
              onChange={(value) => setValue("audienceType", value as "Members" | "Students")}
            />
          </FormField>
          {values.audienceType === "Students" && (
            <FormField label="Student Type">
              <NativeSelect
                value={values.studentType}
                placeholder="Select student type"
                options={[
                  { value: "Specific", label: "Specific" },
                  { value: "All Students", label: "All Students" },
                ]}
                onChange={(value) =>
                  setValue("studentType", value as "Specific" | "All Students")
                }
              />
            </FormField>
          )}
          <FormField label="Limit Type">
            <NativeSelect
              value={values.limitType}
              placeholder="Select limit"
              options={[
                { value: "Limited", label: "Limited" },
                { value: "Unlimited", label: "Unlimited" },
              ]}
              onChange={(value) =>
                setValue("limitType", value as "Limited" | "Unlimited")
              }
            />
          </FormField>
          <FormField label="Quantity">
            <Input
              type="number"
              className={fieldClass}
              value={values.quantity}
              disabled={values.limitType === "Unlimited"}
              onChange={(event) => setValue("quantity", event.target.value)}
            />
          </FormField>
          <FormField label="Start Date">
            <Input
              type="date"
              className={fieldClass}
              value={values.startDate}
              onChange={(event) => setValue("startDate", event.target.value)}
            />
          </FormField>
          <FormField label="End Date">
            <Input
              type="date"
              className={fieldClass}
              value={values.endDate}
              onChange={(event) => setValue("endDate", event.target.value)}
            />
          </FormField>
        </div>

        {values.limitType === "Limited" && (
          <div className="mt-4">
            <p className="mb-2 text-xs font-medium text-[#444444]">
              One student per merchandise?
            </p>
            <div className="flex gap-2">
              {["yes", "no"].map((option) => (
                <button
                  key={option}
                  type="button"
                  className={cn(
                    "h-8 cursor-pointer rounded-full border px-4 text-xs capitalize",
                    values.singleStudent === option &&
                      "border-[#1C9DDE] bg-[#e5f5fd] text-[#1C9DDE]"
                  )}
                  onClick={() => setValue("singleStudent", option as "yes" | "no")}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}

        {values.audienceType === "Members" && (
          <div className="mt-4">
            <p className="mb-2 text-xs font-medium text-[#444444]">Members</p>
            <div className="flex flex-wrap gap-2">
              {TEAM_ROLES.map((role) => (
                <button
                  key={role}
                  type="button"
                  className={cn(
                    "h-8 cursor-pointer rounded-full border px-3 text-xs capitalize",
                    values.selectedMembers.includes(role) &&
                      "border-[#1C9DDE] bg-[#e5f5fd] text-[#1C9DDE]"
                  )}
                  onClick={() =>
                    setValue(
                      "selectedMembers",
                      values.selectedMembers.includes(role)
                        ? values.selectedMembers.filter((item) => item !== role)
                        : [...values.selectedMembers, role]
                    )
                  }
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
        )}

        {values.audienceType === "Students" && values.studentType === "Specific" && (
          <div className="mt-4">
            <p className="mb-2 text-xs font-medium text-[#444444]">
              Specific Students
            </p>
            <div className="flex gap-2">
              <Input
                className={fieldClass}
                value={studentId}
                placeholder="Student ID"
                onChange={(event) => setStudentId(event.target.value)}
              />
              <Button
                className="h-10 cursor-pointer rounded-full bg-[#1C9DDE] px-5"
                onClick={async () => {
                  const student = await onSearchStudent(studentId);
                  if (!student) return;
                  setValue(
                    "selectedStudents",
                    values.selectedStudents.includes(student.id_number)
                      ? values.selectedStudents
                      : [...values.selectedStudents, student.id_number]
                  );
                  setStudentId("");
                }}
              >
                Add
              </Button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {values.selectedStudents.map((id) => (
                <span
                  key={id}
                  className="inline-flex items-center gap-2 rounded-full bg-[#e5f5fd] px-3 py-1 text-xs text-[#1C9DDE]"
                >
                  {id}
                  <button
                    type="button"
                    className="cursor-pointer"
                    onClick={() =>
                      setValue(
                        "selectedStudents",
                        values.selectedStudents.filter((item) => item !== id)
                      )
                    }
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4">
          <p className="mb-2 text-xs font-medium text-[#444444]">
            Selected Merchandise
          </p>
          <div className="grid max-h-44 gap-2 overflow-y-auto rounded-2xl border border-[#eeeeee] p-3 sm:grid-cols-2">
            {merchandiseOptions.map((item) => {
              const selected = values.selectedMerchandise.some(
                (merch) => merch._id === item._id
              );
              return (
                <button
                  key={item._id}
                  type="button"
                  className={cn(
                    "flex cursor-pointer items-center justify-between rounded-xl border px-3 py-2 text-left text-sm",
                    selected && "border-[#1C9DDE] bg-[#e5f5fd]"
                  )}
                  onClick={() => toggleMerch(item)}
                >
                  <span className="truncate">{item.name}</span>
                  {selected && <Check className="h-4 w-4 text-[#1C9DDE]" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button
            variant="outline"
            className="h-10 cursor-pointer rounded-full px-6"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="h-10 cursor-pointer rounded-full bg-[#1C9DDE] px-6 hover:bg-[#178ac2]"
            disabled={loading}
            onClick={save}
          >
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const PromoDetailsDialog = ({
  open,
  promo,
  onOpenChange,
}: {
  open: boolean;
  promo: PromoCodeItem | null;
  onOpenChange: (open: boolean) => void;
}) => {
  if (!promo) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[620px] rounded-3xl border-none p-7">
        <DialogTitle className="text-xl font-semibold">Promo Details</DialogTitle>
        <DialogDescription className="text-sm text-[#8c8c8c]">
          {promo.promo_name}
        </DialogDescription>
        <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
          <InfoBlock label="Type" value={promo.type} />
          <InfoBlock label="Limit Type" value={promo.limit_type} />
          <InfoBlock label="Discount" value={`${promo.discount}%`} />
          <InfoBlock
            label="Quantity"
            value={promo.limit_type === "Unlimited" ? "Unlimited" : String(promo.quantity)}
          />
          <InfoBlock
            label="Date Range"
            value={formatDateRange(promo.start_date, promo.end_date)}
          />
          <InfoBlock label="Created By" value={promo.created_by || "N/A"} />
        </div>
        <div className="mt-5">
          <p className="mb-2 text-xs text-[#9a9a9a]">Merchandise</p>
          <div className="flex flex-wrap gap-2">
            {(promo.selected_merchandise || []).map((item) => (
              <span
                key={item._id}
                className="rounded-full bg-[#f2f2f2] px-3 py-1 text-xs"
              >
                {item.name}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <Button
            variant="outline"
            className="cursor-pointer rounded-full px-6"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const PromoLogDialog = ({
  open,
  logs,
  onOpenChange,
}: {
  open: boolean;
  logs: PromoLogItem[];
  onOpenChange: (open: boolean) => void;
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-h-[80vh] max-w-[620px] overflow-y-auto rounded-3xl border-none p-7">
      <DialogTitle className="text-xl font-semibold">Promo Logs</DialogTitle>
      <DialogDescription className="text-sm text-[#8c8c8c]">
        Recent promo cleanup and usage records.
      </DialogDescription>
      <div className="mt-5 space-y-2">
        {logs.length === 0 ? (
          <p className="py-10 text-center text-sm text-[#8c8c8c]">No logs found.</p>
        ) : (
          logs.map((log) => (
            <div
              key={log._id}
              className="rounded-2xl border border-[#eeeeee] px-4 py-3 text-sm"
            >
              <p className="font-medium">{log.promo_name || log.action || "Promo Log"}</p>
              <p className="text-xs text-[#8c8c8c]">
                {log.admin || "System"} · {formatDate(log.date)}
              </p>
            </div>
          ))
        )}
      </div>
    </DialogContent>
  </Dialog>
);

export const MerchandiseView = () => {
  const location = useLocation();
  const params = useParams();
  const isPromo = location.pathname.includes("promo-code");
  const isProductForm =
    location.pathname.endsWith("/new") || location.pathname.endsWith("/edit");

  if (isProductForm) {
    return (
      <main className="min-h-screen bg-white px-6 py-6 sm:px-10 lg:px-14">
        <ProductFormPage productId={params.productId} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white px-6 py-6 sm:px-10 lg:px-14">
      {isPromo ? <PromoPage /> : <ProductsPage />}
    </main>
  );
};

export default MerchandiseView;
