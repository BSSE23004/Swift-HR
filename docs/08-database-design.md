# SwiftHR - Database Design

## Database Overview

SwiftHR uses PostgreSQL as its primary database, chosen for its reliability, advanced features, and excellent performance for complex queries. The database design follows normalization principles (3NF) to ensure data integrity while maintaining query performance through strategic indexing.

## Database Schema

### Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   User      │       │ Application │       │   Document  │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK)     │◄──────│ id (PK)     │◄──────│ id (PK)     │
│ email       │       │ user_id (FK)│       │ application │
│ password    │       │ application │       │   _id (FK)  │
│ first_name  │       │   _number   │       │ type        │
│ last_name   │       │ position    │       │ url         │
│ phone       │       │ status      │       │ size        │
│ avatar      │       │ personal_   │       │ uploaded_at │
│ role        │       │   info      │       └─────────────┘
│ is_active   │       │ education   │
│ created_at  │       │ experience  │       ┌─────────────┐
│ updated_at  │       │ skills      │       │  StatusLog  │
└─────────────┘       │ cover_      │       ├─────────────┤
                      │   letter    │       │ id (PK)     │
                      │ submitted_at│       │ application │
                      │ updated_at  │       │   _id (FK)  │
                      └─────────────┘       │ old_status  │
                                            │ new_status  │
                                            │ changed_by  │
                                            │ changed_at  │
                                            │ notes       │
                                            └─────────────┘
```

## Table Definitions

### Users Table

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    avatar_url VARCHAR(500),
    role VARCHAR(50) NOT NULL CHECK (role IN ('applicant', 'hr_admin', 'hiring_manager', 'admin')),
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

**Rationale**: The users table stores authentication and profile information. Email is unique for authentication. Role-based access control is implemented through the role field. Indexes optimize common queries like login and user listing.

### Applications Table

```sql
CREATE TABLE applications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    application_number VARCHAR(50) UNIQUE NOT NULL,
    position VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'received' 
        CHECK (status IN ('received', 'under_review', 'interview', 'offer', 'rejected', 'withdrawn')),
    
    -- Personal Information (JSONB for flexibility)
    personal_info JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Education (JSONB array)
    education JSONB NOT NULL DEFAULT '[]'::jsonb,
    
    -- Work Experience (JSONB array)
    experience JSONB NOT NULL DEFAULT '[]'::jsonb,
    
    -- Skills (JSONB array)
    skills JSONB NOT NULL DEFAULT '[]'::jsonb,
    
    -- Cover Letter
    cover_letter TEXT,
    
    -- Metadata
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    submitted_by_ip VARCHAR(45),
    
    -- Soft delete
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_applications_user_id ON applications(user_id);
CREATE INDEX idx_applications_application_number ON applications(application_number);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_submitted_at ON applications(submitted_at);
CREATE INDEX idx_applications_position ON applications(position);
CREATE INDEX idx_applications_personal_info ON applications USING GIN(personal_info);
CREATE INDEX idx_applications_education ON applications USING GIN(education);
CREATE INDEX idx_applications_experience ON applications USING GIN(experience);
CREATE INDEX idx_applications_skills ON applications USING GIN(skills);

-- Composite index for common queries
CREATE INDEX idx_applications_user_status ON applications(user_id, status);
CREATE INDEX idx_applications_status_date ON applications(status, submitted_at);

-- Triggers
CREATE TRIGGER update_applications_updated_at 
    BEFORE UPDATE ON applications 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for application number generation
CREATE TRIGGER generate_application_number 
    BEFORE INSERT ON applications 
    FOR EACH ROW 
    EXECUTE FUNCTION generate_application_number_func();
```

**Rationale**: The applications table stores job applications with flexible JSONB fields for variable data like education and experience. JSONB allows querying and indexing of nested data. Composite indexes optimize common filter combinations. Soft delete enables data recovery.

### Documents Table

```sql
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    application_id INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- File Information
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    
    -- Document Type
    document_type VARCHAR(50) NOT NULL 
        CHECK (document_type IN ('resume', 'cover_letter', 'portfolio', 'certification', 'other')),
    
    -- Storage Information
    storage_path VARCHAR(500),
    storage_provider VARCHAR(50) DEFAULT 'local',
    
    -- Metadata
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    uploaded_by_ip VARCHAR(45),
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP WITH TIME ZONE,
    
    -- Soft delete
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_documents_application_id ON documents(application_id);
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_document_type ON documents(document_type);
CREATE INDEX idx_documents_uploaded_at ON documents(uploaded_at);
CREATE INDEX idx_documents_file_type ON documents(file_type);

-- Trigger
CREATE TRIGGER update_documents_uploaded_at 
    BEFORE UPDATE ON documents 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

**Rationale**: The documents table stores uploaded files with metadata. Separate from applications to support multiple documents per application. File metadata enables validation and management. Document type categorization supports different file purposes.

### Status Logs Table

```sql
CREATE TABLE status_logs (
    id SERIAL PRIMARY KEY,
    application_id INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    
    -- Status Change Information
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    
    -- Change Context
    changed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    changed_by_type VARCHAR(50) DEFAULT 'user' 
        CHECK (changed_by_type IN ('user', 'system', 'api')),
    
    -- Additional Information
    notes TEXT,
    change_reason VARCHAR(255),
    
    -- Timestamp
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Metadata
    ip_address VARCHAR(45),
    user_agent TEXT
);

-- Indexes
CREATE INDEX idx_status_logs_application_id ON status_logs(application_id);
CREATE INDEX idx_status_logs_changed_at ON status_logs(changed_at);
CREATE INDEX idx_status_logs_changed_by ON status_logs(changed_by);
CREATE INDEX idx_status_logs_new_status ON status_logs(new_status);

-- Composite index for application timeline
CREATE INDEX idx_status_logs_app_timeline ON status_logs(application_id, changed_at);
```

**Rationale**: Status logs provide an audit trail of application status changes. This enables tracking, analytics, and compliance requirements. Indexes support timeline queries and change tracking.

### Notifications Table

```sql
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Notification Content
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    
    -- Action Information
    action_url VARCHAR(500),
    action_label VARCHAR(100),
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Related Entity
    related_entity_type VARCHAR(50),
    related_entity_id INTEGER
);

-- Indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notifications_type ON notifications(type);

-- Composite index for user's unread notifications
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read, created_at);

-- Trigger
CREATE TRIGGER update_notifications_read_at 
    BEFORE UPDATE ON notifications 
    FOR EACH ROW 
    WHEN (NEW.is_read = TRUE AND OLD.is_read = FALSE)
    EXECUTE FUNCTION update_read_at_column();
```

**Rationale**: Notifications store in-app messages for users. Read tracking enables notification management. Related entity linking enables context-aware notifications. Indexes optimize notification queries.

### Audit Logs Table

```sql
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    
    -- Action Information
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id INTEGER,
    
    -- Change Details
    old_values JSONB,
    new_values JSONB,
    changed_fields TEXT[],
    
    -- Request Context
    ip_address VARCHAR(45),
    user_agent TEXT,
    request_id VARCHAR(100),
    
    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Partitioning by month for large volume
CREATE TABLE audit_logs_y2024m01 PARTITION OF audit_logs
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

**Rationale**: Audit logs provide comprehensive tracking of all system changes for security and compliance. JSONB storage of old/new values enables detailed change tracking. Partitioning by month manages large data volumes.

### Sessions Table (for Redis fallback)

```sql
CREATE TABLE sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

-- Cleanup job for expired sessions
CREATE INDEX idx_sessions_cleanup ON sessions(expires_at) WHERE expires_at < CURRENT_TIMESTAMP;
```

**Rationale**: Sessions table provides a fallback for session storage if Redis is unavailable. JSONB session data supports flexible session information. Expiration tracking enables automatic cleanup.

### Password Reset Tokens Table

```sql
CREATE TABLE password_reset_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ip_address VARCHAR(45)
);

-- Indexes
CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);

-- Cleanup for expired tokens
CREATE INDEX idx_password_reset_tokens_cleanup ON password_reset_tokens(expires_at) 
    WHERE expires_at < CURRENT_TIMESTAMP AND used = FALSE;
```

**Rationale**: Password reset tokens enable secure password recovery. Token expiration and usage tracking prevent token reuse. IP tracking adds security context.

### OTP Tokens Table

```sql
CREATE TABLE otp_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    otp VARCHAR(10) NOT NULL,
    operation VARCHAR(100) NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    attempts INTEGER DEFAULT 0,
    ip_address VARCHAR(45)
);

-- Indexes
CREATE INDEX idx_otp_tokens_user_id ON otp_tokens(user_id);
CREATE INDEX idx_otp_tokens_otp ON otp_tokens(otp);
CREATE INDEX idx_otp_tokens_expires_at ON otp_tokens(expires_at);

-- Cleanup for expired tokens
CREATE INDEX idx_otp_tokens_cleanup ON otp_tokens(expires_at) 
    WHERE expires_at < CURRENT_TIMESTAMP AND used = FALSE;
```

**Rationale**: OTP tokens support two-factor authentication and sensitive operation verification. Attempt tracking prevents brute force attacks. Operation-specific tokens enable different security levels.

### Settings Table

```sql
CREATE TABLE settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    category VARCHAR(100),
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_settings_key ON settings(key);
CREATE INDEX idx_settings_category ON settings(category);
CREATE INDEX idx_settings_is_public ON settings(is_public);

-- Trigger
CREATE TRIGGER update_settings_updated_at 
    BEFORE UPDATE ON settings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

**Rationale**: Settings table provides flexible application configuration. JSONB values support various data types. Public/private settings distinction allows client-accessible configuration.

## Database Functions and Triggers

### Updated At Trigger Function

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';
```

### Application Number Generation Function

```sql
CREATE OR REPLACE FUNCTION generate_application_number_func()
RETURNS TRIGGER AS $$
DECLARE
    year_part TEXT;
    sequence_part TEXT;
BEGIN
    year_part := TO_CHAR(CURRENT_TIMESTAMP, 'YYYY');
    
    -- Get next sequence number for this year
    SELECT LPAD((COALESCE(MAX(
        CAST(SUBSTRING(application_number FROM '\d+$') AS INTEGER)
    ), 0) + 1)::TEXT, 4, '0')
    INTO sequence_part
    FROM applications
    WHERE application_number LIKE 'APP-' || year_part || '-%';
    
    NEW.application_number := 'APP-' || year_part || '-' || sequence_part;
    RETURN NEW;
END;
$$ language 'plpgsql';
```

### Read At Trigger Function

```sql
CREATE OR REPLACE FUNCTION update_read_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.read_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';
```

## Data Integrity Constraints

### Foreign Key Constraints
All foreign key relationships are explicitly defined with appropriate actions:
- `ON DELETE CASCADE`: Automatically delete dependent records
- `ON DELETE SET NULL`: Set foreign key to NULL when parent is deleted
- `ON DELETE RESTRICT`: Prevent deletion if dependent records exist

### Check Constraints
- Role validation in users table
- Status validation in applications table
- Document type validation in documents table
- Changed by type validation in status logs

### Unique Constraints
- Email uniqueness in users table
- Application number uniqueness in applications table
- Token uniqueness in password reset and OTP tables

### Not Null Constraints
All required fields have NOT NULL constraints to ensure data completeness.

## Indexing Strategy

### Primary Indexes
All tables have primary key indexes on `id` fields for efficient record retrieval.

### Foreign Key Indexes
All foreign key columns are indexed to improve JOIN performance.

### Functional Indexes
- JSONB GIN indexes for querying nested data
- Composite indexes for common query patterns
- Partial indexes for frequently filtered subsets

### Index Maintenance
- Regular index analysis and vacuum
- Monitor index usage statistics
- Remove unused indexes
- Rebuild fragmented indexes

## Data Archival Strategy

### Archival Policy
- Move applications older than 3 years to archival storage
- Archive audit logs older than 1 year
- Archive notifications older than 6 months
- Keep current year's data in primary tables

### Archival Implementation
```sql
-- Archive old applications
CREATE TABLE applications_archive (LIKE applications INCLUDING ALL);

-- Move old data
INSERT INTO applications_archive
SELECT * FROM applications
WHERE submitted_at < CURRENT_TIMESTAMP - INTERVAL '3 years';

DELETE FROM applications
WHERE submitted_at < CURRENT_TIMESTAMP - INTERVAL '3 years';
```

## Backup Strategy

### Backup Types
- **Full Daily Backups**: Complete database backup every day at 2 AM
- **Incremental Hourly Backups**: Changes since last backup every hour
- **Weekly Full Backups**: Complete backup with longer retention

### Backup Retention
- Daily backups: 30 days
- Weekly backups: 12 months
- Monthly backups: 3 years

### Backup Verification
- Regular restore testing
- Backup integrity checks
- Monitoring backup success/failure

## Database Security

### Access Control
- Separate database users for different applications
- Principle of least privilege
- Regular access reviews
- Encrypted connections (SSL/TLS)

### Data Encryption
- Transit encryption: SSL/TLS
- At-rest encryption: PostgreSQL encryption or disk encryption
- Sensitive field encryption: Consider encryption for PII

### Security Auditing
- Enable PostgreSQL logging
- Monitor access patterns
- Regular security audits
- Intrusion detection

## Performance Optimization

### Query Optimization
- Use EXPLAIN ANALYZE for slow queries
- Optimize frequently executed queries
- Use prepared statements
- Implement connection pooling

### Caching Strategy
- Redis caching for frequently accessed data
- Materialized views for complex aggregations
- Query result caching
- Application-level caching

### Connection Pooling
- PgBouncer for connection pooling
- Configure appropriate pool sizes
- Monitor connection usage
- Implement connection timeouts

## Monitoring and Maintenance

### Monitoring Metrics
- Database size and growth
- Query performance
- Index usage statistics
- Connection pool usage
- Lock contention
- Replication lag (if applicable)

### Maintenance Tasks
- Regular VACUUM and ANALYZE
- Index reindexing
- Statistics updates
- Log rotation
- Partition maintenance

### Alerting
- Database connection failures
- Slow query alerts
- Disk space warnings
- Replication issues
- Backup failures

## Migration Strategy

### Migration Process
1. Create migration script with backward compatibility
2. Test migration on staging environment
3. Schedule maintenance window
4. Execute migration
5. Verify migration success
6. Update application code
7. Monitor for issues

### Rollback Plan
- Pre-tested rollback scripts
- Data backup before migration
- Clear rollback criteria
- Communication plan

## Disaster Recovery

### Recovery Procedures
1. Identify failure scope
2. Determine recovery point objective (RPO)
3. Select appropriate backup
4. Execute restore procedure
5. Verify data integrity
6. Update DNS/routing if needed
7. Monitor system stability

### Recovery Testing
- Quarterly disaster recovery drills
- Document recovery procedures
- Train operations team
- Update procedures based on lessons learned

## Conclusion

The SwiftHR database design provides a robust foundation for storing and managing HR application data. The schema balances normalization for data integrity with performance optimization through strategic indexing. JSONB fields provide flexibility for variable data while maintaining query capabilities.

The design supports the application's functional requirements while ensuring data security, performance, and scalability. Comprehensive indexing, partitioning, and archival strategies ensure the database can handle growth in data volume and user count while maintaining performance.

Regular maintenance, monitoring, and backup procedures ensure data reliability and availability, which is critical for a production HR management system handling sensitive personal and professional information.