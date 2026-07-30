# Design System

## Overview

### Purpose

The design system for PSITS (Philippine Society of Information Technology Students, UC Main) web platform ensures a consistent, accessible, and community-first user experience. It provides a shared vocabulary for developers and designers to build robust features including merchandise management, event handling, and student profiles.

### Design Philosophy

- Clarity over decoration
- Consistency over novelty
- Accessibility by default
- Content first
- Predictable interactions
- Clean, modern interfaces with subtle interactive cues

---

# Core Principles

## Visual Principles

- **Simplicity**: Avoid unnecessary decorative elements.
- **Hierarchy**: Use typography and color weight to guide the user's eye.
- **Contrast**: Maintain high contrast for readability, particularly in interactive elements.
- **Whitespace**: Utilize generous spacing to reduce cognitive load.

## UX Principles

- **Predictable interactions**: Standardized behaviors for forms and navigation.
- **Immediate feedback**: Toast notifications and clear loading states for all actions.
- **Forgiving interfaces**: Clear error messages and validation before submission.
- **Keyboard first**: Accessible navigation for all interactive components.

---

# Brand

## Personality

- Professional
- Welcoming
- Confident
- Student-centric

## Voice

- Clear
- Direct
- Helpful
- Encouraging

---

# Design Tokens

## Color

### Primitive Colors

**Primary Scale (Blue)**
- Primary 50: `#e8f5fc`
- Primary 100: `#b9e1f5`
- Primary 200: `#97d2f0`
- Primary 300: `#67bde9`
- Primary 400: `#49b1e5`
- Primary 500: `#1c9dde`
- Primary 600: `#198fca`
- Primary 700: `#146f9e`
- Primary 800: `#0f567a`
- Primary 900: `#0c425d`

**Neutral Scale**
- Light: `#fefefe`
- Light Active: `#fcfcfc`
- Normal: `#f5f5f5`
- Normal Hover: `#dddddd`
- Normal Active: `#c4c4c4`
- Dark: `#b8b8b8`
- Dark Hover: `#939393`
- Dark Active: `#6e6e6e`
- Darker: `#565656`

### Semantic Colors

- **Primary**: `#1c9dde` (Primary 500)
- **Primary Foreground**: `#ffffff`
- **Secondary**: `#f5f5f5` (Normal)
- **Secondary Foreground**: `#565656` (Darker)
- **Success**: `#0bd444`
- **Danger/Destructive**: `#f43f5e`
- **Warning**: `#f59e0b`
- **Muted**: `#f5f5f5` (Normal)
- **Muted Foreground**: `#b8b8b8` (Dark)
- **Accent**: `#e8f5fc` (Primary 50)
- **Accent Foreground**: `#146f9e` (Primary 700)
- **Background**: `#ffffff`
- **Foreground**: `#121212`
- **Card**: `#ffffff`
- **Card Foreground**: `#121212`
- **Popover**: `#ffffff`
- **Popover Foreground**: `#121212`
- **Border**: `#dddddd` (Normal Hover)
- **Input**: `#f5f5f5` (Normal)
- **Ring**: `#67bde9` (Primary 300)

### Dark Theme

The application is primarily designed for a light theme. A dark theme configuration exists primarily for the Sidebar components using CSS class-based toggling (`.dark`), but is not fully propagated through the semantic token palette. 
- `--sidebar`: `hsl(240 5.9% 10%)`
- `--sidebar-foreground`: `hsl(240 4.8% 95.9%)`
- `--sidebar-primary`: `hsl(224.3 76.3% 48%)`
- `--sidebar-border`: `hsl(240 3.7% 15.9%)`

---

## Typography

### Font Families

- **Heading/Body**: Switzer, Inter, ui-sans-serif, system-ui, sans-serif
- **Monospace**: JetBrains Mono, ui-monospace, SFMono-Regular, monospace

### Font Sizes (Tailwind Scale)

- **h1 / .heading-1**: text-5xl (48px)
- **h2 / .heading-2**: text-4xl (36px)
- **h3 / .heading-3**: text-2xl (24px)
- **.sub-heading**: text-lg (18px)
- **.body-text**: text-base (16px)
- **.info-text / small**: text-sm (14px) / text-xs (12px)

### Font Weights

- Regular: 400
- Medium: 500
- Semi-bold: 600
- Bold: 700

### Line Heights

- **Headings**: tracking-tight, tight line height
- **Body Text**: leading-relaxed (1.625)

### Letter Spacing

- **Headings**: tracking-tight (-0.025em)

---

## Spacing

Uses standard Tailwind CSS 4px scale.

```
0   (0px)
0.5 (2px)
1   (4px)
1.5 (6px)
2   (8px)
2.5 (10px)
3   (12px)
4   (16px)
5   (20px)
6   (24px)
8   (32px)
10  (40px)
12  (48px)
16  (64px)
```

**Rules for padding and margins:**
- Page padding: `px-4 py-6` or `p-6`
- Component gaps: Typically `gap-4` for structural elements, `gap-2` for tight groupings.

---

## Radius

- **Small (sm)**: 4px
- **Medium (md)**: 6px
- **Large (lg)**: 8px
- **Extra Large (xl)**: 12px
- **2XL (2xl)**: 16px
- **Pill**: 9999px (Used for rounded-full buttons and badges)

---

## Shadows

Uses Tailwind's default shadow utilities. No custom elevation tokens.
- **Elevation 1 (shadow-sm)**: Subtle shadow for buttons and inputs.
- **Elevation 2 (shadow)**: Standard cards.
- **Elevation 3 (shadow-lg)**: Dropdowns, dialogs, and elevated cards.

---

## Borders

- **Widths**: 1px (`border`), 2px (`border-2`)
- **Styles**: Solid (`border-solid`), Dashed (`border-dashed` used in Empty states)
- **Dividers**: Handled via `divide-y` or `border-b` with `--color-border`.

---

# Layout

- **Grid system**: Tailwind grid utilities (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`)
- **Container widths**: Responsive `.container` class (`mx-auto px-4`), max-width constraints on individual sections (e.g., `max-w-7xl`).
- **Responsive breakpoints**: 
  - sm: 640px
  - md: 768px
  - lg: 1024px
  - xl: 1280px
  - 2xl: 1536px
- **Columns**: Context-dependent (usually 1, 2, or 3 columns).
- **Gutters**: `gap-4` or `gap-6`
- **Safe areas**: Handled via standard padding.

---

# Responsive Design

- **Mobile (default)**: Single column layouts, stacked navigation (sheet/drawer based).
- **Tablet (md)**: Introduction of multi-column layouts.
- **Desktop (lg)**: Horizontal navigation, expanded sidebars.
- **Large Desktop (xl)**: Expanded padding (`py-28`), constrained maximum widths.

**Rules for adapting layouts:**
Mobile-first approach. Use responsive prefixes (`md:`, `lg:`) to enhance layouts for larger screens.

---

# Components

Based on shadcn/ui components (`src/components/ui/`) extended with Tailwind.

## Buttons

- **Variants**: default (primary), secondary, destructive, outline, ghost, link. 
- **States**: hover, focus-visible (ring), disabled (opacity-50, pointer-events-none).
- **Sizes**: default (h-9), sm (h-8), lg (h-10), icon, icon-sm, icon-lg.
- **Usage**: Primary actions use `default`. Destructive actions require confirmation.
- **Accessibility**: Focus rings clearly visible (`focus-visible:ring-ring`).

## Inputs

- **Variants**: Standard text input, Textarea, Select, Checkbox.
- **Validation**: Zod + React Hook Form. Error states trigger red borders (`aria-invalid:border-destructive`) and red focus rings.
- **Errors**: Displayed via `FormMessage`.
- **Labels**: `FormLabel` with clear visual hierarchy.
- **Helper text**: `FormDescription` for additional context.

## Cards

Used for grouping related information (e.g., Event Cards, Dashboards).
- Composed of `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`.

## Dialogs

- Standard `Dialog` for modals. `AlertDialog` specifically for destructive or critical confirmation actions.
- Animated with `fade-in` and `zoom-in`.

## Navigation

- Responsive header. Mobile uses a Sheet/Drawer pattern. Desktop uses horizontal `NavigationMenu` or `Menubar`.
- `AppSidebar` for authenticated layouts (Admin/Student).

## Menus

- `DropdownMenu` for user profiles and context actions.

## Tables

- Native `Table` combined with TanStack Table for data grids (DataTables).
- Includes sorting, filtering, and pagination.

## Badges

- **Variants**: default, secondary, destructive, outline.
- Small, pill-shaped (`rounded-full`) indicators for status or categories.

## Alerts

- Inline contextual feedback.
- **Variants**: default (informational), destructive (error).

## Toasts

- Implemented via Sonner (`Toaster`).
- Used for transient success, error, and informational feedback after actions (e.g., form submissions).
- Position: Top-right.

## Tooltips

- Provide contextual text on hover/focus. Animated entrance.

---

# Icons

- **Style**: Line icons
- **Library**: Lucide React
- **Stroke width**: Consistent with Lucide defaults.
- **Sizes**: Typically `size-4` (16px) inline with text, `size-6` (24px) for empty states or larger UI elements.
- **Usage**: Used to reinforce actions in buttons, indicate status in toasts, and illustrate empty states.

---

# Motion

- **Duration**: Fast transitions. `duration-200` for basic interactions, `duration-300` for larger changes.
- **Easing**: `ease-out` for most enter animations.
- **Microinteractions**: Button scale down on active (`active:scale-95`), hover background color shifts.
- **Loading**: Pulse animations (`animate-pulse`) for skeletons, spin (`animate-spin`) for standard loaders.
- **Page transitions**: Handled via Framer Motion for scroll-triggered fades and slide-ins on specific landing sections.

---

# Accessibility

- **Keyboard navigation**: Fully supported via Radix UI primitives.
- **Focus indicators**: `focus-visible:ring-[3px]` with ring color outline.
- **Screen readers**: Use of `sr-only` classes and standard ARIA roles inherited from Radix.

---

# Content Design

- **Button text**: Action-oriented, concise verbs (e.g., "Save", "Delete", "Submit").
- **Labels**: Clear and descriptive.
- **Errors**: Specific, actionable error messages (e.g., "Email is required").
- **Empty states**: Include an icon, a title, a descriptive message, and an optional call-to-action.
- **Tone**: Professional, encouraging, and clear.

---

# States

- **Default**: Base component appearance.
- **Hover**: Subtle background shifts (`hover:bg-accent`, `hover:bg-primary/90`).
- **Pressed**: Scale reduction (`active:scale-95`).
- **Focused**: Prominent ring (`focus-visible:ring-ring/50`).
- **Disabled**: Reduced opacity (`opacity-50`), `pointer-events-none`.
- **Loading**: Spinners (`Loader2Icon`) inside buttons or Skeleton placeholders.
- **Error**: Destructive colors (`text-danger`, `border-danger`).
- **Success**: Success colors (`text-success`).
- **Empty**: Specific `Empty` composite components.

---

# Themes

- **Light**: Primary application theme.
- **Dark**: Partially scaffolded for Sidebar components, but not applied globally as the default interface.

---

# Assets

- **Icons**: Lucide React
- **Logos**: Primary PSITS and UC Main logos in `src/assets`.
- **Typography**: Switzer via Fontshare.

---

# Design Patterns

- **Forms**: Wrapped in React Hook Form `Form` provider, utilizing Zod for validation. Standard pattern: `FormField` > `FormItem` > `FormLabel` > `FormControl`.
- **Dashboards**: Card-based metric summaries, DataTables for listing entities.
- **CRUD**: Lists via DataTables. Creation/Updates via Dialogs or dedicated pages. Deletions via `AlertDialog`.
- **Authentication**: JWT-based, split into role-specific route guards (`AdminRouteGuard`, `StudentRouteGuard`).
- **Settings**: Categorized forms.

---

# Do's and Don'ts

- **Do**: Use `shadcn/ui` primitives from `src/components/ui` as building blocks.
- **Do**: Validate all forms using Zod schemas.
- **Do**: Use Sonner toasts for action feedback.
- **Don't**: Modify components in `src/components/ui` unless necessary; compose them in `src/components/common` instead.
- **Don't**: Introduce new colors outside the defined CSS variables in `index.css`.
- **Don't**: Use inline styles for layout; rely on Tailwind utility classes.

---

# Versioning

- **Current version**: 1.0 (Initial Design System derived from implementation)
- **Breaking changes**: N/A
- **Migration notes**: Standardizing around Tailwind v4 CSS-first configuration (`@theme`).

---

# Appendix

- **Component checklist**: Refer to `components.json` for the full list of installed shadcn components.
- **Naming conventions**: 
  - CSS custom properties: `--color-*`, `--radius-*`
  - Components: PascalCase
  - CSS Classes: kebab-case
