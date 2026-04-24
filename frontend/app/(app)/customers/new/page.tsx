"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { ArrowLeft } from "lucide-react"

export default function NewCustomerPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    nome: "", telefone: "", cpf: "", email: "",
    sexo: "", segmento_manual: "novo",
    data_nascimento: "", observacoes: "",
    num_compras_anterior: "", total_gasto_anterior: "",
  })

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const payload: Record<string, unknown> = {
        nome: form.nome, telefone: form.telefone,
        cpf: form.cpf || null, email: form.email || null,
        sexo: form.sexo || null, segmento_manual: form.segmento_manual,
        data_nascimento: form.data_nascimento || null,
        observacoes: form.observacoes || null,
        num_compras_anterior: Number(form.num_compras_anterior) || 0,
        total_gasto_anterior: Number(form.total_gasto_anterior) || 0,
      }
      await api.customers.create(payload)
      router.push("/customers")
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
        <h1 className="text-xl font-bold text-gray-900">Novo cliente</h1>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <Field label="Nome *" value={form.nome} onChange={(v) => set("nome", v)} required />
        <Field label="Telefone *" value={form.telefone} onChange={(v) => set("telefone", v)} type="tel" required />
        <Field label="CPF" value={form.cpf} onChange={(v) => set("cpf", v)} />
        <Field label="E-mail" value={form.email} onChange={(v) => set("email", v)} type="email" />
        <Field label="Data de nascimento" value={form.data_nascimento} onChange={(v) => set("data_nascimento", v)} type="date" />

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Sexo</label>
          <select value={form.sexo} onChange={(e) => set("sexo", e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white">
            <option value="">Não informado</option>
            <option value="feminino">Feminino</option>
            <option value="masculino">Masculino</option>
            <option value="outro">Outro</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Status</label>
          <select value={form.segmento_manual} onChange={(e) => set("segmento_manual", e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white">
            <option value="novo">Novo</option>
            <option value="recorrente">Recorrente</option>
            <option value="inativo">Inativo</option>
          </select>
        </div>

        <div className="bg-blue-50 rounded-2xl p-4 space-y-3">
          <p className="text-xs font-semibold text-blue-700">Histórico anterior ao sistema</p>
          <Field label="Nº de compras anteriores" value={form.num_compras_anterior} onChange={(v) => set("num_compras_anterior", v)} type="number" />
          <Field label="Total gasto anteriormente (R$)" value={form.total_gasto_anterior} onChange={(v) => set("total_gasto_anterior", v)} type="number" step="0.01" />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Observações</label>
          <textarea value={form.observacoes} onChange={(e) => set("observacoes", e.target.value)} rows={3} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm" />
        </div>

        <button type="submit" disabled={loading} className="w-full bg-primary text-white font-semibold py-3 rounded-2xl disabled:opacity-60">
          {loading ? "Salvando…" : "Salvar cliente"}
        </button>
      </form>
    </div>
  )
}

function Field({ label, value, onChange, type = "text", required = false, step }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; required?: boolean; step?: string
}) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-600 block mb-1">{label}</label>
      <input
        type={type} value={value} required={required} step={step}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary"
      />
    </div>
  )
}
