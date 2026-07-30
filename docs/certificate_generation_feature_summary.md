# Certificate Generation Feature - Implementation Summary

## Overview
This document summarizes the architectural decisions and implementation details for the automated Certificate Generation feature, which allows admins to manage and issue PDF certificates to eligible event attendees, and students to download them.

## 1. Plan Review & Architecture
- **Rating:** The original plan was highly rated for its clear distinction between Admin and Student flows, and its use of CSV checking over blind imports.
- **PDF Generation Engine:** The feature leverages the existing `generatePDFFromEJS` utility, which securely converts `.ejs` files to HTML and offloads PDF rendering to Puppeteer/Browserless.

## 2. Database & Data Modeling Updates
- **Event Model Updated:** 
  - Added `isGenerateCertificate` (Boolean) to flag if an event issues certificates.
  - Added `certificateTemplate` (ObjectId ref) to link the event to a specific template.
  - Added `eligibleStudentsForCertificate` (Array of Strings) to hold student ID numbers of eligible attendees.
  - *Note:* Queries were updated to match by the custom `eventId` field rather than MongoDB's native `_id`.
- **CertificateTemplate Model Created:**
  - Designed to act as a configuration wrapper for physical `.ejs` templates.
  - Stores the `ejsRelativePath` (e.g., `"templates/certificates/certificate.ejs"`).
  - Contains default signees, images, and fonts using MongoDB `Map` types.
  - *Location:* `server-side/src/models/certificateTemplate.model.ts`

## 3. Business Logic (Services)
- **Service Layer (`certificateV2.service.ts`):** Created to keep controllers thin. Handles:
  - `getAllActiveTemplates`, `createCertificateTemplate`, `updateCertificateTemplate` (Allows editing of existing templates).
  - `previewTemplate`: Injects fallback dummy data (e.g., "John Doe", "Sample Event") into an EJS template to render a preview PDF, bypassing potential EJS `ReferenceError` crashes. Handled TypeScript casting (TS2769) to safely convert Mongoose `Map` objects for `Object.fromEntries()`.
  - `configureEventCertificate`
  - `processCsvEligibility`: Cross-references uploaded CSV student IDs against the actual `Event.attendees` array using a fast `Set` lookup.
  - `updateStudentEligibility`: Handles `$addToSet` and `$pullAll` operations.
  - `verifyAndGenerateStudentCertificate`: Verifies student eligibility and pipes the data into the PDF generation function.

## 4. Controllers & Routes
- **Controller Layer (`certificateV2.controller.ts`):** 
  - Implemented using **standalone function exports** (e.g., `export const getAllActiveTemplates = ...`) to favor functional programming, easier unit testing, and tree-shaking over class-based designs.
  - Includes lightweight logic to parse incoming CSV files from memory buffers using `req.file.buffer.toString()`.
  - Safely streams raw `Buffer` payloads back to the client for PDF previews without serialization issues.
- **Routing (`certificateV2.route.ts`):** 
  - Routes were fully secured using V2 authentication middlewares.
  - **Admin/Dev Endpoints:** Protected with `requireAccessTokenV2` and `roleAuthenticateV2(["admin"])` (Template management, Event Configuration, CSV Upload, Edit, Preview).
  - **Student Endpoints:** Protected with `roleAuthenticateV2(["student", "admin"])` to allow students to download their personal generated PDFs.

## 5. File Naming Conventions
- To adhere to the project's existing v2 authentication architecture:
  - The Service, Controller, and Route files were explicitly named with a **V2 suffix** (e.g., `certificateV2.route.ts`).
  - The database models and interfaces were kept as **non-V2** (`certificateTemplate.model.ts`) to maintain clean database schema naming conventions.

## 6. Frontend Implementation (Admin Dashboard)
- **Feature Organization:** Created a new `certificate` feature slice inside `client-side-ts/src/features/certificate`.
  - **API:** `certificate.api.ts` connects to the V2 backend endpoints. Uses `import type` exclusively for interfaces to avoid Vite compiler issues. Handles safe binary PDF downloads via Axios `responseType: "arraybuffer"`.
  - **Types:** `certificate.types.ts` mirrors the backend schemas (`ICertificateTemplate`, responses, payloads). Updated global `Event` interface to match new fields (`isGenerateCertificate`, etc.).
- **Dashboard UI (`CertificateDashboard.tsx`):**
  - Integrated into `CertificatesPage.tsx` under `/admin/certificates`.
  - Added to the Sidebar under a "Certificates" navigation tab using the `Award` icon.
  - Replaced default `shadcn/ui` tabs with custom button-based tab switching to maintain visual consistency with other admin dashboards (e.g., `OrganizationView.tsx`).
  - Partitioned into two main views:
    - **Events Tab (`EventsTab.tsx`):** Fetches both all events and events configured for certificates. Displays them in separate grid sections ("Events with Certificates" vs "Other Events").
    - **Templates Tab (`TemplatesTab.tsx`):** Displays all active templates from the database. Includes dynamic **Preview** and **Edit** buttons.
    - **Create/Edit Template Flow (`CreateTemplateDialog.tsx`):** Provides a modal form to create a new template or edit an existing one. Includes dynamic array state handling for `Signees`, `Images`, and `Fonts`. Form input placeholders were explicitly clarified (e.g., E-Signature mapping uses string keys, not direct URLs, corresponding to EJS logic). Dialog submit button text dynamically switches from `"Create Template"` to `"Finish Editing"` when in edit mode.

## 7. Frontend Implementation (Event Certificate Management & Eligibility Workflows)
- **Events Tab & Event Image Display (`EventsTab.tsx`):**
  - Updated event card rendering to display event images (`eventImage`) alongside event details.
  - Integrated skeleton card loaders (`Skeleton` components) during initial data fetching for smooth loading states.
- **Student Eligibility Management View (`EventCertificateManagementView.tsx`):**
  - Displays event attendees with search filtering, selection checkboxes, and eligibility status badges (`Eligible` vs `Not Eligible`).
  - Added skeleton table row loaders matching `StudentsView.tsx` loading patterns.
  - Student names are automatically formatted in **Title Case** (`toTitleCase` utility), including hyphenated names.
  - **Batch Eligibility Controls (`Eligibilize` / `Uneligibilize` Buttons):**
    - Wired to update student eligibility via `updateStudentEligibility` backend API (`certificate.api.ts`).
    - Accurate Badge Counts & Targeting: The **Eligibilize** button displays only the count of selected students who are *not yet eligible* (`selectedIneligibleCount`), while the **Uneligibilize** button displays only the count of selected students who are *currently eligible* (`selectedEligibleCount`). Buttons disable automatically when their respective action count is zero.
    - Optimized Payload: `handleUpdateEligibility` filters and sends only the affected subset of student IDs (`targetIds`) to the backend.
  - **Table Row Accessibility & Clickability:**
    - Entire student table rows (`<tr>`) are clickable (`cursor-pointer`) to toggle row selection.
    - Added WAI-ARIA accessibility attributes (`role="checkbox"`, `aria-checked`, `tabIndex={0}`) and keyboard event handling (`Enter` and `Space` keys) for full accessibility.
    - Added `stopPropagation` on checkbox cells so clicking a checkbox directly toggles selection once without conflicting with the row click handler.

## 8. App-Wide Toast & Notification Polish (`sonner.tsx` & Layouts)
- **Admin Toast Container Mounting:**
  - Diagnosed missing toast feedback on admin views: Sonner's `<Toaster />` was previously only mounted inside `MainLayout.tsx` (student routes).
  - Mounted `<Toaster position="bottom-right" />` in `AdminLayout.tsx` and aligned `MainLayout.tsx` to `"bottom-right"` for consistent bottom-right notifications app-wide.
- **Opaque Toast Styling & Rich Colors (`components/ui/sonner.tsx`):**
  - Fixed transparent toast backgrounds caused by unset CSS variables (`--popover`, `--border`, `--radius` without definitions in `index.css`).
  - Added solid hex color fallbacks (`#ffffff`, `#09090b`, `#e4e4e7`, `#ef4444`, etc.) and enabled `richColors={true}` with explicit `toastOptions` styles (`background: #ffffff`, text `#09090b`, border `#e4e4e7`) so loading, success, and error toasts render with crisp, opaque backgrounds and rich status colors.

## 9. Recent Refinements (Global Sorting, Excel Parsing & Verification Flows)
- **Global Server-Side Sorting:**
  - Refactored the `getEventAttendeesRaw` backend controller to accept `sortBy` and `sortOrder` query options, sorting the full filtered attendee array before paginating.
  - Linked this to `EventCertificateManagementView.tsx`, updating the table headers with interactive click bindings, hover states, and dynamic Lucide sort icons (`ArrowUpDown`, `ChevronUp`, `ChevronDown`). Added a **Reset Sort (X)** button to quickly clear active sorting parameters.
- **Excel & Binary File Upload Parsing (.xlsx / .xls):**
  - Installed SheetJS (`xlsx`) library on the backend and refactored the file parsing controller as `processCsvOrXlsxEligibility`.
  - Added mime-type and file-extension detection, utilizing SheetJS to parse binary workbook buffers and read rows from the first sheet (extracting column 0 for student IDs).
- **Import Verification Dialog Flow:**
  - Extended the backend service to lookup and return student names for matched ID records in the uploaded spreadsheet.
  - Created a **Verify Imported Students** confirmation dialog modal in the frontend listing all parsed rows, title-casing names, and displaying color-coded status badges (`Valid Attendee` / `Not Registered`).
  - Added a search input within the dialog modal to filter verification records dynamically.
  - Added UI locking (disabling footer buttons and preventing backdrop/close interaction) while the API transaction is saving.
  - Configured successful import to auto-refetch the attendee table and toast green/red custom background alerts.
- **Guidelines Tooltip:**
  - Added a hoverable tooltip help indicator next to the import button displaying guidelines on spreadsheet column formatting (IDs in column 0) and campus branch suffix rules (e.g. `-ucpt` for Talisay branch, none for Main).

**Status:** Admin modules are fully completed. The student module (personal certificate download page and certificate verification views) is next to be implemented.
