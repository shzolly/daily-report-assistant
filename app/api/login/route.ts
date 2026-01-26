import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const formData = await request.formData()
  const username = formData.get("username") as string
  const pin = formData.get("pin") as string

  if (!username || !pin) {
    return NextResponse.json({ error: "Username and PIN are required" }, { status: 400 })
  }

  const supabase = await createClient()

  const { data: user, error: queryError } = await supabase
    .from("users")
    .select("*")
    .eq("username", username.toLowerCase())
    .eq("pin", pin)
    .eq("is_active", true)
    .single()

  if (queryError || !user) {
    return NextResponse.json({ error: "Invalid username or PIN" }, { status: 401 })
  }

  const cookieStore = await cookies()
  cookieStore.set("user_id", user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  })

  const redirectUrl = user.is_admin ? "/admin" : "/dashboard"

  return NextResponse.json({ redirect: redirectUrl, success: true })
}
