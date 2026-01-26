import { requireAdmin } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import AdminDashboardClient from "@/components/admin-dashboard-client"

export default async function AdminPage() {
  const currentUser = await requireAdmin()

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
      currentUser={currentUser}
      users={users || []}
      categories={categories || []}
      reports={reports || []}
    />
  )
}
