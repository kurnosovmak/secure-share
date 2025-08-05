import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Download, Upload, Clock, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-slate-900 rounded-full">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">SecureShare</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Делитесь файлами приватно с одноразовыми ссылками для скачивания, которые истекают после использования.
            Получателям не нужны аккаунты, максимальная приватность гарантирована.
          </p>
        </div>

        {/* How it works */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center border-slate-200">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Upload className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <CardTitle className="text-lg">1. Создайте ссылку</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Создайте безопасную ссылку для загрузки из вашей панели управления. Поделитесь ей с тем, кому доверяете.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center border-slate-200">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="p-2 bg-green-100 rounded-full">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-lg">2. Загрузите файл</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Получатель загружает файл по секретной ссылке. Файл шифруется и безопасно сохраняется.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center border-slate-200">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="p-2 bg-purple-100 rounded-full">
                  <Download className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <CardTitle className="text-lg">3. Скачайте один раз</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Скачайте файл только один раз. После скачивания ссылка истекает и файл удаляется.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="bg-white rounded-lg p-8 mb-16 border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Приватность по дизайну</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-slate-900">Одноразовый доступ</h3>
                <p className="text-slate-600 text-sm">Файлы автоматически удаляются после скачивания</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-slate-900">Зашифрованное хранение</h3>
                <p className="text-slate-600 text-sm">Все файлы шифруются при хранении и передаче</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-slate-900">Без регистрации</h3>
                <p className="text-slate-600 text-sm">Получателям не нужны аккаунты для загрузки или скачивания</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-slate-900">Безопасные ссылки</h3>
                <p className="text-slate-600 text-sm">Криптографически стойкие токены для всех операций</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link href="/login">
            <Button size="lg" className="bg-slate-900 hover:bg-slate-800">
              Начать работу
            </Button>
          </Link>
          <p className="text-sm text-slate-500 mt-4">Бесплатно • Кредитная карта не требуется</p>
        </div>
      </div>
    </div>
  )
}
