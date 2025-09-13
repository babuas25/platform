# 🔌 API Endpoints Documentation

## Overview
This document provides comprehensive documentation for all API endpoints in the platform. All endpoints are RESTful and return JSON responses with proper HTTP status codes.

## Base URL
```
Production: https://your-domain.vercel.app/api
Development: http://localhost:3000/api
```

## Authentication
All protected endpoints require valid authentication. Authentication is handled via NextAuth.js sessions.

```typescript
// Request Headers
{
  "Content-Type": "application/json",
  "Cookie": "next-auth.session-token=..."
}
```

## Error Response Format
```typescript
interface ErrorResponse {
  error: string
  message?: string
  details?: any
  timestamp: string
}
```

## Success Response Format
```typescript
interface SuccessResponse<T> {
  success: boolean
  data?: T
  message?: string
  timestamp: string
}
```

## Authentication Endpoints

### NextAuth.js Endpoints
**Base Path**: `/api/auth`

#### `GET /api/auth/session`
Get current user session information.

**Response:**
```typescript
interface SessionResponse {
  user: {
    id: string
    name: string
    email: string
    image?: string
    role: string
    category: string
    subcategory: string
  }
  expires: string
}
```

#### `POST /api/auth/signin`
Initiate authentication with OAuth providers.

**Query Parameters:**
- `provider`: `google` | `facebook`
- `callbackUrl`: URL to redirect after authentication

#### `POST /api/auth/signout`
Sign out current user and clear session.

**Response:**
```typescript
{
  "url": "https://your-domain.com"
}
```

## User Management Endpoints

### `GET /api/users`
Retrieve all users with role-based filtering.

**Authentication**: Required
**Permissions**: SuperAdmin, Admin, Staff

**Query Parameters:**
```typescript
interface UserQueryParams {
  page?: number          // Page number (default: 1)
  limit?: number         // Items per page (default: 10)
  role?: string          // Filter by role
  category?: string      // Filter by category
  status?: string        // Filter by status
  search?: string        // Search by name or email
  sort?: string          // Sort field
  order?: 'asc' | 'desc' // Sort order
}
```

**Response:**
```typescript
interface UsersResponse {
  users: User[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  filters: {
    role?: string
    category?: string
    status?: string
    search?: string
  }
}

interface User {
  id: string
  name: string
  email: string
  role: 'SuperAdmin' | 'Admin' | 'Staff' | 'Partner' | 'Agent' | 'User'
  category: string
  subcategory: string
  status: 'Active' | 'Inactive' | 'Suspended'
  createdAt: string
  updatedAt: string
  lastLogin?: string
  metadata?: Record<string, any>
}
```

**Example Request:**
```bash
GET /api/users?page=1&limit=10&role=Staff&status=Active&search=john
```

**Example Response:**
```json
{
  "users": [
    {
      "id": "user-123",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "Staff",
      "category": "Staff",
      "subcategory": "Support",
      "status": "Active",
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-01T00:00:00Z",
      "lastLogin": "2025-01-13T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

### `POST /api/users`
Create a new user.

**Authentication**: Required
**Permissions**: SuperAdmin, Admin

**Request Body:**
```typescript
interface CreateUserRequest {
  name: string
  email: string
  role: 'Admin' | 'Staff' | 'Partner' | 'Agent' | 'User'
  category: string
  subcategory: string
  status?: 'Active' | 'Inactive'
  metadata?: Record<string, any>
}
```

**Response:**
```typescript
interface CreateUserResponse {
  user: User
  message: string
}
```

**Example Request:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "role": "Staff",
  "category": "Staff",
  "subcategory": "Sales",
  "status": "Active"
}
```

### `GET /api/users/[userId]`
Get specific user details.

**Authentication**: Required
**Permissions**: SuperAdmin, Admin, Staff (own data), Users (own data only)

**Path Parameters:**
- `userId`: User ID

**Response:**
```typescript
interface UserResponse {
  user: User
}
```

### `PUT /api/users/[userId]`
Update user information.

**Authentication**: Required
**Permissions**: SuperAdmin (all), Admin (non-SuperAdmin), Users (own data only)

**Path Parameters:**
- `userId`: User ID

**Request Body:**
```typescript
interface UpdateUserRequest {
  name?: string
  email?: string
  role?: string
  category?: string
  subcategory?: string
  status?: 'Active' | 'Inactive' | 'Suspended'
  metadata?: Record<string, any>
}
```

**Response:**
```typescript
interface UpdateUserResponse {
  user: User
  message: string
}
```

### `DELETE /api/users/[userId]`
Delete a user (soft delete - sets status to inactive).

**Authentication**: Required
**Permissions**: SuperAdmin only

**Path Parameters:**
- `userId`: User ID

**Response:**
```typescript
interface DeleteUserResponse {
  success: boolean
  message: string
}
```

## Database Management Endpoints

### `POST /api/database/initialize`
Initialize database with sample data and required collections.

**Authentication**: Required
**Permissions**: SuperAdmin, Admin

**Request Body:**
```typescript
interface InitializeRequest {
  includeAuditLogs?: boolean
  includeSampleData?: boolean
  resetExisting?: boolean
}
```

**Response:**
```typescript
interface InitializeResponse {
  success: boolean
  message: string
  collections: string[]
  sampleDataCreated: {
    users: number
    content: number
    settings: number
    categories: number
  }
  timestamp: string
}
```

### `GET /api/database/status`
Get database initialization status and health check.

**Authentication**: Required
**Permissions**: SuperAdmin, Admin, Staff

**Response:**
```typescript
interface DatabaseStatusResponse {
  status: 'empty' | 'initialized' | 'error'
  collections: {
    [collectionName: string]: {
      exists: boolean
      count: number
      lastUpdated?: string
    }
  }
  health: {
    connection: 'healthy' | 'error'
    latency: number
    errors: string[]
  }
  timestamp: string
}
```

### `POST /api/database/backup`
Create database backup.

**Authentication**: Required
**Permissions**: SuperAdmin only

**Request Body:**
```typescript
interface BackupRequest {
  collections?: string[]
  includeMetadata?: boolean
}
```

**Response:**
```typescript
interface BackupResponse {
  success: boolean
  backupId: string
  collections: string[]
  size: number
  timestamp: string
}
```

## Content Management Endpoints

### `GET /api/content`
Retrieve content items with filtering and pagination.

**Authentication**: Required
**Permissions**: All authenticated users

**Query Parameters:**
```typescript
interface ContentQueryParams {
  page?: number
  limit?: number
  type?: string
  status?: 'draft' | 'published' | 'archived'
  author?: string
  search?: string
}
```

**Response:**
```typescript
interface ContentResponse {
  content: ContentItem[]
  pagination: PaginationInfo
}

interface ContentItem {
  id: string
  title: string
  content: string
  type: string
  status: 'draft' | 'published' | 'archived'
  author: string
  createdAt: string
  updatedAt: string
  metadata?: Record<string, any>
}
```

### `POST /api/content`
Create new content item.

**Authentication**: Required
**Permissions**: SuperAdmin, Admin, Staff

**Request Body:**
```typescript
interface CreateContentRequest {
  title: string
  content: string
  type: string
  status?: 'draft' | 'published'
  metadata?: Record<string, any>
}
```

### `PUT /api/content/[contentId]`
Update content item.

**Authentication**: Required
**Permissions**: SuperAdmin, Admin, Staff (own content), Author (own content)

### `DELETE /api/content/[contentId]`
Delete content item.

**Authentication**: Required
**Permissions**: SuperAdmin, Admin

## Analytics Endpoints

### `GET /api/analytics/users`
Get user analytics data.

**Authentication**: Required
**Permissions**: SuperAdmin, Admin, Staff

**Query Parameters:**
```typescript
interface AnalyticsQuery {
  period?: 'day' | 'week' | 'month' | 'year'
  startDate?: string
  endDate?: string
  groupBy?: 'role' | 'category' | 'status'
}
```

**Response:**
```typescript
interface UserAnalyticsResponse {
  total: number
  active: number
  inactive: number
  byRole: Record<string, number>
  byCategory: Record<string, number>
  growth: {
    period: string
    current: number
    previous: number
    change: number
    changePercent: number
  }
  timeline: Array<{
    date: string
    count: number
    active: number
  }>
}
```

### `GET /api/analytics/activity`
Get platform activity analytics.

**Authentication**: Required
**Permissions**: SuperAdmin, Admin

**Response:**
```typescript
interface ActivityAnalyticsResponse {
  sessions: {
    total: number
    unique: number
    average_duration: number
  }
  pageViews: {
    total: number
    unique: number
    mostVisited: Array<{
      path: string
      views: number
    }>
  }
  userActions: {
    logins: number
    signups: number
    profileUpdates: number
  }
}
```

## Health Check Endpoints

### `GET /api/health`
Basic health check endpoint.

**Authentication**: Not required

**Response:**
```typescript
interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  version: string
  uptime: number
  services: {
    database: 'healthy' | 'error'
    auth: 'healthy' | 'error'
    storage: 'healthy' | 'error'
  }
}
```

### `GET /api/health/detailed`
Detailed health check with metrics.

**Authentication**: Required
**Permissions**: SuperAdmin, Admin

**Response:**
```typescript
interface DetailedHealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  metrics: {
    responseTime: number
    memoryUsage: number
    cpuUsage: number
    activeConnections: number
  }
  services: {
    database: {
      status: 'healthy' | 'error'
      latency: number
      connections: number
    }
    auth: {
      status: 'healthy' | 'error'
      sessions: number
    }
    storage: {
      status: 'healthy' | 'error'
      usage: number
    }
  }
  errors: string[]
}
```

## File Upload Endpoints

### `POST /api/upload`
Upload files (images, documents).

**Authentication**: Required
**Permissions**: SuperAdmin, Admin, Staff

**Request**: Multipart form data
```typescript
interface UploadRequest {
  file: File
  type: 'image' | 'document' | 'avatar'
  category?: string
}
```

**Response:**
```typescript
interface UploadResponse {
  success: boolean
  file: {
    id: string
    filename: string
    originalName: string
    size: number
    type: string
    url: string
    metadata?: Record<string, any>
  }
}
```

## Rate Limiting

All endpoints are subject to rate limiting:

```typescript
interface RateLimits {
  general: '100 requests per minute'
  auth: '10 requests per minute'
  upload: '5 requests per minute'
  database: '50 requests per minute'
}
```

## Error Codes

### HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict
- `422`: Unprocessable Entity
- `429`: Too Many Requests
- `500`: Internal Server Error

### Custom Error Codes
```typescript
enum ApiErrorCodes {
  INVALID_SESSION = 'INVALID_SESSION',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',
  INVALID_ROLE = 'INVALID_ROLE',
  DATABASE_ERROR = 'DATABASE_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED'
}
```

## SDK Integration

### JavaScript/TypeScript Client
```typescript
// Example client usage
import { PlatformAPI } from '@/lib/api-client'

const api = new PlatformAPI({
  baseUrl: 'https://your-domain.vercel.app/api',
  auth: 'session' // Uses session cookies
})

// Get users
const users = await api.users.list({
  page: 1,
  limit: 10,
  role: 'Staff'
})

// Create user
const newUser = await api.users.create({
  name: 'John Doe',
  email: 'john@example.com',
  role: 'Staff',
  category: 'Staff',
  subcategory: 'Support'
})

// Update user
const updatedUser = await api.users.update('user-123', {
  status: 'Active'
})
```

### cURL Examples
```bash
# Get users
curl -X GET "https://your-domain.vercel.app/api/users?page=1&limit=10" \
  -H "Cookie: next-auth.session-token=..."

# Create user
curl -X POST "https://your-domain.vercel.app/api/users" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=..." \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "role": "Staff",
    "category": "Staff",
    "subcategory": "Support"
  }'

# Get database status
curl -X GET "https://your-domain.vercel.app/api/database/status" \
  -H "Cookie: next-auth.session-token=..."
```

---

**Last Updated**: January 2025
**Version**: 1.0.0
**API Status**: Production Ready ✅