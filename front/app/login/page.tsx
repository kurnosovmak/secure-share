"use client"

import type React from "react"
import { apiClient } from "@/lib/api-client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Mail, Lock } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    // Проверяем, авторизован ли пользователь
    const checkAuth = () => {
      const authStatus = localStorage.getItem("isAuthenticated")
      const token = localStorage.getItem("access_token")

      if (authStatus === "true" && token) {
        // Если пользователь уже авторизован, перенаправляем на dashboard
        router.push("/dashboard")
      }
    }

    checkAuth()
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await apiClient.login({ email, password })

      // Сохраняем данные пользователя
      localStorage.setItem("isAuthenticated", "true")
      localStorage.setItem("userEmail", response.user?.email || email)
      localStorage.setItem("userId", response.user?.id || "")

      router.push("/dashboard")
    } catch (error) {
      setError(error instanceof Error ? error.message : "Произошла ошибка при входе")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-slate-900 rounded-full">
                  <Shield className="h-8 w-8 text-white" />
                </div>
              </div>
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Вход в SecureShare</h1>
            <p className="text-slate-600">Войдите в свой аккаунт для управления файлами</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Авторизация</CardTitle>
              <CardDescription>Введите ваши данные для входа</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Пароль</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div>
                      <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 mt-6" disabled={isLoading}>
                      {isLoading ? "Вход..." : "Войти"}
                    </Button>
                </div>
              </form>

              {/*<div className="mt-6 p-4 bg-blue-50 rounded-lg">*/}
              {/*  <p className="text-sm text-blue-800 font-medium mb-2">Демо-данные для входа:</p>*/}
              {/*  <p className="text-sm text-blue-700">Email: admin@example.com</p>*/}
              {/*  <p className="text-sm text-blue-700">Пароль: password</p>*/}
              {/*</div>*/}
            </CardContent>
          </Card>

          <div className="text-center mt-6">
            <Link href="/" className="text-sm text-slate-600 hover:text-slate-900">
              ← Вернуться на главную
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
