"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Upload, CheckCircle, AlertTriangle, X } from "lucide-react"
import { useParams } from "next/navigation"
import { apiClient } from "@/lib/api-client"

type UploadState = "ready" | "uploading" | "success" | "error" | "invalid" | "already_uploaded"

export default function UploadPage() {
  const params = useParams()
  const token = params.token as string

  const [uploadState, setUploadState] = useState<UploadState>("ready")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)

  // Симуляция разных состояний токена для демо
  const isValidToken = token && token.length > 8
  const isExpiredToken = token === "expired123"
  const isUsedToken = token === "used456"
  const isAlreadyUploaded = token === "abc123def456" // токен из dashboard с уже загруженным файлом

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleButtonClick = () => {
    const fileInput = document.getElementById("file-upload") as HTMLInputElement
    if (fileInput) {
      fileInput.click()
    }
  }

  const uploadFile = async () => {
    if (!selectedFile) return

    setUploadState("uploading")
    setUploadProgress(0)

    try {
      await apiClient.uploadFile(token, selectedFile, (progress) => {
        setUploadProgress(progress)
      })

      setUploadState("success")
    } catch (error) {
      console.error("Upload error:", error)
      setUploadState("error")
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Байт"
    const k = 1024
    const sizes = ["Байт", "КБ", "МБ", "ГБ"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  // Проверка на уже загруженный файл
  if (isAlreadyUploaded) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="container mx-auto px-4">
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-orange-100 rounded-full">
                  <AlertTriangle className="h-8 w-8 text-orange-600" />
                </div>
              </div>
              <CardTitle className="text-orange-900">Файл уже загружен</CardTitle>
              <CardDescription>По этой ссылке уже был загружен файл. Повторная загрузка невозможна.</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Для безопасности каждая ссылка может быть использована только один раз для загрузки файла.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!isValidToken || isExpiredToken || isUsedToken) {
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
              <CardTitle className="text-red-900">Недействительная ссылка для загрузки</CardTitle>
              <CardDescription>
                {isExpiredToken && "Срок действия этой ссылки для загрузки истек."}
                {isUsedToken && "Эта ссылка для загрузки уже была использована."}
                {!isValidToken && "Эта ссылка для загрузки недействительна или повреждена."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Пожалуйста, свяжитесь с человеком, который поделился этой ссылкой, чтобы создать новую.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (uploadState === "error") {
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
              <CardTitle className="text-red-900">Ошибка загрузки</CardTitle>
              <CardDescription>Не удалось загрузить файл. Попробуйте еще раз.</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <Button onClick={() => setUploadState("ready")} variant="outline">
                Попробовать снова
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (uploadState === "success") {
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
              <CardTitle className="text-green-900">Загрузка успешна</CardTitle>
              <CardDescription>Ваш файл был безопасно загружен и зашифрован</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="font-medium text-green-900">{selectedFile?.name}</p>
                <p className="text-sm text-green-700">{selectedFile && formatFileSize(selectedFile.size)}</p>
              </div>
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Ссылка для скачивания была отправлена владельцу файла. Этот файл можно скачать только один раз для
                  безопасности.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

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
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Безопасная загрузка файла</h1>
            <p className="text-slate-600">Загрузите ваш файл по одноразовой безопасной ссылке</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Загрузить файл</CardTitle>
              <CardDescription>Ваш файл будет зашифрован и может быть скачан только один раз</CardDescription>
            </CardHeader>
            <CardContent>
              {uploadState === "uploading" ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <Upload className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-pulse" />
                    <p className="font-medium">Загружается {selectedFile?.name}...</p>
                    <p className="text-sm text-slate-600">{selectedFile && formatFileSize(selectedFile.size)}</p>
                  </div>
                  <Progress value={uploadProgress} className="w-full" />
                  <p className="text-center text-sm text-slate-600">{uploadProgress}% завершено</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* File Drop Zone */}
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      dragActive
                        ? "border-blue-400 bg-blue-50"
                        : selectedFile
                          ? "border-green-400 bg-green-50"
                          : "border-slate-300 hover:border-slate-400"
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    {selectedFile ? (
                      <div className="space-y-2">
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                        <p className="font-medium text-green-900">{selectedFile.name}</p>
                        <p className="text-sm text-green-700">{formatFileSize(selectedFile.size)}</p>
                        <Button variant="outline" size="sm" onClick={handleButtonClick}>
                          Выбрать другой файл
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Upload className="h-12 w-12 text-slate-400 mx-auto" />
                        <div>
                          <p className="text-lg font-medium text-slate-900">Перетащите файл сюда</p>
                          <p className="text-slate-600">или нажмите для выбора</p>
                        </div>
                        <input type="file" onChange={handleFileSelect} className="hidden" id="file-upload" />
                        <Button
                          variant="outline"
                          className="cursor-pointer bg-transparent"
                          onClick={handleButtonClick}
                          type="button"
                        >
                          Выбрать файл
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Security Notice */}
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      Ваш файл будет зашифрован во время загрузки и хранения. Эта ссылка для загрузки истечет после
                      использования.
                    </AlertDescription>
                  </Alert>

                  {/* Upload Button */}
                  <Button
                    onClick={uploadFile}
                    disabled={!selectedFile}
                    className="w-full bg-slate-900 hover:bg-slate-800"
                    size="lg"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Загрузить безопасно
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
