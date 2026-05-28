export interface User {
  id: number
  email: string
  name: string
  company_name: string | null
  company_address: string | null
  company_phone: string | null
  company_logo: string | null
  currency: string
  is_admin: boolean
  created_at: string
}

export interface Client {
  id: number
  user_id: number
  name: string
  email: string | null
  phone: string | null
  address: string | null
  company: string | null
  tax_id: string | null
  notes: string | null
  created_at: string
}

export interface InvoiceItem {
  id?: number
  invoice_id?: number
  description: string
  quantity: number
  unit_price: number
  amount: number
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'

export interface Invoice {
  id: number
  user_id: number
  client_id: number
  client_name?: string
  client_email?: string
  client_company?: string
  invoice_number: string
  status: InvoiceStatus
  issue_date: string
  due_date: string | null
  notes: string | null
  tax_rate: number
  discount: number
  subtotal: number
  tax_amount: number
  total: number
  currency: string
  items?: InvoiceItem[]
  created_at: string
  updated_at: string
}

export interface Payment {
  id: number
  invoice_id: number
  user_id: number
  amount: number
  payment_date: string
  method: string | null
  reference: string | null
  notes: string | null
  created_at: string
}

export interface DashboardStats {
  total_revenue: number
  outstanding: number
  overdue: number
  draft_count: number
  paid_count: number
  overdue_count: number
  sent_count: number
  recent_invoices: Invoice[]
  monthly_revenue: { month: string; revenue: number }[]
}

export interface AuthUser {
  id: number
  email: string
  name: string
  isAdmin: boolean
}
