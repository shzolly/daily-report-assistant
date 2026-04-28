"use client"

import { Button } from "@/components/ui/button"
import { Calendar, Settings } from "lucide-react"
import { useRouter } from "next/navigation"

type HeaderProps = {
  user: {
    username: string
    is_admin: boolean
  }
}

export function Header({ user }: HeaderProps) {
  const router = useRouter()

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Calendar className="h-6 w-6" />
          <h1 className="text-xl font-semibold">Daily Report System</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm">
            <span className="text-muted-foreground">Welcome, </span>
            <span className="font-medium">{user.username}</span>
            {user.is_admin && (
              <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-1 rounded">Admin</span>
            )}
          </div>
          {user.is_admin && (
            <Button variant="outline" size="sm" onClick={() => router.push(`/admin?user=${encodeURIComponent(user.username)}`)}>
              <Settings className="h-4 w-4 mr-2" />
              Admin
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
