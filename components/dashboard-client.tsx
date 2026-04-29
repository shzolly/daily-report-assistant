"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Sparkles,
  Save,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  FileText,
  Copy,
  Check,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { Database } from "@/types/database"

type User = Database["public"]["Tables"]["users"]["Row"]
type Category = Database["public"]["Tables"]["categories"]["Row"] & {
  activities: Database["public"]["Tables"]["activities"]["Row"][]
}

type DayReport = {
  date: string
  dayName: string
  activities: {
    activityId: string
    categoryId: string
    note: string
    timeSpent: number
  }[]
  blockers: string
  tomorrowPlan: string
  generatedReport: string
  reportId?: string
}

interface DashboardClientProps {
  user: User
  categories: Category[]
}

export default function DashboardClient({ user, categories }: DashboardClientProps) {
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClient()

  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getMonday(new Date()))
  const [weekReports, setWeekReports] = useState<Record<string, DayReport>>({})
  const [selectedDay, setSelectedDay] = useState<string>(formatDate(new Date()))
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)

  function getMonday(date: Date): Date {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    return new Date(d.setDate(diff))
  }

  function formatDate(date: Date): string {
    return date.toISOString().split("T")[0]
  }

  function getDayName(date: Date): string {
    return date.toLocaleDateString("en-US", { weekday: "short" })
  }

  function getFullDayName(date: Date): string {
    return date.toLocaleDateString("en-US", { weekday: "long" })
  }

  function getWeekDays(startDate: Date): Date[] {
    const days: Date[] = []
    for (let i = 0; i < 5; i++) {
      const day = new Date(startDate)
      day.setDate(startDate.getDate() + i)
      days.push(day)
    }
    return days
  }

  const weekDays = getWeekDays(currentWeekStart)
  const isCurrentWeek = formatDate(getMonday(new Date())) === formatDate(currentWeekStart)

  useEffect(() => {
    let isMounted = true

    async function syncUrlSession() {
      setSessionReady(false)
      try {
        await fetch("/api/url-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id }),
        })
      } finally {
        if (isMounted) {
          setSessionReady(true)
        }
      }
    }

    syncUrlSession()

    return () => {
      isMounted = false
    }
  }, [user.id])

  useEffect(() => {
    if (sessionReady) {
      loadWeekReports()
    }
  }, [currentWeekStart, sessionReady, user.id])

  async function loadWeekReports() {
    const weekStart = formatDate(currentWeekStart)
    const weekEnd = formatDate(new Date(currentWeekStart.getTime() + 4 * 24 * 60 * 60 * 1000))
    console.log("Loading reports for week:", weekStart)

    const { data: reportsByDate, error: reportsByDateError } = await supabase
      .from("reports")
      .select("*, report_activities(*)")
      .eq("user_id", user.id)
      .gte("report_date", weekStart)
      .lte("report_date", weekEnd)

    const { data: reportsByWeekStart, error: reportsByWeekStartError } = await supabase
      .from("reports")
      .select("*, report_activities(*)")
      .eq("user_id", user.id)
      .eq("week_start_date", weekStart)

    if (reportsByDateError || reportsByWeekStartError) {
      console.error("Error loading reports:", reportsByDateError || reportsByWeekStartError)
    }

    const reports = [...(reportsByDate || []), ...(reportsByWeekStart || [])].filter(
      (report, index, allReports) => allReports.findIndex((item) => item.id === report.id) === index,
    )

    console.log("Loaded reports:", reports)

    const reportsData: Record<string, DayReport> = {}

    weekDays.forEach((day, dayIndex) => {
      const dateStr = formatDate(day)
      const dayOfWeek = dayIndex + 1
      const dailyReport = reports?.find((r) => r.report_date === dateStr)
      const legacyWeeklyReport = reports?.find(
        (r) =>
          !r.report_date &&
          (r.report_activities || []).some((ra: any) => Number(ra.day_of_week) === dayOfWeek),
      )
      const report = dailyReport || legacyWeeklyReport
      const reportActivities = (report?.report_activities || []).filter((ra: any) => {
        if (!ra.day_of_week) return true
        return Number(ra.day_of_week) === dayOfWeek
      })

      reportsData[dateStr] = {
        date: dateStr,
        dayName: getFullDayName(day),
        activities:
          reportActivities.map((ra: any) => {
            const activity = categories.find(cat => 
              cat.activities.some(act => act.id === ra.activity_id)
            )
            return {
              activityId: ra.activity_id,
              categoryId: activity?.id || "",
              note: ra.notes || "",
              timeSpent: Number(ra.hours_spent) || 0,
            }
          }),
        blockers: report?.blockers || report?.tomorrow_plan || report?.notes || "",
        tomorrowPlan: report?.tomorrow_plan || "",
        generatedReport: report?.generated_report || "",
        reportId: report?.id,
      }
    })

    setWeekReports(reportsData)
  }

  const currentDayReport = weekReports[selectedDay] || {
    date: selectedDay,
    dayName: getFullDayName(new Date(selectedDay)),
    activities: [],
    blockers: "",
    tomorrowPlan: "",
    generatedReport: "",
  }

  function toggleActivity(categoryId: string, activityId: string) {
    const newReports = { ...weekReports }
    if (!newReports[selectedDay]) {
      newReports[selectedDay] = { ...currentDayReport }
    }

    const activities = [...newReports[selectedDay].activities]
    const index = activities.findIndex((a) => a.activityId === activityId && a.categoryId === categoryId)

    if (index >= 0) {
      activities.splice(index, 1)
    } else {
      activities.push({ activityId, categoryId, note: "", timeSpent: 0 })
    }

    newReports[selectedDay].activities = activities
    setWeekReports(newReports)
  }

  function updateActivityNote(categoryId: string, activityId: string, note: string) {
    const newReports = { ...weekReports }
    const activity = newReports[selectedDay].activities.find(
      (a) => a.activityId === activityId && a.categoryId === categoryId,
    )
    if (activity) {
      activity.note = note
      setWeekReports(newReports)
    }
  }

  function updateActivityTime(categoryId: string, activityId: string, timeSpent: number) {
    const newReports = { ...weekReports }
    const activity = newReports[selectedDay].activities.find(
      (a) => a.activityId === activityId && a.categoryId === categoryId,
    )
    if (activity) {
      activity.timeSpent = timeSpent
      setWeekReports(newReports)
    }
  }

  async function saveReport() {
    setIsSaving(true)
    try {
      const report = weekReports[selectedDay]

      const { data: savedReport, error: reportError } = await supabase
        .from("reports")
        .upsert({
          id: report.reportId || undefined,
          user_id: user.id,
          report_date: selectedDay,
          week_start_date: formatDate(currentWeekStart),
          week_end_date: formatDate(new Date(currentWeekStart.getTime() + 4 * 24 * 60 * 60 * 1000)),
          blockers: report.blockers,
          tomorrow_plan: report.tomorrowPlan,
          generated_report: report.generatedReport,
          status: report.generatedReport ? "completed" : "draft",
        })
        .select()
        .single()

      if (reportError && !savedReport) {
        throw reportError
      }

      if (savedReport) {
        await supabase
          .from("report_activities")
          .delete()
          .eq("report_id", savedReport.id)

        if (report.activities.length > 0) {
          const dayOfWeek = weekDays.findIndex((d) => formatDate(d) === selectedDay) + 1

          const activitiesData = report.activities.map((a) => ({
            report_id: savedReport.id,
            activity_id: a.activityId,
            notes: a.note || "",
            hours_spent: a.timeSpent || 0,
            day_of_week: dayOfWeek,
          }))

          await supabase
            .from("report_activities")
            .insert(activitiesData)
            .then(({ error }) => {
              if (error && !error.message.includes("duplicate")) {
                console.warn("Activities insert warning:", error)
              }
            })

          const newReports = { ...weekReports }
          newReports[selectedDay].reportId = savedReport.id
          setWeekReports(newReports)
        }
      }

      toast({
        title: "Report saved",
        description: "Your daily report has been saved successfully.",
      })
    } catch (error) {
      if (error instanceof Error && !error.message.includes("JSON object requested")) {
        console.warn("Save warning:", error)
      }
    } finally {
      setIsSaving(false)
    }
  }

  async function generateReport() {
    if (currentDayReport.activities.length === 0) {
      toast({
        title: "No activities selected",
        description: "Please select at least one activity to generate a report.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    try {
      const activitiesData = currentDayReport.activities.map((a) => {
        const category = categories.find((c) => c.id === a.categoryId)
        const activity = category?.activities.find((act) => act.id === a.activityId)
        return {
          category: category?.name,
          activity: activity?.name,
          note: a.note,
          timeSpent: a.timeSpent,
        }
      })

      const response = await fetch("/api/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activities: activitiesData,
          blockers: currentDayReport.blockers,
          tomorrowPlan: currentDayReport.tomorrowPlan,
          date: selectedDay,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate report")
      }

      const newReports = { ...weekReports }
      newReports[selectedDay].generatedReport = data.report
      setWeekReports(newReports)

      toast({
        title: "Report generated",
        description: "Saving report...",
      })

      await saveReport()

      toast({
        title: "Report generated & saved",
        description: "Your daily report has been generated and saved successfully.",
      })
    } catch (error) {
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "There was an error generating your report. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  async function copyToClipboard() {
    if (!currentDayReport.generatedReport) return

    await navigator.clipboard.writeText(currentDayReport.generatedReport)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast({
      title: "Copied to clipboard",
      description: "Report copied successfully!",
    })
  }

  async function openAdminDashboard() {
    await fetch("/api/url-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id }),
    }).catch(() => {})
    router.push(`/admin-dashboard?user=${encodeURIComponent(user.username)}`)
  }

  function navigateWeek(direction: "prev" | "next") {
    const newStart = new Date(currentWeekStart)
    newStart.setDate(newStart.getDate() + (direction === "next" ? 7 : -7))
    setCurrentWeekStart(newStart)
    setSelectedDay(formatDate(newStart))
  }

  const totalHours = currentDayReport.activities.reduce((sum, a) => sum + (a.timeSpent || 0), 0)
  const hasReport = currentDayReport.generatedReport.length > 0

  return (
    <div className="app-shell min-h-screen">
      <header className="bg-white/85 border-b border-slate-200/80 shadow-sm backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600 text-white shadow-sm">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-slate-950">Daily Report Assistant</h1>
                <p className="text-xs text-slate-500">/{user.username}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-600">
                <span className="text-slate-400">Hi,</span> {user.full_name || user.username}
              </span>
              <div className="h-6 w-px bg-slate-200" />
              <div className="flex items-center gap-1">
                {user.is_admin && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={openAdminDashboard}
                    className="text-slate-600 hover:text-teal-700 hover:bg-teal-50"
                  >
                    Admin
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/")}
                  className="text-slate-600 hover:text-teal-700 hover:bg-teal-50"
                >
                  Home
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            onClick={() => navigateWeek("prev")}
            disabled={isCurrentWeek}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous Week
          </Button>
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-teal-600" />
            <span className="font-semibold text-slate-800 text-lg">
              {weekDays[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })} -{" "}
              {weekDays[4].toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
            {isCurrentWeek && (
              <Badge className="bg-teal-100 text-teal-700 border-teal-200">
                This Week
              </Badge>
            )}
          </div>
          <Button
            variant="outline"
            onClick={() => navigateWeek("next")}
            className="gap-2"
          >
            Next Week
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <Tabs value={selectedDay} onValueChange={setSelectedDay}>
          <TabsList className="grid w-full grid-cols-5 mb-6 bg-white shadow-sm border rounded-lg p-1.5 h-auto overflow-hidden">
            {weekDays.map((day) => {
              const dateStr = formatDate(day)
              const hasReport = weekReports[dateStr]?.generatedReport
              const isToday = dateStr === formatDate(new Date())
              const isSelected = dateStr === selectedDay
              return (
                <TabsTrigger
                  key={dateStr}
                  value={dateStr}
                  className={`relative rounded-md py-2.5 h-auto transition-all ${
                    isSelected
                      ? "bg-teal-600 shadow-md ring-2 ring-teal-200 ring-offset-2 data-[state=active]:shadow-md data-[state=active]:bg-teal-600"
                      : "hover:bg-teal-50 hover:ring-1 hover:ring-teal-200 data-[state=active]:shadow-none"
                  }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className={`text-xs font-medium ${isSelected ? "!text-white" : isToday ? "text-emerald-600" : "text-slate-600"}`}>
                      {getDayName(day)}
                    </span>
                    <span className={`text-lg font-semibold ${isSelected ? "!text-white" : isToday ? "text-emerald-600" : "text-slate-900"}`}>
                      {day.getDate()}
                    </span>
                    {isToday && (
                      <div className={`absolute top-1 right-1 h-1.5 w-1.5 rounded-full ${isSelected ? "bg-white" : "bg-emerald-500"}`} />
                    )}
                    {hasReport && !isToday && (
                      <div className={`absolute top-1 right-1 h-2 w-2 rounded-full ${isSelected ? "bg-white" : "bg-emerald-500"}`} />
                    )}
                  </div>
                </TabsTrigger>
              )
            })}
          </TabsList>

          {weekDays.map((day) => {
            const dateStr = formatDate(day)
            const report = weekReports[dateStr]
            const dayTotalHours = report?.activities.reduce((sum, a) => sum + (a.timeSpent || 0), 0) || 0
            const hasDayReport = report?.generatedReport

            return (
              <TabsContent key={dateStr} value={dateStr}>
                <div className="grid lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-4">
                    <Card className="bg-white shadow-sm border-slate-200">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                            Activities for {report?.dayName}
                          </CardTitle>
                          <div className="flex items-center gap-1 text-sm text-slate-500">
                            <Clock className="h-4 w-4" />
                            <span>{dayTotalHours.toFixed(1)}h total</span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          {categories.map((category) => (
                            <div key={category.id} className="space-y-3">
                              <h3 className="font-medium text-sm text-slate-500 uppercase tracking-wide flex items-center gap-2">
                                <span className="h-px bg-slate-200 flex-1" />
                                {category.name}
                              </h3>
                              {category.activities.map((activity) => {
                                const isSelected = report?.activities.some(
                                  (a) => a.activityId === activity.id && a.categoryId === category.id,
                                )
                                const activityData = report?.activities.find(
                                  (a) => a.activityId === activity.id && a.categoryId === category.id,
                                )

                                return (
                                  <div key={activity.id} className="space-y-2">
                                    <div className="flex items-start gap-3">
                                      <Checkbox
                                        id={`${category.id}-${activity.id}`}
                                        checked={isSelected}
                                        onCheckedChange={() => toggleActivity(category.id, activity.id)}
                                        className="mt-1 border-slate-300"
                                        disabled={!isCurrentWeek}
                                      />
                                      <Label
                                        htmlFor={`${category.id}-${activity.id}`}
                                        className="text-sm cursor-pointer leading-relaxed flex-1"
                                      >
                                        {activity.name}
                                      </Label>
                                    </div>
                                    {isSelected && (
                                      <div className="ml-7 space-y-2 p-3 bg-slate-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                          <Label
                                            htmlFor={`time-${activity.id}`}
                                            className="text-xs text-slate-500 whitespace-nowrap"
                                          >
                                            Time (hrs):
                                          </Label>
                                          <Input
                                            id={`time-${activity.id}`}
                                            type="number"
                                            min="0"
                                            step="0.5"
                                            value={activityData?.timeSpent || 0}
                                            onChange={(e) =>
                                              updateActivityTime(
                                                category.id,
                                                activity.id,
                                                Number.parseFloat(e.target.value) || 0,
                                              )
                                            }
                                            className="h-8 w-20 text-sm bg-white"
                                            disabled={!isCurrentWeek}
                                          />
                                        </div>
                                        <Textarea
                                          placeholder="Add notes (optional)..."
                                          value={activityData?.note || ""}
                                          onChange={(e) => updateActivityNote(category.id, activity.id, e.target.value)}
                                          className="text-sm bg-white resize-none"
                                          rows={2}
                                          disabled={!isCurrentWeek}
                                        />
                                      </div>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white shadow-sm border-slate-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <AlertCircle className="h-5 w-5 text-amber-500" />
                          Additional Notes
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="blockers" className="text-sm font-medium text-slate-700">
                            Blockers / Risks (Optional)
                          </Label>
                          <Textarea
                            id="blockers"
                            placeholder="Any blockers or risks to mention..."
                            value={report?.blockers || ""}
                            onChange={(e) => {
                              const newReports = { ...weekReports }
                              newReports[selectedDay].blockers = e.target.value
                              setWeekReports(newReports)
                            }}
                            className="mt-2 resize-none"
                            rows={2}
                            disabled={!isCurrentWeek}
                          />
                        </div>
                        <div>
                          <Label htmlFor="tomorrow" className="text-sm font-medium text-slate-700">
                            Plan for Tomorrow (Optional)
                          </Label>
                          <Textarea
                            id="tomorrow"
                            placeholder="What's planned for tomorrow..."
                            value={report?.tomorrowPlan || ""}
                            onChange={(e) => {
                              const newReports = { ...weekReports }
                              newReports[selectedDay].tomorrowPlan = e.target.value
                              setWeekReports(newReports)
                            }}
                            className="mt-2 resize-none"
                            rows={2}
                            disabled={!isCurrentWeek}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {isCurrentWeek && (
                      <div className="flex gap-3">
                        <Button
                          onClick={generateReport}
                          disabled={isGenerating || report?.activities.length === 0}
                          className="flex-1 bg-teal-600 hover:bg-teal-700"
                        >
                          <Sparkles className="mr-2 h-4 w-4" />
                          {isGenerating ? "Generating..." : "Generate Report"}
                        </Button>
                        <Button onClick={saveReport} disabled={isSaving} variant="outline">
                          <Save className="mr-2 h-4 w-4" />
                          {isSaving ? "Saving..." : "Save"}
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="lg:sticky lg:top-24 lg:self-start">
                    <Card className="bg-white shadow-sm border-slate-200 sticky top-24">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <FileText className="h-5 w-5 text-teal-600" />
                            Generated Report
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            {hasReport && (
                              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                Saved
                              </Badge>
                            )}
                            {hasReport && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={copyToClipboard}
                                className="h-8 w-8 p-0"
                                title="Copy to clipboard"
                              >
                                {copied ? (
                                  <Check className="h-4 w-4 text-emerald-500" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {hasReport ? (
                          <Textarea
                            value={report.generatedReport}
                            onChange={(e) => {
                              const newReports = { ...weekReports }
                              newReports[selectedDay].generatedReport = e.target.value
                              setWeekReports(newReports)
                            }}
                            className="min-h-[300px] font-mono text-sm leading-relaxed resize-none bg-slate-50"
                            disabled={!isCurrentWeek}
                          />
                        ) : (
                          <div className="min-h-[300px] flex items-center justify-center text-center p-8 border-2 border-dashed rounded-lg bg-slate-50">
                            <div className="space-y-3">
                              <Sparkles className="h-12 w-12 mx-auto text-slate-300" />
                              <p className="text-slate-500">
                                Select activities and click "Generate Report" to create your daily report
                              </p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            )
          })}
        </Tabs>
      </main>
    </div>
  )
}
