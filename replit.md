# Next.js Dashboard Platform

## Overview

A production-ready enterprise dashboard platform built with Next.js 15.5.2, featuring comprehensive user management, role-based access control (RBAC), and Firebase integration. The platform provides a complete admin interface with authentication, user categorization, performance monitoring, and scalable architecture designed for multi-tenant applications.

The system supports 6 user categories (SuperAdmin, Admin, Staff, Partner, Agent, User) with 15+ specialized subcategories, OAuth integration via NextAuth.js, and a modern component-based UI using Radix UI and Tailwind CSS.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: Next.js 15.5.2 with App Router for modern React server components
- **UI Library**: Radix UI primitives with shadcn/ui components (49 reusable components)
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: React hooks with custom providers for user context and theme management
- **Authentication**: NextAuth.js with session management and protected routes

### Backend Architecture
- **API Routes**: Next.js API routes in `/app/api/` for server-side operations
- **Database Operations**: Firebase Admin SDK for server-side database access
- **Caching Strategy**: Multi-layer caching with LRU cache, API response caching, and browser caching
- **Performance Monitoring**: Query optimization tracking and database indexing
- **Security**: Role-based middleware, CSRF protection, and secure headers

### Data Storage
- **Primary Database**: Firebase Firestore with composite indexes for query optimization
- **Authentication**: Firebase Auth integrated with NextAuth.js for session persistence
- **Caching**: In-memory LRU cache with TTL support and cache invalidation patterns
- **File Storage**: Firebase Storage (configured but not heavily utilized in current implementation)

### Authentication & Authorization
- **Multi-Provider Auth**: Google OAuth, Facebook OAuth, and email/password via Firebase Auth
- **Session Management**: NextAuth.js with HTTP-only cookies and secure session handling
- **Role-Based Access Control**: Hierarchical role system with 6 main categories and granular permissions
- **Protected Routes**: Route groups and middleware for authentication enforcement

### Performance & Scalability
- **Database Indexing**: Comprehensive Firestore composite indexes for complex queries
- **Caching Layers**: Browser caching, API response caching, and database query caching
- **Query Optimization**: Performance monitoring with slow query detection
- **Code Splitting**: Next.js automatic code splitting and lazy loading

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