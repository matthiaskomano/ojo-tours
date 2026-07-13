# OJO Tours - Feature Documentation

## Project Overview

OJO Tours is a luxury safari and tour booking platform built with Next.js, featuring role-based access control for administrators and tourists. The platform allows users to browse tours, lodges, and journals, make bookings, and manage their travel experiences.

---

## Current Features

### Authentication & Authorization
- **Supabase Authentication** - Secure user authentication with email verification
- **Role-Based Access Control (RBAC)** - Four user roles:
  - SUPER_ADMIN - Full system access
  - ADMIN - Administrative functions
  - STAFF - Limited admin access
  - TOURIST - Customer access
- **User Profile Management** - Profile editing and preferences
- **Session Management** - Secure session handling with cookies

### Admin Dashboard
- **Overview Dashboard** - Statistics and metrics for bookings, tours, revenue
- **Tour Management** - Create, edit, delete tours with images, pricing, descriptions
- **Lodge Management** - Manage accommodation listings
- **Booking Management** - View, approve, decline bookings with status tracking
- **Gallery Management** - Image gallery with masonry layout
- **Journal/Blog Management** - Travel journal content management
- **Team Management** - Team member profiles and bios
- **Contact Form Management** - Handle customer inquiries
- **Newsletter Management** - Subscriber management
- **Settings Management** - Site-wide configuration
- **Reports** - Basic reporting and analytics
- **Export to Excel** - Data export functionality

### Tourist Dashboard
- **My Bookings** - View and manage personal bookings
- **Wishlist** - Save favorite tours, lodges, and journals
- **Reviews** - Write and manage reviews for tours and lodges
- **Payment History** - Track payment transactions
- **Notifications** - Receive booking and system notifications
- **Profile Settings** - Manage personal information
- **Support Center** - Contact support team (form interface)
- **Trips** - View upcoming and past trips

### Public Pages
- **Home Page** - Hero section, featured tours, gallery, testimonials
- **Tours Page** - Browse tours with category filtering and search
- **Lodges Page** - Browse accommodation options
- **Journal Page** - Travel blog and stories
- **About Page** - Company information
- **Contact Page** - Contact form with map integration
- **Custom Itinerary Modal** - Request bespoke travel experiences

### Booking System
- **Standard Booking** - Book tours and lodges
- **Custom Itinerary Requests** - Request personalized trips
- **Booking Status Tracking** - Pending, Confirmed, Declined, Cancelled
- **Email Notifications** - Automatic email alerts for new bookings
- **Guest Management** - Track number of guests per booking

### Content Management
- **Image Upload** - Upload images via ImgBB integration
- **Rich Content** - Support for detailed descriptions
- **Categories** - Organize content by categories
- **Featured Items** - Highlight specific content

### Database Models
- **Tour** - Tour packages with pricing, duration, location
- **Lodge** - Accommodation with amenities
- **Journal** - Blog posts and travel stories
- **Booking** - Reservation records with user linkage
- **Wishlist** - User-saved items
- **Review** - User reviews and ratings
- **Gallery** - Image gallery
- **Team** - Team member profiles
- **Notification** - User notifications
- **User** - User accounts with roles
- **Role** - User role definitions
- **Permission** - Granular permissions (future-ready)
- **Session** - Session management
- **Payment** - Payment transaction records
- **Settings** - Site configuration
- **Contact** - Contact form submissions
- **NewsletterSubscriber** - Newsletter subscriptions

---

## Planned Features (Integration Roadmap)

### Phase 1: Payment Processing Integration (Priority: HIGH)

**Description:** Integrate Stripe payment gateway for actual payment processing.

**Features:**
- Stripe payment intent creation
- Secure payment checkout flow
- Webhook handling for payment confirmations
- Refund management system
- Payment history tracking
- Multi-currency support

**Database Changes:**
- Add Stripe payment intent ID to Payment model
- Add Stripe customer ID to User model
- Add refund tracking fields

**Files to Create:**
- `src/lib/stripe.ts` - Stripe client configuration
- `src/app/api/stripe/webhook/route.ts` - Webhook handler
- `src/app/api/payments/create-intent/route.ts` - Payment intent API
- `src/components/payment/payment-form.tsx` - Payment UI

**Files to Modify:**
- `src/actions/bookingActions.ts` - Integrate payment processing
- `src/actions/touristActions.ts` - Track payment status
- `prisma/schema.prisma` - Update Payment model

**Dependencies:**
- `stripe`
- `@stripe/stripe-js`

---

### Phase 2: Support Ticket System (Priority: HIGH)

**Description:** Complete support ticket system with conversation tracking.

**Features:**
- Ticket creation and management
- Ticket status workflow (Open, In Progress, Resolved, Closed)
- Priority levels (Low, Medium, High, Urgent)
- Message threading between users and admins
- Email notifications for ticket updates
- Admin support dashboard
- Ticket categories and assignment

**Database Changes:**
- Add SupportTicket model
- Add SupportMessage model
- Link to User model

**Files to Create:**
- `src/actions/supportActions.ts` - Ticket management actions
- `src/app/(dashboard)/dashboard/admin/support/page.tsx` - Admin support dashboard
- `src/app/(dashboard)/dashboard/admin/support/[id]/page.tsx` - Ticket detail view
- `src/components/support/ticket-card.tsx` - Ticket UI component
- `src/components/support/message-thread.tsx` - Message thread component

**Files to Modify:**
- `src/app/(dashboard)/dashboard/tourist/support/page.tsx` - Integrate ticket system
- `prisma/schema.prisma` - Add support models

---

### Phase 3: Real-time Notifications (Priority: MEDIUM)

**Description:** Implement real-time notification system using Supabase Realtime.

**Features:**
- Real-time notification updates
- Live booking status changes
- Instant notification badge updates
- Real-time support chat (future)
- WebSocket connection management

**Files to Create:**
- `src/contexts/notification-context.tsx` - Notification context provider
- `src/hooks/use-realtime-notifications.ts` - Realtime hook
- `src/lib/realtime.ts` - Realtime utilities

**Files to Modify:**
- `src/app/(dashboard)/dashboard/tourist/layout.tsx` - Add notification provider
- `src/components/tourist/tourist-sidebar.tsx` - Real-time badge updates
- `src/app/(dashboard)/dashboard/tourist/notifications/page.tsx` - Real-time updates

**Dependencies:**
- Uses existing Supabase Realtime capabilities

---

### Phase 4: Advanced Search & Filtering (Priority: MEDIUM)

**Description:** Enhance search and filtering capabilities across the platform.

**Features:**
- Date range filtering for bookings
- Price range sliders for tours/lodges
- Location-based search with geocoding
- Advanced filter combinations
- Search history for logged-in users
- Saved search filters

**Files to Create:**
- `src/components/search/date-range-picker.tsx` - Date picker component
- `src/components/search/price-range-slider.tsx` - Price slider component
- `src/components/search/advanced-filters.tsx` - Advanced filters UI
- `src/lib/search-utils.ts` - Search utility functions
- `src/app/api/search/advanced/route.ts` - Advanced search API

**Files to Modify:**
- `src/app/(public)/tours/page.tsx` - Add advanced filters
- `src/app/(public)/lodges/page.tsx` - Add advanced filters
- `src/actions/tourActions.ts` - Add advanced search logic
- `src/actions/lodgeActions.ts` - Add advanced search logic

---

### Phase 5: Email Template System (Priority: MEDIUM)

**Description:** Centralized email template management system.

**Features:**
- Email template editor UI
- Template variable system
- Template categories (booking, notification, marketing)
- Email preview functionality
- Email sending history tracking
- Template versioning

**Database Changes:**
- Add EmailTemplate model
- Add EmailLog model

**Files to Create:**
- `src/actions/emailActions.ts` - Email management actions
- `src/app/(dashboard)/dashboard/admin/email-templates/page.tsx` - Template list
- `src/app/(dashboard)/dashboard/admin/email-templates/[id]/edit/page.tsx` - Template editor
- `src/components/email/template-editor.tsx` - Template editor component
- `src/lib/email-templates.ts` - Template utilities

**Files to Modify:**
- `src/actions/bookingActions.ts` - Use template system
- `prisma/schema.prisma` - Add email models

---

### Phase 6: Booking Calendar System (Priority: MEDIUM)

**Description:** Availability calendar and booking management system.

**Features:**
- Availability calendar UI
- Date conflict detection
- Seasonal pricing support
- Blackout dates management
- Booking calendar view for admin
- Available spots tracking

**Database Changes:**
- Add Availability model

**Files to Create:**
- `src/actions/availabilityActions.ts` - Availability management
- `src/components/calendar/availability-calendar.tsx` - Calendar UI
- `src/components/calendar/booking-calendar.tsx` - Booking calendar
- `src/app/(dashboard)/dashboard/admin/calendar/page.tsx` - Admin calendar page

**Files to Modify:**
- `src/actions/bookingActions.ts` - Check availability before booking
- `prisma/schema.prisma` - Add Availability model

---

### Phase 7: Review Moderation (Priority: LOW)

**Description:** Admin review moderation and management system.

**Features:**
- Review moderation queue
- Approve/reject reviews
- Review response system
- Verified review badges
- Review reporting system
- Review analytics

**Database Changes:**
- Add moderation status to Review model
- Add admin response fields
- Add verification tracking

**Files to Create:**
- `src/app/(dashboard)/dashboard/admin/reviews/page.tsx` - Admin reviews page
- `src/components/review/moderation-card.tsx` - Review moderation component

**Files to Modify:**
- `src/actions/touristActions.ts` - Add moderation checks
- `prisma/schema.prisma` - Update Review model

---

### Phase 8: Reporting & Analytics (Priority: LOW)

**Description:** Comprehensive reporting and business analytics.

**Features:**
- Detailed financial reports
- Customer analytics dashboard
- Tour performance metrics
- Revenue trends and forecasting
- Customer lifetime value tracking
- Conversion rate analytics
- Export reports to PDF/Excel

**Files to Create:**
- `src/actions/analyticsActions.ts` - Analytics data fetching
- `src/app/(dashboard)/dashboard/admin/analytics/page.tsx` - Analytics dashboard
- `src/components/analytics/revenue-chart.tsx` - Revenue visualization
- `src/components/analytics/customer-metrics.tsx` - Customer analytics
- `src/components/analytics/tour-performance.tsx` - Tour metrics

---

### Phase 9: File Management System (Priority: LOW)

**Description:** Centralized file management for documents and media.

**Features:**
- File manager UI
- Document storage for itineraries
- Bulk upload functionality
- File organization with folders
- File usage tracking
- File versioning

**Files to Create:**
- `src/actions/fileActions.ts` - File management actions
- `src/app/(dashboard)/dashboard/admin/files/page.tsx` - File manager
- `src/components/files/file-manager.tsx` - File manager component
- `src/components/files/bulk-upload.tsx` - Bulk upload component

---

### Phase 10: Multi-language Support (Priority: LOW)

**Description:** Internationalization (i18n) for multiple languages.

**Features:**
- Multi-language support (English, French for Rwanda region)
- Language switcher component
- RTL support for Arabic (future)
- Translation file management
- Localized date/time formatting
- Localized currency formatting

**Files to Create:**
- `src/i18n/config.ts` - i18n configuration
- `src/i18n/en.json` - English translations
- `src/i18n/fr.json` - French translations
- `src/components/language-switcher.tsx` - Language switcher

**Files to Modify:**
- `src/app/layout.tsx` - Add i18n provider
- All component files - Extract hardcoded strings

**Dependencies:**
- `next-intl`

---

## Implementation Order

1. **Phase 1** - Payment Processing (Critical for revenue)
2. **Phase 2** - Support Ticket System (Critical for customer service)
3. **Phase 3** - Real-time Notifications (Enhances UX)
4. **Phase 4** - Advanced Search (Improves conversion)
5. **Phase 5** - Email Templates (Marketing efficiency)
6. **Phase 6** - Booking Calendar (Operational efficiency)
7. **Phase 7** - Review Moderation (Content quality)
8. **Phase 8** - Reporting & Analytics (Business insights)
9. **Phase 9** - File Management (Content management)
10. **Phase 10** - Multi-language Support (Market expansion)

---

## Integration Principles

- **Non-breaking changes:** All new features are additive
- **Backward compatibility:** Existing features remain functional
- **Gradual rollout:** Each phase can be deployed independently
- **Feature flags:** Use environment variables to enable/disable features
- **Database migrations:** Use Prisma migrate for schema changes
- **Testing strategy:** Each phase includes testing approach

---

## Risk Mitigation

- Backup database before schema changes
- Test payment integration in Stripe test mode
- Use feature flags for real-time features
- Monitor performance after each deployment
- Maintain rollback plan for each phase

---

## Tech Stack

- **Framework:** Next.js 16
- **Language:** TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** Supabase Auth
- **Styling:** TailwindCSS
- **UI Components:** shadcn/ui
- **Email:** Resend
- **Image Hosting:** ImgBB
- **State Management:** React hooks
- **Forms:** React Hook Form + Zod
- **Charts:** Recharts
- **Animations:** Framer Motion

---

## Development Commands

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Generate Prisma client
pnpm prisma generate

# Run database migrations
pnpm prisma migrate dev

# Seed database
pnpm seed

# Lint code
pnpm lint
```

---

## Environment Variables

Required environment variables:

```env
# Database
DATABASE_URL=
DIRECT_URL=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Email (Resend)
RESEND_API_KEY=

# App URL
NEXT_PUBLIC_APP_URL=
```

---

## Database Schema

The database uses Prisma ORM with the following main models:
- User, Role, Permission, Session
- Tour, Lodge, Journal
- Booking, Wishlist, Review
- Gallery, Team
- Notification, Payment
- Settings, Contact, NewsletterSubscriber

See `prisma/schema.prisma` for complete schema definition.

---

## Current Status

**Completed Features:**
- ✅ Authentication & Authorization
- ✅ Admin Dashboard (basic)
- ✅ Tourist Dashboard (basic)
- ✅ Public Pages
- ✅ Booking System
- ✅ Email Notifications (basic)
- ✅ Content Management

**In Progress:**
- 🚧 Payment Processing (Phase 1)
- 🚧 Support Ticket System (Phase 2)

**Planned:**
- 📋 Real-time Notifications (Phase 3)
- 📋 Advanced Search (Phase 4)
- 📋 Email Templates (Phase 5)
- 📋 Booking Calendar (Phase 6)
- 📋 Review Moderation (Phase 7)
- 📋 Reporting & Analytics (Phase 8)
- 📋 File Management (Phase 9)
- 📋 Multi-language Support (Phase 10)

---

## Contributing

When adding new features:
1. Follow the phased approach outlined above
2. Ensure backward compatibility
3. Update this documentation
4. Add appropriate tests
5. Follow existing code style and patterns

---

## License

[Add your license information here]
