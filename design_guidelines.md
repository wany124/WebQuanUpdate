# Design Guidelines: Academic Professor Portfolio Website

## Design Approach: Professional Academic Portfolio

**System Foundation**: Drawing from academic and professional portfolio best practices (Google Scholar, ResearchGate, university faculty pages) with a modern dark theme aesthetic.

**Core Principle**: Prioritize content clarity, academic credibility, and efficient information architecture over decorative elements. The design should convey professionalism and scholarly authority.

---

## Core Design Elements

### A. Color Palette

**Dark Mode Primary** (Default):
- Background Primary: `217 33% 17%` (dark slate)
- Background Secondary: `217 33% 22%` (lighter slate for cards)
- Background Tertiary: `217 33% 12%` (deeper slate for sections)
- Text Primary: `0 0% 98%` (near white)
- Text Secondary: `217 20% 80%` (muted slate text)
- Accent Primary: `217 91% 60%` (professional blue for links/CTAs)
- Border: `217 20% 30%` (subtle slate borders)

**Light Mode** (Editor preference):
- Background: `0 0% 100%` (white)
- Text: `217 33% 17%` (dark slate)
- Accent remains consistent

### B. Typography

**Font Stack**: 
- Headings: `'Inter', system-ui, sans-serif` (700, 600 weights)
- Body: `'Inter', system-ui, sans-serif` (400, 500 weights)
- Code/Monospace: `'JetBrains Mono', monospace` (for citations, DOIs)

**Type Scale**:
- H1 (Page titles): `text-4xl md:text-5xl font-bold`
- H2 (Section headers): `text-3xl md:text-4xl font-semibold`
- H3 (Subsections): `text-xl md:text-2xl font-semibold`
- Body: `text-base md:text-lg leading-relaxed`
- Small: `text-sm` (metadata, dates, citations)

### C. Layout System

**Spacing Primitives**: Use tailwind units of `4, 6, 8, 12, 16, 24` for consistent rhythm
- Component padding: `p-6 md:p-8`
- Section spacing: `py-12 md:py-16`
- Card gaps: `gap-6`
- Tight spacing: `space-y-4`
- Generous spacing: `space-y-8`

**Grid Structure**:
- Max content width: `max-w-7xl mx-auto px-4`
- Research/Publications grid: `grid-cols-1 md:grid-cols-2 gap-6`
- Student cards: `grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6`
- Single column content: `max-w-4xl mx-auto`

### D. Component Library

**Navigation**:
- Sticky top navbar with dark slate background (`bg-slate-900/95 backdrop-blur`)
- Horizontal links: HOME, RESEARCH, TEACHING, STUDENTS
- Simple hover states with accent color underline
- Logo/Name on left, navigation links on right
- Mobile: Hamburger menu expanding to full-screen overlay

**Cards** (Research, Publications, Students):
- Background: `bg-slate-800/50` with subtle border
- Rounded corners: `rounded-lg`
- Padding: `p-6`
- Hover: Subtle lift effect `hover:translate-y-[-2px] transition-transform`
- Title in accent color, metadata in muted text
- Clear visual hierarchy: Title → Authors → Venue/Date → Abstract snippet

**Photo Carousel** (Homepage):
- Full-width section with dark background
- Image aspect ratio: `aspect-[16/9] md:aspect-[21/9]`
- Navigation arrows on sides (white with dark background)
- Dots indicator below
- Auto-play with manual override
- Images: Podium photos, lecture shots, conference presentations

**Contact Footer**:
- Dark slate background across all pages
- Two-column layout: Contact info (email, office, phone) | Message form
- Form inputs with subtle borders, focus state in accent color
- Submit button: Accent blue background

**Editor Interface**:
- Clean admin panels with clear sections
- Each editable element has an "Edit" icon button overlay
- Modal/sidebar editors with rich text WYSIWYG (Tiptap-style)
- File upload zones: Drag-drop with preview
- Clear Save/Cancel actions

**Detail Pages** (Research/Papers):
- Hero section: Paper title, authors, venue, date, PDF download button
- Abstract in prominent position
- Structured sections: Abstract, Key Findings, Citations, Related Work
- PDF viewer embedded (if available)
- Back to list navigation

### E. Imagery

**Images Needed**:
1. **Homepage Carousel**: 5-8 professional photos of professor at podiums, giving lectures, at conferences (landscape orientation, high-quality)
2. **Profile Photo**: Professional headshot for personal info section (square aspect ratio)
3. **Student Photos**: Headshots for each PhD student (square, consistent sizing)
4. **Research Thumbnails**: Visual representations/diagrams for each research project (optional but recommended)

**Treatment**: All images use subtle rounded corners (`rounded-lg`), consistent aspect ratios, and subtle shadow (`shadow-lg`) for depth.

### F. Page-Specific Layouts

**Homepage**:
- Personal info section: Photo left, bio/credentials right (2-column on desktop)
- Photo carousel: Full-width, prominent placement
- Research highlights: 3-card grid of featured papers
- Full research list: Compact cards with "View All Research" link
- Contact form: Always in footer

**Research List Page**:
- Filter/Sort options at top (by year, type, topic)
- Grid of research cards with clear categorization
- Each card: Title, authors, venue, year, tags, brief abstract

**Teaching Page**:
- Course cards in grid: Course code, title, semester, enrollment link
- Each course expandable for syllabus, materials, schedule

**Students Page**:
- Grid of student cards: Photo, name, research area, start year, personal website link
- Uniform card sizing for visual consistency

---

## Accessibility & Interactions

- Maintain WCAG AA contrast ratios (4.5:1 minimum)
- All interactive elements have clear focus states
- Keyboard navigation fully supported
- Form inputs clearly labeled
- Skip to content link for screen readers
- No animations beyond subtle transitions (200ms)

This design balances academic professionalism with modern aesthetics, ensuring content is king while maintaining visual appeal appropriate for a research faculty portfolio.