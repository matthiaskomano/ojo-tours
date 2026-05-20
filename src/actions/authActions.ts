"use server";

import { cookies } from "next/headers";

export async function loginUser(formData: FormData) {
  const username = formData.get("username");
  const password = formData.get("password");

  // --- SET YOUR SECURE CREDENTIALS HERE ---
  const ADMIN_USER = "admin";
  const ADMIN_PASSWORD = "supersecretpassword123";
  // ----------------------------------------

  if (username === ADMIN_USER && password === ADMIN_PASSWORD) {
    // 🚀 NEXT.JS 15 FIX: Await the cookies() function first!
    const cookieStore = await cookies();
    
    // Now we can safely set the cookie
    cookieStore.set("ojo_admin_session", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // Expires in 1 day
      path: "/",
    });
    
    return { success: true };
  }

  // If failed, return an error message
  return { success: false, error: "Invalid credentials. Please try again." };
}

// --- LOGOUT FUNCTION (NEW!) ---
export async function logoutUser() {
  const cookieStore = await cookies();
  
  // This completely destroys the session cookie
  cookieStore.delete("ojo_admin_session");
}