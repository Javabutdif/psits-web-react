export interface ICertificateTemplate {
  _id: string;
  name: string;
  description: string;
  ejsRelativePath: string;
  defaultSignees?: Array<{ name: string; designation: string; e_sig?: string }>;
  defaultImages?: Record<string, string>;
  defaultFonts?: Record<string, string>;
  isActive: boolean;
}

export interface CertificateTemplatesResponse {
  success: boolean;
  templates: ICertificateTemplate[];
}

export interface CreateTemplatePayload {
  name: string;
  description: string;
  ejsRelativePath: string;
  defaultSignees?: Array<{ name: string; designation: string; e_sig?: string }>;
  defaultImages?: Record<string, string>;
  defaultFonts?: Record<string, string>;
}

export interface CertificateEvent {
  eventId: string;
  eventName: string;
  eventImage?: string[] | string;
  [key: string]: unknown;
}

export interface EventsWithCertificateResponse {
  success: boolean;
  events: CertificateEvent[];
}

export interface AttendeeRaw {
  name: string;
  id_number: string;
  campus?: string;
  course?: string;
  year_level?: string | number;
}

export interface PaginatedListResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface AssetTreeNode {
  name: string;
  path: string;
  type: "file" | "directory";
  extension?: string;
  children?: AssetTreeNode[];
}


