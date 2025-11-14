# Reports Database Setup for Neon DB

This guide explains how to set up the reports table in your Neon PostgreSQL database with mock data and file storage.

## 📋 Overview

The reports feature includes:
- **Database Schema**: Reports table with enums for status, frequency, and format
- **Mock Data**: 15 realistic hospital reports covering various departments
- **File Storage**: Integration-ready utilities for Vercel Blob, AWS S3, or Cloudflare R2

## 🗄️ Database Schema

The reports table includes:
- **Basic Info**: title, description, department, category
- **Status Management**: DRAFT, GENERATED, PUBLISHED, ARCHIVED
- **Scheduling**: frequency (DAILY, WEEKLY, MONTHLY, QUARTERLY, YEARLY, ON_DEMAND)
- **Format**: PDF, EXCEL, CSV, DASHBOARD
- **File Storage**: file_url, file_size (stores reference, not binary data)
- **Parameters**: JSONB field for custom report configurations
- **Audit Fields**: created_at, updated_at, created_by, generated_by

## 🚀 Quick Start

### 1. Run the Migration

Apply the reports table migration to your Neon database:

```bash
# Using Drizzle Kit
npx drizzle-kit push:pg

# Or manually apply the SQL file
psql $DATABASE_URL -f lib/db/migrations/0003_add_reports_table.sql
```

### 2. Seed Mock Data

Run the seed script to populate 15 mock reports:

```bash
npx tsx lib/db/seed-reports.ts
```

This will create:
- **3 DRAFT** reports (not yet generated)
- **6 GENERATED** reports (created but not published)
- **5 PUBLISHED** reports (live and available)
- **1 ARCHIVED** report (historical data)

### 3. Verify the Data

Check that reports were created:

```sql
SELECT status, COUNT(*)
FROM reports
GROUP BY status;
```

## 📁 File Storage Strategy

### Why Not Store Files in Neon DB?

While Postgres supports binary data (`bytea`), it's **not recommended** for file storage because:
- ❌ Increases database size and backup times
- ❌ Slower queries and performance
- ❌ More expensive than blob storage
- ❌ Difficult to serve files via CDN

### Recommended Approach: External Blob Storage

Store only file **URLs** in Neon DB, and actual files in blob storage:

```typescript
// Database stores only metadata
{
  fileUrl: "https://blob.vercel-storage.com/reports/patient-stats-2024-11.pdf",
  fileSize: 2457600, // 2.4 MB
  mimeType: "application/pdf"
}
```

## 🔧 Storage Options

### Option 1: Vercel Blob Storage (Recommended for Vercel + Neon)

**Best for**: Vercel deployments with Neon database

```bash
# Install package
npm install @vercel/blob

# Add to .env.local
BLOB_READ_WRITE_TOKEN=vercel_blob_...
```

**Usage**:
```typescript
import { put } from '@vercel/blob'
import { uploadToVercelBlob } from '@/lib/utils/file-upload'

const result = await uploadToVercelBlob(file, {
  folder: 'reports'
})

// Save result.url to database
await updateReport(reportId, {
  fileUrl: result.url,
  fileSize: result.size
})
```

**Pricing**:
- Free tier: 500 MB storage, 1 GB bandwidth
- Pro: $0.15/GB storage, $0.30/GB bandwidth

### Option 2: AWS S3

**Best for**: Existing AWS infrastructure

```bash
# Install SDK
npm install @aws-sdk/client-s3

# Add to .env
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
AWS_S3_BUCKET=my-hospital-reports
```

**Usage**:
```typescript
import { uploadToS3 } from '@/lib/utils/file-upload'

const result = await uploadToS3(file, { folder: 'reports' })
```

**Pricing**:
- Storage: ~$0.023/GB/month
- Requests: $0.005 per 1,000 PUT requests

### Option 3: Cloudflare R2

**Best for**: Cost-effective, no egress fees

```bash
# Add to .env
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=hospital-reports
```

**Usage**:
```typescript
import { uploadToCloudflareR2 } from '@/lib/utils/file-upload'

const result = await uploadToCloudflareR2(file, {
  folder: 'reports'
})
```

**Pricing**:
- Free tier: 10 GB storage, 1 million requests/month
- Storage: $0.015/GB/month
- **No egress fees** 🎉

### Option 4: Supabase Storage

**Best for**: If already using Supabase

```bash
npm install @supabase/supabase-js

# Add to .env
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

## 📊 Mock Report Data Details

The seed script creates 15 diverse reports:

| Category | Count | Examples |
|----------|-------|----------|
| Patient Stats | 2 | Monthly admissions, ED performance |
| Financial | 1 | Monthly financial performance |
| Staff/HR | 2 | Productivity analysis, recruitment |
| Quality | 4 | Quality indicators, infection control, satisfaction |
| Operations | 4 | Department utilization, medication usage, radiology |
| Compliance | 1 | Regulatory compliance |
| Equipment | 1 | Maintenance schedule |
| Inventory | 1 | Supply chain status |

### Report Parameters Examples

Each report includes realistic parameters:

```typescript
// Patient Statistics
{
  startDate: "2024-11-01",
  endDate: "2024-11-30",
  includeCharts: true,
  departments: ["Emergency", "Surgery", "Pediatrics"]
}

// Financial Report
{
  fiscalYear: 2024,
  quarter: "Q4",
  compareWithPrevious: true
}

// Dashboard (Real-time)
{
  realTime: true,
  alertThresholds: {
    waitTime: 30,
    occupancyRate: 85
  }
}
```

## 🔐 Security Best Practices

### 1. File Upload Validation

Always validate files before upload:

```typescript
import { validateFile } from '@/lib/utils/file-upload'

const validation = validateFile(file, {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['application/pdf', 'application/vnd.ms-excel']
})

if (!validation.valid) {
  throw new Error(validation.error)
}
```

### 2. Access Control

Implement proper authorization:

```typescript
// Check user permissions before allowing file access
if (!canAccessReport(userId, reportId)) {
  return new Response('Unauthorized', { status: 403 })
}
```

### 3. Signed URLs

Use temporary signed URLs for sensitive files:

```typescript
// Vercel Blob example
import { getSignedUrl } from '@vercel/blob'

const { url } = await getSignedUrl(fileUrl, {
  expiresIn: 3600 // 1 hour
})
```

## 🎯 Next Steps

### 1. Choose Storage Provider

Pick based on your needs:
- **Vercel deployment** → Vercel Blob
- **AWS infrastructure** → S3
- **Cost-conscious** → Cloudflare R2
- **Open source** → Supabase Storage

### 2. Implement File Upload

Create an API route for file uploads:

```typescript
// app/api/reports/upload/route.ts
import { uploadToVercelBlob } from '@/lib/utils/file-upload'

export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get('file') as File

  const result = await uploadToVercelBlob(file, {
    folder: 'reports'
  })

  return Response.json(result)
}
```

### 3. Update Report Generation

Modify report actions to save files:

```typescript
// lib/actions/v2/reports.ts
export async function generateReport(reportId: string) {
  // Generate PDF/Excel file
  const fileBlob = await generatePDF(reportData)

  // Upload to storage
  const uploaded = await uploadToVercelBlob(fileBlob, {
    folder: 'reports'
  })

  // Update database with file URL
  await updateReport(reportId, {
    fileUrl: uploaded.url,
    fileSize: uploaded.size,
    lastGenerated: new Date(),
    status: 'GENERATED'
  })
}
```

## 📈 Monitoring

### Track Storage Usage

Monitor your storage consumption:

```sql
-- Total file storage used
SELECT
  COUNT(*) as total_reports,
  SUM(file_size) as total_bytes,
  ROUND(SUM(file_size) / 1024.0 / 1024.0, 2) as total_mb
FROM reports
WHERE file_url IS NOT NULL;

-- Storage by department
SELECT
  department,
  COUNT(*) as reports,
  ROUND(SUM(file_size) / 1024.0 / 1024.0, 2) as storage_mb
FROM reports
WHERE file_url IS NOT NULL
GROUP BY department
ORDER BY storage_mb DESC;
```

### Cleanup Old Reports

Archive or delete old reports to save storage:

```sql
-- Archive reports older than 1 year
UPDATE reports
SET status = 'ARCHIVED'
WHERE created_at < NOW() - INTERVAL '1 year'
  AND status = 'PUBLISHED';

-- Delete archived reports older than 2 years
DELETE FROM reports
WHERE status = 'ARCHIVED'
  AND created_at < NOW() - INTERVAL '2 years';
```

## 🐛 Troubleshooting

### Migration Fails

If the migration fails due to existing enums:

```sql
-- Drop existing enums if needed
DROP TYPE IF EXISTS report_status CASCADE;
DROP TYPE IF EXISTS report_frequency CASCADE;
DROP TYPE IF EXISTS report_format CASCADE;

-- Then re-run migration
```

### Seed Script Errors

If seeding fails:

```bash
# Clear existing data
psql $DATABASE_URL -c "DELETE FROM reports;"

# Re-run seed
npx tsx lib/db/seed-reports.ts
```

### File Upload Issues

Check your environment variables:

```bash
# Vercel Blob
echo $BLOB_READ_WRITE_TOKEN

# AWS S3
echo $AWS_ACCESS_KEY_ID

# Cloudflare R2
echo $R2_ACCOUNT_ID
```

## 📚 Additional Resources

- [Neon Documentation](https://neon.tech/docs)
- [Vercel Blob Storage](https://vercel.com/docs/storage/vercel-blob)
- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
- [Drizzle ORM](https://orm.drizzle.team/)

## ✅ Checklist

Before deploying to production:

- [ ] Choose and configure blob storage provider
- [ ] Run database migration in Neon
- [ ] Test file upload functionality
- [ ] Implement access control
- [ ] Set up file cleanup/archival strategy
- [ ] Configure CDN for file delivery (optional)
- [ ] Monitor storage usage
- [ ] Test file download functionality
- [ ] Implement backup strategy
- [ ] Document report generation workflow

---

**Questions or Issues?**
Check the troubleshooting section or review the code in:
- `lib/db/migrations/0003_add_reports_table.sql`
- `lib/db/seed-reports.ts`
- `lib/utils/file-upload.ts`
