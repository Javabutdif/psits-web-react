import { useCallback, useEffect, useMemo, useState } from "react";
import {
  activePublishMerchandise,
  addMerchandise,
  createPromoCodeAdmin,
  deleteMerchandise,
  deletePromoCodeAdmin,
  fetchStudentName,
  getAllPromoCodes,
  getPromoLogs,
  merchandiseAdmin,
  publishMerchandise,
  updateMerchandise,
  updatePromoCodeAdmin,
  type MerchandiseItem,
  type PromoCodeRequest,
  type PromoLogItem,
  type PromoMerchandiseItem,
} from "@/features/admin/api/admin";
import { PSITS_ROLES } from "@/features/admin/constants/adminAccess";
import { useAuth } from "@/features/auth";
import { normalizeCampus } from "@/features/auth/utils/campus";
import { showToast } from "@/utils/alertHelper";
import type {
  AdminPromoCode,
  MerchandiseSection,
  MerchandiseSort,
  ProductFilters,
  ProductFormValues,
  ProductImageState,
  ProductSortField,
  ProductStatus,
  PromoFilters,
  PromoFormValues,
} from "../types/merchandise.types";

const ROWS_PER_PAGE = 8;

export const PRODUCT_CATEGORIES = [
  { value: "uniform", label: "Uniform" },
  { value: "intramurals", label: "Intramurals" },
  { value: "ict-congress", label: "ICT Congress" },
  { value: "merchandise", label: "Merchandise" },
  { value: "acquintance", label: "Acquaintance" },
] as const;

export const PRODUCT_TYPES: Record<string, Array<{ value: string; label: string }>> = {
  uniform: [{ value: "Uniform", label: "Uniform" }],
  intramurals: [
    { value: "Tshirt", label: "T-shirt" },
    { value: "Ticket", label: "Ticket" },
    { value: "Others", label: "Others" },
  ],
  "ict-congress": [{ value: "Tshirt w/ Bundle", label: "T-shirt w/ Bundle" }],
  merchandise: [
    { value: "Tshirt", label: "T-shirt" },
    { value: "Item", label: "Item" },
  ],
  acquintance: [
    { value: "Ticket w/ Bundle", label: "Ticket w/ Bundle" },
    { value: "Others", label: "Others" },
  ],
};

export const PRODUCT_VARIATIONS = [
  "White",
  "Purple",
  "Black",
  "Red",
  "Yellow",
  "Orange",
  "Blue",
  "Green",
  "Pink",
  "Gray",
  "Brown",
  "Cyan",
  "Magenta",
  "Teal",
  "Maroon",
  "Innovatio",
  "Paradox",
  "BSIT Wave",
];

export const PRODUCT_SIZES = [
  "18",
  "2XS",
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "2XL",
  "3XL",
  "4XL",
  "5XL",
  "6XL",
];

export const PRODUCT_AUDIENCES = [
  { value: "all", label: "All" },
  { value: "officers", label: "Officers" },
  {
    value: "volunteer,media,developer",
    label: "Volunteers, Media and Developers",
  },
];

export const PURCHASE_CONTROLS = [
  { value: "limited-purchase", label: "Limited Purchase" },
  { value: "bulk-purchase", label: "Bulk Purchase" },
];

export const TEAM_ROLES = [
  "developer",
  "quality assurance",
  "media",
  "volunteer",
  "officers",
  "treasurer",
];

export const EMPTY_PRODUCT_FILTERS: ProductFilters = {
  statuses: [],
  controls: [],
  batches: [],
  confirmedOn: "",
};

export const EMPTY_PROMO_FILTERS: PromoFilters = {
  statuses: [],
  types: [],
  limitTypes: [],
};

export const EMPTY_PRODUCT_FORM: ProductFormValues = {
  name: "",
  price: "",
  discount: "0",
  stocks: "",
  batch: "",
  description: "",
  start_date: "",
  end_date: "",
  category: "",
  type: "",
  control: "",
  selectedAudience: "",
  selectedVariations: [],
  selectedSizes: {},
  isEvent: false,
  eventDate: "",
  sessionConfig: {
    isMorningEnabled: false,
    morningTime: "07:30 - 12:00",
    isAfternoonEnabled: false,
    afternoonTime: "13:00 - 15:00",
    isEveningEnabled: false,
    eveningTime: "18:00 - 20:00",
  },
};

export const EMPTY_PRODUCT_IMAGES: ProductImageState = {
  files: [],
  previews: [],
  removedUrls: [],
};

export const EMPTY_PROMO_FORM: PromoFormValues = {
  promoName: "",
  audienceType: "",
  studentType: "",
  limitType: "Limited",
  singleStudent: "no",
  selectedMembers: [],
  selectedStudents: [],
  selectedMerchandise: [],
  startDate: "",
  endDate: "",
  quantity: "0",
  discount: "0",
};

const formatDateKey = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);
  return date.toISOString().slice(0, 10);
};

export const getProductStatus = (product: MerchandiseItem): ProductStatus => {
  if (Number(product.stocks || 0) <= 0) return "Out of Stock";
  return product.is_active === false ? "Inactive" : "Published";
};

export const formatPurchaseControl = (value?: string) => {
  const option = PURCHASE_CONTROLS.find((control) => control.value === value);
  return option?.label || value || "N/A";
};

export const formatCurrency = (value?: string | number) =>
  `₱${Number(value || 0).toLocaleString()}`;

const productSearchText = (product: MerchandiseItem) =>
  [
    product._id,
    product.name,
    product.category,
    product.price,
    product.batch,
    product.control,
    product.type,
    getProductStatus(product),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

const promoSearchText = (promo: AdminPromoCode) =>
  [
    promo.promo_name,
    promo.type,
    promo.limit_type,
    promo.discount,
    promo.quantity,
    promo.created_by,
    getPromoStatus(promo),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

export const getPromoStatus = (promo: AdminPromoCode) => {
  if (promo.status === "Deleted") return "Deleted";
  const now = new Date();
  const startDate = new Date(promo.start_date);
  const endDate = new Date(promo.end_date);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return promo.status || "Active";
  }
  if (now < startDate) return "Upcoming";
  if (now > endDate) return "Expired";
  return "Active";
};

const productSortValue = (
  product: MerchandiseItem,
  field: ProductSortField
) => {
  if (field === "status") return getProductStatus(product);
  return String(product[field] || "");
};

const sortByText = <TRecord,>(
  records: TRecord[],
  getValue: (record: TRecord) => string,
  direction: "asc" | "desc"
) =>
  [...records].sort((left, right) => {
    const result = getValue(left).localeCompare(getValue(right), undefined, {
      numeric: true,
      sensitivity: "base",
    });
    return direction === "asc" ? result : -result;
  });

const productFormFromRecord = (product?: MerchandiseItem | null): ProductFormValues => {
  if (!product) return EMPTY_PRODUCT_FORM;

  const selectedSizes = Object.fromEntries(
    Object.entries(product.selectedSizes || {}).map(([size, details]) => [
      size,
      {
        custom: Boolean(details.custom),
        price: String(details.price || product.price || "0"),
      },
    ])
  );

  return {
    ...EMPTY_PRODUCT_FORM,
    name: product.name || "",
    price: String(product.price || ""),
    stocks: String(product.stocks || ""),
    batch: String(product.batch || ""),
    description: product.description || "",
    start_date: formatDateKey(product.start_date),
    end_date: formatDateKey(product.end_date),
    category: product.category || "",
    type: product.type || "",
    control: product.control || "",
    selectedAudience: product.selectedAudience || "",
    selectedVariations: product.selectedVariations || [],
    selectedSizes,
  };
};

const promoFormFromRecord = (promo?: AdminPromoCode | null): PromoFormValues => {
  if (!promo) return EMPTY_PROMO_FORM;

  const isStudentPromo = promo.type === "Specific" || promo.type === "All Students";

  return {
    promoId: promo._id,
    promoName: promo.promo_name,
    audienceType: isStudentPromo ? "Students" : "Members",
    studentType: isStudentPromo
      ? promo.type === "Specific"
        ? "Specific"
        : "All Students"
      : "",
    limitType: promo.limit_type === "Unlimited" ? "Unlimited" : "Limited",
    singleStudent: promo.one_person_limit ? "yes" : "no",
    selectedMembers: promo.selected_audience || [],
    selectedStudents: promo.selected_specific_students || [],
    selectedMerchandise: promo.selected_merchandise || [],
    startDate: formatDateKey(promo.start_date),
    endDate: formatDateKey(promo.end_date),
    quantity: String(promo.quantity || 0),
    discount: String(promo.discount || 0),
  };
};

const appendProductFormData = (
  values: ProductFormValues,
  images: ProductImageState,
  createdBy: string
) => {
  const formData = new FormData();

  images.files.forEach((file) => formData.append("images", file));
  images.removedUrls.forEach((url) => formData.append("removeImage", url));

  formData.append("name", values.name);
  formData.append("price", values.price);
  formData.append("stocks", values.stocks);
  formData.append("batch", values.batch);
  formData.append("description", values.description);
  formData.append("selectedVariations", values.selectedVariations.join(","));
  formData.append("selectedSizes", JSON.stringify(values.selectedSizes));
  formData.append("selectedAudience", values.selectedAudience);
  formData.append("created_by", createdBy);
  formData.append("start_date", values.start_date);
  formData.append("end_date", values.end_date);
  formData.append("category", values.category);
  formData.append("type", values.type);
  formData.append("control", values.control);
  formData.append("isEvent", String(values.isEvent));
  formData.append("eventDate", values.eventDate);
  formData.append("sessionConfig", JSON.stringify(values.sessionConfig));

  return formData;
};

const buildPromoPayload = (values: PromoFormValues): PromoCodeRequest => {
  const selectedAudience =
    values.audienceType === "Members"
      ? values.selectedMembers
      : values.studentType === "Specific"
        ? values.selectedStudents
        : "All Students";

  return {
    ...(values.promoId ? { promoId: values.promoId } : {}),
    promoName: values.promoName,
    type: values.audienceType === "Members" ? "Members" : values.studentType,
    limitType: values.limitType,
    singleStudent: values.singleStudent,
    selectedAudience: JSON.stringify(selectedAudience),
    discount: values.discount,
    quantity: values.quantity,
    startDate: values.startDate,
    endDate: values.endDate,
    selectedMerchandise: JSON.stringify(values.selectedMerchandise),
  };
};

export const useMerchandiseData = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<MerchandiseItem[]>([]);
  const [publishedProducts, setPublishedProducts] = useState<MerchandiseItem[]>([]);
  const [promos, setPromos] = useState<AdminPromoCode[]>([]);
  const [promoLogs, setPromoLogs] = useState<PromoLogItem[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [promoSearch, setPromoSearch] = useState("");
  const [productFilters, setProductFilters] =
    useState<ProductFilters>(EMPTY_PRODUCT_FILTERS);
  const [promoFilters, setPromoFilters] =
    useState<PromoFilters>(EMPTY_PROMO_FILTERS);
  const [productSort, setProductSort] = useState<MerchandiseSort<ProductSortField>>({
    field: "name",
    direction: "asc",
  });
  const [productPage, setProductPage] = useState(1);
  const [promoPage, setPromoPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canManageMerchandise =
    normalizeCampus(user?.campus) === "UC-MAIN" &&
    (user?.access === PSITS_ROLES.ADMIN ||
      user?.access === PSITS_ROLES.FINANCE);

  const refreshProducts = useCallback(async () => {
    const [productResult, publishedResult] = await Promise.all([
      merchandiseAdmin(),
      activePublishMerchandise(),
    ]);

    setProducts(productResult || []);
    setPublishedProducts(publishedResult || []);
  }, []);

  const refreshPromos = useCallback(async () => {
    const [promoResult, logResult] = await Promise.all([
      getAllPromoCodes(),
      getPromoLogs(),
    ]);

    setPromos(promoResult || []);
    setPromoLogs(logResult || []);
  }, []);

  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await Promise.all([refreshProducts(), refreshPromos()]);
    } catch {
      setError("Unable to load merchandise data.");
    } finally {
      setIsLoading(false);
    }
  }, [refreshProducts, refreshPromos]);

  useEffect(() => {
    void refreshAll();
  }, [refreshAll]);

  const filteredProducts = useMemo(() => {
    const query = productSearch.trim().toLowerCase();
    const filtered = products.filter((product) => {
      const status = getProductStatus(product);
      const queryMatch = !query || productSearchText(product).includes(query);
      const statusMatch =
        productFilters.statuses.length === 0 ||
        productFilters.statuses.includes(status);
      const controlMatch =
        productFilters.controls.length === 0 ||
        productFilters.controls.includes(product.control || "");
      const batchMatch =
        productFilters.batches.length === 0 ||
        productFilters.batches.includes(String(product.batch || ""));
      const dateMatch =
        !productFilters.confirmedOn ||
        formatDateKey(product.start_date) === productFilters.confirmedOn;

      return queryMatch && statusMatch && controlMatch && batchMatch && dateMatch;
    });

    return sortByText(
      filtered,
      (product) => productSortValue(product, productSort.field),
      productSort.direction
    );
  }, [productFilters, productSearch, productSort, products]);

  const filteredPromos = useMemo(() => {
    const query = promoSearch.trim().toLowerCase();
    return promos.filter((promo) => {
      const status = getPromoStatus(promo);
      const queryMatch = !query || promoSearchText(promo).includes(query);
      const statusMatch =
        promoFilters.statuses.length === 0 ||
        promoFilters.statuses.includes(status);
      const typeMatch =
        promoFilters.types.length === 0 || promoFilters.types.includes(promo.type);
      const limitMatch =
        promoFilters.limitTypes.length === 0 ||
        promoFilters.limitTypes.includes(promo.limit_type);

      return queryMatch && statusMatch && typeMatch && limitMatch;
    });
  }, [promoFilters, promoSearch, promos]);

  const productTotalPages = Math.max(1, Math.ceil(filteredProducts.length / ROWS_PER_PAGE));
  const promoTotalPages = Math.max(1, Math.ceil(filteredPromos.length / ROWS_PER_PAGE));

  const tabCounts = useMemo<Record<MerchandiseSection, number>>(
    () => ({
      products: products.length,
      "promo-code": promos.length,
    }),
    [products.length, promos.length]
  );

  const productRows = filteredProducts.slice(
    (productPage - 1) * ROWS_PER_PAGE,
    productPage * ROWS_PER_PAGE
  );
  const promoRows = filteredPromos.slice(
    (promoPage - 1) * ROWS_PER_PAGE,
    promoPage * ROWS_PER_PAGE
  );

  useEffect(() => {
    setProductPage(1);
  }, [productFilters, productSearch]);

  useEffect(() => {
    setPromoPage(1);
  }, [promoFilters, promoSearch]);

  const toggleProductSort = (field: ProductSortField) => {
    setProductSort((current) =>
      current.field === field
        ? {
            field,
            direction: current.direction === "asc" ? "desc" : "asc",
          }
        : { field, direction: "asc" }
    );
  };

  const saveProduct = async (
    values: ProductFormValues,
    images: ProductImageState,
    existingProductId?: string
  ) => {
    if (!canManageMerchandise) {
      showToast("error", "Unauthorized.");
      return false;
    }

    setIsMutating(true);
    const formData = appendProductFormData(values, images, user?.name || "");

    try {
      const succeeded = existingProductId
        ? await updateMerchandise(existingProductId, formData)
        : await addMerchandise(formData);

      if (succeeded) {
        showToast(
          "success",
          existingProductId
            ? "Product updated successfully"
            : "Product added successfully"
        );
        await refreshProducts();
      }

      return succeeded;
    } finally {
      setIsMutating(false);
    }
  };

  const deleteProduct = async (id: string) => {
    setIsMutating(true);
    try {
      const succeeded = await deleteMerchandise(id);
      if (succeeded) {
        showToast("success", "Product deleted successfully");
        await refreshProducts();
      }
      return Boolean(succeeded);
    } finally {
      setIsMutating(false);
    }
  };

  const publishProduct = async (id: string) => {
    setIsMutating(true);
    try {
      const succeeded = await publishMerchandise(id);
      if (succeeded) {
        showToast("success", "Product published successfully");
        await refreshProducts();
      }
      return Boolean(succeeded);
    } finally {
      setIsMutating(false);
    }
  };

  const savePromo = async (values: PromoFormValues) => {
    setIsMutating(true);
    try {
      const payload = buildPromoPayload(values);
      const succeeded = values.promoId
        ? await updatePromoCodeAdmin(payload)
        : await createPromoCodeAdmin(payload);

      if (succeeded) await refreshPromos();
      return succeeded;
    } finally {
      setIsMutating(false);
    }
  };

  const deletePromo = async (id: string) => {
    setIsMutating(true);
    try {
      const succeeded = await deletePromoCodeAdmin(id);
      if (succeeded) await refreshPromos();
      return succeeded;
    } finally {
      setIsMutating(false);
    }
  };

  const searchStudent = async (idNumber: string) => {
    const result = await fetchStudentName(idNumber);
    if (!result?.data?.id_number) {
      showToast("error", "No student found");
      return null;
    }

    return {
      id_number: String(result.data.id_number),
      name: String(result.data.name || ""),
    };
  };

  const productBatches = useMemo(
    () =>
      Array.from(
        new Set(products.map((product) => String(product.batch || "")).filter(Boolean))
      ),
    [products]
  );

  const promoMerchandiseOptions = useMemo<PromoMerchandiseItem[]>(
    () =>
      publishedProducts.map((product) => ({
        _id: product._id,
        name: product.name,
        items: [],
      })),
    [publishedProducts]
  );

  return {
    canManageMerchandise,
    deleteProduct,
    deletePromo,
    error,
    filteredProducts,
    filteredPromos,
    getProductFormValues: productFormFromRecord,
    getPromoFormValues: promoFormFromRecord,
    isLoading,
    isMutating,
    productBatches,
    productFilters,
    productPage,
    productRows,
    productSearch,
    productTotalPages,
    products,
    promoFilters,
    promoLogs,
    promoMerchandiseOptions,
    promoPage,
    promoRows,
    promoSearch,
    promoTotalPages,
    publishProduct,
    refreshAll,
    saveProduct,
    savePromo,
    searchStudent,
    setProductFilters,
    setProductPage,
    setProductSearch,
    setPromoFilters,
    setPromoPage,
    setPromoSearch,
    tabCounts,
    toggleProductSort,
  };
};
