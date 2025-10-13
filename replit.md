# Academic Portfolio Website

## Overview

This is an academic professor portfolio website designed to showcase research publications, teaching activities, and PhD students. The platform features a public-facing website for visitors and a protected content management system for the professor to update their information, research, courses, and student listings.

The application follows a modern academic portfolio design with a professional dark theme, emphasizing content clarity and scholarly authority. It includes an image carousel on the homepage, detailed research pages with filtering capabilities, teaching course listings, and PhD student profiles.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool

**Routing**: Wouter for client-side routing with dedicated routes for:
- Public pages (home, research, teaching, students)
- Authentication page
- Protected editor pages for content management

**State Management**: 
- TanStack Query (React Query) for server state management and caching
- React Hook Form for form state with Zod validation
- Context API for authentication state

**UI Framework**: 
- Shadcn/ui component library built on Radix UI primitives
- Tailwind CSS for styling with custom design tokens
- Dark mode by default with light mode support

**Design System**:
- Custom color palette defined in CSS variables (HSL format)
- Professional dark theme with slate color scheme
- Responsive design with mobile-first approach
- Consistent spacing using Tailwind's spacing scale (4, 6, 8, 12, 16, 24)

### Backend Architecture

**Server Framework**: Express.js with TypeScript

**API Design**: RESTful API with the following resource endpoints:
- `/api/personal-info` - Singleton resource for professor information
- `/api/carousel` - Image carousel management
- `/api/research` - Research publications with featured filtering
- `/api/courses` - Teaching course listings
- `/api/students` - PhD student profiles
- `/api/contact` - Contact form submissions
- `/api/upload/image` - Image upload handling

**Authentication & Authorization**:
- Session-based authentication using express-session
- PostgreSQL session store (connect-pg-simple)
- Password hashing with bcrypt
- Protected routes require authenticated user session
- Single admin user model for content editing

**File Upload Strategy**:
- Multer middleware for handling multipart form data
- In-memory storage buffer before cloud upload
- Support for profile photos, research thumbnails, carousel images

**Database ORM**: 
- Drizzle ORM for type-safe database queries
- Schema-first approach with Zod validation
- Support for PostgreSQL via Neon serverless driver

**Data Models**:
- Users (admin authentication)
- Personal Info (singleton - professor details)
- Carousel Images (homepage slideshow)
- Events (homepage events carousel with images)
- Experience (professional timeline positions)
- Research (publications with metadata, tags, categories, citations)
  - Citation field for formatted bibliographic citations with copy-to-clipboard
  - PDF download support
  - DOI/external links
- Courses (teaching information)
- Students (current and alumni PhD students)
- Contact Messages (form submissions)

### External Dependencies

**Database**: 
- Neon Serverless PostgreSQL
- WebSocket connection pooling for serverless environments
- Environment variable: `DATABASE_URL`

**Object Storage**:
- Google Cloud Storage via Replit Object Storage sidecar
- Authentication through Replit's credential service
- Public bucket storage for uploaded images
- Environment variable: `DEFAULT_OBJECT_STORAGE_BUCKET_ID`
- Sidecar endpoint: `http://127.0.0.1:1106`

**Session Management**:
- PostgreSQL-backed session store
- Environment variable: `SESSION_SECRET`
- 30-day session lifetime

**Third-Party UI Libraries**:
- Radix UI primitives for accessible components
- Lucide React for icons
- Recharts for potential data visualization
- Embla Carousel for carousel functionality
- Vaul for drawer components

**Development Tools**:
- Vite for development server and hot module replacement
- Replit-specific plugins for development banners and cartographer
- TSX for TypeScript execution
- esbuild for production bundling

**Validation & Type Safety**:
- Zod schemas for runtime validation
- Drizzle-zod for automatic schema generation from database models
- TypeScript strict mode enabled

**Image Upload Flow**:
1. Client uploads file via FormData
2. Multer processes multipart request in memory
3. ObjectStorageService uploads to Google Cloud Storage via Replit sidecar
4. Public URL returned and stored in database
5. Images served directly from cloud storage

**Responsive Design Breakpoints**:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px