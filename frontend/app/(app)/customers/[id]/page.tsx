"use client"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { ArrowLeft, Phone, ShoppingBag } from "lucide-react"

interface Customer {
  id: number; nome: string; telefone: string; cpf?: string
  email?: string; data_nascimento?: string; sexo?: string
  observacoes?: string; segmento: string; num_compras: number; total_gasto: number
}

interface TimelineItem {
  tipo: string; data: string; valor?: number; status?: string; template?: string; id?: number
}

const segColors: Record<string, string> = {
  novo: "bg-blue-100 text-blue-700",
  recorrente: "bg-green-100 text-green-700",
  inativo: "bg-gray-100 text-gray-500",
}

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [timeline, setTimeline] = useState<TimelineItem[]>([])

  useEffect(() => {
    api.customers.get(Number(id)).then((d) => setCustomer(d as Customer)).catch(console.error)
    api.customers.timeline(Number(id)).then((d) => setTimeline(d as TimelineItem[])).catch(console.error)
  }, [id])

  if (!customer) return <div className="p-4 text-center text-sm text-gray-400 pt-20">Carregando…</div>

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => router.back()} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100">
          <ArrowLeft size={16} />
        </button>
        <h1 className="text-xl font-bold text-gray-900">{customer.nome}</h1>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${segColors[customer.segmento]}`}>{customer.segmento}</span>
          <a href={`tel:${customer.telefone}`} className="flex items-center gap-1 text-primary text-sm font-medium">
            <Phone size={14} /> {customer.telefone}
          </a>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Stat label="Compras" value={String(customer.num_compras)} />
          <Stat label="Total gasto" value={customer.total_gasto.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} />
          {customer.email && <Stat label="E-mail" value={customer.email} />}
          {customer.data_nascimento && <Stat label="Nascimento" value={new Date(customer.data_nascimento).toLocaleDateString("pt-BR")} />}
        </div>
      </div>

      <div className="flex gap-2 mb-5">
        <button
          onClick={() => router.push(`/sales/new?customer_id=${customer.id}`)}
          className="flex-1 flex items-center justify-center gap-2 bg-primary text-white font-semibold py-2.5 rounded-2xl text-sm"
        >
          <ShoppingBag size={16} /> Nova venda
        </button>
      </div>

      <h2 className="text-sm font-semibold text-gray-700 mb-3">Histórico</h2>
      <div className="space-y-2">
        {timeline.map((item, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-3 flex justify-between items-center">
            <div>
              <p className="text-xs font-medium text-gray-700 capitalize">{item.tipo}</p>
              <p className="text-[10px] text-gray-400">{new Date(item.data).toLocaleDateString("pt-BR")}</p>
            </div>
            {item.valor != null && (
              <span className="text-sm font-semibold text-gray-800">
                {item.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </span>
            )}
            {item.status && <span className="text-[10px] text-gray-400">{item.status}</span>}
          </div>
        ))}
        {timeline.length === 0 && <p className="text-center text-sm text-gray-400 py-6">Sem histórico</p>}
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] text-gray-400">{label}</p>
      <p className="text-sm font-semibold text-gray-800">{value}</p>
    </div>
  )
}
