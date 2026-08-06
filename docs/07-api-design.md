# SwiftHR - API Design

## API Overview

SwiftHR exposes a RESTful API built with Django REST Framework, following industry best practices for versioning, authentication, error handling, and documentation. The API is designed to be stateless, scalable, and developer-friendly.

## API Architecture

### Base URL
- **Production**: `https://api.swifthr.com/api/v1/`
- **Development**: `http://localhost:8000/api/v1/`
- **Staging**: `https://staging-api.swifthr.com/api/v1/`

### API Versioning
- **Strategy**: URL path versioning (`/api/v1/`)
- **Current Version**: v1
- **Deprecation Policy**: Previous versions supported for 6 months after new version release
- **Version Header**: Optional `API-Version: v1` header for explicit version specification

**Rationale**: URL path versioning is clear and cacheable. It allows for independent evolution of API versions while maintaining backward compatibility.

### Data Format
- **Request Format**: JSON
- **Response Format**: JSON
- **Character Encoding**: UTF-8
- **Date Format**: ISO 8601 (`YYYY-MM-DDTHH:MM:SSZ`)

### Content Negotiation
- **Accept Header**: `application/json`
- **Content-Type Header**: `application/json`
- **Default**: JSON responses

## Authentication

### JWT Authentication
All API endpoints (except public endpoints) require JWT authentication.

**Authentication Flow**
1. User submits credentials to `/auth/login/`
2. Server returns access token (30 min expiry) and refresh token (7 days expiry)
3. Client includes access token in `Authorization: Bearer <token>` header
4. When access token expires, use refresh token to obtain new access token

**Token Endpoints**
```
POST   /api/v1/auth/login/           # Obtain tokens
POST   /api/v1/auth/refresh/        # Refresh access token
POST   /api/v1/auth/logout/         # Invalidate tokens
POST   /api/v1/auth/verify/         # Verify token validity
```

**Request Example**
```http
POST /api/v1/auth/login/
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response Example**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "applicant"
  }
}
```

**Rationale**: JWT provides stateless, scalable authentication suitable for modern web applications. Separate access and refresh tokens balance security and user experience.

## API Endpoints

### Authentication Endpoints

#### Login
```
POST   /api/v1/auth/login/
```
**Description**: Authenticate user and return JWT tokens.

**Request Body**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Response** (200 OK)
```json
{
  "access": "string",
  "refresh": "string",
  "user": {
    "id": "integer",
    "email": "string",
    "first_name": "string",
    "last_name": "string",
    "role": "string"
  }
}
```

**Error Response** (401 Unauthorized)
```json
{
  "error": "Invalid credentials"
}
```

#### Register
```
POST   /api/v1/auth/register/
```
**Description**: Register a new user account.

**Request Body**
```json
{
  "email": "string (required)",
  "password": "string (required, min 8 chars)",
  "first_name": "string (required)",
  "last_name": "string (required)",
  "phone": "string (optional)"
}
```

**Response** (201 Created)
```json
{
  "id": "integer",
  "email": "string",
  "first_name": "string",
  "last_name": "string",
  "role": "applicant"
}
```

#### Forgot Password
```
POST   /api/v1/auth/forgot-password/
```
**Description**: Initiate password reset process.

**Request Body**
```json
{
  "email": "string (required)"
}
```

**Response** (200 OK)
```json
{
  "message": "Password reset email sent"
}
```

#### Reset Password
```
POST   /api/v1/auth/reset-password/
```
**Description**: Reset password using token from email.

**Request Body**
```json
{
  "token": "string (required)",
  "new_password": "string (required, min 8 chars)"
}
```

**Response** (200 OK)
```json
{
  "message": "Password reset successful"
}
```

#### Verify OTP
```
POST   /api/v1/auth/verify-otp/
```
**Description**: Verify one-time password for sensitive operations.

**Request Body**
```json
{
  "otp": "string (required, 6 digits)",
  "operation": "string (required)"
}
```

**Response** (200 OK)
```json
{
  "verified": true,
  "message": "OTP verified successfully"
}
```

### User Endpoints

#### Get Current User
```
GET    /api/v1/users/me/
```
**Description**: Get current authenticated user profile.

**Authentication**: Required

**Response** (200 OK)
```json
{
  "id": 1,
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "avatar": "https://example.com/avatar.jpg",
  "role": "applicant",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-15T00:00:00Z"
}
```

#### Update User Profile
```
PATCH  /api/v1/users/me/
```
**Description**: Update current user profile.

**Authentication**: Required

**Request Body**
```json
{
  "first_name": "string (optional)",
  "last_name": "string (optional)",
  "phone": "string (optional)",
  "avatar": "file (optional)"
}
```

**Response** (200 OK)
```json
{
  "id": 1,
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "avatar": "https://example.com/avatar.jpg",
  "role": "applicant",
  "updated_at": "2024-01-15T00:00:00Z"
}
```

#### Change Password
```
POST   /api/v1/users/me/change-password/
```
**Description**: Change user password.

**Authentication**: Required

**Request Body**
```json
{
  "current_password": "string (required)",
  "new_password": "string (required, min 8 chars)"
}
```

**Response** (200 OK)
```json
{
  "message": "Password changed successfully"
}
```

### Application Endpoints

#### List Applications
```
GET    /api/v1/applications/
```
**Description**: Get list of applications (filtered by user role).

**Authentication**: Required

**Query Parameters**
- `page`: Page number (default: 1)
- `page_size`: Items per page (default: 20, max: 100)
- `status`: Filter by status (optional)
- `search`: Search by name or email (optional)
- `date_from`: Filter by submission date from (optional)
- `date_to`: Filter by submission date to (optional)

**Response** (200 OK)
```json
{
  "count": 100,
  "next": "http://api.example.com/api/v1/applications/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "application_number": "APP-2024-0001",
      "applicant_name": "John Doe",
      "applicant_email": "john@example.com",
      "position": "Software Engineer",
      "status": "under_review",
      "submitted_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-16T14:20:00Z"
    }
  ]
}
```

#### Get Application Detail
```
GET    /api/v1/applications/{id}/
```
**Description**: Get detailed information about a specific application.

**Authentication**: Required

**Response** (200 OK)
```json
{
  "id": 1,
  "application_number": "APP-2024-0001",
  "applicant": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  },
  "position": "Software Engineer",
  "status": "under_review",
  "personal_info": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "address": "123 Main St",
    "city": "San Francisco",
    "state": "CA",
    "zip": "94102"
  },
  "education": [
    {
      "institution": "University of California",
      "degree": "Bachelor of Science",
      "field": "Computer Science",
      "graduation_year": 2020
    }
  ],
  "experience": [
    {
      "company": "Tech Company",
      "position": "Junior Developer",
      "start_date": "2020-06-01",
      "end_date": "2022-06-01",
      "description": "Developed web applications"
    }
  ],
  "skills": ["Python", "JavaScript", "React"],
  "documents": [
    {
      "type": "resume",
      "url": "https://example.com/resume.pdf",
      "uploaded_at": "2024-01-15T10:30:00Z"
    }
  ],
  "submitted_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-16T14:20:00Z",
  "status_history": [
    {
      "status": "received",
      "changed_at": "2024-01-15T10:30:00Z",
      "changed_by": "system"
    },
    {
      "status": "under_review",
      "changed_at": "2024-01-16T14:20:00Z",
      "changed_by": "hr_admin@example.com"
    }
  ]
}
```

#### Create Application
```
POST   /api/v1/applications/
```
**Description**: Submit a new job application.

**Authentication**: Required

**Request Body**
```json
{
  "position": "string (required)",
  "personal_info": {
    "first_name": "string (required)",
    "last_name": "string (required)",
    "email": "string (required)",
    "phone": "string (optional)",
    "address": "string (optional)",
    "city": "string (optional)",
    "state": "string (optional)",
    "zip": "string (optional)"
  },
  "education": [
    {
      "institution": "string (required)",
      "degree": "string (required)",
      "field": "string (required)",
      "graduation_year": "integer (required)"
    }
  ],
  "experience": [
    {
      "company": "string (required)",
      "position": "string (required)",
      "start_date": "date (required)",
      "end_date": "date (optional)",
      "description": "string (optional)"
    }
  ],
  "skills": ["string"],
  "cover_letter": "string (optional)",
  "documents": [
    {
      "type": "string (required)",
      "file": "file (required)"
    }
  ]
}
```

**Response** (201 Created)
```json
{
  "id": 1,
  "application_number": "APP-2024-0001",
  "status": "received",
  "submitted_at": "2024-01-15T10:30:00Z",
  "message": "Application submitted successfully"
}
```

#### Update Application
```
PATCH  /api/v1/applications/{id}/
```
**Description**: Update an existing application (applicant can only update their own).

**Authentication**: Required

**Request Body**: Same as create application (all fields optional)

**Response** (200 OK)
```json
{
  "id": 1,
  "application_number": "APP-2024-0001",
  "status": "received",
  "updated_at": "2024-01-16T10:30:00Z",
  "message": "Application updated successfully"
}
```

#### Update Application Status
```
PATCH  /api/v1/applications/{id}/status/
```
**Description**: Update application status (HR admin only).

**Authentication**: Required (HR Admin role)

**Request Body**
```json
{
  "status": "string (required)",
  "notes": "string (optional)"
}
```

**Response** (200 OK)
```json
{
  "id": 1,
  "status": "interview",
  "updated_at": "2024-01-16T14:20:00Z",
  "message": "Status updated successfully"
}
```

#### Delete Application
```
DELETE /api/v1/applications/{id}/
```
**Description**: Delete an application (applicant can only delete their own if not processed).

**Authentication**: Required

**Response** (204 No Content)

### Dashboard Endpoints

#### Get Dashboard Stats
```
GET    /api/v1/dashboard/stats/
```
**Description**: Get dashboard statistics and metrics.

**Authentication**: Required

**Response** (200 OK)
```json
{
  "total_applications": 150,
  "pending_review": 25,
  "interview_scheduled": 10,
  "offers_extended": 5,
  "rejected": 30,
  "applications_by_status": {
    "received": 50,
    "under_review": 25,
    "interview": 10,
    "offer": 5,
    "rejected": 30
  },
  "recent_applications": [
    {
      "id": 1,
      "application_number": "APP-2024-0001",
      "applicant_name": "John Doe",
      "status": "under_review",
      "submitted_at": "2024-01-15T10:30:00Z"
    }
  ],
  "time_to_hire": {
    "average_days": 14,
    "median_days": 12
  }
}
```

#### Get Application Trends
```
GET    /api/v1/dashboard/trends/
```
**Description**: Get application trends over time.

**Authentication**: Required

**Query Parameters**
- `period`: Time period (7d, 30d, 90d, 1y) (default: 30d)

**Response** (200 OK)
```json
{
  "period": "30d",
  "daily_applications": [
    {
      "date": "2024-01-01",
      "count": 5
    },
    {
      "date": "2024-01-02",
      "count": 8
    }
  ],
  "status_changes": [
    {
      "date": "2024-01-01",
      "received": 5,
      "under_review": 3,
      "interview": 1
    }
  ]
}
```

### File Upload Endpoints

#### Upload Document
```
POST   /api/v1/files/upload/
```
**Description**: Upload a file (document, image, etc.).

**Authentication**: Required

**Request**: `multipart/form-data`

**Form Data**
- `file`: File (required)
- `type`: File type (required)
- `application_id`: Associated application ID (optional)

**Response** (201 Created)
```json
{
  "id": 1,
  "url": "https://example.com/media/uploads/document.pdf",
  "type": "resume",
  "size": 1024000,
  "uploaded_at": "2024-01-15T10:30:00Z"
}
```

#### Get File
```
GET    /api/v1/files/{id}/
```
**Description**: Get file metadata.

**Authentication**: Required

**Response** (200 OK)
```json
{
  "id": 1,
  "url": "https://example.com/media/uploads/document.pdf",
  "type": "resume",
  "size": 1024000,
  "uploaded_at": "2024-01-15T10:30:00Z"
}
```

#### Delete File
```
DELETE /api/v1/files/{id}/
```
**Description**: Delete a file.

**Authentication**: Required

**Response** (204 No Content)

### Notification Endpoints

#### Get Notifications
```
GET    /api/v1/notifications/
```
**Description**: Get user notifications.

**Authentication**: Required

**Query Parameters**
- `unread_only`: Filter unread only (boolean, default: false)

**Response** (200 OK)
```json
{
  "count": 5,
  "unread_count": 2,
  "results": [
    {
      "id": 1,
      "type": "application_status",
      "title": "Application Status Updated",
      "message": "Your application status has changed to 'Under Review'",
      "read": false,
      "created_at": "2024-01-16T14:20:00Z",
      "action_url": "/applications/1"
    }
  ]
}
```

#### Mark Notification as Read
```
PATCH  /api/v1/notifications/{id}/read/
```
**Description**: Mark a notification as read.

**Authentication**: Required

**Response** (200 OK)
```json
{
  "id": 1,
  "read": true,
  "read_at": "2024-01-16T15:00:00Z"
}
```

#### Mark All Notifications as Read
```
POST   /api/v1/notifications/mark-all-read/
```
**Description**: Mark all notifications as read.

**Authentication**: Required

**Response** (200 OK)
```json
{
  "message": "All notifications marked as read"
}
```

## Error Handling

### Error Response Format
All errors follow a consistent format:

```json
{
  "error": "Error type",
  "message": "Human-readable error message",
  "details": {
    "field_name": ["Specific error message"]
  },
  "code": "ERROR_CODE",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### HTTP Status Codes

**Success Codes**
- `200 OK`: Request succeeded
- `201 Created`: Resource created successfully
- `204 No Content`: Request succeeded, no content returned

**Client Error Codes**
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required or failed
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict (e.g., duplicate email)
- `422 Unprocessable Entity`: Validation errors
- `429 Too Many Requests`: Rate limit exceeded

**Server Error Codes**
- `500 Internal Server Error`: Server error
- `503 Service Unavailable`: Service temporarily unavailable

### Common Error Codes

| Code | Description |
|------|-------------|
| `AUTH_INVALID_CREDENTIALS` | Invalid email or password |
| `AUTH_TOKEN_EXPIRED` | Access token has expired |
| `AUTH_TOKEN_INVALID` | Invalid token |
| `VALIDATION_ERROR` | Request validation failed |
| `RESOURCE_NOT_FOUND` | Requested resource not found |
| `PERMISSION_DENIED` | Insufficient permissions |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `DUPLICATE_RESOURCE` | Resource already exists |
| `FILE_TOO_LARGE` | Uploaded file exceeds size limit |
| `INVALID_FILE_TYPE` | Invalid file type |

**Rationale**: Consistent error handling helps developers integrate the API more easily and provides actionable feedback for debugging.

## Rate Limiting

### Rate Limit Strategy
- **Authenticated Users**: 1000 requests per hour
- **Unauthenticated Users**: 100 requests per hour
- **Burst Limit**: 200 requests per minute

### Rate Limit Headers
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 950
X-RateLimit-Reset: 1609459200
```

### Rate Limit Error Response
```json
{
  "error": "Rate limit exceeded",
  "message": "Too many requests. Please try again later.",
  "code": "RATE_LIMIT_EXCEEDED",
  "retry_after": 3600
}
```

**Rationale**: Rate limiting protects the API from abuse and ensures fair resource allocation among users.

## Pagination

### Pagination Strategy
- **Style**: Cursor-based pagination for large datasets
- **Default Page Size**: 20 items
- **Maximum Page Size**: 100 items
- **Supported Parameters**: `page`, `page_size`

### Pagination Response
```json
{
  "count": 150,
  "next": "http://api.example.com/api/v1/applications/?page=2",
  "previous": null,
  "results": [...]
}
```

**Rationale**: Pagination prevents overwhelming responses and improves performance. Cursor-based pagination is efficient for large datasets.

## Filtering and Sorting

### Filtering
Most list endpoints support filtering via query parameters:

```
GET /api/v1/applications/?status=under_review&date_from=2024-01-01&date_to=2024-01-31
```

### Sorting
Sort results using the `ordering` parameter:

```
GET /api/v1/applications/?ordering=-submitted_at
```

- Use `-` prefix for descending order
- Multiple fields: `ordering=status,-submitted_at`

**Rationale**: Filtering and sorting enable clients to retrieve exactly the data they need, reducing bandwidth and processing.

## API Documentation

### OpenAPI/Swagger Documentation
- **URL**: `/api/v1/docs/` (Swagger UI)
- **Schema**: `/api/v1/schema/` (OpenAPI JSON)
- **Redoc**: `/api/v1/redoc/` (Alternative documentation)

### Documentation Features
- Interactive API testing
- Request/response examples
- Authentication information
- Error response documentation
- Data model schemas

**Rationale**: Comprehensive API documentation reduces integration time and support burden. Interactive documentation allows developers to test endpoints directly.

## Webhooks

### Webhook Events
- `application.created`: New application submitted
- `application.status_updated`: Application status changed
- `user.created`: New user registered
- `user.password_reset`: Password reset requested

### Webhook Configuration
Webhook URLs can be configured per organization in the admin panel.

### Webhook Payload
```json
{
  "event": "application.status_updated",
  "timestamp": "2024-01-16T14:20:00Z",
  "data": {
    "application_id": 1,
    "application_number": "APP-2024-0001",
    "old_status": "received",
    "new_status": "under_review"
  }
}
```

### Webhook Security
- HMAC signature verification
- Retry mechanism (3 attempts with exponential backoff)
- Timeout: 10 seconds per attempt

**Rationale**: Webhooks enable real-time integrations with external systems, allowing automation of HR workflows.

## API Security

### Security Headers
```http
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'
```

### CORS Configuration
- **Allowed Origins**: Configured per environment
- **Allowed Methods**: GET, POST, PUT, PATCH, DELETE, OPTIONS
- **Allowed Headers**: Authorization, Content-Type, X-Requested-With
- **Max Age**: 3600 seconds

### Input Validation
- All inputs validated using Django serializers
- SQL injection prevention via ORM
- XSS protection via input sanitization
- File upload validation (type, size, content)

**Rationale**: Comprehensive security measures protect the API and user data from common vulnerabilities.

## API Testing

### Testing Strategy
- Unit tests for all endpoints
- Integration tests for API workflows
- Load testing for performance validation
- Security testing for vulnerability detection

### Test Endpoints
- Test environment: `https://test-api.swifthr.com/api/v1/`
- Test data: Seeded with sample data
- Authentication: Test tokens available

**Rationale**: Comprehensive testing ensures API reliability and performance before production deployment.

## API Version Migration

### Migration Process
1. New version introduced alongside current version
2. Deprecation warnings added to old version endpoints
3. Clients given 6 months to migrate
4. Old version deprecated and removed

### Migration Support
- Migration guide provided
- Breaking changes documented
- Support during migration period
- Backward compatibility maintained where possible

**Rationale**: Structured version migration allows API evolution while minimizing disruption to existing clients.

## Conclusion

The SwiftHR API design provides a robust, secure, and developer-friendly interface for the application. The RESTful architecture, comprehensive authentication, consistent error handling, and thorough documentation ensure that the API can support current requirements while being flexible enough to accommodate future growth.

The API follows industry best practices for versioning, security, and performance, making it suitable for production use in a HR management system that handles sensitive data and requires high reliability.