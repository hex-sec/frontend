import { z } from 'zod'

/**
 * Zod schema for new visitor form validation
 */
export const NewVisitorSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  hostResidentId: z.string().min(1, 'Debe seleccionar un anfitrión'),
  reason: z.string().min(3, 'La razón debe tener al menos 3 caracteres'),
  validUntil: z.string().datetime('Debe ser una fecha válida'),
  photoDataUrl: z.string().url().optional().or(z.literal('')),
})

export type NewVisitorInput = z.infer<typeof NewVisitorSchema>
