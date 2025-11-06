'use client'

import { useState, useCallback, memo } from 'react'
import GenerationProcess from './GenerationProcess'

interface ValidationErrors {
  appName?: string;
  description?: string;
}

const GenerationInterface = () => {
  const [appName, setAppName] = useState('')
  const [description, setDescription] = useState('')
  const [showProcess, setShowProcess] = useState(false)
  const [errors, setErrors] = useState<ValidationErrors>({})

  const validateForm = useCallback((): ValidationErrors => {
    const newErrors: ValidationErrors = {}
    if (!appName.trim()) newErrors.appName = 'App name required'
    if (!description.trim()) newErrors.description = 'Description required'
    return newErrors
  }, [appName, description])

  const handleGenerate = useCallback(async () => {
    const validationErrors = validateForm()
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length === 0) {
      setShowProcess(true)
    }
  }, [validateForm])

  const handleReset = useCallback(() => {
    setShowProcess(false)
    setAppName('')
    setDescription('')
    setErrors({})
  }, [])

  const handleInputChange = useCallback((field: 'appName' | 'description', value: string) => {
    if (field === 'appName') {
      setAppName(value)
    } else {
      setDescription(value)
    }
    
    if (errors[field]) {
      setErrors(prev => {
        const { [field]: _, ...rest } = prev
        return rest
      })
    }
  }, [errors])

  if (showProcess) {
    return <GenerationProcess appName={appName} description={description} onReset={handleReset} />
  }

  return (
    <div className="w-full animate-fade-in">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="space-y-4">
          {/* App Name Input */}
          <div className="space-y-2">
            <label htmlFor="appName" className="block text-sm font-semibold text-gray-900">
              Application Name
            </label>
            <input
              type="text"
              id="appName"
              value={appName}
              onChange={(e) => handleInputChange('appName', e.target.value)}
              placeholder="e.g., Todo App, Blog Platform, E-commerce Store"
              className={`w-full px-3 py-2 rounded-lg border text-sm
                ${errors.appName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500'}
                focus:ring-2 focus:ring-opacity-50 transition-all`}
              aria-invalid={!!errors.appName}
              aria-describedby={errors.appName ? 'appName-error' : undefined}
            />
            {errors.appName && (
              <p id="appName-error" className="text-red-500 text-sm mt-1 animate-fade-in" role="alert">
                {errors.appName}
              </p>
            )}
          </div>

          {/* Description Textarea */}
          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-semibold text-gray-900">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your application's features, functionality, and requirements..."
              rows={4}
              className={`w-full px-3 py-2 rounded-lg border text-sm
                ${errors.description ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500'}
                focus:ring-2 focus:ring-opacity-50 transition-all resize-none`}
              aria-invalid={!!errors.description}
              aria-describedby={errors.description ? 'description-error' : undefined}
            />
            {errors.description && (
              <p id="description-error" className="text-red-500 text-sm mt-1 animate-fade-in" role="alert">
                {errors.description}
              </p>
            )}
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={!appName.trim() || !description.trim()}
            className={`w-full py-2.5 font-semibold text-sm rounded-lg
              bg-orange-500 text-white hover:bg-orange-600 
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all transform active:scale-[0.98]`}
            aria-label="Generate Application"
          >
            Generate Application
          </button>
        </div>
      </div>
    </div>
  )
}

export default memo(GenerationInterface)
