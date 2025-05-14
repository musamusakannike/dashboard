"use client"

import { Button } from "@/components/ui/button"

interface DashboardHeaderProps {
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function DashboardHeader({ title, description, action }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        {description && <p className="text-zinc-400 mt-1">{description}</p>}
      </div>
      {action && (
        <Button
          onClick={action.onClick}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500"
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}
