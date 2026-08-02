# Authentication deployment checklist

Complete these steps before enabling OAuth or MFA in production.

1. Rotate the Supabase service-role key, database URLs, Resend key, and cron secret that were previously committed in `.env`. The local `.env` file is now untracked; keep it that way.
2. Run `pnpm install` (or your chosen package manager) to install `@supabase/ssr`, then run `pnpm prisma generate` and `pnpm prisma migrate deploy`.
3. In Supabase Authentication URL Configuration, set the production Site URL and allow only:
   - `https://your-domain.example/api/auth/callback`
   - `https://your-domain.example/update-password`
   - local development equivalents
4. Enable email confirmation. Configure SMTP, password strength, password breach protection, CAPTCHA, and Auth rate limits in the Supabase dashboard.
5. Configure Google and GitHub in Supabase Authentication Providers. In each provider, use Supabase's provider callback URL (`https://<project-ref>.supabase.co/auth/v1/callback`), not the application callback URL.
6. Enable TOTP enrollment and verification in Supabase MFA settings. The application supports backup TOTP factors; it deliberately does not create application recovery codes.
7. Verify RLS for every Supabase table and Storage bucket. The service-role Storage client is server-only and must never be imported by a Client Component.
8. Review Auth audit logs and the application `AuthEvent` table after rollout. Do not place tokens, passwords, codes, or raw IP addresses in application logs.

## Release checks

- Password register, confirmation, login, reset, and logout
- Google and GitHub first-time and returning sign-in
- Existing profile / duplicate-email behavior
- MFA enroll, challenge, disable, and backup-factor behavior
- Expired session, expired reset link, expired MFA code, disabled account
- Tourist, staff, admin, and super-admin authorization paths
