const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export const api = {
  customers: {
    list: (q?: string, segment?: string) =>
      request(`/api/customers?${new URLSearchParams({ ...(q && { q }), ...(segment && { segment }) })}`),
    get: (id: number) => request(`/api/customers/${id}`),
    timeline: (id: number) => request(`/api/customers/${id}/timeline`),
    create: (data: object) => request("/api/customers", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: object) => request(`/api/customers/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    delete: (id: number) => request(`/api/customers/${id}`, { method: "DELETE" }),
  },
  appointments: {
    list: (from: string, to: string) => request(`/api/appointments?from=${from}&to=${to}`),
    create: (data: object) => request("/api/appointments", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: object) => request(`/api/appointments/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    delete: (id: number) => request(`/api/appointments/${id}`, { method: "DELETE" }),
  },
  sales: {
    list: (customer_id?: number) => request(`/api/sales${customer_id ? `?customer_id=${customer_id}` : ""}`),
    get: (id: number) => request(`/api/sales/${id}`),
    create: (form: FormData) =>
      fetch(`${BASE}/api/sales`, { method: "POST", body: form }).then((r) => r.json()),
  },
  whatsapp: {
    send: (data: object) => request("/api/whatsapp/send", { method: "POST", body: JSON.stringify(data) }),
  },
  dashboard: {
    kpis: () => request("/api/dashboard/kpis"),
    segments: () => request("/api/dashboard/segments"),
    reactivation: () => request("/api/dashboard/reactivation"),
  },
}
