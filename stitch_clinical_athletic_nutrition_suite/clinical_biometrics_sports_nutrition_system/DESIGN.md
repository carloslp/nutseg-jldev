---
name: Clinical Biometrics & Sports Nutrition System
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#3d4947'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#6d7a77'
  outline-variant: '#bcc9c6'
  surface-tint: '#006a61'
  primary: '#00685f'
  on-primary: '#ffffff'
  primary-container: '#008378'
  on-primary-container: '#f4fffc'
  inverse-primary: '#6bd8cb'
  secondary: '#4b41e1'
  on-secondary: '#ffffff'
  secondary-container: '#645efb'
  on-secondary-container: '#fffbff'
  tertiary: '#712ae2'
  on-tertiary: '#ffffff'
  tertiary-container: '#8a4cfc'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#89f5e7'
  primary-fixed-dim: '#6bd8cb'
  on-primary-fixed: '#00201d'
  on-primary-fixed-variant: '#005049'
  secondary-fixed: '#e2dfff'
  secondary-fixed-dim: '#c3c0ff'
  on-secondary-fixed: '#0f0069'
  on-secondary-fixed-variant: '#3323cc'
  tertiary-fixed: '#eaddff'
  tertiary-fixed-dim: '#d2bbff'
  on-tertiary-fixed: '#25005a'
  on-tertiary-fixed-variant: '#5a00c6'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Geist
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 30px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.01em
  title-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm-medium:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-md:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Geist
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
  data-metric:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.02em
  data-table:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-tablet: 1.5rem
  margin-desktop: 2rem
  space-xxs: 0.25rem
  space-xs: 0.5rem
  space-sm: 0.75rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
---

## Brand & Style

This design system serves high-performance sports dietitians, clinical nutritionists, and elite biometric analysts. The visual language merges modern clinical precision with technical athletic performance. It feels sterile yet approachable, authoritative without being intimidating, and systematically organized to support high cognitive load without user fatigue.

The design movement is **Clinical Minimalism**:
- **Utilitarian Clarity**: Unadorned data presentation where data points, metabolic formulas, and biometric delta values take center stage.
- **Architectural Hierarchy**: Crisp hairline dividers, balanced negative space, and strict typographic rhythm replace heavy shadows or ornate textures.
- **Functional Density**: High information density balanced by precise structural whitespace, preventing interface crowding while keeping complex diagnostic panels within a unified viewport.

## Colors

The palette establishes an evidence-based clinical atmosphere using Medical Teal as the anchor for primary actions and active physiological indicators, paired with Electric Indigo for kinetic athletic tracking and calendar sequencing. 

### Core Palette
- **Canvas Base**: `#f8fafc` (Crisp Slate White) provides an eye-resting, cool foundation distinct from pure paper white.
- **Surface Elevation**: `#ffffff` (Pure White) reserved for elevated cards, active cells, and focus containers.
- **Border Subtle**: `#e2e8f0` provides 1px structural framing across data boundaries.
- **Primary Accent (Medical Teal)**: `#0d9488` drives critical CTAs, active status indicators, and baseline metabolic curves.
- **Secondary Accent (Electric Indigo)**: `#4f46e5` distinguishes workout blocks, dynamic metric switches, and scheduled tracking.
- **Tertiary Accent (Manual Lock / Override)**: `#7c3aed` highlights clinical overrides, locked target parameters, and dietitian-forced recalculations.

### Clinical Status & Nutrition Semantics
- **Clinical Warning / Alert**: Amber Orange `#d97706` against warning surface `#fef3c7` with dense structural left borders (`#b45309`).
- **Success & External Dispatch**: Forest Green `#16a34a` (WhatsApp dispatch confirmation) and Emerald Green `#059669` (target reached).
- **Critical Violation**: Crimson `#dc2626` over soft rose `#fee2e2` for metabolic floor breaches and caloric deficit warnings.
- **Macro Distribution Engine**:
  - Protein: Ocean Blue `#2563eb`
  - Carbohydrates: Harvest Amber `#d97706`
  - Lipids / Fats: Emerald Green `#059669`

### Typography Neutral Ramp
- **Text Primary**: `#0f172a` (Deep Slate Black) — high legibility threshold for values and critical metrics.
- **Text Secondary**: `#64748b` (Cool Slate) — units of measurement, timestamps, contextual subtitles.
- **Text Muted**: `#94a3b8` (Slate) — inactive column headers, placeholder states, disabled parameters.

## Typography

Typography prioritizes tabular alignment, rapid visual parsing, and diagnostic clarity. 

- **Font Pairing**: Geist serves display metrics, section headers, formula chips, and numeric values due to its geometric precision and structured tabular glyph set. Inter manages dense narrative body copy, advisory remarks, and interactive input labels.
- **Numeric Rendering**: All data visualization counters, SMAE equivalency matrices, and laboratory tables must enforce monospace numbers via `font-feature-settings: "tnum" 1, "cv05" 1`.
- **Hierarchical Discipline**: Display values (`32px`) anchor metabolic sum cards. Section anchors sit strictly at `24px`. Micro labels (`11px - 12px`) are styled in uppercase or tracked medium weights to identify metabolic equations and clinical flags without encroaching on primary value reading.

## Layout & Spacing

The layout follows a strict 4px base increment model configured for data-dense monitoring dashboards, clinical entry splits, and dynamic charts.

### Grid & Canvas Mechanics
- **Desktop (≥ 1280px)**: 12-column fluid grid locked inside a max-width container of `1600px`. Gutters sit at `1.5rem` (`24px`), section margins at `2rem` (`32px`). Accommodates dual split layouts: Athlete/Patient roster on left panel (4 columns), Biometric/Macro calculation engine on main panel (8 columns).
- **Tablet (768px - 1279px)**: 8-column layout with `1rem` (`16px`) gutters and `1.5rem` (`24px`) margins. Sidebar collapses to a fixed-rail icon bar; sub-panels stack into tabs.
- **Mobile (< 768px)**: 4-column layout with `1rem` (`16px`) gutters and margins. Tables reflow into vertically stacked card matrices; primary summary meters pin to the bottom safe area.

### Density Tiers
- **Dense Data Zones (SMAE tables, lab profiles)**: Component row heights default to `36px` to `40px` with horizontal cell padding at `space-sm` (`12px`) and vertical padding at `space-xxs` (`4px`).
- **Standard Clinical Views**: Card padding remains consistent at `space-lg` (`24px`), dropping to `space-md` (`16px`) on mobile devices.

## Elevation & Depth

The system rejects exaggerated blurred shadows, relying instead on structural surface separation and low-opacity ambient stabilization.

- **Baseline Level 0 (Canvas)**: Background color `#f8fafc`. Flat, non-elevated ground.
- **Baseline Level 1 (Clinical Cards & Data Tables)**: Surface `#ffffff`, framed by a single 1px hairline stroke `#e2e8f0` and an ultra-soft ambient shadow: `box-shadow: 0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.02)`.
- **Baseline Level 2 (Flyouts, Menus & Date Range Pickers)**: Surface `#ffffff`, border `#cbd5e1`, with elevated projection: `box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.05)`.
- **Baseline Level 3 (Diagnostic Modals & Emergency Flag Overlays)**: Surface `#ffffff`, border `#94a3b8`, shadow: `box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.04)`. Accompanied by a clinical backdrop overlay: `rgba(15, 23, 42, 0.4)` with `backdrop-filter: blur(2px)`.

## Shapes

The design maintains an intentional contrast between clinical crispness and ergonomic utility:

- **Base Factor**: Level 2 (Balanced Roundedness).
- **Controls & Form Elements**: `8px` (`0.5rem`) for text inputs, number selectors, primary buttons, dropdown triggers, and status chips.
- **Card Containers & Visual Modules**: `12px` (`0.75rem`) for biometric summary cards, caloric safety meters, chart cards, and modal sheets.
- **Metric Badges & Biometric Deltas**: Full pill geometry (`9999px`) for differential indicators (`+1.4 Δ`), formula chips, and macro balance tags.
- **Borders**: Fixed uniform width of `1px` across all containers; active inputs scale to a `1.5px` stroke with no exterior offset rings, maintaining strict spatial containment.

## Components

### Buttons & Trigger Elements
- **Primary Action (Teal)**: `#0d9488` background, `#ffffff` text, font weight 500, `8px` corner radius. Interactive state: hover at `#0f766e`, active downscale to `0.99`.
- **Secondary Action (Indigo/Outlined)**: 1px border `#4f46e5`, transparent background, `#4f46e5` text. Hover shifts to `#eef2ff`.
- **Clinical WhatsApp Dispatch Action**: `#16a34a` solid background with integrated SVG message icon, white text, dedicated `8px` radius.

### Biometric Delta Badges
- Pill-shaped tags (`9999px`) sized at height `22px`, horizontal padding `8px`, font size `11px` Geist Mono / Tabular.
- **Positive Delta / Improvement**: `#ecfdf5` background, `#059669` text, prepended with `Δ` and directional vector arrow (`↑` or `↓` depending on metric context).
- **Adverse Delta / Decline**: `#fef2f2` background, `#dc2626` text with respective alert indicator.
- **Neutral / Stabilized**: `#f1f5f9` background, `#64748b` text.

### Segmented Macro Progress Bars & Caloric Floor Meters
- **Macro Bar**: Height `8px` or `12px`, continuous track `#f1f5f9` containing contiguous segments for Protein (`#2563eb`), Carbs (`#d97706`), and Fats (`#059669`). Transitions must be linear and smooth.
- **Caloric Safety Floor Indicator**: Dual-layered bar with a hatched vertical threshold line at the minimal basal metabolic rate. If total energy deficit dips below this line, the remainder track flashes solid `#dc2626` with an inline alert label.

### Clinical Warning Banners
- Background `#fef3c7`, surface text `#92400e`. Left vertical boundary features a solid `4px` border in `#d97706`.
- Sits persistently above calculation tables when athlete markers indicate relative energy deficiency (RED-S) or contraindicated hydration levels.

### Formula Engine Chips
- Compact `24px` height tags with `6px` radius.
- Background `#f8fafc`, border `1px solid #cbd5e1`, text `#334155`. Displays active formula attribution (e.g., `Katch-McArdle [LBM]`, `Mifflin-St Jeor [RMR]`, `Cunningham`).
- Features a violet indicator dot (`#7c3aed`) when a manual override or locked multiplier is applied.

### SMAE Data Grids & Meal Allocation Tables
- Structured table layout using alternating subtle row shading on hover (`#f8fafc`).
- Top boundary of column headers features `1px solid #e2e8f0` with `12px` Geist uppercase headers in `#64748b`.
- In-cell inputs (gram weights, portion counts) feature embedded stepper actions, tabular alignments, and instantaneous reactive calorie recalculation indicators.