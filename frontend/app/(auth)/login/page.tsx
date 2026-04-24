"use client"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-8">Ótica Nina</h1>
        <button onClick={() => router.push("/dashboard")} className="w-full bg-primary text-white font-semibold py-3 rounded-2xl">
          Entrar
        </button>
      </div>
    </div>
  )
}
