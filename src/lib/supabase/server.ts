import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Creates the request-scoped server client. Cookie writes may be unavailable
 * from a Server Component; middleware performs refreshes in that case.
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Components cannot mutate response cookies. Middleware
            // refreshes the session before the component is rendered.
          }
        },
      },
    },
  );
}
