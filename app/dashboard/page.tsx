"use client"

import { useEffect, useState } from "react"
import { fetchAPI } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users, Star, Bell } from "lucide-react"
import { DashboardHeader } from "@/components/dashboard/header"
import { Skeleton } from "@/components/ui/skeleton"

type DashboardStats = {
  totalCourses: number
  totalUsers: number
  totalReviews: number
  totalNotifications: number
  recentCourses: any[]
  recentUsers: any[]
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setIsLoading(true)

        // In a real implementation, you would have a dedicated endpoint for dashboard stats
        // For now, we'll fetch data from multiple endpoints and combine them
        const [coursesData, usersData, notificationsData] = await Promise.all([
          fetchAPI("/courses?limit=5"),
          fetchAPI("/users/me"), // Using this as a placeholder since we don't have a users list endpoint
          fetchAPI("/notifications/unread"),
        ])

        setStats({
          totalCourses: coursesData.pagination?.total || coursesData.courses?.length || 0,
          totalUsers: 0, // Placeholder
          totalReviews: 0, // Placeholder
          totalNotifications: notificationsData.count || 0,
          recentCourses: coursesData.courses || [],
          recentUsers: [], // Placeholder
        })
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err)
        setError("Failed to load dashboard data. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  return (
    <div className="space-y-6">
      <DashboardHeader title="Dashboard" description="Overview of your platform" />

      {error && <div className="bg-red-900/20 border border-red-800 text-red-200 px-4 py-3 rounded-md">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Courses"
          value={stats?.totalCourses}
          icon={BookOpen}
          description="Active courses"
          isLoading={isLoading}
        />
        <StatCard
          title="Total Users"
          value={stats?.totalUsers}
          icon={Users}
          description="Registered users"
          isLoading={isLoading}
        />
        <StatCard
          title="Total Reviews"
          value={stats?.totalReviews}
          icon={Star}
          description="Course reviews"
          isLoading={isLoading}
        />
        <StatCard
          title="Notifications"
          value={stats?.totalNotifications}
          icon={Bell}
          description="Unread notifications"
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-zinc-800 bg-zinc-950/50">
          <CardHeader>
            <CardTitle className="text-white">Recent Courses</CardTitle>
            <CardDescription className="text-zinc-400">Latest courses added to the platform</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-12 w-12 rounded-md bg-zinc-800" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-48 bg-zinc-800" />
                        <Skeleton className="h-3 w-24 bg-zinc-800" />
                      </div>
                    </div>
                  ))}
              </div>
            ) : stats?.recentCourses && stats.recentCourses.length > 0 ? (
              <div className="space-y-4">
                {stats.recentCourses.map((course) => (
                  <div key={course._id} className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-md bg-indigo-900/30 flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-indigo-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{course.title}</p>
                      <p className="text-sm text-zinc-400">
                        ${course.price} • {new Date(course.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-zinc-500">No courses found</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-950/50">
          <CardHeader>
            <CardTitle className="text-white">Recent Users</CardTitle>
            <CardDescription className="text-zinc-400">Latest users registered on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded-full bg-zinc-800" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32 bg-zinc-800" />
                        <Skeleton className="h-3 w-48 bg-zinc-800" />
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-zinc-500">No recent users data available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  isLoading,
}: {
  title: string
  value?: number
  icon: any
  description: string
  isLoading: boolean
}) {
  return (
    <Card className="border-zinc-800 bg-zinc-950/50">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-400">{title}</p>
            {isLoading ? (
              <Skeleton className="h-8 w-16 mt-1 bg-zinc-800" />
            ) : (
              <p className="text-3xl font-bold text-white">{value || 0}</p>
            )}
            <p className="text-xs text-zinc-500 mt-1">{description}</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-indigo-900/30 flex items-center justify-center">
            <Icon className="h-6 w-6 text-indigo-400" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
