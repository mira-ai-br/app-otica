"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { ArrowLeft } from "lucide-react"

export default function NewAppointmentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ customer_id: "", data_hora: "", duracao_min: "30", observacoes: "" })
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await api.appointments.create({
        customer_id: Number(form.customer_id),
        data_hora: new Date(form.data_hora).toISOString(),
        duracao_min: Number(form.duracao_min),
        observacoes: form.observacoes || null,
      })
      router.push("/appointments")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => router.back()} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100">
          <ArrowLeft size={16} />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Novo agendamento</h1>
      </div>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">ID do cliente *</label>
          <input type="number" required value={form.customer_id} onChange={(e) => set("customer_id", e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Data e hora *</label>
          <input type="datetime-local" required value={form.data_hora} onChange={(e) => set("data_hora", e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Duração (minutos)</label>
          <input type="number" value={form.duracao_min} onChange={(e) => set("duracao_min", e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Observações</label>
          <textarea value={form.observacoes} onChange={(e) => set("observacoes", e.target.value)} rows={3}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm" />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-primary text-white font-semibold py-3 rounded-2xl disabled:opacity-60">
          {loading ? "Salvando…" : "Agendar"}
        </button>
      </form>
    </div>
  )
}
