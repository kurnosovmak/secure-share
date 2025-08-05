"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userEmail, setUserEmail] = useState("")
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      const authStatus = localStorage.getItem("isAuthenticated")
      const email = localStorage.getItem("userEmail")
      const token = localStorage.getItem("access_token")

      if (authStatus === "true" && email && token) {
        setIsAuthenticated(true)
        setUserEmail(email)
        apiClient.setToken(token)
      } else {
        setIsAuthenticated(false)
        apiClient.clearToken()
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  const logout = async () => {
    try {
      await apiClient.logout()
    } catch (error) {
      console.warn("Logout error:", error)
    }

    setIsAuthenticated(false)
    setUserEmail("")
    router.push("/login")
  }

  const requireAuth = () => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }

  return {
    isAuthenticated,
    isLoading,
    userEmail,
    logout,
    requireAuth,
  }
}
