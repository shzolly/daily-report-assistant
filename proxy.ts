import type { NextRequest, NextResponse } from "next/server"
import { NextResponse as Response } from "next/server"

export async function proxy(request: NextRequest): Promise<NextResponse> {
  // Authentication is now handled via cookies in server components
  return Response.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
