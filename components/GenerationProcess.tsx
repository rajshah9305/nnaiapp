'use client'

import { useState, useEffect, useRef } from 'react'
import LivePreview from './LivePreview'
import ReviewExport from './ReviewExport'
import type { GeneratedFile, GenerationProcessProps, GenerationError, FileProgress } from '@/types'

const LoadingSpinner = () => (
  <div className="flex items-center space-x-4 p-4">
    <div className="relative w-12 h-12">
      <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
      <div className="absolute inset-0 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
    <div className="space-y-2 animate-fade-in [animation-delay:200ms]">
      <div className="text-black font-semibold text-base">
        Generating Code
      </div>
      <div className="text-black opacity-70 text-sm">
        Analyzing requirements and creating files...
      </div>
    </div>
  </div>
)

export default function GenerationProcess({ appName, description, onReset }: GenerationProcessProps) {
  const [streamedText, setStreamedText] = useState('')
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([])
  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentFile, setCurrentFile] = useState<string>('')
  const [fileProgress, setFileProgress] = useState<FileProgress[]>([])
  const [isAIThinking, setIsAIThinking] = useState(true)
  const [showReview, setShowReview] = useState(false)
  const codeContainerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll effect with debounce
  useEffect(() => {
    if (!codeContainerRef.current) return
    
    const container = codeContainerRef.current
    const shouldScroll = container.scrollHeight - container.scrollTop < 1000
    
    if (shouldScroll) {
      const timeoutId = setTimeout(() => {
        container.scrollTop = container.scrollHeight
      }, 100)
      return () => clearTimeout(timeoutId)
    }
  }, [streamedText])

  useEffect(() => {
    const abortController = new AbortController()

    const generateCode = async () => {
      try {
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'X-Request-Time': new Date().toISOString()
          },
          body: JSON.stringify({ appName, description }),
          signal: abortController.signal
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
        }
        
        const reader = response.body?.getReader()
        if (!reader) throw new Error('No response body')

        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))
                
                if (data.error) {
                  setError(data.error)
                  return
                }
                
                if (data.chunk) {
                  setIsAIThinking(false)
                  setStreamedText(prev => prev + data.chunk)
                  
                  const fileMatch = data.chunk.match(/"filePath"\s*:\s*"([^"]+)"/)
                  if (fileMatch) {
                    const fileName = fileMatch[1]
                    setCurrentFile(fileName)
                    setFileProgress(prev => {
                      if (!prev.find(f => f.name === fileName)) {
                        return [...prev, { name: fileName, status: 'generating' }]
                      }
                      return prev
                    })
                  }
                }

                if (data.type === 'partial' && data.files) {
                  setGeneratedFiles(data.files)
                }
                
                if (data.type === 'complete' && data.files) {
                  setGeneratedFiles(data.files)
                  setIsComplete(true)
                  setFileProgress(prev => prev.map(f => ({ ...f, status: 'complete' })))
                  setCurrentFile('')
                  setTimeout(() => setShowReview(true), 5000)
                }
              } catch (parseError) {
                console.error('Error parsing SSE data:', parseError)
                setError('Failed to parse server response')
              }
            }
          }
        }
      } catch (err: GenerationError) {
        if (err.name === 'AbortError') return
        
        const errorMessage = err?.message || 'Generation failed. Please try again.'
        setError(errorMessage)
        console.error('Generation error:', err)
      }
    }

    generateCode()

    return () => {
      abortController.abort()
    }
  }, [appName, description])

  if (showReview && generatedFiles.length > 0) {
    return (
      <div className="animate-fade-in">
        <ReviewExport
          files={generatedFiles}
          appName={appName}
          onReset={onReset}
          streamedText={streamedText}
        />
      </div>
    )
  }

  return (
    <div className="w-full animate-fade-in">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 h-[calc(100vh-180px)] max-h-[700px]">
          {/* Left: Code Stream */}
          <div className="flex flex-col border-r border-gray-200">
            <div className="p-3 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Code Generation</h2>
                  {currentFile && (
                    <p className="text-xs text-gray-600 mt-0.5" aria-live="polite">
                      Generating: {currentFile}
                    </p>
                  )}
                  {isComplete && !showReview && (
                    <p className="text-xs text-green-600 mt-0.5" aria-live="polite">
                      ✓ Generation complete
                    </p>
                  )}
                </div>
                {isComplete && !showReview && (
                  <button
                    onClick={() => setShowReview(true)}
                    className="px-3 py-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-xs font-medium"
                    aria-label="View generated code"
                  >
                    View Code →
                  </button>
                )}
              </div>
            </div>
            <div 
              ref={codeContainerRef}
              className="flex-1 overflow-auto p-4 bg-gray-900 code-block-container"
              role="log"
              aria-live="polite"
            >
              {isAIThinking ? (
                <LoadingSpinner />
              ) : error ? (
                <div className="text-red-400 p-4" role="alert">
                  <p className="font-semibold">Error:</p>
                  <p>{error}</p>
                </div>
              ) : (
                <pre className="text-sm">
                  <code>{streamedText}</code>
                </pre>
              )}
            </div>
          </div>

          {/* Right: Live Preview */}
          <div className="flex flex-col">
            <div className="p-3 bg-gray-50 border-b border-gray-200">
              <h2 className="text-base font-semibold text-gray-900">Live Preview</h2>
            </div>
            <div className="flex-1 overflow-hidden">
              <LivePreview
                streamedText={streamedText}
                generatedFiles={generatedFiles}
                appName={appName}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
