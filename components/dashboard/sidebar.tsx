"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import {
  BarChart3,
  BookOpen,
  FileText,
  Layers,
  LogOut,
  MessageSquare,
  Settings,
  Users,
  Bell,
  Rocket,
  Menu,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState, useEffect } from "react"

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: BarChart3,
  },
  {
    title: "Courses",
    href: "/dashboard/courses",
    icon: BookOpen,
  },
  {
    title: "Topics",
    href: "/dashboard/topics",
    icon: Layers,
  },
  {
    title: "Lessons",
    href: "/dashboard/lessons",
    icon: FileText,
  },
  {
    title: "Users",
    href: "/dashboard/users",
    icon: Users,
  },
  {
    title: "Reviews",
    href: "/dashboard/reviews",
    icon: MessageSquare,
  },
  {
    title: "Notifications",
    href: "/dashboard/notifications",
    icon: Bell,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize() // Set initial state
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const toggleSidebar = () => setIsOpen(!isOpen)

  // Close sidebar when navigating on mobile
  useEffect(() => {
    if (isMobile) {
      setIsOpen(false)
    }
  }, [pathname, isMobile])

  return (
    <>
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-4 right-4 z-50">
        <Button
          variant="outline"
          size="icon"
          className="bg-zinc-900 border-zinc-800"
          onClick={toggleSidebar}
        >
          {isOpen ? <X className="h-5 w-5 text-white" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={cn(
          "w-64 h-screen flex flex-col border-r border-zinc-800 bg-black/40 fixed md:relative z-40 transition-transform duration-300 ease-in-out",
          isMobile && !isOpen ? "-translate-x-full" : "translate-x-0"
        )}
      >
        <div className="p-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Rocket className="h-6 w-6 text-indigo-500" />
            <h1 className="text-xl font-bold text-white">INTELLECTA</h1>
          </div>
          <p className="text-xs text-zinc-500 mt-1">Admin Dashboard</p>
        </div>

        <div className="flex-1 overflow-auto py-2">
          <nav className="space-y-1 px-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-indigo-900/30 text-indigo-400"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-zinc-800">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-8 w-8 border border-zinc-800">
              <AvatarImage src={user?.profileImage || "/placeholder.svg"} />
              <AvatarFallback className="bg-indigo-900 text-indigo-200">
                {user?.fullname?.charAt(0) || "A"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-white">{user?.fullname || "Admin User"}</p>
              <p className="text-xs text-zinc-500">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
            onClick={logout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </>
  )
}
