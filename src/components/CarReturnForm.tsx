'use client'

import { useState } from 'react'
import { processCarReturn } from '@/app/actions/processCarReturn'
import type { CarReturnData } from '@/lib/validations'

export default function CarReturnForm() {
  const [formData, setFormData] = useState<CarReturnData>({
    rentalId: '',
    odometerEnd: 0,
    damageReport: '',
    returnedAt: new Date()
  })
  const [result, setResult] = useState<{
    success: boolean
    message: string
    error?: string
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setResult(null)

    try {
      const response = await processCarReturn(formData)
      setResult(response)
    } catch (error) {
      setResult({
        success: false,
        message: 'An unexpected error occurred',
        error: error instanceof Error ? error.message : 'UNKNOWN_ERROR'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'odometerEnd' ? parseInt(value, 10) || 0 : value
    }))
  }

  return (
    <div className="max-w-md mx-auto bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Process Car Return (JSON)
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="rentalId" className="block text-sm font-medium text-gray-700">
            Rental ID
          </label>
          <input
            type="text"
            id="rentalId"
            name="rentalId"
            value={formData.rentalId}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter rental ID"
          />
        </div>
        
        <div>
          <label htmlFor="odometerEnd" className="block text-sm font-medium text-gray-700">
            End Odometer Reading
          </label>
          <input
            type="number"
            id="odometerEnd"
            name="odometerEnd"
            value={formData.odometerEnd}
            onChange={handleInputChange}
            required
            min="0"
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter final odometer reading"
          />
        </div>
        
        <div>
          <label htmlFor="damageReport" className="block text-sm font-medium text-gray-700">
            Damage Report (Optional)
          </label>
          <textarea
            id="damageReport"
            name="damageReport"
            value={formData.damageReport}
            onChange={handleInputChange}
            rows={3}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Describe any damage to the vehicle"
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Processing...' : 'Process Car Return'}
        </button>
      </form>

      {result && (
        <div className={`mt-4 p-4 rounded-md ${
          result.success 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <p className="font-medium">{result.message}</p>
          {result.error && (
            <p className="text-sm mt-1 opacity-75">Error: {result.error}</p>
          )}
        </div>
      )}
    </div>
  )
}
