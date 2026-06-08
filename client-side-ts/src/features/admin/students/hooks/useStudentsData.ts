import { useCallback, useEffect, useMemo, useState } from "react";
import {
  approveMembership,
  cancelMembership,
  changeStudentPasswordAdmin,
  deletedStudent,
  getCountStudent,
  getDashboardActiveStudents,
  getStudentMembershipHistory,
  membershipPrice,
  membershipRequest,
  studentDeletion,
  studentRestore,
  updateStudent,
} from "@/features/admin/api/admin";
import { useAuth } from "@/features/auth";
import { showToast } from "@/utils/alertHelper";
import type {
  AdminStudent,
  StudentAction,
  StudentFilters,
  StudentFormValues,
  StudentMembershipHistoryItem,
  StudentSort,
  StudentSortField,
  StudentTabCounts,
  StudentsTab,
} from "../types/students.types";

const ROWS_PER_PAGE = 8;

const DEFAULT_FILTERS: StudentFilters = {
  courses: [],
  years: [],
  membershipStatus: "all",
  appliedOn: "",
};

const DEFAULT_SORT: StudentSort = {
  field: "name",
  direction: "asc",
};

const DEFAULT_TAB_COUNTS: StudentTabCounts = {
  all: 0,
  requests: 0,
  deleted: 0,
};

interface StudentApiRecord {
  _id?: string;
  id_number?: string;
  rfid?: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  email?: string;
  course?: string;
  year?: string | number;
  membershipStatus?: string;
  status?: string;
  applied?: string;
  deletedBy?: string;
  deletedDate?: string;
  isFirstApplication?: boolean;
  campus?: string;
}

const normalizeName = (record: StudentApiRecord) =>
  [record.first_name, record.middle_name, record.last_name]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

const normalizeStudent = (record: StudentApiRecord): AdminStudent => ({
  id: String(record._id || record.id_number || crypto.randomUUID()),
  id_number: String(record.id_number || ""),
  rfid: String(record.rfid || ""),
  first_name: String(record.first_name || ""),
  middle_name: String(record.middle_name || ""),
  last_name: String(record.last_name || ""),
  name: normalizeName(record) || "Unnamed Student",
  email: String(record.email || ""),
  course: String(record.course || ""),
  year: String(record.year || ""),
  membershipStatus: String(record.membershipStatus || "NOT_APPLIED"),
  status: String(record.status || ""),
  applied: String(record.applied || ""),
  deletedBy: String(record.deletedBy || ""),
  deletedDate: String(record.deletedDate || ""),
  isFirstApplication: Boolean(record.isFirstApplication),
  campus: String(record.campus || ""),
});

const searchableText = (student: AdminStudent) =>
  [
    student.name,
    student.email,
    student.id_number,
    student.rfid,
    student.course,
    student.year,
    student.membershipStatus,
    student.deletedBy,
    student.deletedDate,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

const getSortValue = (student: AdminStudent, field: StudentSortField) => {
  if (field === "courseYear") return `${student.course} ${student.year}`;
  return String(student[field] || "");
};

const formatDateKey = (value: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString().slice(0, 10);
};

const createReferenceCode = () =>
  Math.floor(Math.random() * (999999999 - 111111111 + 1)) + 111111111;

export const useStudentsData = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<StudentsTab>("all");
  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filters, setFilters] = useState<StudentFilters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<StudentSort>(DEFAULT_SORT);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [membershipFee, setMembershipFee] = useState(50);
  const [tabCounts, setTabCounts] =
    useState<StudentTabCounts>(DEFAULT_TAB_COUNTS);

  const isUcMainAdmin = user?.role === "Admin" && user.campus === "UC-Main";
  const canManageMembership =
    isUcMainAdmin && (user?.access === "admin" || user?.access === "finance");

  const fetchStudentCounts = useCallback(async () => {
    const result = await getCountStudent();
    if (!result) return;

    setTabCounts({
      all: result.all || 0,
      requests: result.request || 0,
      deleted: result.deleted || 0,
    });
  }, []);

  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result =
        activeTab === "all"
          ? await getDashboardActiveStudents()
          : activeTab === "requests"
            ? await membershipRequest()
            : await deletedStudent();

      setStudents(
        ((result || []) as StudentApiRecord[]).map((record) =>
          normalizeStudent(record)
        )
      );
    } catch {
      setStudents([]);
      setError("Unable to load student data.");
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    fetchStudentCounts();
  }, [fetchStudentCounts]);

  useEffect(() => {
    const fetchMembershipFee = async () => {
      const price = await membershipPrice();
      if (price) setMembershipFee(price);
    };
    fetchMembershipFee();
  }, []);

  useEffect(() => {
    setSelectedIds([]);
    setPage(1);
    setSearch("");
    setFilters(DEFAULT_FILTERS);
    setSort(DEFAULT_SORT);
  }, [activeTab]);

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return students
      .filter((student) => {
        if (query && !searchableText(student).includes(query)) return false;
        if (
          filters.courses.length > 0 &&
          !filters.courses.includes(student.course)
        ) {
          return false;
        }
        if (filters.years.length > 0 && !filters.years.includes(student.year)) {
          return false;
        }
        if (
          filters.membershipStatus !== "all" &&
          student.membershipStatus !== filters.membershipStatus
        ) {
          return false;
        }
        if (
          filters.appliedOn &&
          formatDateKey(student.applied) !== filters.appliedOn
        ) {
          return false;
        }
        return true;
      })
      .sort((left, right) => {
        const leftValue = getSortValue(left, sort.field).toLowerCase();
        const rightValue = getSortValue(right, sort.field).toLowerCase();
        const result = leftValue.localeCompare(rightValue, undefined, {
          numeric: true,
          sensitivity: "base",
        });
        return sort.direction === "asc" ? result : -result;
      });
  }, [filters, search, sort, students]);

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / ROWS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const pagedStudents = filteredStudents.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE
  );

  useEffect(() => {
    if (page !== currentPage) setPage(currentPage);
  }, [currentPage, page]);

  const selectedStudents = useMemo(
    () => students.filter((student) => selectedIds.includes(student.id_number)),
    [selectedIds, students]
  );

  const toggleSort = (field: StudentSortField) => {
    setSort((currentSort) =>
      currentSort.field === field
        ? {
            field,
            direction: currentSort.direction === "asc" ? "desc" : "asc",
          }
        : { field, direction: "asc" }
    );
  };

  const toggleStudentSelection = (idNumber: string) => {
    setSelectedIds((currentIds) =>
      currentIds.includes(idNumber)
        ? currentIds.filter((id) => id !== idNumber)
        : [...currentIds, idNumber]
    );
  };

  const togglePageSelection = () => {
    const pageIds = pagedStudents.map((student) => student.id_number);
    setSelectedIds((currentIds) =>
      pageIds.length > 0 &&
      pageIds.every((id) => currentIds.includes(id))
        ? currentIds.filter((id) => !pageIds.includes(id))
        : Array.from(new Set([...currentIds, ...pageIds]))
    );
  };

  const saveStudent = async (values: StudentFormValues) => {
    setIsMutating(true);
    try {
      const result = await updateStudent(
        values.id_number,
        values.rfid,
        values.first_name,
        values.middle_name,
        values.last_name,
        values.email,
        values.course,
        values.year
      );
      if (result?.status === 200) {
        showToast("success", "Student updated successfully.");
        await fetchStudents();
        return true;
      }
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  const updatePassword = async (idNumber: string, password: string) => {
    setIsMutating(true);
    try {
      return Boolean(await changeStudentPasswordAdmin(idNumber, password));
    } finally {
      setIsMutating(false);
    }
  };

  const fetchMembershipHistory = useCallback(async (idNumber: string) => {
    const result = await getStudentMembershipHistory(idNumber);
    return (result || []) as StudentMembershipHistoryItem[];
  }, []);

  const approveStudentMembership = useCallback((student: AdminStudent) => {
    return approveMembership({
      reference_code: String(createReferenceCode()),
      id_number: student.id_number,
      rfid: student.rfid || "N/A",
      type: student.isFirstApplication ? "Membership" : "Renewal",
      admin: user?.name || "Admin",
      cash: membershipFee,
      date: new Date(),
      total: membershipFee,
    });
  }, [membershipFee, user?.name]);

  const submitMembership = useCallback(async (student: AdminStudent) => {
    setIsMutating(true);
    try {
      const result = await approveStudentMembership(student);
      if (result) {
        await Promise.all([fetchStudents(), fetchStudentCounts()]);
        return true;
      }
      return false;
    } finally {
      setIsMutating(false);
    }
  }, [approveStudentMembership, fetchStudentCounts, fetchStudents]);

  const runAction = async (
    action: StudentAction,
    records: AdminStudent[]
  ) => {
    if (records.length === 0) return false;

    setIsMutating(true);
    try {
      const results = await Promise.all(
        records.map((record) => {
          if (action === "delete") {
            return studentDeletion(record.id_number, user?.name || "Admin");
          }
          if (action === "restore") return studentRestore(record.id_number);
          if (action === "cancelRequest") return cancelMembership(record.id_number);
          return approveStudentMembership(record);
        })
      );

      const isSuccess = results.every((result) =>
        typeof result === "boolean" ? result : result === 200 || result === undefined
      );

      if (isSuccess) {
        if (action === "delete") showToast("success", "Student deleted.");
        if (action === "restore") showToast("success", "Student restored.");
        await Promise.all([fetchStudents(), fetchStudentCounts()]);
        setSelectedIds([]);
      }

      return isSuccess;
    } finally {
      setIsMutating(false);
    }
  };

  return {
    activeTab,
    canManageMembership,
    currentPage,
    error,
    fetchMembershipHistory,
    filters,
    isLoading,
    isMutating,
    isUcMainAdmin,
    membershipFee,
    page: currentPage,
    pagedStudents,
    runAction,
    saveStudent,
    search,
    selectedIds,
    selectedStudents,
    setActiveTab,
    setFilters,
    setPage,
    setSearch,
    sort,
    submitMembership,
    tabCounts,
    total: filteredStudents.length,
    totalPages,
    togglePageSelection,
    toggleSort,
    toggleStudentSelection,
    updatePassword,
  };
};
