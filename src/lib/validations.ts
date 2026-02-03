import { z } from 'zod'

// ==================== CLIENT ====================
export const clientSchema = z.object({
  firstName: z.string().min(1, 'Prénom requis').max(100),
  lastName: z.string().min(1, 'Nom requis').max(100),
  email: z.string().email('Email invalide').optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  privateNotes: z.string().max(2000).optional().nullable(),
})

export type ClientInput = z.infer<typeof clientSchema>

// ==================== ANIMAL ====================
export const animalSchema = z.object({
  name: z.string().min(1, 'Nom requis').max(100),
  species: z.enum(['dog', 'cat', 'rabbit', 'bird', 'other']),
  breed: z.string().max(100).optional().nullable(),
  color: z.string().max(50).optional().nullable(),
  weight: z.number().positive().max(200).optional().nullable(),
  dateOfBirth: z.string().datetime().optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  photo: z.string().url().optional().nullable(),
  // Fiche santé/comportement
  temperament: z.enum(['calm', 'anxious', 'playful', 'aggressive', 'mixed']).optional().nullable(),
  allergies: z.string().max(500).optional().nullable(),
  healthNotes: z.string().max(1000).optional().nullable(),
  groomingNotes: z.string().max(1000).optional().nullable(),
  clientId: z.string(),
})

export type AnimalInput = z.infer<typeof animalSchema>

// ==================== APPOINTMENT ====================
export const appointmentStatusEnum = z.enum([
  'scheduled',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
  'no_show',
])

export const appointmentSchema = z.object({
  clientId: z.string().cuid(),
  animalId: z.string().cuid(),
  serviceId: z.string().cuid(),
  startTime: z.string().datetime(),
  notes: z.string().max(1000).optional().nullable(),
  internalNotes: z.string().max(1000).optional().nullable(),
})

export const appointmentUpdateSchema = z.object({
  id: z.string().cuid(),
  status: appointmentStatusEnum.optional(),
  notes: z.string().max(1000).optional().nullable(),
  internalNotes: z.string().max(1000).optional().nullable(),
  cancellationReason: z.string().max(500).optional().nullable(),
})

export type AppointmentInput = z.infer<typeof appointmentSchema>

// ==================== INVOICE ====================
export const invoiceStatusEnum = z.enum([
  'draft',
  'sent',
  'paid',
  'cancelled',
  'overdue',
])

export const paymentMethodEnum = z.enum([
  'cash',
  'card',
  'transfer',
  'check',
])

export const invoiceSchema = z.object({
  clientId: z.string().cuid(),
  appointmentId: z.string().cuid().optional().nullable(),
  subtotal: z.number().positive(),
  taxRate: z.number().min(0).max(100).default(20),
})

export const invoiceUpdateSchema = z.object({
  id: z.string().cuid(),
  status: invoiceStatusEnum.optional(),
  paymentMethod: paymentMethodEnum.optional().nullable(),
})

export type InvoiceInput = z.infer<typeof invoiceSchema>

// ==================== SERVICE ====================
export const serviceSchema = z.object({
  name: z.string().min(1, 'Nom requis').max(100),
  description: z.string().max(500).optional().nullable(),
  price: z.number().positive('Prix doit être positif'),
  minPrice: z.number().positive().optional().nullable(),
  maxPrice: z.number().positive().optional().nullable(),
  duration: z.number().int().positive().max(480), // Max 8h
  minDuration: z.number().int().positive().optional().nullable(),
  maxDuration: z.number().int().positive().optional().nullable(),
  isFlexible: z.boolean().default(false),
})

export type ServiceInput = z.infer<typeof serviceSchema>

// ==================== SALON ====================
export const salonSchema = z.object({
  name: z.string().min(1, 'Nom requis').max(100),
  description: z.string().max(500).optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  address: z.string().max(200).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  postalCode: z.string().max(10).optional().nullable(),
  email: z.string().email().optional().nullable(),
  logo: z.string().url().optional().nullable(),
  // Infos légales
  siret: z.string().length(14, 'SIRET doit contenir 14 chiffres').optional().nullable(),
  tvaNumber: z.string().max(20).optional().nullable(),
  legalName: z.string().max(200).optional().nullable(),
  legalForm: z.string().max(50).optional().nullable(),
  invoiceTerms: z.string().max(500).optional().nullable(),
  invoiceNotes: z.string().max(500).optional().nullable(),
})

export type SalonInput = z.infer<typeof salonSchema>

// ==================== HELPER ====================
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: true
  data: T
} | {
  success: false
  errors: Array<{ path: string; message: string }>
} {
  const result = schema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { 
    success: false, 
    errors: result.error.issues.map(issue => ({
      path: issue.path.join('.'),
      message: issue.message,
    }))
  }
}
