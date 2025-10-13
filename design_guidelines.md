# Design Guidelines: Academic Professor Portfolio Website

## Design Approach: Organic Professional Academic Portfolio

**System Foundation**: Modern academic portfolio design inspired by high-end university faculty pages, research journals, and professional academic websites - emphasizing natural content flow and organic layouts over rigid card-based designs.

**Core Principle**: Create a professional, organic aesthetic that prioritizes content clarity and scholarly authority through natural spacing, subtle transitions, and integrated layouts. Avoid blocky AI-generated appearance with card containers and floating labels.

---

## Core Design Philosophy

### A. NO Blocky Elements
❌ **Avoid**:
- Distinct card/box containers with visible backgrounds
- Floating label boxes (like "BIOGRAPHY", "RESEARCH")
- Rounded corner containers
- Separate boxes for each content item
- Heavy borders and distinct background colors for sections

✅ **Use Instead**:
- Content integrated directly into page background
- Subtle horizontal divider lines between sections
- Natural spacing and asymmetric layouts
- Subtle shadows for depth (no containers)
- Smooth gradient transitions between sections

### B. Natural Content Flow
- Full-width sections with subtle transitions
- Overlapping elements and layered designs
- Varied spacing for visual interest
- Magazine-style layouts with integrated imagery
- Content wraps naturally without rigid containers

---

## Color Palette

**Dark Mode Primary** (Default):
- Background Primary: `217 33% 17%` (dark slate)
- Background for sections: Use same background with subtle gradients
- Text Primary: `0 0% 98%` (near white)
- Text Secondary: `217 20% 80%` (muted slate text)
- Text Tertiary: `217 20% 60%` (subtle slate for metadata)
- Accent Primary: `217 91% 60%` (professional blue for links/CTAs)
- Divider lines: `217 20% 30%` (subtle horizontal dividers)

**Light Mode** (Alternative):
- Background: `0 0% 100%` (white)
- Text: `217 33% 17%` (dark slate)
- Dividers: `217 20% 90%` (light borders)
- Accent remains consistent

**Gradient Usage**:
- Hero sections: Subtle gradient from dark to background
- Section transitions: Fade effects between areas
- No flat color blocks - always use smooth transitions

---

## Typography

**Font Stack**: 
- Headings: `'Inter', system-ui, sans-serif` (700, 600 weights)
- Body: `'Inter', system-ui, sans-serif` (400, 500 weights)
- Metadata: `'Inter', system-ui, sans-serif` (400 weight, smaller sizes)

**Type Scale**:
- H1 (Hero titles): `text-4xl md:text-5xl lg:text-6xl font-bold` - integrated into background, no container
- H2 (Section headers): `text-2xl md:text-3xl font-semibold` - simple typography, no boxes
- H3 (Subsections): `text-xl font-semibold` - minimal styling
- Body: `text-base leading-relaxed` - natural line height
- Metadata: `text-sm text-muted-foreground` - subtle, integrated into flow

---

## Layout System

### Spacing Primitives
Use natural, varied spacing (not uniform grid):
- Section vertical spacing: `py-12 md:py-16` or `py-16 md:py-20`
- Content padding: Direct on background, no container padding
- Item spacing: `space-y-8` or `space-y-12` for generous breathing room
- Divider spacing: `my-8` or `my-12` for horizontal lines

### Grid Structure
- Max content width: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- Asymmetric layouts encouraged
- Magazine-style: Photo on left/right with text flowing naturally
- No rigid card grids - use full-width rows with dividers

---

## Page-Specific Layouts

### Homepage Design

**Hero Section**:
- Title integrated directly into gradient background
- No centered box or container
- Subtle gradient: `bg-gradient-to-b from-slate-900 to-background`
- Text flows naturally on background

**Biography Section**:
- Remove card container (`bg-card` border)
- Photo positioned with subtle shadow only: `shadow-lg` (no border, no background box)
- Bio text flows naturally beside or around photo
- Interests/Education/Experience laid out directly on page background
- Use subtle divider line at bottom: `border-b border-slate-800/50`

**Events Carousel**:
- Keep full-width image backgrounds
- Natural integration with page flow

**Experience Timeline**:
- Vertical line with dots (already good)
- No card containers around positions
- Content flows naturally with timeline visual

### Research Page Design

**Page Header**:
- Remove floating "RESEARCH" label box
- Simple page title integrated into layout
- Filter dropdown positioned naturally

**Research Items**:
- Full-width horizontal rows (already implemented)
- Image on left with subtle shadow only: `shadow-md` (no border)
- Content on right flowing naturally (no box)
- Thin horizontal divider between items: `border-b border-slate-800/50`
- Tags and metadata integrated into text flow
- No rounded corners or card borders

### Teaching Page Design

**Page Structure**:
- Remove any floating "TEACHING" label
- Course items as full-width rows with dividers
- Course info flows naturally without boxes
- Use subtle indentation and spacing
- Horizontal divider lines: `border-b border-slate-800/50`

### Students Page Design

**Layout**:
- Remove floating "STUDENTS" label
- Student profiles in natural grid layout
- Photos with subtle shadow: `shadow-md` (no container boxes)
- Info flows below photo without card backgrounds
- Natural spacing between items

---

## Component Patterns

### Images & Photos
- Profile photos: Subtle shadow only `shadow-lg`, no border, no background
- Research images: `shadow-md` for subtle depth
- No rounded corners on containers (use `rounded-lg` only on actual images)
- Natural positioning within content flow

### Dividers & Separators
- Use thin horizontal lines: `border-b border-slate-800/50`
- Spacing: `my-8` or `my-12` around dividers
- Subtle, barely visible - just enough to separate content

### Sections & Backgrounds
- No distinct background colors for sections
- Use same page background throughout
- Subtle gradients for transitions: `bg-gradient-to-b`
- Content integrates directly with background

### Interactive Elements
- Buttons: Keep existing shadcn button styles
- Links: Accent color with subtle underline on hover
- No hover state background changes on sections/cards
- Subtle transitions: `transition-opacity` or `transition-transform`

---

## Accessibility & Interactions

- Maintain WCAG AA contrast ratios (4.5:1 minimum)
- All interactive elements have clear focus states
- Keyboard navigation fully supported
- Subtle transitions only (200ms max)
- No heavy animations or jarring effects
- Natural, organic feel throughout

---

## Summary: What Changed

**Old Approach** (Blocky AI):
- Card containers with backgrounds
- Floating label boxes
- Rigid grid layouts
- Heavy borders and rounded corners
- Distinct section backgrounds

**New Approach** (Organic Professional):
- Content on page background directly
- Simple integrated typography
- Natural flow and asymmetric layouts
- Subtle divider lines
- Smooth gradient transitions
- Magazine-style integrated imagery

**Goal**: A professionally designed academic website that feels natural, credible, and scholarly - not a templated AI design.
