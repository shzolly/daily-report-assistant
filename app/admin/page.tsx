import DashboardClient from "@/components/dashboard-client"
import { getUserByUsername } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function AdminUserDashboardPage() {
  const user = await getUserByUsername("admin")

  if (!user || !user.is_active) {
    redirect("/demo")
  }

  const supabase = await createClient()
  const { data: categories } = await supabase.from("categories").select("*, activities(*)").eq("is_active", true)

  return <DashboardClient user={user} categories={categories || []} />
}
