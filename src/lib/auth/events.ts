import { prisma } from "@/lib/prisma";

export type AuthEventName =
  | "login"
  | "logout"
  | "registration"
  | "password_reset_requested"
  | "password_reset_completed"
  | "email_verified"
  | "oauth_login"
  | "mfa_enrolled"
  | "mfa_verified"
  | "mfa_disabled";

/** Best-effort audit logging that never blocks authentication or stores secrets. */
export async function logAuthEvent(input: {
  event: AuthEventName;
  success: boolean;
  supabaseUserId?: string;
  provider?: string;
  metadata?: Record<string, string | number | boolean>;
}) {
  try {
    const user = input.supabaseUserId
      ? await prisma.user.findUnique({ where: { supabaseId: input.supabaseUserId }, select: { id: true } })
      : null;
    await prisma.authEvent.create({
      data: {
        userId: user?.id,
        event: input.event,
        success: input.success,
        provider: input.provider,
        metadata: input.metadata,
      },
    });
  } catch (error) {
    console.error("[auth] Failed to record authentication event", error);
  }
}
