import type React from "react"
import ProtectedRoute from "@/components/protected-route"
import { DashboardSidebar } from "@/components/dashboard/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-[#0a0a1a]">
        <DashboardSidebar />
        <main className="flex-1 overflow-auto p-6 md:ml-64">
          {/* Add margin on desktop to account for fixed sidebar */}
          {children}
        </main>
      </div>
    </ProtectedRoute>
  )
}
