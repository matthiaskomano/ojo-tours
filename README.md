# OJO Tours

A comprehensive Next.js tourism platform built with Supabase, Prisma, and TypeScript.

## Quick Start

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env

# Run database migrations
pnpm prisma db push

# Seed database
pnpm prisma db seed

# Start development server
pnpm dev
```

## Key Features

- **Booking System**: Tour and lodge bookings with payment plans
- **User Management**: Role-based access control (Admin, Staff, Tourist)
- **Real-time Notifications**: Live updates using Supabase Realtime
- **Email Notifications**: Comprehensive email system using Resend
- **Content Management**: Tours, lodges, journals, gallery, and team management
- **Payment Tracking**: Deposit management and payment history
- **Waitlist System**: Automatic waitlist management and notifications

## Documentation

- [Email Notification System](EMAIL_NOTIFICATION_SYSTEM.md) - Email notification implementation
- [Real-time Setup](REALTIME_SETUP.md) - Realtime notification configuration
- [Feature Roadmap](OJO-TOURS-FEATURE-ROADMAP.md) - Strategic development plan
- [SEO Implementation Guide](SEO_IMPLEMENTATION_GUIDE.md) - SEO optimization details

## Utility Scripts

```bash
# Test email notifications (requires RESEND_API_KEY and TEST_EMAIL)
export TEST_EMAIL="your-email@example.com"
npx tsx scripts/test-email-notifications.ts

# Diagnose realtime connection issues
npx tsx scripts/diagnose-realtime.ts

# Test notification system
npx tsx scripts/test-notifications.ts <userId>

# Update user role
npx tsx scripts/updateUserRole.ts <userId> <roleId>
```

## Environment Variables

```env
# Database
DATABASE_URL=your_database_url
DIRECT_URL=your_direct_url

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Email
RESEND_API_KEY=your_resend_api_key

# Authentication
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=your_nextauth_url
```

## Tech Stack

- **Framework**: Next.js 16.2.6 (App Router)
- **Language**: TypeScript 5
- **Database**: PostgreSQL with Prisma ORM 6.19.3
- **Backend**: Supabase (Auth, Database, Storage, Realtime)
- **Email**: Resend
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui
- **Forms**: React Hook Form + Zod

## Notification System

OJO Tours uses an **email-only notification system** as the primary communication channel. All important notifications are delivered via email using the Resend email service.

### Email Notification Types

1. Booking Confirmation Email
2. Cancellation Email
3. Waitlist Confirmation Email
4. Waitlist Availability Email
5. Payment Confirmation Email
6. Refund Notification Email
7. Payment Reminder Email

For detailed information about the email notification system, see [EMAIL_NOTIFICATION_SYSTEM.md](EMAIL_NOTIFICATION_SYSTEM.md).

## License

[Your License Here]
