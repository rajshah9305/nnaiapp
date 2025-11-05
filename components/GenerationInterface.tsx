'use client'

import { useState, useCallback } from 'react'
import GenerationProcess from './GenerationProcess'

interface ValidationErrors {
  appName?: string;
  description?: string;
}

export default function GenerationInterface() {
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

  const handleGenerate = async () => {
    const validationErrors = validateForm()
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length === 0) {
      setShowProcess(true)
    }
  }

  const handleReset = () => {
    setShowProcess(false)
    setAppName('')
    setDescription('')
    setErrors({})
  }

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
              onChange={(e) => {
                setAppName(e.target.value)
                if (errors.appName) {
                  const { appName: _, ...rest } = errors
                  setErrors(rest)
                }
              }}
              placeholder="e.g., Todo App, Blog Platform, E-commerce Store"
              className={`w-full px-3 py-2 rounded-lg border text-sm
                ${errors.appName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500'}
                focus:ring-2 focus:ring-opacity-50 transition-all`}

            />
            {errors.appName && (
              <p className="text-red-500 text-sm mt-1 animate-fade-in">
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
              onChange={(e) => {
                setDescription(e.target.value)
                if (errors.description) {
                  const { description: _, ...rest } = errors
                  setErrors(rest)
                }
              }}
              placeholder="Describe your application's features, functionality, and requirements..."
              rows={4}
              className={`w-full px-3 py-2 rounded-lg border text-sm
                ${errors.description ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500'}
                focus:ring-2 focus:ring-opacity-50 transition-all resize-none`}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1 animate-fade-in">
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
          >
            Generate Application
          </button>
        </div>
      </div>
    </div>
  )
}
