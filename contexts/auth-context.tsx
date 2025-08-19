"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface User {
  id: string
  username: string
  email: string
  joinedAt: string
  stats: {
    totalLessonsCompleted: number
    totalWPM: number
    totalAccuracy: number
    bestWPM: number
    bestAccuracy: number
  }
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  signup: (username: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  updateUserStats: (wpm: number, accuracy: number) => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load user from localStorage on mount
    const savedUser = localStorage.getItem("learning-enhanced-user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call
    const users = JSON.parse(localStorage.getItem("learning-enhanced-users") || "[]")
    const foundUser = users.find((u: any) => u.email === email && u.password === password)

    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser
      setUser(userWithoutPassword)
      localStorage.setItem("learning-enhanced-user", JSON.stringify(userWithoutPassword))
      return true
    }
    return false
  }

  const signup = async (username: string, email: string, password: string): Promise<boolean> => {
    // Check if user already exists
    const users = JSON.parse(localStorage.getItem("learning-enhanced-users") || "[]")
    const existingUser = users.find((u: any) => u.email === email || u.username === username)

    if (existingUser) {
      return false
    }

    const newUser = {
      id: Date.now().toString(),
      username,
      email,
      password,
      joinedAt: new Date().toISOString(),
      stats: {
        totalLessonsCompleted: 0,
        totalWPM: 0,
        totalAccuracy: 0,
        bestWPM: 0,
        bestAccuracy: 0,
      },
    }

    users.push(newUser)
    localStorage.setItem("learning-enhanced-users", JSON.stringify(users))

    const { password: _, ...userWithoutPassword } = newUser
    setUser(userWithoutPassword)
    localStorage.setItem("learning-enhanced-user", JSON.stringify(userWithoutPassword))
    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("learning-enhanced-user")
  }

  const updateUserStats = (wpm: number, accuracy: number) => {
    if (!user) return

    const updatedUser = {
      ...user,
      stats: {
        ...user.stats,
        totalLessonsCompleted: user.stats.totalLessonsCompleted + 1,
        totalWPM: Math.round((user.stats.totalWPM + wpm) / 2),
        totalAccuracy: Math.round((user.stats.totalAccuracy + accuracy) / 2),
        bestWPM: Math.max(user.stats.bestWPM, wpm),
        bestAccuracy: Math.max(user.stats.bestAccuracy, accuracy),
      },
    }

    setUser(updatedUser)
    localStorage.setItem("learning-enhanced-user", JSON.stringify(updatedUser))

    // Update in users array
    const users = JSON.parse(localStorage.getItem("learning-enhanced-users") || "[]")
    const userIndex = users.findIndex((u: any) => u.id === user.id)
    if (userIndex !== -1) {
      users[userIndex] = { ...updatedUser, password: users[userIndex].password }
      localStorage.setItem("learning-enhanced-users", JSON.stringify(users))
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        updateUserStats,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
