'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { notifyCustomer } from '@/lib/notifications'
import { getCurrentUser, hasPermission } from '@/lib/auth'
import { carReturnSchema, type CarReturnData } from '@/lib/validations'
import { RentalStatus, VehicleStatus } from '@prisma/client'

/**
 * Server action to process a car return
 * This function:
 * 1. Validates the input data
 * 2. Checks user permissions
 * 3. Updates the rental record
 * 4. Updates the car record
 * 5. Notifies the customer
 */
export async function processCarReturn(data: CarReturnData): Promise<{
  success: boolean
  message: string
  error?: string
}> {
  try {
    // Check user authentication and permissions
    const user = getCurrentUser()
    if (!hasPermission(user)) {
      return {
        success: false,
        message: 'Access denied. You do not have permission to perform this action.',
        error: 'UNAUTHORIZED'
      }
    }

    // Validate the input data
    const validationResult = carReturnSchema.safeParse(data)
    if (!validationResult.success) {
      return {
        success: false,
        message: 'Invalid input data',
        error: validationResult.error.errors.map(e => e.message).join(', ')
      }
    }

    const validatedData = validationResult.data

    // Find the rental record
    const rental = await prisma.rental.findUnique({
      where: { id: validatedData.rentalId },
      include: { Car: true }
    })

    if (!rental) {
      return {
        success: false,
        message: 'Rental not found',
        error: 'RENTAL_NOT_FOUND'
      }
    }

    // Check if rental is already returned
    if (rental.status === RentalStatus.Returned) {
      return {
        success: false,
        message: 'Rental has already been returned',
        error: 'ALREADY_RETURNED'
      }
    }

    // Check if rental is active
    if (rental.status !== RentalStatus.Active) {
      return {
        success: false,
        message: 'Rental is not active and cannot be returned',
        error: 'INVALID_STATUS'
      }
    }

    // Validate odometer reading
    if (validatedData.odometerEnd < rental.odometerStart) {
      return {
        success: false,
        message: 'End odometer reading cannot be less than start reading',
        error: 'INVALID_ODOMETER'
      }
    }

    // Use a transaction to ensure data consistency
    await prisma.$transaction(async (tx) => {
      // Update the rental record
      await tx.rental.update({
        where: { id: validatedData.rentalId },
        data: {
          status: RentalStatus.Returned,
          returnedAt: validatedData.returnedAt,
          odometerEnd: validatedData.odometerEnd,
          damageReport: validatedData.damageReport
        }
      })

      // Update the car record
      await tx.car.update({
        where: { id: rental.carId },
        data: {
          status: VehicleStatus.Active,
          odometer: validatedData.odometerEnd
        }
      })
    })

    // Notify the customer
    try {
      await notifyCustomer(
        rental.customerEmail,
        'Your rental has been processed.'
      )
    } catch (notificationError) {
      // Log the error but don't fail the entire operation
      console.error('Failed to notify customer:', notificationError)
    }

    // Revalidate any cached data
    revalidatePath('/rentals')
    revalidatePath('/cars')

    return {
      success: true,
      message: `Car return processed successfully. Rental ${validatedData.rentalId} has been marked as returned.`
    }

  } catch (error) {
    console.error('Error processing car return:', error)
    
    return {
      success: false,
      message: 'An error occurred while processing the car return',
      error: error instanceof Error ? error.message : 'UNKNOWN_ERROR'
    }
  }
}
