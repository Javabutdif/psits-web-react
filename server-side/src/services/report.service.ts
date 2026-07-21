import { isValidObjectId, type ClientSession } from "mongoose";
import { Report } from "../models/report.model";
import { IOrdersItems } from "../models/orders.interface";

export interface MerchandiseReportRow {
  _id: string;
  reference_code: string;
  product_name: string;
  id_number: string;
  student_name: string;
  course: string;
  year: string;
  size: unknown;
  variation: unknown;
  quantity: number;
  total: number;
  date: Date;
}

export interface MerchandiseReportFilters {
  search?: string;
  referenceCode?: string;
  studentId?: string;
  name?: string;
  course?: string;
  year?: string;
  productName?: string;
  size?: string;
  color?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface MerchandiseReportQuery extends MerchandiseReportFilters {
  page?: number;
  limit?: number;
}

export interface MerchandiseReportSummary {
  unitsSold: number;
  totalRevenue: number;
}

export interface CreateReportInput {
  orderId?: string;
  order_id?: string;
  idNumber?: string;
  id_number?: string;
  merchId?: string;
  merch_id?: string;
  itemCount?: number;
  item_count?: number;
  total?: number;
  date?: Date | string;
}

type CreateReportPayload = CreateReportInput | CreateReportInput[];

export interface CreateReportResult {
  success: boolean;
  report?: unknown;
  message?: string;
}

export interface MerchandiseReportResult {
  rows: MerchandiseReportRow[];
  data: MerchandiseReportRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  summary: MerchandiseReportSummary;
}

const normalizePage = (value?: number) => {
  if (!value || Number.isNaN(value)) return 1;
  return Math.max(1, Math.floor(value));
};

const normalizeLimit = (value?: number) => {
  if (!value || Number.isNaN(value)) return 10;
  return Math.max(1, Math.floor(value));
};

const toLowerTrim = (value: unknown): string => {
  if (value == null) return "";
  return String(value).trim().toLowerCase();
};

const buildAggregationPipeline = (
  filters: MerchandiseReportFilters,
  skip: number,
  limit: number
) => {
  const matchStage: Record<string, any>[] = [];

  if (filters.search) {
    const q = filters.search.trim().toLowerCase();
    matchStage.push({
      $match: {
        $or: [
          { id_number: { $regex: q, $options: "i" } },
          { order_id: { $regex: q, $options: "i" } },
        ],
      },
    });
  }

  if (filters.referenceCode) {
    matchStage.push({
      $match: {
        order_id: { $regex: filters.referenceCode.trim(), $options: "i" },
      },
    });
  }

  if (filters.studentId) {
    matchStage.push({
      $match: {
        id_number: { $regex: filters.studentId.trim(), $options: "i" },
      },
    });
  }

  if (filters.course) {
    matchStage.push({
      $match: {
        "order_id.course": { $regex: filters.course.trim(), $options: "i" },
      },
    });
  }

  if (filters.year) {
    matchStage.push({
      $match: { "order_id.year": Number(filters.year) },
    });
  }

  if (filters.dateFrom || filters.dateTo) {
    const dateFilter: Record<string, any> = {};
    if (filters.dateFrom) dateFilter.$gte = new Date(filters.dateFrom);
    if (filters.dateTo) dateFilter.$lte = new Date(filters.dateTo);
    matchStage.push({ $match: { date: dateFilter } });
  }

  const matchPipeline =
    matchStage.length > 0 ? { $match: matchStage[0].$match } : {};

  const pipeline: any[] = [
    {
      $lookup: {
        from: "orders",
        localField: "order_id",
        foreignField: "_id",
        as: "order",
      },
    },
    { $unwind: { path: "$order", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "merches",
        localField: "merch_id",
        foreignField: "_id",
        as: "merch",
      },
    },
    { $unwind: { path: "$merch", preserveNullAndEmptyArrays: true } },
    ...(Object.keys(matchPipeline).length > 0 ? [matchPipeline] : []),
    {
      $addFields: {
        effective_id_number: {
          $cond: {
            if: { $gt: [{ $ifNull: ["$order.id_number", ""] }, ""] },
            then: "$order.id_number",
            else: "$id_number",
          },
        },
        orderItem: {
          $first: {
            $filter: {
              input: "$order.items",
              as: "item",
              cond: {
                $eq: ["$$item.product_id", "$merch._id"],
              },
            },
          },
        },
        effective_reference_code: {
          $cond: {
            if: { $gt: [{ $ifNull: ["$order.reference_code", ""] }, ""] },
            then: "$order.reference_code",
            else: "",
          },
        },
        effective_student_name: {
          $cond: {
            if: { $gt: [{ $ifNull: ["$order.student_name", ""] }, ""] },
            then: "$order.student_name",
            else: "",
          },
        },
        effective_course: {
          $cond: {
            if: { $gt: [{ $ifNull: ["$order.course", ""] }, ""] },
            then: "$order.course",
            else: "",
          },
        },
        effective_year: {
          $cond: {
            if: { $gt: [{ $ifNull: ["$order.year", null] }, null] },
            then: "$order.year",
            else: null,
          },
        },
      },
    },
    {
      $project: {
        _id: 1,
        reference_code: "$effective_reference_code",
        product_name: "$merch.name",
        id_number: "$effective_id_number",
        student_name: "$effective_student_name",
        course: "$effective_course",
        year: { $toString: "$effective_year" },
        size: "$orderItem.sizes",
        variation: "$orderItem.variation",
        quantity: "$item_count",
        total: "$total",
        date: "$date",
      },
    },
    { $sort: { date: -1 } },
    { $skip: skip },
    { $limit: limit },
  ];

  return pipeline;
};

const applyPostMatchFilters = (
  docs: any[],
  filters: MerchandiseReportFilters
) => {
  return docs.filter((doc) => {
    if (filters.name) {
      const merchName = toLowerTrim(doc.product_name);
      if (!merchName.includes(toLowerTrim(filters.name))) return false;
    }
    if (filters.productName) {
      const productName = toLowerTrim(doc.product_name);
      if (!productName.includes(toLowerTrim(filters.productName))) return false;
    }
    if (filters.size) {
      const sizeVal = doc.size;
      const sizeStr = Array.isArray(sizeVal)
        ? sizeVal.join(" ")
        : typeof sizeVal === "object" && sizeVal !== null
          ? JSON.stringify(sizeVal)
          : String(sizeVal ?? "");
      if (!toLowerTrim(sizeStr).includes(toLowerTrim(filters.size)))
        return false;
    }
    if (filters.color) {
      const variationVal = doc.variation;
      const variationStr = Array.isArray(variationVal)
        ? variationVal.join(" ")
        : typeof variationVal === "object" && variationVal !== null
          ? JSON.stringify(variationVal)
          : String(variationVal ?? "");
      if (!toLowerTrim(variationStr).includes(toLowerTrim(filters.color)))
        return false;
    }
    if (filters.referenceCode) {
      const ref = toLowerTrim(doc.reference_code);
      if (!ref.includes(toLowerTrim(filters.referenceCode))) return false;
    }
    return true;
  });
};

const mapToRow = (doc: Record<string, unknown>): MerchandiseReportRow => ({
  _id: String(doc._id),
  reference_code: toLowerTrim(doc.reference_code)
    ? String(doc.reference_code)
    : "-",
  product_name: toLowerTrim(doc.product_name) ? String(doc.product_name) : "-",
  id_number: toLowerTrim(doc.id_number) ? String(doc.id_number) : "-",
  student_name: toLowerTrim(doc.student_name) ? String(doc.student_name) : "-",
  course: toLowerTrim(doc.course) ? String(doc.course) : "-",
  year: doc.year != null ? String(doc.year) : "-",
  size: doc.size ?? "-",
  variation: doc.variation ?? "-",
  quantity: Number(doc.quantity ?? 0),
  total: Number(doc.total ?? 0),
  date:
    doc.date instanceof Date
      ? doc.date
      : new Date(doc.date as string | number | Date),
});

export const getMerchandiseReport = async (
  params: MerchandiseReportQuery = {}
): Promise<MerchandiseReportResult> => {
  const page = normalizePage(params.page);
  const limit = normalizeLimit(params.limit);
  const skip = (page - 1) * limit;

  const pipeline = buildAggregationPipeline(params, skip, limit);
  const results = await Report.aggregate(pipeline);

  const filteredResults = applyPostMatchFilters(results, params);

  const totalCount = await Report.countDocuments();

  const totalPages = Math.max(1, Math.ceil(totalCount / limit));

  const rows = filteredResults.map(mapToRow);

  const summary = rows.reduce(
    (acc, row) => {
      acc.unitsSold += row.quantity;
      acc.totalRevenue += row.total;
      return acc;
    },
    { unitsSold: 0, totalRevenue: 0 }
  );

  return {
    rows,
    data: rows,
    total: totalCount,
    page,
    limit,
    totalPages,
    summary,
  };
};

export const getMerchandiseReportById = async (reportId: string) => {
  if (!isValidObjectId(reportId)) {
    throw new Error("Invalid report id.");
  }

  const report = await Report.findById(reportId)
    .populate({
      path: "order_id",
      select: "reference_code id_number student_name course year",
    })
    .populate({
      path: "merch_id",
      select: "name selectedVariations",
    })
    .lean();

  if (!report) return null;

  const order = report.order_id as {
    reference_code?: string;
    items?: IOrdersItems[];
    id_number?: string;
    student_name?: string;
    course?: string;
    year?: number;
  } | null;

  const merch = report.merch_id as {
    name?: string;
    selectedSizes?: unknown;
    selectedVariations?: unknown;
  } | null;

  console.log(order?.items);
  return {
    _id: String(report._id),
    reference_code: order?.reference_code || "-",
    product_name: merch?.name || "-",
    id_number: order?.id_number || report.id_number || "-",
    student_name: order?.student_name || "-",
    course: order?.course || "-",
    year: order?.year != null ? String(order.year) : "-",
    size: order?.items ?? "-",
    variation: merch?.selectedVariations ?? "-",
    quantity: Number(report.item_count ?? 0),
    total: Number(report.total ?? 0),
    date: report.date instanceof Date ? report.date : new Date(report.date),
  } as MerchandiseReportRow;
};

export const deleteMerchandiseReportById = async (reportId: string) => {
  if (!isValidObjectId(reportId)) {
    throw new Error("Invalid report id.");
  }

  return Report.findByIdAndDelete(reportId);
};

export const createReports = async (
  ...args: unknown[]
): Promise<CreateReportResult> => {
  const rawPayload = args[0] as CreateReportPayload | undefined;
  const session = args[1] as ClientSession | undefined;

  const payloadArray = Array.isArray(rawPayload)
    ? rawPayload
    : rawPayload
      ? [rawPayload]
      : [];

  const docs = payloadArray.map((payload) => ({
    order_id: payload.orderId ?? payload.order_id,
    id_number: payload.idNumber ?? payload.id_number,
    merch_id: payload.merchId ?? payload.merch_id,
    item_count: Number(payload.itemCount ?? payload.item_count ?? 0),
    total: Number(payload.total ?? 0),
    date: payload.date ? new Date(payload.date) : new Date(),
  }));

  const uniqueDocs = Array.from(
    new Map(
      docs.map((doc) => [
        [
          String(doc.order_id ?? ""),
          String(doc.id_number ?? ""),
          String(doc.merch_id ?? ""),
          String(doc.item_count ?? 0),
          String(doc.total ?? 0),
          doc.date instanceof Date ? doc.date.toISOString() : String(doc.date),
        ].join("|"),
        doc,
      ])
    ).values()
  );

  const report = uniqueDocs.length
    ? session
      ? await Report.insertMany(uniqueDocs, { session })
      : await Report.insertMany(uniqueDocs)
    : [];

  return {
    success: true,
    report,
  };
};

export const reportService = {
  createReports,
  getMerchandiseReport,
  getMerchandiseReportById,
  deleteMerchandiseReportById,
};

export default {
  createReports,
  getMerchandiseReport,
  getMerchandiseReportById,
  deleteMerchandiseReportById,
};
