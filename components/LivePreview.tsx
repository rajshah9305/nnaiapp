'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import type { LivePreviewProps } from '@/types'

interface PreviewError {
  message: string
  type: 'parse' | 'runtime' | 'general'
}

const SUPPORTED_FRAMEWORKS = {
  REACT: {
    scripts: [
      'https://unpkg.com/react@18/umd/react.development.js',
      'https://unpkg.com/react-dom@18/umd/react-dom.development.js',
      'https://unpkg.com/@babel/standalone/babel.min.js'
    ],
    css: ['https://cdn.tailwindcss.com']
  }
}

export default function LivePreview({ streamedText, generatedFiles, appName }: LivePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const lastCodeRef = useRef<string>('')
  const [previewStatus, setPreviewStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [error, setError] = useState<PreviewError | null>(null)

  // Enhanced file finder with TypeScript support
  const findAppFile = useCallback(() => {
    const patterns = [
      /(^|\/)frontend\/src\/App\.(tsx|jsx|js)$/i,
      /(^|\/)src\/App\.(tsx|jsx|js)$/i,
      /(^|\/)App\.(tsx|jsx|js)$/i,
    ]

    // Try exact matches first
    for (const pat of patterns) {
      const hit = generatedFiles.find((f) => pat.test(f.filePath))
      if (hit) return hit
    }

    // Look for App component definition
    const componentFile = generatedFiles.find((f) => 
      /function\s+App\s*\(|const\s+App\s*=|class\s+App\s+extends/.test(f.content)
    )

    return componentFile
  }, [generatedFiles])

  // Extract component code from stream
  const extractComponentFromStream = useCallback((text: string) => {
    const jsonMatch = text.match(/\[\s*\{[\s\S]*?\}\s*\]/)
    if (!jsonMatch) return null

    try {
      const files = JSON.parse(jsonMatch[0])
      return (files as any[]).find(
        (f) => typeof f?.filePath === 'string' && /(^|\/)App\.(tsx|jsx|js)$/i.test(f.filePath)
      )?.content || null
    } catch {
      return null
    }
  }, [])

  // Prepare component code for preview
  const prepareComponentCode = useCallback((code: string) => {
    // Strip imports/exports
    const stripped = code
      .replace(/import\s+.*?from\s+['"].*?['"];?\n?/g, '')
      .replace(/export\s+(default\s+)?/g, '')
      .trim()

    // Detect component name
    const patterns = [
      /export\s+default\s+function\s+([A-Za-z0-9_]+)/,
      /function\s+([A-Za-z0-9_]+)\s*\(/,
      /const\s+([A-Za-z0-9_]+)\s*=\s*(?:\([^)]*\)\s*=>|function)/,
      /class\s+([A-Za-z0-9_]+)\s+extends\s+React\.Component/
    ]

    const nameMatch = patterns.reduce((match, pattern) => match || pattern.exec(code), null as RegExpExecArray | null)
    const detectedName = nameMatch?.[1] || 'App'
    
    // Add App alias if needed
    const needsAlias = detectedName !== 'App' && !/\bconst\s+App\s*=/.test(stripped)
    return needsAlias ? `${stripped}\nconst App = ${detectedName};` : stripped
  }, [])

  // Generate preview HTML
  const generatePreviewHTML = useCallback((componentCode: string) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8" />
        ${SUPPORTED_FRAMEWORKS.REACT.scripts
          .map(src => `<script crossorigin src="${src}"></script>`)
          .join('\n')}
        ${SUPPORTED_FRAMEWORKS.REACT.css
          .map(href => `<link rel="stylesheet" href="${href}">`)
          .join('\n')}
        <style>
          html,body{margin:0;padding:0;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
          *{box-sizing:border-box}
        </style>
      </head>
      <body>
        <div id="root"></div>
        <script>
          window.addEventListener('error', function(e) {
            window.parent.postMessage({
              type: 'preview-error',
              error: { message: e.message, type: 'runtime' }
            }, '*');
          });
        </script>
        <script type="text/babel">
          const {useState,useEffect,useRef,useCallback,useMemo}=React;
          try {
            ${componentCode}
            const root=ReactDOM.createRoot(document.getElementById('root'));
            root.render(React.createElement(App));
          } catch(e) {
            window.parent.postMessage({
              type: 'preview-error',
              error: { message: e.message, type: 'runtime' }
            }, '*');
          }
        </script>
      </body>
      </html>
    `
  }, [])

  useEffect(() => {
    if (!iframeRef.current) return

    const iframe = iframeRef.current
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
    if (!iframeDoc) return

    // Handle preview errors
    const handlePreviewError = (event: MessageEvent) => {
      if (event.data?.type === 'preview-error') {
        setError(event.data.error)
        setPreviewStatus('error')
      }
    }
    window.addEventListener('message', handlePreviewError)

    // Get component code
    let componentCode = ''
    const appFile = findAppFile()

    if (appFile?.content) {
      componentCode = appFile.content
    } else if (streamedText) {
      const streamComponent = extractComponentFromStream(streamedText)
      if (streamComponent) componentCode = streamComponent
    }

    if (!componentCode) {
      setPreviewStatus('loading')
      return
    }

    if (componentCode === lastCodeRef.current) return
    lastCodeRef.current = componentCode

    try {
      const preparedCode = prepareComponentCode(componentCode)
      const html = generatePreviewHTML(preparedCode)

      setPreviewStatus('ready')
      setError(null)

      iframeDoc.open()
      iframeDoc.write(html)
      iframeDoc.close()
    } catch (err: any) {
      setError({ message: err.message, type: 'parse' })
      setPreviewStatus('error')
    }

    return () => {
      window.removeEventListener('message', handlePreviewError)
    }
  }, [streamedText, generatedFiles, appName, findAppFile, extractComponentFromStream, prepareComponentCode, generatePreviewHTML])

  return (
    <div className="relative w-full h-full bg-white">
      {previewStatus === 'loading' && !streamedText && (
        <div className="absolute inset-0 flex items-center justify-center bg-white z-10 animate-fade-in">
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-sm text-black font-semibold">Waiting for code...</p>
            <p className="text-xs text-black opacity-70 mt-1">Preview will render as code generates</p>
          </div>
        </div>
      )}

      {previewStatus === 'error' && error && (
        <div className="absolute inset-0 flex items-center justify-center bg-white z-10 animate-fade-in">
          <div className="text-center max-w-md px-6">
            <div className="w-12 h-12 mx-auto mb-4 text-red-500">
              <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-black mb-2">Preview Error</h3>
            <p className="text-sm text-black opacity-70">{error.message}</p>
          </div>
        </div>
      )}

      <iframe
        ref={iframeRef}
        className="w-full h-full border-0 bg-white"
        sandbox="allow-scripts allow-same-origin"
        title="Live Preview"
        style={{ minHeight: '100%', display: previewStatus === 'loading' ? 'none' : 'block' }}
      />
    </div>
  )
}
