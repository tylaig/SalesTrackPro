# Sales Dashboard Application

## Overview

This is a full-stack web application built for sales management and customer support. The application provides a comprehensive dashboard for tracking sales performance, managing clients, and handling support tickets. It's built with a modern tech stack including React frontend, Node.js/Express backend, and PostgreSQL database with Drizzle ORM.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Build Tool**: Vite for development and production builds
- **Charts**: Recharts for data visualization

### Backend Architecture
- **Runtime**: Node.js 20 with ES modules
- **Framework**: Express.js for REST API
- **Database ORM**: Drizzle ORM with PostgreSQL driver
- **Database**: PostgreSQL 16 (Neon serverless)
- **Development**: tsx for TypeScript execution in development
- **Production**: esbuild for server bundling

### Monorepo Structure
The application follows a monorepo pattern with shared types and schemas:
- `client/` - React frontend application
- `server/` - Express.js backend API
- `shared/` - Shared TypeScript types and database schemas

## Key Components

### Database Schema (`shared/schema.ts`)
- **Users**: Authentication and user management
- **Clients**: Customer information and contact details
- **Sales**: Sales records with status tracking (realized, recovered, lost)
- **Support Tickets**: Customer support with priority and status management
- **Relations**: Proper foreign key relationships between entities

### API Layer (`server/routes.ts`)
- **Sales Management**: CRUD operations for sales records with filtering and pagination
- **Client Management**: Customer data management
- **Support System**: Ticket creation and management with status tracking
- **Metrics**: Sales analytics and chart data endpoints

### Frontend Pages
- **Dashboard**: Main analytics view with KPIs, charts, and recent sales
- **Sales**: Complete sales management interface
- **Clients**: Customer management system
- **Support**: Support ticket system with form and ticket list

### UI Components
- **KPI Cards**: Performance metrics with growth indicators
- **Charts**: Sales trends and distribution visualizations
- **Data Tables**: Paginated, searchable data displays
- **Forms**: Validated forms with proper error handling

## Data Flow

1. **Client Requests**: Frontend makes API calls using TanStack Query
2. **API Processing**: Express routes handle requests and interact with database
3. **Database Operations**: Drizzle ORM executes type-safe database queries
4. **Response Handling**: Data flows back through the stack with proper error handling
5. **UI Updates**: React Query manages caching and real-time updates

## External Dependencies

### Backend Dependencies
- **@neondatabase/serverless**: Neon PostgreSQL serverless driver
- **drizzle-orm**: Type-safe ORM for database operations
- **express**: Web framework for API endpoints
- **zod**: Runtime type validation
- **connect-pg-simple**: PostgreSQL session store

### Frontend Dependencies
- **@tanstack/react-query**: Server state management
- **@radix-ui/**: Headless UI component primitives
- **recharts**: Chart library for data visualization
- **wouter**: Lightweight routing library
- **tailwindcss**: Utility-first CSS framework
- **date-fns**: Date manipulation utilities

### Development Dependencies
- **tsx**: TypeScript execution for development
- **esbuild**: Fast bundler for production
- **vite**: Frontend build tool and dev server
- **@replit/vite-plugin-runtime-error-modal**: Replit-specific error handling

## Deployment Strategy

### Development Environment
- **Process**: `npm run dev` starts both frontend and backend concurrently
- **Port**: Application runs on port 5000
- **Hot Reload**: Vite provides hot module replacement for frontend
- **Database**: Connected to Neon serverless PostgreSQL

### Production Build
- **Frontend**: Vite builds optimized static assets to `dist/public`
- **Backend**: esbuild bundles server code to `dist/index.js`
- **Static Serving**: Express serves frontend assets in production
- **Database**: Uses production DATABASE_URL environment variable

### Replit Configuration
- **Modules**: nodejs-20, web, postgresql-16
- **Deployment**: Autoscale deployment target
- **Build**: `npm run build` for production assets
- **Run**: `npm run start` for production server

## Recent Updates

### Super Admin System Implementation (June 20, 2025)
- Implemented comprehensive Super Admin dashboard with advanced capabilities
- Created complete user management system with role-based access
- Added plans management with feature configuration and pricing
- Built webhook system for payment event tracking (pending/approved)
- Developed WhatsApp chips recovery management system
- Added admin analytics with KPIs, charts, and performance metrics
- Extended PostgreSQL schema with plans, webhooks, whatsappChips tables
- Integrated all admin components with proper routing and navigation

### Authentication System (June 20, 2025)
- Implemented complete login/logout authentication system
- Added login page with form validation and user credentials
- Integrated authentication state management with localStorage
- Added logout functionality to sidebar navigation
- Demo credentials: admin/password123

### Support Ticket System Enhancement (June 20, 2025)
- Corrected support ticket system to handle client-to-company requests
- Updated schema and API endpoints to use clientId instead of userId
- Fixed TypeScript type definitions for support components
- Improved support form validation and error handling

### Reports Page Implementation (June 20, 2025)
- Created comprehensive reports page with advanced analytics
- Added KPI cards with performance metrics and growth indicators
- Implemented top products analysis and status breakdown
- Enhanced data visualization with trend charts and distribution graphs
- Added export functionality and filtering options

### Platform Integration Improvements (June 20, 2025)
- Fixed all TypeScript type safety issues across components
- Enhanced error handling and loading states
- Improved data flow between frontend and backend
- Added proper authentication routing and protected pages
- Resolved dashboard and sales page data display issues

## System Features

### Complete Dashboard Suite
- **Dashboard**: KPI metrics, sales trends, and recent activity overview
- **Sales Management**: Full CRUD operations with status tracking and filtering
- **Client Management**: Customer database with contact information
- **Support System**: Client support ticket management with priority levels
- **Reports**: Advanced analytics with charts and performance metrics
- **Authentication**: Secure login/logout with session management

### Technical Implementation
- PostgreSQL database with Drizzle ORM for type-safe operations
- React Query for efficient data fetching and caching
- Comprehensive form validation with Zod schemas
- Responsive design with Tailwind CSS and shadcn/ui components
- Real-time data updates and optimistic UI patterns

## Changelog

```
Changelog:
- June 20, 2025: Complete platform integration with authentication, reports, and support enhancements
- June 20, 2025: Initial setup and core functionality implementation
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
Project focus: Complete sales management platform with client support integration.
Authentication: Simple demo credentials for development and testing.
```