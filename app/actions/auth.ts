"use server"

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function loginAction(formData: FormData) {
  const username = formData.get("username") as string
  const pin = formData.get("pin") as string

  if (!username || !pin) {
    return { error: "Username and PIN are required" }
  }

  const supabase = await createClient()

  // Validate user credentials
  const { data: user, error: queryError } = await supabase
    .from("users")
    .select("*")
    .eq("username", username)
    .eq("pin", pin)
    .eq("is_active", true)
    .single()

  if (queryError || !user) {
    return { error: "Invalid username or PIN" }
  }

  // Update last login
  await supabase.from("users").update({ last_login: new Date().toISOString() }).eq("id", user.id)

  // Set user_id cookie directly
  const cookieStore = await cookies()
  cookieStore.set("user_id", user.id, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  })

  // Redirect based on role
  if (user.is_admin) {
    redirect("/admin")
  } else {
    redirect("/dashboard")
  }
}

export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete("user_id")
  redirect("/login")
}
