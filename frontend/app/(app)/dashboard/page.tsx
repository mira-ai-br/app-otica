"use client"
import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { Users, ShoppingBag, TrendingUp, DollarSign } from "lucide-react"

interface KPIs {
  num_vendas: number
  faturamento: number
  ticket_medio: number
  novos_clientes: number
}

interface Segments {
  novo: number
  recorrente: number
  inativo: number
}

export default function DashboardPage() {
  const [kpis, setKpis] = useState<KPIs | null>(null)
  const [segments, setSegments] = useState<Segments | null>(null)

  useEffect(() => {
    api.dashboard.kpis().then((d) => setKpis(d as KPIs)).catch(console.error)
    api.dashboard.segments().then((d) => setSegments(d as Segments)).catch(console.error)
  }, [])

  const fmt = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-gray-900 mb-1">Dashboard</h1>
      <p className="text-sm text-gray-500 mb-5">Mês atual</p>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card icon={<DollarSign size={18} className="text-primary" />} label="Faturamento" value={kpis ? fmt(kpis.faturamento) : "—"} />
        <Card icon={<ShoppingBag size={18} className="text-primary" />} label="Vendas" value={kpis ? String(kpis.num_vendas) : "—"} />
        <Card icon={<TrendingUp size={18} className="text-primary" />} label="Ticket médio" value={kpis ? fmt(kpis.ticket_medio) : "—"} />
        <Card icon={<Users size={18} className="text-primary" />} label="Novos clientes" value={kpis ? String(kpis.novos_clientes) : "—"} />
      </div>

      {segments && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-sm font-semibold text-gray-700 mb-3">Segmentos de clientes</p>
          <div className="space-y-2">
            <SegBar label="Recorrentes" count={segments.recorrente} total={segments.novo + segments.recorrente + segments.inativo} color="bg-primary" />
            <SegBar label="Novos" count={segments.novo} total={segments.novo + segments.recorrente + segments.inativo} color="bg-blue-300" />
            <SegBar label="Inativos" count={segments.inativo} total={segments.novo + segments.recorrente + segments.inativo} color="bg-gray-300" />
          </div>
        </div>
      )}
    </div>
  )
}

function Card({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4">
      <div className="flex items-center gap-2 mb-2">{icon}<span className="text-xs text-gray-500">{label}</span></div>
      <p className="text-xl font-bold text-gray-900">{value}</p>
    </div>
  )
}

function SegBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-600 mb-1">
        <span>{label}</span>
        <span>{count} ({pct}%)</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
