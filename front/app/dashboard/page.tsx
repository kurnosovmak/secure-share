"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Shield, Plus, Copy, ExternalLink, Clock, Download, Trash2, LogOut, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/useAuth"
import { apiClient, type UploadLink } from "@/lib/api-client"

export default function Dashboard() {
  const { toast } = useToast()
  const { isAuthenticated, isLoading: authIsLoading, userEmail, logout, requireAuth } = useAuth()
  const [links, setLinks] = useState<UploadLink[]>([])
  const [isLoadingLinks, setIsLoadingLinks] = useState(true)

  useEffect(() => {
    requireAuth()
  }, [isAuthenticated, authIsLoading])

  const loadLinks = async () => {
    try {
      setIsLoadingLinks(true)
      const linksData = await apiClient.getUploadLinks()
      setLinks(linksData)
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить ссылки",
        variant: "destructive",
      })
    } finally {
      setIsLoadingLinks(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated && !authIsLoading) {
      loadLinks()
    }
  }, [isAuthenticated, authIsLoading])

  if (authIsLoading || isLoadingLinks) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-8 w-8 text-slate-400 mx-auto mb-4 animate-spin" />
          <p className="text-slate-600">Загрузка...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  const generateUploadLink = async () => {
    try {
      const newLink = await apiClient.createUploadLink()
      setLinks([newLink, ...links])
      toast({
        title: "Ссылка для загрузки создана",
        description: "Поделитесь этой ссылкой с человеком, который должен загрузить файл.",
      })
    } catch (error) {
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Не удалось создать ссылку",
        variant: "destructive",
      })
    }
  }

  const copyToClipboard = (token: string, type: "upload" | "download") => {
    const baseUrl = window.location.origin
    const url = type === "upload" ? `${baseUrl}/upload/${token}` : `${baseUrl}/download/${token}`

    navigator.clipboard.writeText(url)
    toast({
      title: "Ссылка скопирована",
      description: `Ссылка для ${type === "upload" ? "загрузки" : "скачивания"} скопирована в буфер обмена.`,
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "waiting_for_upload":
        return (
          <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
            Ожидает загрузки
          </Badge>
        )
      case "uploaded":
        return (
          <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
            Готов к скачиванию
          </Badge>
        )
      case "downloaded":
        return (
          <Badge variant="outline" className="text-gray-600 border-gray-200 bg-gray-50">
            Скачан
          </Badge>
        )
      case "expired":
        return (
          <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">
            Истек
          </Badge>
        )
      default:
        return <Badge variant="outline">Неизвестно</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStats = () => {
    return {
      pending: links.filter((l) => l.status === "waiting_for_upload").length,
      ready: links.filter((l) => l.status === "uploaded").length,
      downloaded: links.filter((l) => l.status === "downloaded").length,
      total: links.length,
    }
  }

  const stats = getStats()

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-slate-900 rounded-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Панель управления</h1>
              <p className="text-slate-600">Управляйте вашими безопасными ссылками для обмена файлами</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-slate-600">
              <User className="h-4 w-4" />
              <span>{userEmail}</span>
            </div>
            <Button onClick={generateUploadLink} className="bg-slate-900 hover:bg-slate-800">
              <Plus className="h-4 w-4 mr-2" />
              Создать ссылку для загрузки
            </Button>
            <Button variant="outline" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Выйти
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm text-slate-600">Ожидают</p>
                  <p className="text-xl font-bold">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm text-slate-600">Готовы</p>
                  <p className="text-xl font-bold">{stats.ready}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Download className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-sm text-slate-600">Скачаны</p>
                  <p className="text-xl font-bold">{stats.downloaded}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Trash2 className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-slate-600">Всего</p>
                  <p className="text-xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Links List */}
        <Card>
          <CardHeader>
            <CardTitle>Ваши ссылки для загрузки</CardTitle>
            <CardDescription>Управляйте и отслеживайте ваши безопасные ссылки для обмена файлами</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {links.map((link, index) => (
                <div key={link.id}>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {getStatusBadge(link.status)}
                        <span className="text-sm text-slate-500">Создано {formatDate(link.createdAt)}</span>
                      </div>
                      {link.fileName && (
                        <div className="flex items-center space-x-2 text-sm text-slate-700">
                          <span className="font-medium">{link.fileName}</span>
                          <span className="text-slate-500">({link.fileSize})</span>
                        </div>
                      )}
                      <div className="text-xs text-slate-500 font-mono mt-1">Токен: {link.id}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {link.status === "waiting_for_upload" && (
                        <Button variant="outline" size="sm" onClick={() => copyToClipboard(link.id, "upload")}>
                          <Copy className="h-4 w-4 mr-1" />
                          Копировать ссылку для загрузки
                        </Button>
                      )}
                      {link.status === "uploaded" && (
                        <Button variant="outline" size="sm" onClick={() => copyToClipboard(link.id, "download")}>
                          <Copy className="h-4 w-4 mr-1" />
                          Копировать ссылку для скачивания
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {index < links.length - 1 && <Separator className="my-4" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
