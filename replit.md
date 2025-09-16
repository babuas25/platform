# Next.js Dashboard Platform

## Overview

A production-ready enterprise dashboard platform built with Next.js 15.5.2, featuring comprehensive user management, role-based access control (RBAC), and Firebase integration. The platform provides a complete admin interface with authentication, user categorization, performance monitoring, and scalable architecture designed for multi-tenant applications.

The system supports 6 user categories (SuperAdmin, Admin, Staff, Partner, Agent, User) with 15+ specialized subcategories, OAuth integration via NextAuth.js, and a modern component-based UI using Radix UI and Tailwind CSS.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture (Enhanced 2025)

### 🆕 **NEW Enterprise Architecture**
- **Structure**: Feature-first architecture with `src/features/` organization
- **Domain Separation**: Libraries organized by domain in `src/shared/lib/`
- **API Versioning**: Scalable `/api/v1/` structure for future growth
- **Path Aliases**: TypeScript aliases (`@features/*`, `@shared/*`, `@server/*`)

### Frontend Architecture (Enhanced)
- **Framework**: Next.js 15.5.2 with App Router for modern React server components
- **UI Library**: Design system with 49 reusable components in `src/shared/components/ui/`
- **Component Organization**: Feature-specific components in respective domains
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: React hooks with custom providers for user context and theme management
- **Authentication**: NextAuth.js with enhanced RBAC and session management

### Backend Architecture (Enhanced)
- **API Routes**: Versioned Next.js API routes in `/app/api/v1/` for scalable server-side operations
- **Database Operations**: Firebase Admin SDK organized in `src/shared/lib/db/` domain
- **Caching Strategy**: Domain-organized caching in `src/shared/lib/cache/` with LRU cache, API response caching, and browser caching
- **Authentication**: Enhanced RBAC system in `src/shared/lib/auth/` domain
- **Performance Monitoring**: Query optimization tracking and database indexing
- **Security**: Role-based middleware, CSRF protection, and secure headers with versioned API security

### Data Storage (Enhanced)
- **Primary Database**: Firebase Firestore with composite indexes organized in `src/shared/lib/db/`
- **Authentication**: Firebase Auth integrated with NextAuth.js in `src/shared/lib/auth/`
- **Caching**: Domain-organized caching system in `src/shared/lib/cache/` with TTL and invalidation
- **Configuration**: Centralized runtime config in `src/shared/config/`
- **Types**: Global types organized in `src/shared/types/`
- **Constants**: Application constants in `src/shared/constants/`

### Authentication & Authorization
- **Multi-Provider Auth**: Google OAuth, Facebook OAuth, and email/password via Firebase Auth
- **Session Management**: NextAuth.js with HTTP-only cookies and secure session handling
- **Role-Based Access Control**: Hierarchical role system with 6 main categories and granular permissions
- **Protected Routes**: Route groups and middleware for authentication enforcement

### Performance & Scalability (2025 Enhanced)
- **Feature Isolation**: Each feature in `src/features/` can be developed and deployed independently
- **Domain Organization**: Libraries organized by domain for better tree-shaking
- **Database Indexing**: Comprehensive Firestore composite indexes in `src/shared/lib/db/`
- **Caching Layers**: Domain-organized caching in `src/shared/lib/cache/`
- **API Versioning**: Scalable versioned APIs starting with `/api/v1/`
- **Path Aliases**: Clean imports with TypeScript path mapping
- **Code Splitting**: Next.js automatic code splitting with feature-based organization

## External Dependencies

### Core Services
- **Firebase**: Primary backend service including Firestore, Authentication, and Admin SDK
- **NextAuth.js**: Authentication library handling OAuth providers and session management
- **Vercel**: Recommended deployment platform with automatic scaling

### Authentication Providers
- **Google OAuth**: Configured for social authentication
- **Facebook OAuth**: Secondary social authentication option
- **Firebase Auth**: Email/password authentication with custom user management

### UI & Styling
- **Radix UI**: Unstyled, accessible UI primitives for complex components
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Lucide React**: Icon library for consistent iconography
- **next-themes**: Theme switching functionality with system preference detection

### Development Tools
- **TypeScript**: Full type safety throughout the application
- **ESLint**: Code linting with Next.js configuration
- **PostCSS**: CSS processing with Tailwind CSS integration

### Performance & Monitoring
- **Firebase Admin SDK**: Server-side database operations and user management
- **Custom Caching**: In-memory caching system with performance monitoring
- **Query Optimization**: Database indexing and performance tracking utilities

### Deployment Dependencies
- **Node.js**: Runtime environment (>= 18.0.0)
- **npm**: Package manager (>= 11.6.0)
- **Firebase CLI**: For database rules and index deployment