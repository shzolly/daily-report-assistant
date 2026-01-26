import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

type User = {
  id: string
  username: string
  pin: string
  full_name: string | null
  role: string
  is_admin: boolean
  is_active: boolean
  created_at: string
  last_login: string | null
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies()
  const userId = cookieStore.get("user_id")?.value

  if (!userId) {
    return null
  }

  const supabase = await createClient()

  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single()

  if (error || !user) {
    return null
  }

  return user as User
}

export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error("Unauthorized")
  }
  return user
}

export async function requireAdmin(): Promise<User> {
  const user = await requireAuth()
  if (!user.is_admin) {
    throw new Error("Admin access required")
  }
  return user
}
