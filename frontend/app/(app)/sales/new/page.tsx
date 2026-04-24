"use client"
import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Camera } from "lucide-react"

function NewSaleForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    customer_id: params.get("customer_id") ?? "",
    valor_total: "", forma_pagamento: "dinheiro", parcelas: "1",
    grau_od: "", grau_oe: "", observacoes: "",
  })
  const [files, setFiles] = useState<{ oculos?: File; nota?: File; os?: File }>({})
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
      const fd = new FormData()
      fd.append("customer_id", form.customer_id)
      fd.append("valor_total", form.valor_total)
      fd.append("forma_pagamento", form.forma_pagamento)
      fd.append("parcelas", form.parcelas)
      if (form.grau_od) fd.append("grau_od", form.grau_od)
      if (form.grau_oe) fd.append("grau_oe", form.grau_oe)
      if (form.observacoes) fd.append("observacoes", form.observacoes)
      if (files.oculos) fd.append("foto_oculos", files.oculos)
      if (files.nota) fd.append("foto_nota", files.nota)
      if (files.os) fd.append("foto_os", files.os)
      await fetch(`${BASE}/api/sales`, { method: "POST", body: fd })
      router.push(form.customer_id ? `/customers/${form.customer_id}` : "/customers")
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
        <h1 className="text-xl font-bold text-gray-900">Nova venda</h1>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <Field label="ID do cliente *" value={form.customer_id} onChange={(v) => set("customer_id", v)} type="number" required />
        <Field label="Valor total (R$) *" value={form.valor_total} onChange={(v) => set("valor_total", v)} type="number" step="0.01" required />

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Forma de pagamento</label>
          <select value={form.forma_pagamento} onChange={(e) => set("forma_pagamento", e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white">
            <option value="dinheiro">Dinheiro</option>
            <option value="pix">PIX</option>
            <option value="credito">Cartão de crédito</option>
            <option value="debito">Cartão de débito</option>
          </select>
        </div>

        {form.forma_pagamento === "credito" && (
          <Field label="Parcelas" value={form.parcelas} onChange={(v) => set("parcelas", v)} type="number" />
        )}

        <div className="bg-blue-50 rounded-2xl p-4 space-y-3">
          <p className="text-xs font-semibold text-blue-700">Grau da receita (opcional)</p>
          <Field label="OD (olho direito)" value={form.grau_od} onChange={(v) => set("grau_od", v)} />
          <Field label="OE (olho esquerdo)" value={form.grau_oe} onChange={(v) => set("grau_oe", v)} />
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-600">Fotos (opcional)</p>
          <PhotoInput label="Foto dos óculos" onChange={(f) => setFiles((p) => ({ ...p, oculos: f }))} />
          <PhotoInput label="Nota fiscal" onChange={(f) => setFiles((p) => ({ ...p, nota: f }))} />
          <PhotoInput label="Ordem de serviço" onChange={(f) => setFiles((p) => ({ ...p, os: f }))} />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Observações</label>
          <textarea value={form.observacoes} onChange={(e) => set("observacoes", e.target.value)} rows={3}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm" />
        </div>

        <button type="submit" disabled={loading} className="w-full bg-primary text-white font-semibold py-3 rounded-2xl disabled:opacity-60">
          {loading ? "Salvando…" : "Registrar venda"}
        </button>
      </form>
    </div>
  )
}

export default function NewSalePage() {
  return (
    <Suspense>
      <NewSaleForm />
    </Suspense>
  )
}

function Field({ label, value, onChange, type = "text", required = false, step }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; required?: boolean; step?: string
}) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-600 block mb-1">{label}</label>
      <input type={type} value={value} required={required} step={step}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary" />
    </div>
  )
}

function PhotoInput({ label, onChange }: { label: string; onChange: (f: File) => void }) {
  return (
    <label className="flex items-center gap-3 border border-dashed border-gray-300 rounded-xl p-3 cursor-pointer hover:border-primary">
      <Camera size={18} className="text-gray-400" />
      <span className="text-sm text-gray-500">{label}</span>
      <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onChange(e.target.files[0])} />
    </label>
  )
}
