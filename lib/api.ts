import { toast } from "@/components/ui/use-toast"

const BASE_URL = "https://intellecta-server-h5ug.onrender.com/api/v1"
// const BASE_URL = "http://localhost:5000/api/v1" 

export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem("intellecta-token")

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong")
  }

  return data
}

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem("intellecta-token")

  if (!token) {
    throw new Error("Authentication required")
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...options.headers,
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.message || `Error: ${response.status} ${response.statusText}`

      if (response.status === 401) {
        // Handle token expiration
        localStorage.removeItem("intellecta-token")
        localStorage.removeItem("intellecta-user")
        window.location.href = "/login"
      }

      throw new Error(errorMessage)
    }

    return await response.json()
  } catch (error) {
    const message = error instanceof Error ? error.message : "An unknown error occurred"
    toast({
      title: "API Error",
      description: message,
      variant: "destructive",
    })
    throw error
  }
}

// Courses
export const coursesApi = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params as Record<string, string>).toString()
    return fetchWithAuth(`/courses?${queryString}`)
  },
  getById: (id: string) => fetchWithAuth(`/courses/${id}`),
  create: (data: any) =>
    fetchWithAuth("/courses", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    fetchWithAuth(`/courses/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchWithAuth(`/courses/${id}`, {
      method: "DELETE",
    }),
  search: (criteria: any) =>
    fetchWithAuth("/courses/search", {
      method: "POST",
      body: JSON.stringify(criteria),
    }),
}

// Topics
export const topicsApi = {
  getByCourse: (courseId: string) => fetchWithAuth(`/courses/${courseId}/topics`),
  getById: (id: string) => fetchWithAuth(`/courses/topics/${id}`),
  create: (data: any) =>
    fetchWithAuth(`/courses/${data.course}/topics`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    fetchWithAuth(`/courses/topics/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchWithAuth(`/courses/topics/${id}`, {
      method: "DELETE",
    }),
}

// Lessons
export const lessonsApi = {
  getByTopic: (topicId: string) => fetchWithAuth(`/courses/lessons/${topicId}`),
  getById: (id: string) => fetchWithAuth(`/courses/lesson/${id}`),
  create: (data: any) =>
    fetchWithAuth(`/courses/topics/${data.topic}/lessons`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    fetchWithAuth(`/courses/lessons/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchWithAuth(`/courses/lessons/${id}`, {
      method: "DELETE",
    }),
}

// Reviews
export const reviewsApi = {
  getByCourse: (courseId: string, params = {}) => {
    const queryString = new URLSearchParams(params as Record<string, string>).toString()
    return fetchWithAuth(`/courses/${courseId}/reviews?${queryString}`)
  },
  update: (reviewId: string, data: any) =>
    fetchWithAuth(`/courses/reviews/${reviewId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (reviewId: string) =>
    fetchWithAuth(`/courses/reviews/${reviewId}`, {
      method: "DELETE",
    }),
}

// Notifications
export const notificationsApi = {
  getAll: () => fetchWithAuth("/notifications"),
  getUnread: () => fetchWithAuth("/notifications/unread"),
  getById: (id: string) => fetchWithAuth(`/notifications/${id}`),
  create: (data: any) =>
    fetchWithAuth("/notifications", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    fetchWithAuth(`/notifications/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchWithAuth(`/notifications/${id}`, {
      method: "DELETE",
    }),
  markAsRead: (id: string) =>
    fetchWithAuth(`/notifications/${id}/read`, {
      method: "POST",
    }),
  markAllAsRead: () =>
    fetchWithAuth("/notifications/mark-all-read", {
      method: "POST",
    }),
}

// Users
export const usersApi = {
  getProfile: () => fetchWithAuth("/users/me"),
  updateProfile: (data: any) =>
    fetchWithAuth("/users/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  // Admin endpoints:
  getAll: () => fetchWithAuth("/users"),
  getById: (id: string) => fetchWithAuth(`/users/${id}`),
  update: (id: string, data: any) =>
    fetchWithAuth(`/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchWithAuth(`/users/${id}`, {
      method: "DELETE",
    }),
}