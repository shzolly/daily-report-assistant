import { getCurrentUser, getUserByUsername } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import AdminDashboardClient from "@/components/admin-dashboard-client"

type AdminPageProps = {
  searchParams: Promise<{
    user?: string
  }>
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const { user: username } = await searchParams
  const currentUser = username ? await getUserByUsername(username) : await getCurrentUser()

  if (!currentUser?.is_admin || !currentUser.is_active) {
    redirect("/demo")
  }
  const activeAdmin = currentUser!

  const supabase = await createClient()

  // Get all data for admin
  const { data: usersData } = await supabase.from("users").select("*").order("created_at", { ascending: false })
  
  // Transform is_admin boolean to role string for the UI
  const users = (usersData || []).map((user: any) => ({
    ...user,
    role: user.is_admin ? "admin" : "user",
  }))

  const { data: categories } = await supabase
    .from("categories")
    .select("*, activities(*)")
    .order("created_at", { ascending: false })

  const { data: reports } = await supabase
    .from("reports")
    .select("*, users(id, username, full_name)")
    .order("week_start_date", { ascending: false })
    .limit(100)

  return (
    <AdminDashboardClient
      currentUser={activeAdmin}
      users={users || []}
      categories={categories || []}
      reports={reports || []}
    />
  )
}
