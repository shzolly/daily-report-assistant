"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, CalendarCheck2, FileText, Sparkles, Users } from "lucide-react"
import Link from "next/link"

const highlights = [
  { label: "Personal URLs", value: "/john" },
  { label: "Weekly reports", value: "5 days" },
  { label: "AI summaries", value: "1 click" },
]

export default function HomePage() {
  return (
    <main className="landing-shell min-h-screen overflow-hidden text-slate-950">
      <nav className="border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
        <div className="container mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-600 text-white shadow-sm">
              <CalendarCheck2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-none">Daily Report Assistant</p>
              <p className="text-xs text-slate-500">URL-based team reporting</p>
            </div>
          </div>
          <Link href="/demo">
            <Button className="bg-teal-600 hover:bg-teal-700">
              Open Demo
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </nav>

      <section className="container mx-auto grid max-w-7xl gap-10 px-4 py-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:py-20">
        <div className="space-y-7">
          <Badge className="border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-50">
            <Sparkles className="mr-1 h-3 w-3" />
            No login. Just a personalized workspace URL.
          </Badge>

          <div className="space-y-4">
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-normal text-slate-950 md:text-6xl">
              Daily reports without the login ceremony.
            </h1>
            <p className="max-w-xl text-lg leading-8 text-slate-600">
              Give each teammate a unique dashboard URL, collect structured daily activity, and generate polished summaries
              when the day is done.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/demo">
              <Button size="lg" className="w-full bg-teal-600 hover:bg-teal-700 sm:w-auto">
                Open demo dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>

          <div className="grid max-w-xl grid-cols-3 gap-3">
            {highlights.map((item) => (
              <div key={item.label} className="rounded-lg border border-slate-200 bg-white/75 p-4 shadow-sm">
                <p className="text-lg font-semibold text-slate-950">{item.value}</p>
                <p className="mt-1 text-xs text-slate-500">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white/85 p-3 shadow-2xl shadow-slate-200/70 backdrop-blur">
          <div className="rounded-lg border border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </div>
              <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-500">/demo</span>
            </div>
            <div className="grid gap-4 p-4 md:grid-cols-[1.25fr_0.75fr]">
              <div className="space-y-4">
                <div className="grid grid-cols-5 gap-2">
                  {["Mon", "Tue", "Wed", "Thu", "Fri"].map((day, index) => (
                    <div
                      key={day}
                      className={`rounded-lg border p-3 text-center ${
                        index === 2 ? "border-teal-200 bg-teal-600 text-white" : "border-slate-200 bg-white text-slate-600"
                      }`}
                    >
                      <p className="text-xs font-medium">{day}</p>
                      <p className="mt-1 text-lg font-semibold">{14 + index}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-semibold">
                      <Users className="h-4 w-4 text-teal-600" />
                      Activities
                    </div>
                    <span className="text-xs text-slate-500">6.5h total</span>
                  </div>
                  <div className="space-y-3">
                    {["Code review and QA", "Client report updates", "Planning and follow-up"].map((activity) => (
                      <div key={activity} className="flex items-center gap-3 rounded-md bg-slate-50 px-3 py-2">
                        <div className="h-4 w-4 rounded border border-teal-300 bg-teal-100" />
                        <span className="text-sm text-slate-700">{activity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="mb-4 flex items-center gap-2 font-semibold">
                  <FileText className="h-4 w-4 text-teal-600" />
                  Generated Report
                </div>
                <div className="space-y-2">
                  <div className="h-3 rounded bg-slate-200" />
                  <div className="h-3 rounded bg-slate-200" />
                  <div className="h-3 w-4/5 rounded bg-slate-200" />
                  <div className="h-3 w-11/12 rounded bg-slate-200" />
                  <div className="h-3 w-2/3 rounded bg-slate-200" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
