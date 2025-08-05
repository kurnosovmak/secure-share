"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Download, CheckCircle, AlertTriangle, X, FileText, Clock, Loader2 } from "lucide-react"
import { useParams } from "next/navigation"
import { apiClient, type DownloadFileInfo } from "@/lib/api-client"

type DownloadState = "loading" | "ready" | "downloading" | "complete" | "error"

export default function DownloadPage() {
  const params = useParams()
  const token = params.token as string

  const [downloadState, setDownloadState] = useState<DownloadState>("loading")
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [fileInfo, setFileInfo] = useState<DownloadFileInfo | null>(null)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    const loadFileInfo = async () => {
      try {
        setDownloadState("loading")
        const info = await apiClient.getDownloadFileInfo(token)
        setFileInfo(info)

        // Проверяем статус файла
        if (info.status === "uploaded") {
          setDownloadState("ready")
        } else {
          setDownloadState("error")
          switch (info.status) {
            case "waiting_for_upload":
              setError("Файл еще не загружен")
              break
            case "downloaded":
              setError("Этот файл уже был скачан и больше недоступен")
              break
            case "expired":
              setError("Срок действия этой ссылки для скачивания истек")
              break
            default:
              setError("Файл недоступен для скачивания")
          }
        }
      } catch (error) {
        setDownloadState("error")
        if (error instanceof Error) {
          if (error.message.includes("401")) {
            setError("Файл еще не загружен")
          } else if (error.message.includes("410")) {
            setError("Срок действия ссылки истек")
          } else if (error.message.includes("404")) {
            setError("Ссылка не найдена или файл не существует")
          } else {
            setError(error.message)
          }
        } else {
          setError("Произошла ошибка при загрузке информации о файле")
        }
      }
    }

    if (token) {
      loadFileInfo()
    }
  }, [token])

  const downloadFile = async () => {
    if (!fileInfo) return

    setDownloadState("downloading")
    setDownloadProgress(0)

    try {
      // Симуляция прогресса для UI
      const progressInterval = setInterval(() => {
        setDownloadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 15
        })
      }, 150)

      const { blob, filename } = await apiClient.downloadFile(token)

      clearInterval(progressInterval)
      setDownloadProgress(100)

      // Создание ссылки для скачивания
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = fileInfo.filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      setDownloadState("complete")
    } catch (error) {
      console.error("Download error:", error)
      setDownloadState("error")
      setError(error instanceof Error ? error.message : "Ошибка при скачивании файла")
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Байт"
    const k = 1024
    const sizes = ["Байт", "КБ", "МБ", "ГБ"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "uploaded":
        return "text-green-600"
      case "downloaded":
        return "text-gray-600"
      case "expired":
        return "text-red-600"
      case "waiting_for_upload":
        return "text-blue-600"
      default:
        return "text-gray-600"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "uploaded":
        return "Готов к скачиванию"
      case "downloaded":
        return "Уже скачан"
      case "expired":
        return "Истек"
      case "waiting_for_upload":
        return "Ожидает загрузки"
      default:
        return "Неизвестно"
    }
  }

  // Состояние загрузки
  if (downloadState === "loading") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-slate-400 mx-auto mb-4 animate-spin" />
          <p className="text-slate-600">Загрузка информации о файле...</p>
        </div>
      </div>
    )
  }

  // Состояние ошибки
  if (downloadState === "error") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="container mx-auto px-4">
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <X className="h-8 w-8 text-red-600" />
                </div>
              </div>
              <CardTitle className="text-red-900">Скачивание недоступно</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent>
              {fileInfo && (
                <div className="mb-4 p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">Статус:</span>
                    <span className={`text-sm font-medium ${getStatusColor(fileInfo.status)}`}>
                      {getStatusText(fileInfo.status)}
                    </span>
                  </div>
                  {fileInfo.filename && (
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">Файл:</span>
                      <span className="text-sm text-slate-600">{fileInfo.filename}</span>
                    </div>
                  )}
                  {fileInfo.file_size && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">Размер:</span>
                      <span className="text-sm text-slate-600">{formatFileSize(fileInfo.file_size)}</span>
                    </div>
                  )}
                </div>
              )}
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  По соображениям безопасности файлы можно скачать только один раз. Пожалуйста, свяжитесь с
                  отправителем, если вам снова нужен файл.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Состояние завершенного скачивания
  if (downloadState === "complete") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="container mx-auto px-4">
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-green-900">Скачивание завершено</CardTitle>
              <CardDescription>Ваш файл был успешно скачан</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              {fileInfo && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="font-medium text-green-900">{fileInfo.filename}</p>
                  <p className="text-sm text-green-700">{formatFileSize(fileInfo.file_size)}</p>
                </div>
              )}
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Эта ссылка для скачивания теперь истекла, и файл был навсегда удален с наших серверов для вашей
                  безопасности.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Основное состояние - готов к скачиванию
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-slate-900 rounded-full">
                <Shield className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Безопасное скачивание файла</h1>
            <p className="text-slate-600">Скачайте ваш файл - эта ссылка истечет после использования</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Готов к скачиванию</CardTitle>
              <CardDescription>Этот файл можно скачать только один раз для безопасности</CardDescription>
            </CardHeader>
            <CardContent>
              {downloadState === "downloading" ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <Download className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-pulse" />
                    <p className="font-medium">Скачивается {fileInfo?.filename}...</p>
                    <p className="text-sm text-slate-600">
                      {fileInfo?.file_size && formatFileSize(fileInfo.file_size)}
                    </p>
                  </div>
                  <Progress value={downloadProgress} className="w-full" />
                  <p className="text-center text-sm text-slate-600">{downloadProgress}% завершено</p>
                </div>
              ) : (
                fileInfo && (
                  <div className="space-y-6">
                    {/* File Info */}
                    <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-lg">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{fileInfo.filename}</p>
                        <p className="text-sm text-slate-600">{formatFileSize(fileInfo.file_size)}</p>
                        <p className="text-xs text-slate-500">{fileInfo.mime_type}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-medium ${getStatusColor(fileInfo.status)}`}>
                          {getStatusText(fileInfo.status)}
                        </span>
                      </div>
                    </div>

                    {/* Upload Info */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2 text-slate-600">
                        <Clock className="h-4 w-4" />
                        <div>
                          <p className="font-medium">Загружен</p>
                          <p>{formatDate(fileInfo.created_at)}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 text-slate-600">
                        <AlertTriangle className="h-4 w-4" />
                        <div>
                          <p className="font-medium">Истекает</p>
                          <p>{formatDate(fileInfo.expired_at)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Security Warning */}
                    <Alert>
                      <Shield className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Важно:</strong> Этот файл будет навсегда удален после скачивания. Убедитесь, что вы
                        готовы сохранить его на своем устройстве.
                      </AlertDescription>
                    </Alert>

                    {/* Download Button */}
                    <Button onClick={downloadFile} className="w-full bg-slate-900 hover:bg-slate-800" size="lg">
                      <Download className="h-4 w-4 mr-2" />
                      Скачать файл (только один раз)
                    </Button>

                    <p className="text-xs text-center text-slate-500">
                      Скачивая файл, вы подтверждаете, что эта ссылка немедленно истечет
                    </p>
                  </div>
                )
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
