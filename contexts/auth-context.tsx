"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { AuthState, UserRole } from "@/types"

interface AuthContextType extends AuthState {
  login: (role: UserRole, userId: string, userName: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    userRole: null,
    userId: null,
    userName: null,
  })

  useEffect(() => {
    // Check for existing session on mount
    const savedAuth = localStorage.getItem("auth_session")
    if (savedAuth) {
      try {
        const parsed = JSON.parse(savedAuth)
        setAuthState(parsed)
      } catch (error) {
        console.error("Error parsing saved auth:", error)
        localStorage.removeItem("auth_session")
      }
    }
  }, [])

  const login = (role: UserRole, userId: string, userName: string) => {
    const newAuthState = {
      isAuthenticated: true,
      userRole: role,
      userId,
      userName,
    }
    setAuthState(newAuthState)
    localStorage.setItem("auth_session", JSON.stringify(newAuthState))
  }

  const logout = () => {
    const newAuthState = {
      isAuthenticated: false,
      userRole: null,
      userId: null,
      userName: null,
    }
    setAuthState(newAuthState)
    localStorage.removeItem("auth_session")
  }

  return <AuthContext.Provider value={{ ...authState, login, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
