import DashboardClient from "@/components/dashboard-client"
import { getUserByUsername } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { CalendarX, Home, Search } from "lucide-react"
import Link from "next/link"

type UserDashboardPageProps = {
  params: Promise<{
    username: string
  }>
}

export default async function UserDashboardPage({ params }: UserDashboardPageProps) {
  const { username } = await params
  const user = await getUserByUsername(username)

  if (!user || !user.is_active) {
    return <UnknownWorkspace username={username} />
  }
  const activeUser = user!

  const supabase = await createClient()
  const { data: categories } = await supabase.from("categories").select("*, activities(*)").eq("is_active", true)

  return <DashboardClient user={activeUser} categories={categories || []} />
}

function UnknownWorkspace({ username }: { username: string }) {
  return (
    <main className="app-shell flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg rounded-lg border border-slate-200 bg-white/90 p-8 text-center shadow-xl shadow-slate-200/70 backdrop-blur">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
          <CalendarX className="h-7 w-7" />
        </div>
        <div className="mt-6 space-y-2">
          <h1 className="text-2xl font-semibold text-slate-950">Workspace not found</h1>
          <p className="text-sm leading-6 text-slate-600">
            We could not find an active Daily Report Assistant workspace for <span className="font-medium text-slate-900">/{username}</span>.
          </p>
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/demo"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-teal-700"
          >
            <Search className="h-4 w-4" />
            Open demo
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <Home className="h-4 w-4" />
            Back home
          </Link>
        </div>
      </div>
    </main>
  )
}
