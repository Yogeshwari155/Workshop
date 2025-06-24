// API utility functions for frontend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ""

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}/api${endpoint}`

  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  }

  const response = await fetch(url, config)

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new ApiError(response.status, errorData.error || "An error occurred")
  }

  return response.json()
}

// Workshop API functions
export const workshopApi = {
  getAll: (params?: Record<string, string>) => {
    const searchParams = params ? `?${new URLSearchParams(params)}` : ""
    return apiRequest<any>(`/workshops${searchParams}`)
  },

  getById: (id: number) => apiRequest<any>(`/workshops/${id}`),

  create: (data: any) =>
    apiRequest<any>("/workshops", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: number, data: any) =>
    apiRequest<any>(`/workshops/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    apiRequest<any>(`/workshops/${id}`, {
      method: "DELETE",
    }),
}

// Auth API functions
export const authApi = {
  login: (email: string, password: string) =>
    apiRequest<any>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (name: string, email: string, password: string) =>
    apiRequest<any>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),

  logout: () =>
    apiRequest<any>("/auth/logout", {
      method: "POST",
    }),
}

// Registration API functions
export const registrationApi = {
  getAll: (params?: Record<string, string>) => {
    const searchParams = params ? `?${new URLSearchParams(params)}` : ""
    return apiRequest<any>(`/registrations${searchParams}`)
  },

  create: (data: any) =>
    apiRequest<any>("/registrations", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: number, data: any) =>
    apiRequest<any>(`/registrations/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
}

// Admin API functions
export const adminApi = {
  getStats: () => apiRequest<any>("/admin/stats"),

  getRegistrations: (params?: Record<string, string>) => {
    const searchParams = params ? `?${new URLSearchParams(params)}` : ""
    return apiRequest<any>(`/admin/registrations${searchParams}`)
  },

  approveRegistration: (id: number) =>
    apiRequest<any>(`/admin/registrations/${id}/approve`, {
      method: "POST",
    }),

  rejectRegistration: (id: number, reason: string) =>
    apiRequest<any>(`/admin/registrations/${id}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),
}

// Upload API functions
export const uploadApi = {
  uploadFile: (file: File) => {
    const formData = new FormData()
    formData.append("file", file)

    return apiRequest<any>("/upload", {
      method: "POST",
      headers: {}, // Remove Content-Type to let browser set it for FormData
      body: formData,
    })
  },
}
