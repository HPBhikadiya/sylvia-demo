import { z } from 'zod'

/**
 * Validation schema for car return data
 */
export const carReturnSchema = z.object({
  rentalId: z.string().min(1, 'Rental ID is required'),
  odometerEnd: z.number().min(0, 'Odometer reading must be non-negative'),
  damageReport: z.string().optional(),
  returnedAt: z.date().optional().default(() => new Date())
})

export type CarReturnData = z.infer<typeof carReturnSchema>
