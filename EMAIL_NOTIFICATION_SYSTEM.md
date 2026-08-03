# Email Notification System Documentation

## Overview

OJO Tours uses an **email-only notification system** as the primary communication channel with users. All important notifications are delivered via email using the Resend email service. This approach ensures reliable delivery, provides a permanent record of communications, and works for all users regardless of their online status.

## Architecture

### Email Service Provider

- **Provider**: Resend (resend.com)
- **Configuration**: Environment variable `RESEND_API_KEY`
- **From Addresses**:
  - Bookings: `bookings@ojotours.com`
  - Payments: `payments@ojotours.com`

### System Components

1. **Email Actions** (`src/actions/emailActions.ts`)
   - Booking confirmation emails
   - Cancellation emails
   - Waitlist confirmation emails
   - Waitlist availability notifications
   - Payment reminder emails

2. **Payment Actions** (`src/actions/paymentActions.ts`)
   - Payment confirmation emails
   - Refund notification emails
   - Payment reminder emails

3. **Booking Actions** (`src/actions/bookingActions.ts`)
   - New booking notifications to admin
   - Booking status change notifications

## Email Notification Types

### 1. Booking Confirmation Email

**Trigger**: When a booking status is changed to "Confirmed"

**Content Includes**:
- Booking details (item name, type, date, guests)
- Total price and payment type
- Deposit amount (if applicable)
- Remaining balance (if applicable)
- Special requests
- Payment reminder for deposit bookings

**Function**: `sendBookingConfirmationEmail(bookingId: string)`

**File**: `src/actions/emailActions.ts`

### 2. Cancellation Email

**Trigger**: When a booking is cancelled

**Content Includes**:
- Booking details
- Cancellation reason (if provided)
- Refund percentage and amount
- Refund processing timeline (5-7 business days)

**Function**: `sendCancellationEmail(booking, refundAmount, refundPercentage)`

**File**: `src/actions/emailActions.ts`

### 3. Waitlist Confirmation Email

**Trigger**: When a user joins a waitlist

**Content Includes**:
- Waitlisted item details
- Preferred date and number of guests
- Waitlist ID
- Processing timeline (24-48 hours)

**Function**: `sendWaitlistConfirmationEmail(waitlistEntry)`

**File**: `src/actions/emailActions.ts`

### 4. Waitlist Availability Email

**Trigger**: When a spot becomes available for a waitlisted user

**Content Includes**:
- Available item details
- Original waitlist preferences
- Contact information
- 24-hour response window

**Function**: `sendWaitlistAvailabilityNotification(waitlistId: string)`

**File**: `src/actions/emailActions.ts`

### 5. Payment Confirmation Email

**Trigger**: When a payment is successfully recorded

**Content Includes**:
- Payment amount and type
- Payment method
- Transaction ID
- Booking details
- Payment status

**Function**: `sendPaymentConfirmationEmail(paymentId: string)`

**File**: `src/actions/paymentActions.ts`

### 6. Refund Notification Email

**Trigger**: When a refund is processed

**Content Includes**:
- Original payment amount
- Refund amount
- Refund reason
- Transaction ID
- Processing timeline (5-7 business days)

**Function**: `sendRefundNotificationEmail(paymentId, refundAmount, refundReason)`

**File**: `src/actions/paymentActions.ts`

### 7. Payment Reminder Email

**Trigger**: When a payment is due (manual trigger on booking confirmation)

**Content Includes**:
- Installment number
- Payment amount
- Due date
- Booking ID
- Late payment consequences

**Function**: `sendPaymentReminderEmail(bookingId: string)`

**File**: `src/actions/paymentActions.ts` and `src/actions/emailActions.ts`

## Integration Points

### Booking System

Email notifications are integrated into the booking workflow:

```typescript
// In bookingActions.ts
await sendBookingConfirmationEmail(id);
await sendPaymentReminderEmail(booking.id);
```

### Payment System

Email notifications are triggered on payment events:

```typescript
// In paymentActions.ts
await sendPaymentConfirmationEmail(payment.id);
await sendRefundNotificationEmail(payment.id, refundAmount, refundReason);
```

### Waitlist System

Email notifications are sent for waitlist operations:

```typescript
// In waitlistActions.ts
await sendWaitlistConfirmationEmail(waitlistEntry);
```

## Configuration

### Environment Variables

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxx
```

### Email Templates

Email templates are defined inline within the email action functions. Each template includes:

- Consistent branding (OJO Tours)
- Responsive HTML design
- Professional styling
- Clear call-to-action where applicable
- Relevant booking/payment details

## Testing

### Manual Testing

Use the provided test script to verify all email notification types:

```bash
# Set your test email
export TEST_EMAIL="your-email@example.com"
export RESEND_API_KEY="your-resend-api-key"

# Run the email notification tests
npx tsx scripts/test-email-notifications.ts
```

This script tests all 7 email notification types and provides a summary of results.

### Testing During Development

1. **Booking Confirmation Flow**:
   - Create a booking
   - Change status to "Confirmed"
   - Check email for confirmation

2. **Payment Flow**:
   - Record a payment
   - Check email for payment confirmation
   - Process a refund
   - Check email for refund notification

3. **Waitlist Flow**:
   - Join a waitlist
   - Check email for waitlist confirmation
   - Mark as available
   - Check email for availability notification

## Error Handling

### Email Sending Failures

All email functions include error handling:

```typescript
try {
  const { data, error } = await resend.emails.send({...});
  if (error) {
    console.error("Email error:", error);
    return { success: false, error };
  }
  return { success: true, data };
} catch (error) {
  console.error("Failed to send email:", error);
  return { success: false, error: "Failed to send email" };
}
```

### Logging

Email operations are logged for debugging:
- Successful sends
- Failed attempts
- Error details

## Best Practices

### Email Content

- Keep subject lines clear and descriptive
- Include relevant booking/payment details
- Use consistent branding
- Provide actionable information
- Include contact information for support

### Error Recovery

- Log all email operations
- Monitor email delivery rates
- Implement retry logic for critical emails
- Alert on persistent failures

### User Experience

- Send emails promptly after triggering events
- Include all relevant information in the email
- Provide clear next steps where applicable
- Use professional, friendly tone

## Compliance and Security

### Data Protection

- Only send booking-related information to the booking customer
- Never include sensitive payment details in emails
- Use secure environment variables for API keys
- Comply with email regulations (CAN-SPAM, GDPR)

### Authentication

- Resend API key is stored in environment variables
- Email sending is server-side only
- No client-side email operations

## Monitoring and Maintenance

### Delivery Monitoring

- Monitor Resend dashboard for delivery rates
- Track bounce rates and spam complaints
- Monitor API usage and limits

### Template Maintenance

- Review email templates periodically
- Update branding as needed
- Ensure template consistency
- Test template rendering

### API Key Management

- Rotate API keys regularly
- Use environment-specific keys
- Monitor API key usage
- Revoke compromised keys immediately

## Troubleshooting

### Emails Not Sending

1. Check `RESEND_API_KEY` is set correctly
2. Verify Resend account is active
3. Check Resend dashboard for errors
4. Review server logs for error messages

### Emails Not Received

1. Check recipient email address is correct
2. Verify email is not in spam folder
3. Check Resend delivery logs
4. Verify recipient email provider is not blocking

### Template Issues

1. Test email rendering in multiple clients
2. Validate HTML syntax
3. Check for broken images or links
4. Verify responsive design

## Future Enhancements

Potential improvements to the email notification system:

- Email template management system
- A/B testing for email content
- Email delivery analytics and tracking
- Automated retry for failed emails
- Email preferences management
- Rich text email editor
- Attachment support for receipts/documents
- Scheduled email sending
- Email localization for multiple languages
- Integration with customer support system