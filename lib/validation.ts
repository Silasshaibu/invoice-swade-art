import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required'),
})

export const accessRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required'),
})

export const createClientSchema = z.object({
  name: z.string().min(1, 'Client name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  company: z.string().optional().or(z.literal('')),
  tax_id: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
})

export const createInvoiceSchema = z.object({
  client_id: z.number().int().positive('Valid client required'),
  due_date: z.string().optional().nullable(),
  notes: z.string().optional().or(z.literal('')),
  tax_rate: z.number().nonnegative().optional(),
  discount: z.number().nonnegative().optional(),
  items: z.array(z.object({
    description: z.string().min(1, 'Description required'),
    quantity: z.number().positive('Quantity must be positive'),
    unit_price: z.number().nonnegative('Price cannot be negative'),
  })),
})

export const createPaymentSchema = z.object({
  invoice_id: z.number().int().positive('Valid invoice required'),
  amount: z.number().positive('Amount must be positive'),
  payment_date: z.string().date('Valid date required'),
  method: z.string().optional().or(z.literal('')),
  reference: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
})

export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  company_name: z.string().optional(),
  company_address: z.string().optional(),
  company_phone: z.string().optional(),
  company_email: z.string().email().optional(),
  company_website: z.string().url().optional(),
  currency: z.string().length(3).optional(),
  tax_id: z.string().optional(),
  invoice_prefix: z.string().optional(),
  next_invoice_num: z.string().optional(),
  payment_terms: z.number().int().nonnegative().optional(),
  invoice_notes: z.string().optional(),
  pdf_template: z.enum(['professional', 'classic', 'modern', 'compact']).optional(),
  email_sent: z.boolean().optional(),
  email_received: z.boolean().optional(),
  email_overdue: z.boolean().optional(),
})
