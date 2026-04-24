"use client"
import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { Plus, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"

interface Appointment {
  id: number; customer_id: number; data_hora: string
  duracao_min: number; status: string; observacoes?: string; origem: string
}

const statusColors: Record<string, string> = {
  agendado: "bg-blue-100 text-blue-700",
  confirmado: "bg-green-100 text-green-700",
  cancelado: "bg-red-100 text-red-700",
  concluido: "bg-gray-100 text-gray-500",
}

export default function AppointmentsPage() {
  const [date, setDate] = useState(new Date())
  const [appointments, setAppointments] = useState<Appointment[]>([])

  const from = new Date(date); from.setHours(0, 0, 0, 0)
  const to = new Date(date); to.setHours(23, 59, 59, 999)

  useEffect(() => {
    api.appointments.list(from.toISOString(), to.toISOString())
      .then((d) => setAppointments(d as Appointment[]))
      .catch(console.error)
  }, [date.toDateString()])

  const prev = () => setDate((d) => { const n = new Date(d); n.setDate(n.getDate() - 1); return n })
  const next = () => setDate((d) => { const n = new Date(d); n.setDate(n.getDate() + 1); return n })

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900">Agenda</h1>
        <Link href="/appointments/new" className="w-9 h-9 bg-primary rounded-full flex items-center justify-center">
          <Plus size={18} className="text-white" />
        </Link>
      </div>

      <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 px-4 py-3 mb-4">
        <button onClick={prev} className="text-gray-400"><ChevronLeft size={20} /></button>
        <span className="text-sm font-semibold text-gray-800">
          {date.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
        </span>
        <button onClick={next} className="text-gray-400"><ChevronRight size={20} /></button>
      </div>

      <div className="space-y-2">
        {appointments.map((a) => (
          <div key={a.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-semibold text-gray-900">
                  {new Date(a.data_hora).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                </p>
                {a.origem === "whatsapp" && (
                  <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">WhatsApp</span>
                )}
              </div>
              <p className="text-xs text-gray-400">{a.duracao_min} min</p>
              {a.observacoes && <p className="text-xs text-gray-500 mt-0.5">{a.observacoes}</p>}
            </div>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColors[a.status] ?? "bg-gray-100 text-gray-500"}`}>
              {a.status}
            </span>
          </div>
        ))}
        {appointments.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-10">Nenhum agendamento neste dia</p>
        )}
      </div>
    </div>
  )
}
