import DashboardClient from "@/components/dashboard-client"
import { getUserByUsername } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"

type UserDashboardPageProps = {
  params: Promise<{
    username: string
  }>
}

export default async function UserDashboardPage({ params }: UserDashboardPageProps) {
  const { username } = await params
  const user = await getUserByUsername(username)

  if (!user || !user.is_active) {
    notFound()
  }
  const activeUser = user!

  const supabase = await createClient()
  const { data: categories } = await supabase.from("categories").select("*, activities(*)").eq("is_active", true)

  return <DashboardClient user={activeUser} categories={categories || []} />
}
