import { getCurrentUser } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import DashboardClient from "@/components/dashboard-client"

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const supabase = await createClient()

  // Get categories with activities
  const { data: categories } = await supabase.from("categories").select("*, activities(*)").eq("is_active", true)

  return <DashboardClient user={user} categories={categories || []} />
}
