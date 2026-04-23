export type Segmento = "novo" | "recorrente" | "inativo"

export interface Customer {
  id: number
  nome: string
  telefone: string
  cpf?: string
  data_nascimento?: string
  email?: string
  observacoes?: string
  total_gasto: number
  num_compras: number
  ultima_compra?: string
  segmento: Segmento
  created_at: string
}

export interface Appointment {
  id: number
  customer_id: number
  data_hora: string
  duracao_min: number
  status: "agendado" | "concluido" | "cancelado" | "no_show"
  observacoes?: string
  customer?: Customer
}

export interface SalePhoto {
  id: number
  tipo: "oculos" | "nota_fiscal" | "ordem_servico"
  url: string
}

export interface Sale {
  id: number
  customer_id: number
  appointment_id?: number
  valor_total: number
  forma_pagamento: string
  parcelas: number
  grau_od?: string
  grau_oe?: string
  observacoes?: string
  photos: SalePhoto[]
  created_at: string
}

export interface TimelineItem {
  tipo: "venda" | "agendamento" | "whatsapp"
  data: string
  valor?: number
  status?: string
  template?: string
  id?: number
}

export interface KPIs {
  num_vendas: number
  faturamento: number
  ticket_medio: number
  novos_clientes: number
}

export interface AppSettings {
  nome_otica: string
  cor_primaria: string
  cor_secundaria: string
  logo_url?: string
  cupom_aniversario_valor: string
  cupom_aniversario_tipo: "percentual" | "fixo"
  horario_disparo_diario: string
}
