# Rajgir Marathon — Official Design System & Style Guide
**Version:** 2.0 (White Mode / Light Theme)  
**Target:** Production Platform (`rajgirmarathon.com` & `rajgir.org`)  
**Brand Slogan:** *Run Through History*  
**Date:** November 2026

---

## 1. Brand Identity & Logo Anatomy

The official Rajgir Marathon emblem encapsulates the dual essence of **athletic energy** and **ancient heritage**:

```
                  ┌────────────────────────────────────────┐
                  │          [ CRIMSON SUNRISE ]           │
                  │   Energy • Vitality • Early Morning    │
                  ├───────────────────┬────────────────────┤
                  │ [ GOLDEN STUPAS ] │ [ ATHLETIC RUNNER] │
                  │ Peace Pagoda      │ Forward Motion     │
                  │ Ratnagiri Hills   │ Human Spirit       │
                  ├───────────────────┴────────────────────┤
                  │     [ ATHLETIC BLOCK TYPOGRAPHY ]      │
                  │  Collegiate Slab Serif (Graduate)      │
                  │  "RAJGIR MARATHON - RUN THROUGH HIST." │
                  └────────────────────────────────────────┘
```

1. **The Dynamic Runner Silhouette**: Symbolizes endurance, forward momentum, inclusivity, and competitive spirit.
2. **The Radiant Crimson Sun**: Represents the sunrise start of the marathon in the Ratnagiri Hills, vitality, passion, and high performance.
3. **The Golden Hills & Buddhist Stupas**: Represents the Vishwa Shanti Stupa, ancient heritage, and the scenic beauty of Rajgir, Bihar.
4. **Collegiate Athletic Typography**: Bold, block, chamfered slab typography representing race prestige, timed competition, and historic permanence.

---

## 2. Website Theme Definition (White Mode / Light Mode)

### Design Philosophy
The platform transitions from a dark aesthetic to a **world-class, high-energy, clean white mode**. White mode provides:
- **Maximum Readability & Accessibility**: Passes WCAG 2.1 AAA contrast benchmarks for runners, corporate sponsors, and visitors under daylight conditions.
- **Editorial Cleanliness**: Generous white space, crisp typography, and refined shadows inspire trust for payments and registrations.
- **Vibrant Brand Contrast**: The logo's bold **Crimson Red**, **Heritage Stupa Gold**, and **Deep Obsidian** stand out crisply on light canvas surfaces.

### Surface Elevation Hierarchy (Light Mode)

| Level | Token / Name | Hex Value | Usage |
| :--- | :--- | :--- | :--- |
| **Base Canvas** | `bg-canvas` | `#F8F9FA` | Main page background across routes |
| **Warm Section** | `bg-heritage` | `#FAF7F2` | Alternating section backgrounds (warm sand/stupa stone tint) |
| **Elevated Surface** | `bg-surface` | `#FFFFFF` | Cards, modals, registration forms, dashboard widgets |
| **Surface Accent** | `bg-surface-subtle` | `#F1F5F9` | Table headers, input backgrounds, disabled states |
| **Dividers / Borders** | `border-default` | `#E2E8F0` | Structural card borders and container separators |

---

## 3. Required Color Palette

Derived directly from the official logo artwork:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CORE BRAND PALETTE                              │
├───────────────────┬────────────────────┬───────────────────────────────┤
│ Marathon Crimson  │   #E51922          │ Primary Actions, Urgency, CTAs│
│ Stupa Ochre Gold  │   #D9822B / #C47D18│ Heritage, Medals, Badges      │
│ Deep Obsidian     │   #111827          │ Headings, High-Contrast Text  │
│ Pure Canvas White │   #FFFFFF          │ Backgrounds, Cards, Modals    │
│ Warm Sand Stone   │   #FAF7F2          │ Section Dividers, Warm Blocks │
└───────────────────┴────────────────────┴───────────────────────────────┘
```

### Detailed Palette Specification

#### 1. Marathon Crimson (Primary Brand Accent)
*Extracted from the rising sun and "MARATHON" lettering.*
- **`crimson-50`**: `#FEF2F2` (Soft badge / alert background)
- **`crimson-100`**: `#FEE2E2` (Hover state for light cards)
- **`crimson-500`**: `#EF4444` (Secondary vibrant accent)
- **`crimson-600`** *(Primary)*: **`#E51922`** (Main CTA buttons, logo accent, active tab indicator)
- **`crimson-700`**: `#C8141C` (Button hover, active click)
- **`crimson-800`**: `#991B1B` (Accessible high-contrast text on light backgrounds)

#### 2. Rajgir Stupa Gold / Ochre (Secondary Brand Accent)
*Extracted from the Ratnagiri Hills, Vishwa Shanti Stupa, and the bottom banner.*
- **`gold-50`**: `#FFFBEB` (Highlight card background, award chips)
- **`gold-100`**: `#FEF3C7` (Badge border, pill highlight)
- **`gold-400`**: `#F59E0B` (Bright decorative stars, timers)
- **`gold-500`**: `#D9822B` (Stupa Ochre primary, category chips)
- **`gold-600`**: `#C47D18` (Category distance borders, award plaques)
- **`gold-800`**: `#854D0E` (Accessible text on gold-tinted badges)

#### 3. Neutral Typography & Surface Foundation
- **`neutral-900`** *(Deep Obsidian)*: **`#111827`** — Headings, titles, race bib IDs
- **`neutral-800`** *(Charcoal)*: **`#1F2937`** — Body text, form field labels
- **`neutral-600`** *(Slate Muted)*: **`#4B5563`** — Secondary descriptions, captions
- **`neutral-400`** *(Cool Grey)*: **`#9CA3AF`** — Placeholder text, inactive icons
- **`neutral-200`** *(Border Light)*: **`#E5E7EB`** — Card borders, dividers, input borders
- **`neutral-100`** *(Input Fill)*: **`#F3F4F6`** — Search inputs, background tags
- **`neutral-50`** *(Off-White Canvas)*: **`#F8F9FA`** — Page base background
- **`pure-white`**: **`#FFFFFF`** — Elevated card containers and dialog surfaces

#### 4. Semantic Status Colors
- **Success (Confirmed / Active)**:
  - Surface: `#ECFDF5`
  - Border: `#A7F3D0`
  - Text & Icon: `#059669`
- **Warning (Under Review / Pending Committee Approval)**:
  - Surface: `#FFFBEB`
  - Border: `#FDE68A`
  - Text & Icon: `#D97706`
- **Info (Notice / Guide)**:
  - Surface: `#EFF6FF`
  - Border: `#BFDBFE`
  - Text & Icon: `#2563EB`
- **Error (Form Validation / Rejected)**:
  - Surface: `#FEF2F2`
  - Border: `#FECACA`
  - Text & Icon: `#DC2626`

---

## 4. Consistent Border Radius System

To establish a polished, cohesive visual rhythm, the interface employs a **standardized 5-tier radius scale**:

| Token | CSS Value | Tailwind Class | Recommended Component Usage |
| :--- | :--- | :--- | :--- |
| **Small** | `4px` / `0.25rem` | `rounded` | Micro-badges, table cells, form checkboxes, tooltips |
| **Medium** | `8px` / `0.5rem` | `rounded-lg` | Input fields, select dropdowns, textareas, code blocks |
| **Large** | `12px` / `0.75rem` | `rounded-xl` | Primary content cards, stepper steps, bib preview card |
| **Extra Large** | `16px` - `24px` | `rounded-2xl` | Modal dialogs, dashboard stat widgets, hero banner cards |
| **Pill (Full)** | `9999px` | `rounded-full` | Primary & secondary CTA buttons, role selection chips, status badges |

### Visual Rules:
- **Buttons & Chips**: Use `rounded-full` to echo athletic race tracks and runner bib tokens.
- **Inputs & Interactive Controls**: Always use `rounded-lg` (`8px`) for modern form ergonomics.
- **Card Containers**: Standardize on `rounded-xl` (`12px`) with a subtle `1px` border (`border-neutral-200`) and soft elevation (`shadow-sm` or `shadow-md`).

---

## 5. Typography System (Existing Site Audit)

Audit of font families already loaded and configured in the project:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        TYPOGRAPHY TRIAD                                │
├─────────────────┬───────────────────┬──────────────────────────────────┤
│ Graduate        │ Athletic Block    │ Race titles, Bib numbers, Timers │
│ Montserrat      │ Geometric Display │ Section Headings, Nav, Badges    │
│ Inter           │ Clean UI Sans     │ Body Copy, Forms, Dashboards     │
└─────────────────┴───────────────────┴──────────────────────────────────┘
```

### 1. `Graduate` (Collegiate Athletic Block Slab Serif)
- **Class**: `.font-graduate`
- **Source**: Google Fonts
- **Visual Identity**: Directly matches the collegiate block serif in the official logo ("RAJGIR" and "RUN THROUGH HISTORY").
- **Usage**:
  - Hero primary headlines (`RAJGIR MARATHON 2027`)
  - Distance markers (`42.2 KM`, `21.1 KM`, `10 KM`, `5 KM`)
  - Race bib numbers (`RJG-2027-10K-4843`)
  - Countdown clock digits
  - Major monetary/prize pool figures

### 2. `Montserrat` (Modern Geometric Display Sans)
- **Class**: `.font-montserrat`
- **Source**: Google Fonts
- **Visual Identity**: Clean, authoritative, geometric, and modern.
- **Usage**:
  - Section title headers (H2, H3)
  - Navigation bar links
  - Button text (set to `uppercase tracking-wider font-extrabold`)
  - Card titles and feature highlights
  - Milestone and route checkpoint names

### 3. `Inter` (Humanist Workhorse UI Sans)
- **Class**: `.font-inter`
- **Source**: Google Fonts
- **Visual Identity**: High legibility at small sizes, optimal line-heights, neutral aesthetic.
- **Usage**:
  - Paragraph text and event descriptions
  - Form field labels, placeholders, helper text, and error messages
  - Admin and dashboard data tables
  - Legal waivers, terms and conditions, FAQ accordion bodies

### Type Scale Hierarchy

| Level | Size (Desktop / Mobile) | Weight | Font Family | Example Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Display 1** | `48px` / `32px` | Black (900) | `Graduate` | Hero Banner Title |
| **Heading 1** | `36px` / `28px` | ExtraBold (800) | `Montserrat` | Major Page Headings |
| **Heading 2** | `28px` / `22px` | Bold (700) | `Montserrat` | Section Titles (`#categories`, `#route`) |
| **Heading 3** | `20px` / `18px` | SemiBold (600) | `Montserrat` | Card Titles & Category Names |
| **Body Large** | `16px` / `15px` | Regular (400) | `Inter` | Introductory Subheadings |
| **Body Regular** | `14px` / `14px` | Regular (400) | `Inter` | Standard descriptions, form inputs |
| **Caption / Micro** | `12px` / `11px` | Medium (500) | `Inter` | Timestamps, metadata, helper text |
| **Button / Badge**| `13px` / `12px` | Bold (700) | `Montserrat` | All CTA pill buttons (`uppercase tracking-wider`) |

---

## 6. Component Design Specifications (White Mode)

### A. Buttons & CTAs
- **Primary Athletic Button** (High conversion):
  - Background: `bg-crimson-600` (`#E51922`), Hover: `bg-crimson-700` (`#C8141C`)
  - Text: `text-white font-montserrat font-extrabold uppercase text-xs tracking-wider`
  - Shape: `rounded-full px-6 py-3 shadow-md hover:shadow-lg transition-all`
- **Secondary Heritage Button**:
  - Background: `bg-gold-500` (`#D9822B`), Hover: `bg-gold-600` (`#C47D18`)
  - Text: `text-white font-montserrat font-bold uppercase text-xs tracking-wider`
  - Shape: `rounded-full px-5 py-2.5`
- **Outline / Ghost Button**:
  - Border: `border-2 border-neutral-300 hover:border-neutral-900`
  - Background: `bg-transparent hover:bg-neutral-100`
  - Text: `text-neutral-800 font-montserrat font-bold text-xs uppercase`
  - Shape: `rounded-full px-5 py-2.5`

### B. Form Inputs & Controls
- **Standard Field**:
  - Background: `bg-white` (or `bg-neutral-50` subtle)
  - Border: `border border-neutral-300 focus:border-crimson-600 focus:ring-2 focus:ring-crimson-100`
  - Radius: `rounded-lg` (`8px`)
  - Padding: `px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400`
- **Radio / Option Select Cards**:
  - Inactive: `bg-white border-2 border-neutral-200 text-neutral-700 hover:border-gold-400`
  - Selected: `bg-amber-50/60 border-2 border-crimson-600 text-crimson-900 shadow-sm`

### C. Cards & Elevated Containers
- **Content Card**:
  - Background: `bg-white`
  - Border: `border border-neutral-200/80`
  - Radius: `rounded-xl` (`12px`)
  - Shadow: `shadow-sm hover:shadow-md transition-shadow`
  - Accent Strip (Optional): `3px` top border in `bg-gradient-to-r from-crimson-600 to-gold-500`

### D. Navigation Bar (`SiteHeader`)
- Background: `bg-white/95 backdrop-blur-md border-b border-neutral-200 shadow-xs`
- Logo: Full color logo on white
- Links: `text-neutral-700 hover:text-crimson-600 font-montserrat font-semibold text-sm`
- Active Indicator: Bottom border in `bg-crimson-600` or rounded indicator dot

---

## 7. Tailwind Configuration Reference (`frontend/tailwind.config.js`)

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: "#F8F9FA",
          heritage: "#FAF7F2",
          surface: "#FFFFFF",
          subtle: "#F1F5F9",
        },
        crimson: {
          50: "#FEF2F2",
          100: "#FEE2E2",
          500: "#EF4444",
          600: "#E51922", // Official Logo Crimson
          700: "#C8141C",
          800: "#991B1B",
          900: "#7F1D1D",
        },
        gold: {
          50: "#FFFBEB",
          100: "#FEF3C7",
          400: "#F59E0B",
          500: "#D9822B", // Stupa Ochre Gold
          600: "#C47D18",
          700: "#A15C07",
          800: "#854D0E",
        },
        obsidian: {
          DEFAULT: "#111827",
          charcoal: "#1F2937",
          muted: "#4B5563",
        },
      },
      fontFamily: {
        graduate: ["Graduate", "serif", "sans-serif"],
        montserrat: ["Montserrat", "-apple-system", "sans-serif"],
        inter: ["Inter", "-apple-system", "sans-serif"],
      },
      borderRadius: {
        card: "12px",
        container: "16px",
      },
    },
  },
  plugins: [],
};
```

---

## 8. Summary Checklist for Frontend White-Mode Implementation

- [ ] Update `globals.css` `:root` `--background` to `#F8F9FA` and `--foreground` to `#111827`.
- [ ] Replace hardcoded dark class sets (`bg-[#080604]`, `bg-[#0f0c09]`, `text-white`, `border-white/10`) with semantic light tokens (`bg-canvas`, `bg-white`, `text-obsidian`, `border-neutral-200`).
- [ ] Preserve high-visibility accent elements: Use **`#E51922`** (Crimson) for primary CTA buttons and **`#D9822B`** (Stupa Gold) for awards, distances, and badges.
- [ ] Standardize border radius: Inputs (`rounded-lg`), Cards (`rounded-xl`), Modals (`rounded-2xl`), Buttons (`rounded-full`).
- [ ] Maintain the typography triad: **Graduate** for race titles & numbers, **Montserrat** for headings & navigation, and **Inter** for forms & body copy.

