"use client"

import type React from "react"

import { useState } from "react"
import { usersApi } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { AlertCircle } from "lucide-react"

interface UserFormProps {
  user: any
  onSave: (updatedUser: any) => void
}

export function UserForm({ user, onSave }: UserFormProps) {
  const [formData, setFormData] = useState({
    username: user.username || "",
    fullname: user.fullname || "",
    email: user.email || "",
    role: user.role || "user",
    isActive: user.isActive !== false,
    isPremium: user.isPremium || false,
    isVerified: user.isVerified || false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const updatedUser = await usersApi.update(user._id, formData)
      onSave(updatedUser.user || updatedUser)
    } catch (err) {
      console.error("Failed to update user:", err)
      setError(err instanceof Error ? err.message : "Failed to update user. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 py-4">
      {error && (
        <div className="bg-red-900/20 border border-red-800 text-red-200 px-4 py-3 rounded-md flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="username" className="text-zinc-300">
            Username
          </Label>
          <Input
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="bg-zinc-900/50 border-zinc-800 text-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fullname" className="text-zinc-300">
            Full Name
          </Label>
          <Input
            id="fullname"
            name="fullname"
            value={formData.fullname}
            onChange={handleChange}
            className="bg-zinc-900/50 border-zinc-800 text-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-zinc-300">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="bg-zinc-900/50 border-zinc-800 text-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role" className="text-zinc-300">
            Role
          </Label>
          <Select value={formData.role} onValueChange={(value) => handleSelectChange("role", value)}>
            <SelectTrigger className="bg-zinc-900/50 border-zinc-800 text-white">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
              <SelectItem value="user" className="hover:bg-zinc-800 hover:text-white">
                User
              </SelectItem>
              <SelectItem value="admin" className="hover:bg-zinc-800 hover:text-white">
                Admin
              </SelectItem>
              <SelectItem value="superadmin" className="hover:bg-zinc-800 hover:text-white">
                Super Admin
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="isActive" className="text-zinc-300">
              Active Status
            </Label>
            <p className="text-xs text-zinc-500">Allow user to access the platform</p>
          </div>
          <Switch
            id="isActive"
            checked={formData.isActive}
            onCheckedChange={(checked) => handleSwitchChange("isActive", checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="isPremium" className="text-zinc-300">
              Premium Status
            </Label>
            <p className="text-xs text-zinc-500">Grant premium access to the user</p>
          </div>
          <Switch
            id="isPremium"
            checked={formData.isPremium}
            onCheckedChange={(checked) => handleSwitchChange("isPremium", checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="isVerified" className="text-zinc-300">
              Verified Status
            </Label>
            <p className="text-xs text-zinc-500">Mark user as verified</p>
          </div>
          <Switch
            id="isVerified"
            checked={formData.isVerified}
            onCheckedChange={(checked) => handleSwitchChange("isVerified", checked)}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500"
        >
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  )
}
