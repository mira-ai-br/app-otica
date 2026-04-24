"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { api } from "@/lib/api"
import { Search, Plus, ChevronRight } from "lucide-react"

interface Customer {
  id: number
  nome: string
  telefone: string
  segmento: string
  num_compras: number
  total_gasto: number
}

const segColors: Record<string, string> = {
  novo: "bg-blue-100 text-blue-700",
  recorrente: "bg-green-100 text-green-700",
  inativo: "bg-gray-100 text-gray-500",
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [q, setQ] = useState("")

  useEffect(() => {
    api.customers.list(q || undefined).then((d) => setCustomers(d as Customer[])).catch(console.error)
  }, [q])

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900">Clientes</h1>
        <Link href="/customers/new" className="w-9 h-9 bg-primary rounded-full flex items-center justify-center">
          <Plus size={18} className="text-white" />
        </Link>
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nome ou telefone…"
          className="w-full pl-9 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm outline-none"
        />
      </div>

      <div className="space-y-2">
        {customers.map((c) => (
          <Link key={c.id} href={`/customers/${c.id}`} className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 p-4">
            <div>
              <p className="font-semibold text-gray-900 text-sm">{c.nome}</p>
              <p className="text-xs text-gray-500">{c.telefone}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${segColors[c.segmento] ?? "bg-gray-100 text-gray-500"}`}>
                  {c.segmento}
                </span>
                <span className="text-[10px] text-gray-400">{c.num_compras} compra(s)</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-sm font-semibold text-gray-700">
                {c.total_gasto.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </span>
              <ChevronRight size={16} className="text-gray-400" />
            </div>
          </Link>
        ))}
        {customers.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-10">Nenhum cliente encontrado</p>
        )}
      </div>
    </div>
  )
}
