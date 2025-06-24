"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface User {
  id: string
  name: string
  email: string
  role: "user" | "admin"
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; message: string }>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored auth token
    const token = localStorage.getItem("auth-token")
    if (token) {
      // In a real app, validate token with backend
      const userData = localStorage.getItem("user-data")
      if (userData) {
        setUser(JSON.parse(userData))
      }
    }
    setIsLoading(false)
  }, [])

  // Update the login function to be more restrictive
  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      // Mock user database - in real app, this would be from your backend
      const mockUsers = [
        { email: "john@example.com", password: "password123", name: "John Doe", role: "user" },
        { email: "admin@example.com", password: "admin123", name: "Admin User", role: "admin" },
        { email: "sarah@example.com", password: "password123", name: "Sarah Johnson", role: "user" },
      ]

      const user = mockUsers.find((u) => u.email === email && u.password === password)

      if (!user) {
        return { success: false, message: "Invalid credentials or account doesn't exist" }
      }

      const userData = {
        id: Date.now().toString(),
        name: user.name,
        email: user.email,
        role: user.role as "user" | "admin",
      }

      localStorage.setItem("auth-token", "mock-token")
      localStorage.setItem("user-data", JSON.stringify(userData))
      setUser(userData)
      return { success: true, message: "Login successful" }
    } catch (error) {
      return { success: false, message: "Something went wrong" }
    }
  }

  const signup = async (
    name: string,
    email: string,
    password: string,
  ): Promise<{ success: boolean; message: string }> => {
    try {
      // Check if user already exists
      const mockUsers = [
        { email: "john@example.com", password: "password123", name: "John Doe", role: "user" },
        { email: "admin@example.com", password: "admin123", name: "Admin User", role: "admin" },
        { email: "sarah@example.com", password: "password123", name: "Sarah Johnson", role: "user" },
      ]

      const existingUser = mockUsers.find((u) => u.email === email)
      if (existingUser) {
        return { success: false, message: "Account with this email already exists" }
      }

      const userData = {
        id: Date.now().toString(),
        name,
        email,
        role: "user" as const,
      }

      localStorage.setItem("auth-token", "mock-token")
      localStorage.setItem("user-data", JSON.stringify(userData))
      setUser(userData)
      return { success: true, message: "Account created successfully" }
    } catch (error) {
      return { success: false, message: "Something went wrong" }
    }
  }

  const logout = () => {
    localStorage.removeItem("auth-token")
    localStorage.removeItem("user-data")
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
