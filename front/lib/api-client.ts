interface LoginRequest {
  email: string
  password: string
}

interface LoginResponse {
  access_token: string
  user?: {
    id: string
    email: string
  }
}

interface UploadLink {
  id: string
  upload_url: string
  download_url?: string
  status: "waiting_for_upload" | "uploaded" | "expired" | "downloaded"
  file_name?: string
  file_size?: number
  mime_type?: string
  expires_at?: string
  created_at: string
  updated_at?: string
}

interface ApiError {
  message: string
  errors?: Record<string, string[]>
}

interface DownloadFileInfo {
  id: string
  status: "waiting_for_upload" | "uploaded" | "expired" | "downloaded"
  created_at: string
  expired_at: string
  filename: string
  file_size: number
  mime_type: string
}

class ApiClient {
  private baseUrl: string
  private token: string | null = null

  constructor(baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.example.com") {
    this.baseUrl = baseUrl
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("access_token")
    }
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", token)
    }
  }

  clearToken() {
    this.token = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token")
      localStorage.removeItem("isAuthenticated")
      localStorage.removeItem("userEmail")
      localStorage.removeItem("userId")
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options.headers,
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    const config: RequestInit = {
      ...options,
      headers,
    }

    // Не устанавливаем Content-Type для FormData
    if (options.body instanceof FormData) {
      delete (headers as any)["Content-Type"]
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        let errorData: ApiError
        try {
          errorData = await response.json()
        } catch {
          errorData = { message: `HTTP ${response.status}: ${response.statusText}` }
        }

        // Если токен недействителен, очищаем его
        if (response.status === 401) {
          this.clearToken()
        }

        throw new Error(errorData.message || `HTTP ${response.status}`)
      }

      // Для скачивания файлов возвращаем Response
      if (/^\/download\/[^/]+$/.test(endpoint)) {
        return response as unknown as T
      }

      return response.json()
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error("Ошибка сети")
    }
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    })

    this.setToken(response.access_token)
    return response
  }

  async logout(): Promise<void> {
    try {
      await this.request("/auth/logout", {
        method: "POST",
      })
    } catch (error) {
      // Игнорируем ошибки при выходе
      console.warn("Logout error:", error)
    } finally {
      this.clearToken()
    }
  }

  // Upload Links endpoints
  async createUploadLink(): Promise<UploadLink> {
    return this.request<UploadLink>("/upload-links", {
      method: "POST",
    })
  }

  async getUploadLinks(): Promise<UploadLink[]> {
    return this.request<UploadLink[]>("/upload-links")
  }

  async getLinkStatus(linkId: string): Promise<UploadLink> {
    return this.request<UploadLink>(`/upload-links/${linkId}/status`)
  }

  // Upload endpoint
  async uploadFile(
    linkId: string,
    file: File,
    onProgress?: (progress: number) => void,
  ): Promise<{ message: string; file_name: string; file_size: number }> {
    const formData = new FormData()
    formData.append("file", file)

    const url = `${this.baseUrl}/upload/${linkId}`

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      // Отслеживание прогресса загрузки
      if (onProgress) {
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100)
            onProgress(progress)
          }
        })
      }

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText)
            resolve(response)
          } catch {
            resolve({ message: "Файл успешно загружен", file_name: file.name, file_size: file.size })
          }
        } else {
          try {
            const errorData = JSON.parse(xhr.responseText)
            reject(new Error(errorData.message || `HTTP ${xhr.status}`))
          } catch {
            reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`))
          }
        }
      })

      xhr.addEventListener("error", () => {
        reject(new Error("Ошибка сети при загрузке файла"))
      })

      xhr.addEventListener("timeout", () => {
        reject(new Error("Превышено время ожидания загрузки"))
      })

      xhr.open("POST", url)

      if (this.token) {
        xhr.setRequestHeader("Authorization", `Bearer ${this.token}`)
      }

      xhr.setRequestHeader("Accept", "application/json")
      xhr.timeout = 300000 // 5 минут

      xhr.send(formData)
    })
  }

  // Download endpoint
  getDownloadUrl(linkId: string): string {
    return `${this.baseUrl}/download/${linkId}`
  }

  async downloadFile(linkId: string): Promise<{ blob: Blob; filename: string }> {
    const response = (await this.request(`/download/${linkId}`, {
      method: "GET",
    })) as Response

    if (!response.ok) {
      const errorText = await response.text()
      let errorData: ApiError
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { message: `HTTP ${response.status}: ${response.statusText}` }
      }
      throw new Error(errorData.message)
    }

    const blob = await response.blob()
    const contentDisposition = response.headers.get("Content-Disposition")
    let filename = "download"

    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, "")
      }
    }

    return { blob, filename }
  }

  // Download file info endpoint
  async getDownloadFileInfo(linkId: string): Promise<DownloadFileInfo> {
    return this.request<DownloadFileInfo>(`/download/${linkId}/info`)
  }

  // Проверка статуса соединения
  async checkHealth(): Promise<{ status: string }> {
    return this.request<{ status: string }>("/health")
  }
}

export const apiClient = new ApiClient()
export type { UploadLink, LoginRequest, LoginResponse, ApiError, DownloadFileInfo }
