"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Users, FileText, FolderTree, Activity, Edit, Trash2, Plus, ArrowLeft, Eye, Link2 } from "lucide-react"
import type { Database } from "@/types/database"

type User = Database["public"]["Tables"]["users"]["Row"]
type Category = Database["public"]["Tables"]["categories"]["Row"] & {
  activities: Database["public"]["Tables"]["activities"]["Row"][]
}
type Report = Database["public"]["Tables"]["reports"]["Row"] & {
  users: { id: string; username: string; full_name: string | null } | null | any
}

interface AdminDashboardClientProps {
  currentUser: User
  users: User[]
  categories: Category[]
  reports: Report[]
}

export default function AdminDashboardClient({ currentUser, users, categories, reports }: AdminDashboardClientProps) {
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClient()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add")
  const [dialogType, setDialogType] = useState<"user" | "category" | "activity" | null>(null)
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // User form state
  const [userForm, setUserForm] = useState({
    username: "",
    full_name: "",
    role: "user",
    is_active: true,
  })

  // Category form state
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    is_active: true,
  })

  // Activity form state
  const [activityForm, setActivityForm] = useState({
    category_id: "",
    name: "",
    description: "",
    is_active: true,
  })

  // Users Management
  async function handleUserSubmit() {
    setIsSubmitting(true)
    try {
      // Transform role to is_admin for database
      const { role, ...rest } = userForm
      const userData = {
        ...rest,
        username: rest.username.trim().toLowerCase(),
        full_name: rest.full_name.trim(),
        is_admin: role === "admin",
        role,
      }
      
      if (dialogMode === "add") {
        const { error } = await supabase.from("users").insert([userData])
        if (error) throw error
        toast({ title: "User created", description: `Access URL: /${userData.username}` })
      } else {
        if (!selectedItemId) throw new Error("No user selected")
        const { error } = await supabase.from("users").update(userData).eq("id", selectedItemId)
        if (error) throw error
        toast({ title: "User updated", description: "User has been updated successfully." })
      }
      closeDialog()
      router.refresh()
    } catch (error) {
      toast({
        title: "Operation failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleUserDelete(userId: string) {
    if (!confirm("Are you sure you want to delete this user?")) return

    try {
      const { error } = await supabase.from("users").delete().eq("id", userId)
      if (error) throw error
      toast({ title: "User deleted", description: "User has been deleted successfully." })
      router.refresh()
    } catch (error) {
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    }
  }

  // Categories Management
  async function handleCategorySubmit() {
    setIsSubmitting(true)
    try {
      if (dialogMode === "add") {
        const { data, error } = await supabase.from("categories").insert([categoryForm]).select()
        if (error) throw error
        toast({ title: "Category created", description: "Category has been created successfully." })
      } else {
        if (!selectedItemId) throw new Error("No category selected")
        const { data, error } = await supabase.from("categories").update(categoryForm).eq("id", selectedItemId).select()
        if (error) throw error
        toast({ title: "Category updated", description: "Category has been updated successfully." })
      }
      closeDialog()
      router.refresh()
    } catch (error) {
      toast({
        title: "Operation failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleCategoryDelete(categoryId: string) {
    if (!confirm("Are you sure you want to delete this category?")) return

    try {
      const { error } = await supabase.from("categories").delete().eq("id", categoryId)
      if (error) throw error
      toast({ title: "Category deleted", description: "Category has been deleted successfully." })
      router.refresh()
    } catch (error) {
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    }
  }

  // Activities Management
  async function handleActivitySubmit() {
    setIsSubmitting(true)
    try {
      if (dialogMode === "add") {
        const { error } = await supabase.from("activities").insert([activityForm])
        if (error) throw error
        toast({ title: "Activity created", description: "Activity has been created successfully." })
      } else {
        if (!selectedItemId) throw new Error("No activity selected")
        const { error } = await supabase.from("activities").update(activityForm).eq("id", selectedItemId)
        if (error) throw error
        toast({ title: "Activity updated", description: "Activity has been updated successfully." })
      }
      closeDialog()
      router.refresh()
    } catch (error) {
      toast({
        title: "Operation failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleActivityDelete(activityId: string) {
    if (!confirm("Are you sure you want to delete this activity?")) return

    try {
      const { error } = await supabase.from("activities").delete().eq("id", activityId)
      if (error) throw error
      toast({ title: "Activity deleted", description: "Activity has been deleted successfully." })
      router.refresh()
    } catch (error) {
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    }
  }

  function openUserDialog(mode: "add" | "edit", user?: User) {
    setDialogMode(mode)
    setDialogType("user")
    setSelectedItemId(user?.id || null)
    if (mode === "edit" && user) {
      setUserForm({
        username: user.username,
        full_name: user.full_name || "",
        role: user.role || "user",
        is_active: user.is_active ?? true,
      })
    } else {
      setUserForm({
        username: "",
        full_name: "",
        role: "user",
        is_active: true,
      })
    }
    setIsDialogOpen(true)
  }

  function openCategoryDialog(mode: "add" | "edit", category?: Category) {
    setDialogMode(mode)
    setDialogType("category")
    setSelectedItemId(category?.id || null)
    if (mode === "edit" && category) {
      setCategoryForm({
        name: category.name,
        description: category.description || "",
        is_active: category.is_active ?? true,
      })
    } else {
      setCategoryForm({
        name: "",
        description: "",
        is_active: true,
      })
    }
    setIsDialogOpen(true)
  }

  function openActivityDialog(mode: "add" | "edit", activity?: any) {
    setDialogMode(mode)
    setDialogType("activity")
    setSelectedItemId(activity?.id || null)
    if (mode === "edit" && activity) {
      setActivityForm({
        category_id: activity.category_id,
        name: activity.name,
        description: activity.description || "",
        is_active: activity.is_active ?? true,
      })
    } else {
      setActivityForm({
        category_id: categories[0]?.id || "",
        name: "",
        description: "",
        is_active: true,
      })
    }
    setIsDialogOpen(true)
  }

  function closeDialog() {
    setIsDialogOpen(false)
    setDialogType(null)
    setSelectedItemId(null)
  }

  return (
    <div className="admin-shell min-h-screen">
      {/* Header */}
      <div className="border-b border-slate-200/80 bg-white/85 shadow-sm backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-950">Admin Dashboard</h1>
              <p className="text-sm text-slate-500">Manage personalized URLs, reports, categories, and activities</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => router.push(`/${currentUser.username}`)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reports.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <FolderTree className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categories.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Activities</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {categories.reduce((sum, cat) => sum + cat.activities.length, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="activities">Activities</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Users Management</CardTitle>
                    <CardDescription>Manage user accounts and permissions</CardDescription>
                  </div>
                  <Button onClick={() => openUserDialog("add")}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add User
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Full Name</TableHead>
                      <TableHead>Access URL</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.username}</TableCell>
                        <TableCell>{user.full_name}</TableCell>
                        <TableCell>
                          <a
                            href={`/${user.username}`}
                            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-teal-700 hover:bg-teal-50 hover:text-teal-800"
                          >
                            <Link2 className="h-3 w-3" />
                            /{user.username}
                          </a>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.is_active ? "default" : "destructive"}>
                            {user.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => openUserDialog("edit", user)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleUserDelete(user.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Reports Overview</CardTitle>
                <CardDescription>View and manage all user reports</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Week Start</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>{new Date(report.report_date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {report.users?.full_name || report.users?.username || "Unknown"}
                        </TableCell>
                        <TableCell>{new Date(report.week_start_date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant={report.status === "completed" ? "default" : "secondary"}>
                            {report.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(report.updated_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Report Details</DialogTitle>
                                <DialogDescription>
                                  {report.users?.full_name || report.users?.username || "Unknown"} - {new Date(report.report_date).toLocaleDateString()}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                {report.blockers && (
                                  <div>
                                    <Label className="font-semibold">Blockers/Risks:</Label>
                                    <p className="text-sm mt-1">{report.blockers}</p>
                                  </div>
                                )}
                                {report.tomorrow_plan && (
                                  <div>
                                    <Label className="font-semibold">Tomorrow's Plan:</Label>
                                    <p className="text-sm mt-1">{report.tomorrow_plan}</p>
                                  </div>
                                )}
                                {report.generated_report && (
                                  <div>
                                    <Label className="font-semibold">Generated Report:</Label>
                                    <Textarea
                                      value={report.generated_report}
                                      readOnly
                                      className="mt-1 min-h-[300px] font-mono text-sm"
                                    />
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Categories Management</CardTitle>
                    <CardDescription>Manage activity categories</CardDescription>
                  </div>
                  <Button onClick={() => openCategoryDialog("add")}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Category
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Activities Count</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell>{category.description || "-"}</TableCell>
                        <TableCell>{category.activities.length}</TableCell>
                        <TableCell>
                          <Badge variant={category.is_active ? "default" : "destructive"}>
                            {category.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openCategoryDialog("edit", category)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleCategoryDelete(category.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activities Tab */}
          <TabsContent value="activities">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Activities Management</CardTitle>
                    <CardDescription>Manage individual activities</CardDescription>
                  </div>
                  <Button onClick={() => openActivityDialog("add")}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Activity
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((category) =>
                      category.activities.map((activity) => (
                        <TableRow key={activity.id}>
                          <TableCell className="font-medium">{activity.name}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{category.name}</Badge>
                          </TableCell>
                          <TableCell>{activity.description || "-"}</TableCell>
                          <TableCell>
                            <Badge variant={activity.is_active ? "default" : "destructive"}>
                              {activity.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openActivityDialog("edit", activity)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="destructive" size="sm" onClick={() => handleActivityDelete(activity.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )),
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* User Dialog */}
      <Dialog open={isDialogOpen && dialogType === "user"} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogMode === "add" ? "Add New User" : "Edit User"}</DialogTitle>
            <DialogDescription>
              {dialogMode === "add"
                ? "Create a personalized dashboard URL for a new user"
                : "Update user information and access"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="john"
                value={userForm.username}
                onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Access URL: /{userForm.username.trim().toLowerCase() || "username"}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={userForm.full_name}
                onChange={(e) => setUserForm({ ...userForm, full_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={userForm.role}
                onValueChange={(value) => setUserForm({ ...userForm, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={userForm.is_active}
                onCheckedChange={(checked) => setUserForm({ ...userForm, is_active: checked === true })}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
            <Button onClick={handleUserSubmit} disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Saving..." : dialogMode === "add" ? "Create User" : "Update User"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Category Dialog */}
      <Dialog open={isDialogOpen && dialogType === "category"} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogMode === "add" ? "Add New Category" : "Edit Category"}</DialogTitle>
            <DialogDescription>
              {dialogMode === "add" ? "Create a new activity category" : "Update category information"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cat-name">Category Name</Label>
              <Input
                id="cat-name"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-desc">Description</Label>
              <Textarea
                id="cat-desc"
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="cat-active"
                checked={categoryForm.is_active}
                onCheckedChange={(checked) => setCategoryForm({ ...categoryForm, is_active: !!checked })}
              />
              <Label htmlFor="cat-active">Active</Label>
            </div>
            <Button onClick={handleCategorySubmit} disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Saving..." : dialogMode === "add" ? "Create Category" : "Update Category"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Activity Dialog */}
      <Dialog open={isDialogOpen && dialogType === "activity"} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogMode === "add" ? "Add New Activity" : "Edit Activity"}</DialogTitle>
            <DialogDescription>
              {dialogMode === "add" ? "Create a new activity" : "Update activity information"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="act-category">Category</Label>
              <Select
                value={activityForm.category_id}
                onValueChange={(value) =>
                  setActivityForm({ ...activityForm, category_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="act-name">Activity Name</Label>
              <Input
                id="act-name"
                value={activityForm.name}
                onChange={(e) => setActivityForm({ ...activityForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="act-desc">Description</Label>
              <Textarea
                id="act-desc"
                value={activityForm.description}
                onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="act-active"
                checked={activityForm.is_active}
                onCheckedChange={(checked) => setActivityForm({ ...activityForm, is_active: checked === true })}
              />
              <Label htmlFor="act-active">Active</Label>
            </div>
            <Button onClick={handleActivitySubmit} disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Saving..." : dialogMode === "add" ? "Create Activity" : "Update Activity"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
