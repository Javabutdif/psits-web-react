import type { DocArticle, DocSection } from "../types/documentation.types";

export const documentationSections: DocSection[] = [
  {
    id: "overview",
    title: "System Overview",
    icon: "overview",
    children: [
      getOverviewArticle(),
      getArchitectureArticle(),
      getTechStackArticle(),
      getCollectionsArticle(),
    ],
  },
  {
    id: "auth",
    title: "Authentication",
    icon: "auth",
    children: [
      getAuthOverviewArticle(),
      getAuthFlowArticle(),
      getAuthMiddlewareArticle(),
      getTokenSecurityArticle(),
    ],
  },
  {
    id: "roles",
    title: "Roles & Permissions",
    icon: "roles",
    children: [
      getAdminRolesArticle(),
      getStudentRolesArticle(),
      getRoleHierarchyArticle(),
      getPermissionMatrixArticle(),
    ],
  },
  {
    id: "admin-features",
    title: "Admin Features",
    icon: "admin",
    children: [
      getDashboardArticle(),
      getOrganizationArticle(),
      getRecruitmentArticle(),
      getStudentsArticle(),
      getEventsArticle(),
      getMerchandiseArticle(),
      getOrdersArticle(),
      getCertificatesArticle(),
      getReportsArticle(),
      getSettingsArticle(),
      getLogsArticle(),
      getDevToolsArticle(),
    ],
  },
  {
    id: "student-features",
    title: "Student Features",
    icon: "student",
    children: [
      getStudentMembershipArticle(),
      getStudentEventsArticle(),
      getStudentOrdersArticle(),
      getStudentCertificatesArticle(),
      getStudentAccountArticle(),
    ],
  },
  {
    id: "public-features",
    title: "Public Features",
    icon: "public",
    children: [
      getPublicEventsArticle(),
      getPublicShopArticle(),
      getPublicResourcesArticle(),
    ],
  },
  {
    id: "api",
    title: "API Reference",
    icon: "api",
    children: [
      getApiOverviewArticle(),
      getApiAuthArticle(),
      getApiAdminArticle(),
      getApiStudentsArticle(),
      getApiEventsArticle(),
      getApiMerchandiseArticle(),
      getApiOrdersArticle(),
      getApiCertificatesArticle(),
      getApiDevToolsArticle(),
      getApiRecruitmentArticle(),
    ],
  },
  {
    id: "infrastructure",
    title: "Infrastructure",
    icon: "infra",
    children: [
      getCronJobsArticle(),
      getStorageArticle(),
      getEmailArticle(),
      getRateLimitingArticle(),
      getCampusSystemArticle(),
    ],
  },
];

function getOverviewArticle(): DocArticle {
  return {
    id: "system-introduction",
    title: "System Introduction",
    sectionId: "overview",
    content: [
      "The PSITS Web Application is a comprehensive management system for the Philippines Society of Information Technology Students (PSITS). It serves three user groups: administrators, students, and the general public.",
      "The system provides event management, merchandise sales, membership management, recruitment tracking, certificate generation, and administrative tools — all organized by campus.",
      "There are five campuses in the system: UC_MAIN (Cebu City main campus), UC_BANILAD, UC_LM, UC_PT, and UC_JONES. Some features are restricted to UC_MAIN administrators only.",
    ],
    codeBlocks: [
      {
        language: "text",
        title: "URL Structure",
        code: `Public:  https://psits.edu.ph/
Admin:   https://psits.edu.ph/admin/...
Student: https://psits.edu.ph/student/...
API:     https://psits.edu.ph/api/...`,
      },
    ],
  };
}

function getArchitectureArticle(): DocArticle {
  return {
    id: "system-architecture",
    title: "System Architecture",
    sectionId: "overview",
    content: [
      "The application follows a three-tier architecture with clear separation between frontend, backend, and data layers.",
      "The frontend is a React 19 + TypeScript application using Vite as the build tool. It uses TanStack Query for data fetching, shadcn/ui for components, and React Router for navigation. The frontend is split into three layout modes: public (MainLayout), admin (AdminLayout), and student (StudentLayout).",
      "The backend is an Express + TypeScript API with MongoDB (Mongoose) as the persistence layer. Routes are organized by domain under src/routes/. Controllers handle HTTP requests while services contain business logic. Middleware provides authentication, authorization, and error handling.",
      "Authentication uses a dual-token JWT system: a short-lived access token (stored in memory) and a long-lived httpOnly refresh cookie. The v2 authentication middleware has three layers: token verification, role-based access, and granular admin access control.",
    ],
  };
}

function getTechStackArticle(): DocArticle {
  return {
    id: "technology-stack",
    title: "Technology Stack",
    sectionId: "overview",
    content: [
      "The system is built with modern web technologies across the full stack.",
    ],
    tables: [
      {
        headers: ["Layer", "Technology", "Purpose"],
        rows: [
          ["Frontend", "React 19 + TypeScript", "UI framework and type safety"],
          ["Build", "Vite", "Bundler and dev server"],
          ["State", "TanStack Query", "Server state caching and sync"],
          ["UI", "shadcn/ui + Tailwind CSS", "Component library and styling"],
          ["Routing", "React Router v7", "Client-side navigation"],
          ["Charts", "Recharts", "Data visualization"],
          ["QR", "react-qr-code / @yudiel/react-qr-scanner", "QR code generation and scanning"],
          ["Animations", "framer-motion", "Transition animations"],
          ["Backend", "Express + TypeScript", "REST API server"],
          ["Database", "MongoDB + Mongoose", "Document persistence"],
          ["File Storage", "Cloudflare R2 (S3-compatible)", "Image and document storage"],
          ["Email", "Resend", "Transactional email delivery"],
          ["Cron Jobs", "node-cron", "Scheduled background tasks"],
        ],
      },
    ],
  };
}

function getCollectionsArticle(): DocArticle {
  return {
    id: "database-collections",
    title: "Database Collections",
    sectionId: "overview",
    content: [
      "MongoDB stores all application data across the following collections:",
    ],
    tables: [
      {
        headers: ["Collection", "Purpose"],
        rows: [
          ["student", "Student accounts, membership status, campus, course, year level"],
          ["admin", "Admin officer accounts, roles, access levels, status"],
          ["event", "Events with attendees, QR codes, raffle data"],
          ["merch", "Merchandise products, inventory, images"],
          ["order", "Student orders, payment status, fulfillment"],
          ["cart", "Shopping cart items per student"],
          ["certificateTemplate", "Certificate design templates and configurations"],
          ["promo", "Promo/discount codes and usage tracking"],
          ["log", "Activity and audit logs"],
          ["application", "Recruitment job applications"],
          ["recruitmentPosition", "Open positions for recruitment"],
          ["settings", "System-wide configuration settings"],
          ["report", "Admin-generated reports"],
          ["apiendpoint", "API documentation entries"],
          ["feature", "Feature documentation entries"],
        ],
      },
    ],
  };
}

function getAuthOverviewArticle(): DocArticle {
  return {
    id: "auth-overview",
    title: "Authentication Overview",
    sectionId: "auth",
    content: [
      "PSITS uses a dual-token JWT authentication system. Users authenticate via POST /api/v2/auth/login with their ID number and password. On success, the server issues a short-lived access token (returned in JSON) and sets a long-lived httpOnly refresh cookie.",
      "The access token is stored in-memory only (not localStorage) to prevent XSS extraction. The refresh cookie is httpOnly and secure, protecting against XSS while enabling server-side token rotation.",
      "Authentication is required for all admin and student routes. Public routes (event browsing, shop) are accessible without a token.",
    ],
    codeBlocks: [
      {
        language: "typescript",
        title: "Login Request",
        code: `POST /api/v2/auth/login
Content-Type: application/json

{
  "id_number": "12345678",
  "password": "your_password"
}

Response (200):
{
  "accessToken": "eyJhbGc...",
  "user": {
    "id": "...",
    "idNumber": "12345678",
    "role": "admin",
    "campus": "UC_MAIN",
    "name": "Jan Lorenz Laroco",
    "access": "PSITS_ADMIN"
  }
}`,
      },
      {
        language: "typescript",
        title: "Token Refresh",
        code: `POST /api/v2/auth/refresh
// No body required — refresh token is read from httpOnly cookie

Response (200):
{
  "accessToken": "eyJhbGc...",
  "user": { ... }
}`,
      },
    ],
  };
}

function getAuthFlowArticle(): DocArticle {
  return {
    id: "auth-flow",
    title: "Authentication Flow",
    sectionId: "auth",
    content: [
      "1. User enters ID number and password on the login page.",
      "2. Frontend sends POST /api/v2/auth/login with credentials.",
      "3. Backend verifies credentials against the student or admin collection.",
      "4. On success, backend issues an access token (JWT) and sets an httpOnly refresh cookie.",
      "5. Frontend stores the access token in memory and the user object in React context.",
      "6. Every subsequent API request includes the access token in the Authorization header.",
      "7. When the access token expires, the frontend calls POST /api/v2/auth/refresh to get a new token.",
      "8. On logout, the frontend calls POST /api/v2/auth/logout to clear the refresh cookie.",
      "",
      "Route guards (AdminRouteGuard, StudentRouteGuard, CampusRouteGuards) protect pages by checking the user's role and campus before rendering the route.",
    ],
  };
}

function getAuthMiddlewareArticle(): DocArticle {
  return {
    id: "auth-middleware",
    title: "Middleware Layers",
    sectionId: "auth",
    content: [
      "The v2 authentication middleware operates in three layers. Routes combine these layers based on their sensitivity:",
    ],
    tables: [
      {
        headers: ["Layer", "Middleware", "Use Case"],
        rows: [
          ["1A — Fast verify", "requireAccessTokenV2", "Read-only routes, performance-critical"],
          ["1B — DB-check", "requireAccessTokenWithDBCheck", "Destructive/sensitive operations"],
          ["2 — Role check", "roleAuthenticateV2(['admin'|'student'])", "All protected routes (required)"],
          ["3 — Admin access", "adminAccessAuthenticateV2([...])", "Granular admin permission checks"],
        ],
      },
    ],
    codeBlocks: [
      {
        language: "typescript",
        title: "Typical Route Protection Chain",
        code: `// Public read
router.get("/events", requireAccessTokenV2, roleAuthenticateV2(["admin", "student"]), handler)

// Sensitive write (admin only)
router.post("/events", requireAccessTokenWithDBCheck, roleAuthenticateV2(["admin"]), handler)

// Admin with access level check
router.delete("/admin/user", requireAccessTokenWithDBCheck, roleAuthenticateV2(["admin"]), adminAccessAuthenticateV2(["PSITS_ADMIN"]), handler)`,
      },
    ],
  };
}

function getTokenSecurityArticle(): DocArticle {
  return {
    id: "token-security",
    title: "Token Security",
    sectionId: "auth",
    content: [
      "Access tokens are JWTs signed with HS256. They contain the user's sub (MongoDB ObjectId), idNumber, role, campus, and access level. Token lifetime is short (typically 15 minutes).",
      "Refresh tokens are stored as httpOnly cookies, preventing JavaScript access. The backend validates refresh tokens against a server-side session store.",
      "Rate limiting is applied to login (/api/login and /api/v2/auth/login) and signup routes to prevent brute-force attacks. The brute force detector in DevTools monitors repeated failed attempts.",
      "Password storage uses bcrypt hashing with a configured cost factor.",
    ],
  };
}

function getAdminRolesArticle(): DocArticle {
  return {
    id: "admin-roles",
    title: "Admin Roles",
    sectionId: "roles",
    content: [
      "Admin accounts have a role ('admin' or 'student') and an access level that determines what actions they can perform. The access level is stored as PSITS_* prefixed string.",
    ],
    tables: [
      {
        headers: ["Access Level", "Key Permissions"],
        rows: [
          ["PSITS_ADMIN", "Full system access: CRUD all entities, manage officers, approve roles, change membership pricing"],
          ["PSITS_DEV", "Developer tools access: server diagnostics, DB operations, cron management, brute force logs"],
          ["PSITS_HEAD_FINANCE", "Finance oversight: approve membership changes, view financial reports"],
          ["PSITS_FINANCE", "Financial operations: approve membership, manage merchandise pricing, process refunds"],
          ["PSITS_EXEC", "Executive functions: approve member role requests, manage recruitment positions"],
          ["PSITS_STANDARD", "Standard admin: view data, manage events and students (no financial or officer management)"],
          ["PSITS_NO_ACCESS", "Restricted: can log in but has no admin panel access"],
        ],
      },
    ],
  };
}

function getStudentRolesArticle(): DocArticle {
  return {
    id: "student-roles",
    title: "Student Roles",
    sectionId: "roles",
    content: [
      "Students have a role within the organization that determines their additional capabilities beyond basic membership.",
    ],
    tables: [
      {
        headers: ["Role", "Description"],
        rows: [
          ["PSITS_GENERAL", "Regular student member with basic access"],
          ["PSITS_MEDIA", "Student with media/content creation responsibilities"],
          ["PSITS_DEVELOPER", "Student developer with technical project access"],
          ["PSITS_VOLUNTEER", "Volunteer student assisting with events and activities"],
          ["PSITS_OFFICER", "Student officer with elevated event management privileges"],
        ],
      },
    ],
  };
}

function getRoleHierarchyArticle(): DocArticle {
  return {
    id: "role-hierarchy",
    title: "Role Hierarchy",
    sectionId: "roles",
    content: [
      "The system uses a tiered access hierarchy. Higher tiers can perform all actions of lower tiers plus additional operations. The hierarchy is enforced through the adminAccessAuthenticateV2 middleware on sensitive routes.",
    ],
    tables: [
      {
        headers: ["Tier", "Access Levels", "Can Manage Officers?"],
        rows: [
          ["1 (Highest)", "PSITS_ADMIN", "Yes — full CRUD, suspend, restore"],
          ["2", "PSITS_DEV", "No — DevTools read-only for officer data"],
          ["3", "PSITS_HEAD_FINANCE", "No — financial oversight only"],
          ["4", "PSITS_FINANCE", "No — financial operations only"],
          ["5", "PSITS_EXEC", "Yes — approve/reject role requests"],
          ["6 (Lowest)", "PSITS_STANDARD", "No — read and basic operations"],
        ],
      },
    ],
  };
}

function getPermissionMatrixArticle(): DocArticle {
  return {
    id: "permission-matrix",
    title: "Permission Matrix",
    sectionId: "roles",
    content: [
      "The following matrix shows which admin roles can perform key actions. 'DevTools' panel is restricted to PSITS_ADMIN and PSITS_DEV only.",
    ],
    tables: [
      {
        headers: ["Action", "ADMIN", "DEV", "HEAD_FINANCE", "FINANCE", "EXEC", "STANDARD"],
        rows: [
          ["Create/Edit Events", "Yes", "Yes", "Yes", "Yes", "Yes", "Yes"],
          ["Manage Attendees", "Yes", "Yes", "Yes", "Yes", "Yes", "Yes"],
          ["Run Raffles", "Yes", "Yes", "Yes", "Yes", "Yes", "No"],
          ["Manage Merchandise", "Yes", "Yes", "Yes", "Yes", "No", "Yes (view)"],
          ["Process Refunds", "Yes", "No", "Yes", "Yes", "No", "No"],
          ["Manage Officers", "Yes", "No", "No", "No", "No", "No"],
          ["Approve Memberships", "Yes", "Yes", "Yes", "Yes", "No", "No"],
          ["Change Membership Price", "Yes", "No", "Yes", "Yes", "No", "No"],
          ["Access DevTools", "Yes", "Yes", "No", "No", "No", "No"],
          ["View Reports", "Yes", "Yes", "Yes", "Yes", "Yes", "Yes"],
          ["Recruitment Management", "Yes", "Yes", "Yes", "Yes", "Yes", "Yes"],
        ],
      },
    ],
  };
}

function getDashboardArticle(): DocArticle {
  return {
    id: "admin-dashboard",
    title: "Dashboard",
    sectionId: "admin-features",
    content: [
      "The Dashboard provides a real-time overview of the PSITS system with key metrics and visualizations.",
      "Accessible at /admin/dashboard. Requires UC_MAIN campus and admin role.",
    ],
    tables: [
      {
        headers: ["Metric", "Description"],
        rows: [
          ["On-Sale Products", "Count of active merchandise items available for purchase"],
          ["Students", "Total registered student count in the system"],
          ["Orders", "Total orders placed across all campuses"],
          ["Active Members", "Students with current active or renewed membership"],
        ],
      },
    ],
    codeBlocks: [
      {
        language: "typescript",
        title: "Dashboard API",
        code: `GET /api/admin/get-dashboard
Authorization: Bearer <token>
Requires: admin role, UC_MAIN campus`,
      },
    ],
  };
}

function getOrganizationArticle(): DocArticle {
  return {
    id: "admin-organization",
    title: "Organization Management",
    sectionId: "admin-features",
    content: [
      "Organization Management allows administrators to manage officer accounts, membership approvals, and member records. Accessible at /admin/organization.",
    ],
    tables: [
      {
        headers: ["Function", "Route", "Required Access"],
        rows: [
          ["Search student by ID", "GET /api/admin/student_search/:id_number", "admin"],
          ["Approve membership", "POST /api/admin/approve-membership", "ADMIN or FINANCE"],
          ["Revoke all memberships", "PUT /api/admin/revoke-student", "ADMIN"],
          ["View membership history", "GET /api/admin/history", "admin"],
          ["View membership requests", "GET /api/admin/membership-request", "admin"],
          ["View all officers", "GET /api/admin/get-all-officers", "ADMIN, FINANCE, EXEC"],
          ["View all members", "GET /api/admin/get-all-members", "admin"],
          ["View suspended officers", "GET /api/admin/get-suspend-officers", "admin"],
          ["Edit officer", "POST /api/admin/edit-officer", "ADMIN"],
          ["Suspend officer", "PUT /api/admin/suspend", "ADMIN"],
          ["Restore officer", "PUT /api/admin/restore-officer", "ADMIN"],
          ["Approve role request", "PUT /api/admin/approve-role", "ADMIN"],
          ["Decline role request", "PUT /api/admin/decline-role", "ADMIN"],
          ["Add new officer", "POST /api/admin/add-officer", "ADMIN"],
          ["Approve admin account", "PUT /api/admin/approve-admin-account", "ADMIN"],
          ["Change membership price", "PUT /api/admin/change-membership-price", "ADMIN, HEAD_FINANCE, FINANCE"],
        ],
      },
    ],
  };
}

function getRecruitmentArticle(): DocArticle {
  return {
    id: "admin-recruitment",
    title: "Recruitment Management",
    sectionId: "admin-features",
    content: [
      "Recruitment Management handles the organization's hiring process: creating positions, reviewing applications, scheduling interviews, and managing applicant status. Accessible at /admin/recruitment-management.",
      "Positions can be opened in bulk. Resumes are uploaded to Cloudflare R2 as PDFs.",
    ],
    tables: [
      {
        headers: ["Function", "HTTP Method", "Auth"],
        rows: [
          ["List all positions", "GET", "Public (no auth)"],
          ["Get position by ID", "GET /positions/:id", "Public"],
          ["Create position", "POST /positions", "admin + ADMIN/FINANCE/EXEC/DEV"],
          ["Bulk open positions", "POST /positions/bulk-open", "admin + ADMIN/FINANCE/EXEC/DEV"],
          ["Update position", "PATCH /positions/:id", "admin + ADMIN/FINANCE/EXEC/DEV"],
          ["Delete position", "DELETE /positions/:id", "admin + ADMIN/FINANCE/EXEC/DEV"],
          ["Toggle hiring status", "PATCH /positions/:id/hiring-status", "admin + ADMIN/FINANCE/EXEC/DEV"],
          ["Submit application", "POST /positions/:id/applications", "student (PDF resume, rate-limited)"],
          ["View my applications", "GET /applications/me", "student"],
          ["View all applicants", "GET /applications", "admin"],
          ["Update application status", "PATCH /applications/:id/status", "admin + ADMIN/FINANCE/EXEC/DEV"],
          ["Delete application", "DELETE /applications/:id", "admin + ADMIN/FINANCE/EXEC/DEV"],
          ["Verify applicant account", "POST /applications/:id/verify", "admin + ADMIN/FINANCE/EXEC/DEV"],
          ["Schedule interview", "POST /applications/:id/interview", "admin + ADMIN/FINANCE/EXEC/DEV"],
          ["Cancel interview", "DELETE /applications/:id/interview", "admin + ADMIN/FINANCE/EXEC/DEV"],
          ["Download resume", "GET /applications/:id/resume", "admin"],
        ],
      },
    ],
  };
}

function getStudentsArticle(): DocArticle {
  return {
    id: "admin-students",
    title: "Student Management",
    sectionId: "admin-features",
    content: [
      "Student Management provides tools for looking up and viewing student profiles. Accessible at /admin/students.",
    ],
    tables: [
      {
        headers: ["Function", "HTTP Method", "Auth"],
        rows: [
          ["Student lookup by ID", "GET /api/admin/student_search/:id_number", "admin"],
          ["Get student profile", "GET /api/v2/students/profile/:id_number", "student (own) or admin"],
          ["Get student orders", "GET /api/v2/students/orders", "student (own), active membership required"],
          ["Get student refund", "GET /api/v2/students/refund/:orderId", "student (own), active membership required"],
          ["Get membership status", "GET /api/v2/students/membership-status", "student (own)"],
          ["Request membership", "PUT /api/v2/students/membership-request", "student (own)"],
        ],
      },
    ],
  };
}

function getEventsArticle(): DocArticle {
  return {
    id: "admin-events",
    title: "Event Management",
    sectionId: "admin-features",
    content: [
      "Event Management is the core feature for creating and running events. It supports event creation with images (uploaded to R2), attendee registration, QR code-based attendance tracking, raffle draws, and event statistics. Accessible at /admin/events and /admin/events/:eventId.",
      "Raffle functionality is restricted to UC_MAIN campus only.",
    ],
    tables: [
      {
        headers: ["Function", "HTTP Method", "Auth"],
        rows: [
          ["Create event (with images)", "POST /api/v2/events", "admin (multipart/form-data, max 3 images)"],
          ["Get all events", "GET /api/v2/events/get-all-event", "admin or student"],
          ["Get events raw (id+name only)", "GET /api/v2/events/get-all-events-raw", "admin"],
          ["Get my events", "GET /api/v2/events/my-events", "student (active membership required)"],
          ["Get event by ID", "GET /api/v2/events/:eventId", "admin or student"],
          ["Update event", "PATCH /api/v2/events/:eventId", "admin"],
          ["Get event attendees", "GET /api/v2/events/:eventId/attendees", "admin"],
          ["Get event statistics", "GET /api/v2/events/:eventId/statistics", "admin"],
          ["Add attendee", "POST /api/v2/events/:eventId/attendees", "admin (creates user account if needed)"],
          ["Mark attendance", "PUT /api/v2/events/:eventId/attendance/:idNumber", "admin"],
          ["Edit attendee", "PUT /api/v2/events/:eventId/attendees/:idNumber", "admin"],
          ["Change attendee password", "PUT /api/v2/events/:eventId/attendees/:idNumber/password", "admin"],
          ["Get eligible raffle participants", "GET /api/v2/events/raffle/:eventId/", "admin (UC_MAIN only)"],
          ["Draw raffle winner", "POST /api/v2/events/raffle/:eventId/draw", "admin (UC_MAIN only)"],
          ["Undo raffle winner", "POST /api/v2/events/raffle/:eventId/undo/:attendeeId", "admin (UC_MAIN only)"],
        ],
      },
    ],
    codeBlocks: [
      {
        language: "typescript",
        title: "Create Event Request",
        code: `POST /api/v2/events
Content-Type: multipart/form-data

Fields:
  title: string
  description: string
  date: string (ISO 8601)
  location: string
  capacity: number
  images: File[] (up to 3, jpeg/png/webp/gif, max 5MB each)`,
      },
    ],
  };
}

function getMerchandiseArticle(): DocArticle {
  return {
    id: "admin-merchandise",
    title: "Merchandise Management",
    sectionId: "admin-features",
    content: [
      "Merchandise Management allows admins to create, update, publish, and delete products. Products support up to 3 images stored on Cloudflare R2. Soft deletion hides products from students; hard deletion permanently removes them (daily cron job cleans up expired soft-deleted items). Accessible at /admin/merchandise/products.",
      "Promo codes can be created and managed at /admin/merchandise/promo.",
    ],
    tables: [
      {
        headers: ["Function", "HTTP Method", "Auth"],
        rows: [
          ["List all products", "GET /api/v2/merchandise/", "admin"],
          ["List active products", "GET /api/v2/merchandise/active", "admin or student"],
          ["List published products", "GET /api/v2/merchandise/retrieve-published", "admin or student"],
          ["Get product by ID", "GET /api/v2/merchandise/:id", "admin or student"],
          ["Create product", "POST /api/v2/merchandise/", "admin + ADMIN or FINANCE"],
          ["Update product", "PUT /api/v2/merchandise/update/:_id", "admin + ADMIN or FINANCE"],
          ["Soft delete product", "PUT /api/v2/merchandise/delete-soft", "admin + ADMIN or FINANCE"],
          ["Publish product", "PUT /api/v2/merchandise/publish", "admin + ADMIN or FINANCE"],
          ["Hard delete product", "DELETE /api/v2/merchandise/hard-delete", "admin + ADMIN or FINANCE"],
        ],
      },
    ],
  };
}

function getOrdersArticle(): DocArticle {
  return {
    id: "admin-orders",
    title: "Order Management",
    sectionId: "admin-features",
    content: [
      "Order Management tracks student orders, fulfillment status, and refunds. Accessible at /admin/orders. Expired orders are automatically cancelled by a monthly cron job on the 1st of each month.",
    ],
    tables: [
      {
        headers: ["Function", "HTTP Method", "Auth"],
        rows: [
          ["List all orders", "GET /api/v2/dev/orders", "admin + ADMIN or DEV"],
          ["Get order details", "GET /api/v2/dev/orders/:id", "admin + ADMIN or DEV"],
          ["Get refund queue", "GET /api/v2/dev/refunds", "admin + ADMIN or DEV"],
        ],
      },
    ],
  };
}

function getCertificatesArticle(): DocArticle {
  return {
    id: "admin-certificates",
    title: "Certificate Management",
    sectionId: "admin-features",
    content: [
      "Certificate Management allows admins to create certificate templates, configure events for certificate eligibility, upload CSV/XLSX files to mark student eligibility, and generate/download certificates as PDFs. Accessible at /admin/certificates.",
    ],
    tables: [
      {
        headers: ["Function", "HTTP Method", "Auth"],
        rows: [
          ["Get asset file tree", "GET /api/v2/certificates/assets-tree", "admin"],
          ["List active templates", "GET /api/v2/certificates/templates", "admin"],
          ["List events with certificates", "GET /api/v2/certificates/events", "admin"],
          ["Create template", "POST /api/v2/certificates/templates", "admin"],
          ["Update template", "PATCH /api/v2/certificates/templates/:templateId", "admin"],
          ["Preview template", "GET /api/v2/certificates/templates/:templateId/preview", "admin"],
          ["Configure event for certificates", "PATCH /api/v2/certificates/:eventId/configure", "admin"],
          ["Upload eligibility CSV/XLSX", "POST /api/v2/certificates/:eventId/eligibility/csv", "admin"],
          ["Mass update eligibility", "PATCH /api/v2/certificates/:eventId/eligibility", "admin"],
          ["Get event attendees raw", "GET /api/v2/certificates/:eventId/attendees-raw", "admin"],
          ["Generate certificate (student)", "GET /api/v2/certificates/:eventId/generate/:studentId", "student or admin"],
          ["Get student certificate events", "GET /api/v2/certificates/student/events", "student"],
        ],
      },
    ],
  };
}

function getReportsArticle(): DocArticle {
  return {
    id: "admin-reports",
    title: "Reports",
    sectionId: "admin-features",
    content: [
      "Reports provides aggregated analytics and exportable data for administrative decision-making. Accessible at /admin/reports. Restricted to UC_MAIN campus.",
    ],
    tables: [
      {
        headers: ["Function", "HTTP Method", "Auth"],
        rows: [
          ["Fetch reports", "GET /api/reports/", "admin (DB-check required)"],
        ],
      },
    ],
  };
}

function getSettingsArticle(): DocArticle {
  return {
    id: "admin-settings",
    title: "Settings",
    sectionId: "admin-features",
    content: [
      "Settings provides system-wide configuration: membership pricing, officer management, and account settings. Accessible at /admin/settings. Restricted to UC_MAIN campus.",
    ],
    tables: [
      {
        headers: ["Function", "HTTP Method", "Auth"],
        rows: [
          ["Get membership price", "GET /api/admin/get-membership-price", "admin"],
          ["Change membership price", "PUT /api/admin/change-membership-price", "ADMIN, HEAD_FINANCE, or FINANCE"],
          ["Get dashboard stats", "GET /api/admin/get-dashboard", "admin"],
          ["Get active membership count", "GET /api/admin/get-active-membership-count", "admin"],
          ["Get student count", "GET /api/admin/get-students-count", "admin"],
          ["Update admin access level", "PUT /api/admin/update-admin-access", "ADMIN"],
          ["Change officer password", "POST /api/admin/change-password-officer", "ADMIN"],
          ["Request role as member", "PUT /api/admin/request-role", "admin"],
          ["Get pending role requests", "GET /api/admin/get-request-role", "admin"],
        ],
      },
    ],
  };
}

function getLogsArticle(): DocArticle {
  return {
    id: "admin-logs",
    title: "Activity Logs",
    sectionId: "admin-features",
    content: [
      "Activity Logs records all significant actions taken by administrators in the system. Accessible at /admin/logs. Restricted to UC_MAIN campus.",
    ],
    tables: [
      {
        headers: ["Function", "HTTP Method", "Auth"],
        rows: [
          ["Get logs", "GET /api/v2/dev/logs", "admin + ADMIN or DEV"],
          ["Delete old logs", "DELETE /api/v2/dev/logs/old", "admin + ADMIN or DEV"],
        ],
      },
    ],
  };
}

function getDevToolsArticle(): DocArticle {
  return {
    id: "admin-devtools",
    title: "Developer Tools",
    sectionId: "admin-features",
    content: [
      "Developer Tools provides server diagnostics, operational utilities, and security monitoring. Accessible at /admin/devtools. Restricted to UC_MAIN campus and ADMIN/DEV roles only.",
      "Panels are organized into three categories: Diagnostics, Operations, and Security.",
    ],
    tables: [
      {
        headers: ["Panel", "Function", "HTTP Method"],
        rows: [
          ["Email Queue", "View pending/failed emails", "GET /api/v2/dev/email-queue"],
          ["Email Resend", "Resend a single email", "POST /api/v2/dev/email-resend/:id"],
          ["Email Export", "Export email queue as CSV", "GET /api/v2/dev/email-export"],
          ["Health", "Server health status", "GET /api/v2/dev/health"],
          ["Sessions", "View and manage sessions", "GET /api/v2/dev/sessions"],
          ["Sessions Clear", "Clear expired sessions", "DELETE /api/v2/dev/sessions/expired"],
          ["Sessions Invalidate", "Invalidate a session", "POST /api/v2/dev/sessions/invalidate"],
          ["Sessions Bulk", "Bulk invalidate sessions", "POST /api/v2/dev/sessions/invalidate-bulk"],
          ["Cron Monitor", "View cron job status", "GET /api/v2/dev/cron-status"],
          ["Trigger Cron", "Manually trigger a cron job", "POST /api/v2/dev/actions/cron"],
          ["Env Inspector", "View environment variables", "GET /api/v2/dev/env-status"],
          ["Rate Limiter", "View rate limit stats", "GET /api/v2/dev/rate-limit-stats"],
          ["DB Performance", "View MongoDB performance", "GET /api/v2/dev/db-performance"],
          ["Rebuild DB Indexes", "Rebuild collection indexes", "POST /api/v2/dev/db/rebuild-indexes"],
          ["Server Errors", "View and clear error logs", "GET /api/v2/dev/errors"],
          ["Brute Force", "View brute force attempts", "GET /api/v2/dev/brute-force-logs"],
          ["Endpoint Inventory", "List all registered API endpoints", "GET /api/v2/dev/endpoint-inventory"],
          ["Order Manager", "View and manage orders", "GET /api/v2/dev/orders"],
          ["Data Export", "Export any collection", "GET /api/v2/dev/export"],
          ["Revenue", "Membership revenue dashboard", "GET /api/v2/dev/membership-revenue"],
          ["Stock Alerts", "Low stock notifications", "GET /api/v2/dev/stock-alerts"],
          ["Certificate Templates", "View certificate templates", "GET /api/v2/dev/certificates"],
          ["Settings", "System settings overview", "GET /api/v2/dev/settings"],
          ["Refund Queue", "Pending refund requests", "GET /api/v2/dev/refunds"],
          ["Officer Access", "Manage officer accounts", "GET /api/v2/dev/officers"],
          ["Suspended Officers", "View suspended accounts", "GET /api/v2/dev/suspended"],
          ["Pending Requests", "View role request queue", "GET /api/v2/dev/pending"],
          ["Permission Matrix", "Role-permission overview", "GET /api/v2/dev/matrix"],
          ["Quick Actions", "Common admin actions", "POST /api/v2/dev/actions/*"],
          ["API Tester", "Test any endpoint interactively", "POST /api/v2/dev/test-endpoint"],
        ],
      },
    ],
  };
}

function getStudentMembershipArticle(): DocArticle {
  return {
    id: "student-membership",
    title: "Membership",
    sectionId: "student-features",
    content: [
      "Students must have an active membership to access certain features like placing orders, attending events, and generating certificates. Membership status flows through: NONE → PENDING → ACTIVE/RENEWED.",
      "Students submit a membership request via the application page. Admins review and approve or reject. Membership price can be changed by finance officers.",
    ],
    codeBlocks: [
      {
        language: "typescript",
        title: "Membership Status Flow",
        code: `MEMBERSHIP_NONE
    ↓ (student applies)
MEMBERSHIP_PENDING
    ↓ (admin approves)
MEMBERSHIP_ACTIVE / MEMBERSHIP_RENEWED
    ↓ (membership expires)
MEMBERSHIP_NONE`,
      },
    ],
  };
}

function getStudentEventsArticle(): DocArticle {
  return {
    id: "student-events",
    title: "Events (Student View)",
    sectionId: "student-features",
    content: [
      "Students can browse public events, register as attendees (which creates an account if needed), and view their attendance history. Event attendance records include QR code verification.",
    ],
  };
}

function getStudentOrdersArticle(): DocArticle {
  return {
    id: "student-orders",
    title: "Orders (Student View)",
    sectionId: "student-features",
    content: [
      "Students with active membership can browse the shop, add items to cart, place orders, and view order history. Orders expire if not paid within the configured timeframe (automatically cancelled by monthly cron).",
    ],
  };
}

function getStudentCertificatesArticle(): DocArticle {
  return {
    id: "student-certificates",
    title: "Certificates (Student View)",
    sectionId: "student-features",
    content: [
      "Students can view events for which they are eligible to receive certificates and download their certificates as PDFs. Eligibility is determined by admin-uploaded CSV/XLSX files or automatic attendee lists.",
    ],
  };
}

function getStudentAccountArticle(): DocArticle {
  return {
    id: "student-account",
    title: "Account Settings",
    sectionId: "student-features",
    content: [
      "Students can manage their profile, change password, and view personal information from the student account settings page.",
    ],
  };
}

function getPublicEventsArticle(): DocArticle {
  return {
    id: "public-events",
    title: "Events (Public View)",
    sectionId: "public-features",
    content: [
      "Public visitors can browse upcoming and past events without logging in. Event details including images, dates, and descriptions are visible to everyone.",
    ],
  };
}

function getPublicShopArticle(): DocArticle {
  return {
    id: "public-shop",
    title: "Shop (Public View)",
    sectionId: "public-features",
    content: [
      "The shop is accessible to the public for browsing merchandise. However, adding items to cart and placing orders requires an active student membership. Products are filtered by published status.",
    ],
  };
}

function getPublicResourcesArticle(): DocArticle {
  return {
    id: "public-resources",
    title: "Resources",
    sectionId: "public-features",
    content: [
      "The Resources page provides general information about PSITS organization, events, and activities to the public.",
    ],
  };
}

function getApiOverviewArticle(): DocArticle {
  return {
    id: "api-overview",
    title: "API Overview",
    sectionId: "api",
    content: [
      "All API endpoints follow REST conventions and return JSON responses. The base URL is determined by the deployment environment (localhost:5000 for development, the production domain for live).",
      "All protected endpoints require an Authorization header: Bearer <access_token>.",
      "Error responses follow a consistent shape: { success: false, message: '...', error?: '...' }",
    ],
    tables: [
      {
        headers: ["Prefix", "Purpose"],
        rows: [
          ["/api/v2/auth", "Authentication (login, register, refresh, logout)"],
          ["/api/admin", "Admin operations (membership, officers, dashboard)"],
          ["/api/v2/students", "Student-specific operations"],
          ["/api/v2/events", "Event management (v2)"],
          ["/api/v2/merchandise", "Merchandise management (v2)"],
          ["/api/v2/recruitment", "Recruitment management"],
          ["/api/v2/dev", "Developer tools and diagnostics"],
          ["/api/v2/certificates", "Certificate management"],
          ["/api/reports", "Report generation"],
          ["/api/orders", "Order operations"],
          ["/api/cart", "Cart operations"],
          ["/api/promo", "Promo code management"],
          ["/api/logs", "Activity logs"],
          ["/api/docs", "Documentation entries (CRUD for admin)"],
        ],
      },
    ],
  };
}

function getApiAuthArticle(): DocArticle {
  return {
    id: "api-auth",
    title: "Auth API Endpoints",
    sectionId: "api",
    content: [
      "Authentication endpoints handle user login, registration, token refresh, and logout.",
    ],
    tables: [
      {
        headers: ["Method", "Endpoint", "Description"],
        rows: [
          ["POST", "/api/v2/auth/login", "Authenticate with id_number + password"],
          ["POST", "/api/v2/auth/refresh", "Issue new access token from refresh cookie"],
          ["POST", "/api/v2/auth/logout", "Clear refresh cookie"],
          ["POST", "/api/v2/auth/signup", "Register new student account"],
          ["POST", "/api/login", "Legacy v1 login"],
          ["POST", "/api/register", "Legacy v1 registration"],
          ["POST", "/api/student/forgot-password", "Request password reset"],
          ["POST", "/api/student/reset-password/:token", "Reset password with token"],
        ],
      },
    ],
  };
}

function getApiAdminArticle(): DocArticle {
  return {
    id: "api-admin",
    title: "Admin API Endpoints",
    sectionId: "api",
    content: ["Admin API endpoints for officer management, membership, and dashboard statistics."],
    tables: [
      {
        headers: ["Method", "Endpoint", "Description"],
        rows: [
          ["GET", "/api/admin/student_search/:id_number", "Search student by ID number"],
          ["GET", "/api/admin/get-dashboard", "Dashboard statistics"],
          ["GET", "/api/admin/get-active-membership-count", "Active membership count"],
          ["GET", "/api/admin/get-students-count", "Total student count"],
          ["GET", "/api/admin/get-all-officers", "List all officer accounts"],
          ["GET", "/api/admin/get-all-members", "List all members"],
          ["GET", "/api/admin/get-suspend-officers", "List suspended officers"],
          ["GET", "/api/admin/get-membership-price", "Current membership price"],
          ["GET", "/api/admin/history", "Membership history"],
          ["GET", "/api/admin/membership-request", "Pending membership requests"],
          ["POST", "/api/admin/approve-membership", "Approve a membership request"],
          ["POST", "/api/admin/edit-officer", "Edit officer details"],
          ["POST", "/api/admin/change-password-officer", "Change officer password"],
          ["POST", "/api/admin/add-officer", "Create new officer account"],
          ["PUT", "/api/admin/revoke-student", "Revoke all student memberships"],
          ["PUT", "/api/admin/suspend", "Suspend an officer account"],
          ["PUT", "/api/admin/restore-officer", "Restore a suspended officer"],
          ["PUT", "/api/admin/role-remove", "Remove member role"],
          ["PUT", "/api/admin/request-role", "Request admin role as member"],
          ["PUT", "/api/admin/get-request-role", "Get pending role requests"],
          ["PUT", "/api/admin/approve-role", "Approve a role request"],
          ["PUT", "/api/admin/decline-role", "Decline a role request"],
          ["PUT", "/api/admin/approve-admin-account", "Approve new admin account"],
          ["PUT", "/api/admin/decline-admin-account", "Decline new admin account"],
          ["PUT", "/api/admin/update-admin-access", "Update officer access level"],
          ["PUT", "/api/admin/change-membership-price", "Update membership price"],
        ],
      },
    ],
  };
}

function getApiStudentsArticle(): DocArticle {
  return {
    id: "api-students",
    title: "Students API Endpoints",
    sectionId: "api",
    content: ["Student-specific API endpoints for profiles, membership, and orders."],
    tables: [
      {
        headers: ["Method", "Endpoint", "Description"],
        rows: [
          ["GET", "/api/v2/students/profile/:id_number", "Get student profile"],
          ["GET", "/api/v2/students/membership-status", "Get own membership status"],
          ["PUT", "/api/v2/students/membership-request", "Submit membership request"],
          ["GET", "/api/v2/students/orders", "Get own orders (membership required)"],
          ["GET", "/api/v2/students/refund/:orderId", "Request refund (membership required)"],
        ],
      },
    ],
  };
}

function getApiEventsArticle(): DocArticle {
  return {
    id: "api-events",
    title: "Events API Endpoints",
    sectionId: "api",
    content: ["Event management API endpoints for creation, attendance, and raffles."],
    tables: [
      {
        headers: ["Method", "Endpoint", "Description"],
        rows: [
          ["POST", "/api/v2/events", "Create event with images"],
          ["GET", "/api/v2/events/get-all-event", "Get all events"],
          ["GET", "/api/v2/events/get-all-events-raw", "Get events (id+name only)"],
          ["GET", "/api/v2/events/my-events", "Get my attended events"],
          ["GET", "/api/v2/events/:eventId", "Get event by ID"],
          ["PATCH", "/api/v2/events/:eventId", "Update event"],
          ["GET", "/api/v2/events/:eventId/attendees", "Get event attendees"],
          ["GET", "/api/v2/events/:eventId/statistics", "Get event statistics"],
          ["POST", "/api/v2/events/:eventId/attendees", "Add attendee"],
          ["PUT", "/api/v2/events/:eventId/attendance/:idNumber", "Mark attendance"],
          ["PUT", "/api/v2/events/:eventId/attendees/:idNumber", "Edit attendee"],
          ["PUT", "/api/v2/events/:eventId/attendees/:idNumber/password", "Change attendee password"],
          ["GET", "/api/v2/events/raffle/:eventId/", "Get raffle-eligible attendees"],
          ["POST", "/api/v2/events/raffle/:eventId/draw", "Draw raffle winner"],
          ["POST", "/api/v2/events/raffle/:eventId/undo/:attendeeId", "Undo raffle winner"],
        ],
      },
    ],
  };
}

function getApiMerchandiseArticle(): DocArticle {
  return {
    id: "api-merchandise",
    title: "Merchandise API Endpoints",
    sectionId: "api",
    content: ["Merchandise management API endpoints for products and promotions."],
    tables: [
      {
        headers: ["Method", "Endpoint", "Description"],
        rows: [
          ["GET", "/api/v2/merchandise/", "List all products"],
          ["GET", "/api/v2/merchandise/active", "List active products"],
          ["GET", "/api/v2/merchandise/retrieve-published", "List published products"],
          ["GET", "/api/v2/merchandise/:id", "Get product by ID"],
          ["POST", "/api/v2/merchandise/", "Create product (multipart)"],
          ["PUT", "/api/v2/merchandise/update/:_id", "Update product"],
          ["PUT", "/api/v2/merchandise/delete-soft", "Soft delete product"],
          ["PUT", "/api/v2/merchandise/publish", "Publish product"],
          ["DELETE", "/api/v2/merchandise/hard-delete", "Hard delete product"],
        ],
      },
    ],
  };
}

function getApiOrdersArticle(): DocArticle {
  return {
    id: "api-orders",
    title: "Orders API Endpoints",
    sectionId: "api",
    content: ["Order management API endpoints."],
    tables: [
      {
        headers: ["Method", "Endpoint", "Description"],
        rows: [
          ["GET", "/api/orders/", "List orders"],
          ["GET", "/api/orders/:id", "Get order details"],
          ["POST", "/api/orders/", "Create order"],
          ["PUT", "/api/orders/:id", "Update order"],
        ],
      },
    ],
  };
}

function getApiCertificatesArticle(): DocArticle {
  return {
    id: "api-certificates",
    title: "Certificates API Endpoints",
    sectionId: "api",
    content: ["Certificate template and generation API endpoints."],
    tables: [
      {
        headers: ["Method", "Endpoint", "Description"],
        rows: [
          ["GET", "/api/v2/certificates/assets-tree", "Get asset file tree"],
          ["GET", "/api/v2/certificates/templates", "List templates"],
          ["GET", "/api/v2/certificates/events", "List events with certificates"],
          ["POST", "/api/v2/certificates/templates", "Create template"],
          ["PATCH", "/api/v2/certificates/templates/:templateId", "Update template"],
          ["GET", "/api/v2/certificates/templates/:templateId/preview", "Preview template"],
          ["PATCH", "/api/v2/certificates/:eventId/configure", "Configure event certificates"],
          ["POST", "/api/v2/certificates/:eventId/eligibility/csv", "Upload eligibility CSV/XLSX"],
          ["PATCH", "/api/v2/certificates/:eventId/eligibility", "Mass update eligibility"],
          ["GET", "/api/v2/certificates/:eventId/attendees-raw", "Get event attendees raw"],
          ["GET", "/api/v2/certificates/:eventId/generate/:studentId", "Generate certificate PDF"],
          ["GET", "/api/v2/certificates/student/events", "Get student's certificate events"],
        ],
      },
    ],
  };
}

function getApiDevToolsArticle(): DocArticle {
  return {
    id: "api-devtools",
    title: "DevTools API Endpoints",
    sectionId: "api",
    content: ["Developer tools and server diagnostics API. All endpoints require ADMIN or DEV access level."],
    tables: [
      {
        headers: ["Method", "Endpoint", "Description"],
        rows: [
          ["GET", "/api/v2/dev/health", "Server health check"],
          ["GET", "/api/v2/dev/sessions", "List active sessions"],
          ["DELETE", "/api/v2/dev/sessions/expired", "Clear expired sessions"],
          ["POST", "/api/v2/dev/sessions/invalidate", "Invalidate a session"],
          ["POST", "/api/v2/dev/sessions/invalidate-bulk", "Bulk invalidate sessions"],
          ["GET", "/api/v2/dev/email-queue", "Email queue status"],
          ["POST", "/api/v2/dev/email-resend/:id", "Resend single email"],
          ["GET", "/api/v2/dev/email-export", "Export email queue CSV"],
          ["GET", "/api/v2/dev/cron-status", "Cron job status"],
          ["POST", "/api/v2/dev/actions/cron", "Trigger cron manually"],
          ["GET", "/api/v2/dev/env-status", "Environment variables"],
          ["GET", "/api/v2/dev/rate-limit-stats", "Rate limit statistics"],
          ["GET", "/api/v2/dev/rate-limit-violations", "Rate limit violations"],
          ["GET", "/api/v2/dev/db-performance", "Database performance"],
          ["POST", "/api/v2/dev/db/rebuild-indexes", "Rebuild DB indexes"],
          ["GET", "/api/v2/dev/logs", "Activity logs"],
          ["DELETE", "/api/v2/dev/logs/old", "Delete old logs"],
          ["GET", "/api/v2/dev/errors", "Server error log"],
          ["DELETE", "/api/v2/dev/errors", "Clear error log"],
          ["GET", "/api/v2/dev/brute-force-logs", "Brute force attempts"],
          ["GET", "/api/v2/dev/endpoint-inventory", "API endpoint inventory"],
          ["POST", "/api/v2/dev/test-endpoint", "Test any endpoint"],
          ["GET", "/api/v2/dev/orders", "Order manager"],
          ["GET", "/api/v2/dev/orders/:id", "Order details"],
          ["GET", "/api/v2/dev/export", "Export collection data"],
          ["GET", "/api/v2/dev/membership-revenue", "Revenue dashboard"],
          ["GET", "/api/v2/dev/stock-alerts", "Low stock alerts"],
          ["GET", "/api/v2/dev/settings", "System settings"],
          ["GET", "/api/v2/dev/certificates", "Certificate templates"],
          ["GET", "/api/v2/dev/refunds", "Refund queue"],
          ["GET", "/api/v2/dev/officers", "Officer access management"],
          ["GET", "/api/v2/dev/suspended", "Suspended officers"],
          ["GET", "/api/v2/dev/pending", "Pending role requests"],
          ["GET", "/api/v2/dev/matrix", "Permission matrix"],
        ],
      },
    ],
  };
}

function getApiRecruitmentArticle(): DocArticle {
  return {
    id: "api-recruitment",
    title: "Recruitment API Endpoints",
    sectionId: "api",
    content: ["Recruitment management API for positions and applications."],
    tables: [
      {
        headers: ["Method", "Endpoint", "Description"],
        rows: [
          ["GET", "/api/v2/recruitment/positions", "List all positions"],
          ["GET", "/api/v2/recruitment/positions/:id", "Get position by ID"],
          ["POST", "/api/v2/recruitment/positions", "Create position"],
          ["POST", "/api/v2/recruitment/positions/bulk-open", "Bulk open positions"],
          ["PATCH", "/api/v2/recruitment/positions/:id", "Update position"],
          ["DELETE", "/api/v2/recruitment/positions/:id", "Delete position"],
          ["PATCH", "/api/v2/recruitment/positions/:id/hiring-status", "Toggle hiring status"],
          ["POST", "/api/v2/recruitment/positions/:id/applications", "Submit application"],
          ["GET", "/api/v2/recruitment/applications/me", "My applications"],
          ["GET", "/api/v2/recruitment/applications/me/:id", "My application detail"],
          ["GET", "/api/v2/recruitment/applications", "All applicants"],
          ["GET", "/api/v2/recruitment/applications/:id", "Application details"],
          ["PATCH", "/api/v2/recruitment/applications/:id/status", "Update status"],
          ["DELETE", "/api/v2/recruitment/applications/:id", "Delete application"],
          ["POST", "/api/v2/recruitment/applications/:id/verify", "Verify applicant account"],
          ["POST", "/api/v2/recruitment/applications/:id/interview", "Schedule interview"],
          ["PATCH", "/api/v2/recruitment/applications/:id/interview", "Update interview"],
          ["DELETE", "/api/v2/recruitment/applications/:id/interview", "Cancel interview"],
          ["GET", "/api/v2/recruitment/applications/:id/resume", "Download resume"],
          ["GET", "/api/v2/recruitment/applications/:id/resume-url", "Get resume URL"],
        ],
      },
    ],
  };
}

function getCronJobsArticle(): DocArticle {
  return {
    id: "cron-jobs",
    title: "Scheduled Cron Jobs",
    sectionId: "infrastructure",
    content: [
      "The backend runs several background tasks via node-cron on Asia/Manila timezone:",
    ],
    tables: [
      {
        headers: ["Schedule", "Job", "Description"],
        rows: [
          ["Daily at midnight", "Promo check", "Expiring promo codes"],
          ["Daily at 1:00 AM", "Email resend", "Resend failed pending emails"],
          ["1st of month at 1:00 AM", "Cancel expired orders", "Auto-cancel unpaid orders"],
          ["Daily at 2:00 AM", "Merch cleanup", "Hard-delete expired soft-deleted products"],
        ],
      },
    ],
    codeBlocks: [
      {
        language: "typescript",
        title: "Cron Definition Example",
        code: `import cron from "node-cron";

cron.schedule("0 0 * * *", async () => {
  // Runs daily at midnight
  await checkPromos();
}, { timezone: "Asia/Manila" });`,
      },
    ],
  };
}

function getStorageArticle(): DocArticle {
  return {
    id: "file-storage",
    title: "File Storage",
    sectionId: "infrastructure",
    content: [
      "All user-uploaded files (event images, merchandise photos, recruitment resumes) are stored on Cloudflare R2, an S3-compatible object storage service.",
      "File paths follow the pattern: {domain}/{timestamp}_{random}{extension}. This prevents filename collisions and ensures cache-busting on updates.",
      "Maximum file size: 5MB per image. Allowed image formats: JPEG, PNG, WebP, GIF. Resumes: PDF only.",
    ],
    tables: [
      {
        headers: ["Domain", "File Types", "Max Size"],
        rows: [
          ["events/", "Images (jpeg/png/webp/gif)", "5MB each, max 3 per event"],
          ["merchandise/", "Images (jpeg/png/webp/gif)", "5MB each, max 3 per product"],
          ["recruitment/{positionId}/resume/", "PDF only", "5MB each"],
        ],
      },
    ],
  };
}

function getEmailArticle(): DocArticle {
  return {
    id: "email-system",
    title: "Email System",
    sectionId: "infrastructure",
    content: [
      "Emails are sent via Resend. The system handles transactional emails for password reset, membership approval notifications, and event announcements.",
      "Failed emails are queued and automatically retried by the daily 1 AM cron job. Admins can view the email queue and trigger individual resends from DevTools.",
    ],
    tables: [
      {
        headers: ["Email Type", "Trigger"],
        rows: [
          ["Password reset", "Student requests forgot password"],
          ["Membership approved/rejected", "Admin approves or rejects membership request"],
          ["New officer created", "Admin creates a new officer account"],
          ["Role request approved", "Admin approves a role request"],
          ["Event announcement", "Admin creates or updates an event (optional)"],
        ],
      },
    ],
  };
}

function getRateLimitingArticle(): DocArticle {
  return {
    id: "rate-limiting",
    title: "Rate Limiting",
    sectionId: "infrastructure",
    content: [
      "Rate limiting is applied to sensitive endpoints to prevent abuse:",
    ],
    tables: [
      {
        headers: ["Endpoint", "Limit", "Window"],
        rows: [
          ["POST /api/login", "5 requests", "15 minutes per IP"],
          ["POST /api/v2/auth/login", "5 requests", "15 minutes per IP"],
          ["POST /api/register", "3 requests", "15 minutes per IP"],
          ["POST /api/v2/auth/signup", "3 requests", "15 minutes per IP"],
          ["POST /positions/:id/applications", "3 submissions", "1 hour per student"],
        ],
      },
    ],
  };
}

function getCampusSystemArticle(): DocArticle {
  return {
    id: "campus-system",
    title: "Campus System",
    sectionId: "infrastructure",
    content: [
      "PSITS operates across five campuses. The campus system controls data visibility and feature access:",
    ],
    tables: [
      {
        headers: ["Campus Code", "Campus Name"],
        rows: [
          ["UC_MAIN", "Cebu City (Main Campus)"],
          ["UC_BANILAD", "Banilad Campus"],
          ["UC_LM", "Lahug-Mandurriao Campus"],
          ["UC_PT", "Pardo-Tuao Campus"],
          ["UC_JONES", "Jones Avenue Campus"],
        ],
      },
    ],
    codeBlocks: [
      {
        language: "typescript",
        title: "Campus-Restricted Routes",
        code: `// These admin routes are restricted to UC_MAIN only:
/admin/dashboard
/admin/organization
/admin/students
/admin/reports
/admin/orders
/admin/settings
/admin/merchandise/promo
/admin/logs
/admin/devtools
/admin/events/:eventId/raffle`,
      },
    ],
  };
}

export const documentationData = {
  sections: documentationSections,
};
