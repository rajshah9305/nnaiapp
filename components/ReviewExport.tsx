'use client'

import { useState, useCallback, useMemo } from 'react'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import LivePreview from './LivePreview'
import type { GeneratedFile, CodeCategory, ReviewExportProps } from '@/types'

// Enhanced types
interface FileCategory {
  id: CodeCategory
  label: string
  icon: React.ReactNode
  color: string
}

const FILE_CATEGORIES: FileCategory[] = [
  {
    id: 'frontend',
    label: 'Frontend',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
    </svg>,
    color: 'text-orange-500'
  },
  {
    id: 'backend',
    label: 'Backend',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
    </svg>,
    color: 'text-orange-500'
  },
  {
    id: 'database',
    label: 'Database',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
    </svg>,
    color: 'text-orange-500'
  },
  {
    id: 'preview',
    label: 'Preview',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>,
    color: 'text-orange-500'
  }
]

export default function ReviewExport({ files, appName, onReset, streamedText = '' }: ReviewExportProps) {
  const [activeTab, setActiveTab] = useState<CodeCategory>('frontend')
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)

  // Memoized file categorization
  const {
    frontendFiles,
    backendFiles,
    databaseFiles,
    envContent,
    packageContent
  } = useMemo(() => {
    const categorizeFiles = () => {
      const frontend = files.filter(f => 
        f.filePath.includes('frontend') ||
        f.filePath.includes('src/') ||
        f.filePath.match(/\.(jsx|js|tsx|ts|css)$/) ||
        f.filePath === 'App.jsx' ||
        f.filePath === 'App.js'
      )

      const backend = files.filter(f =>
        f.filePath.includes('backend') ||
        f.filePath.includes('server') ||
        f.filePath.includes('routes') ||
        f.filePath.includes('api')
      )

      const database = files.filter(f =>
        f.filePath.includes('database') ||
        f.filePath.includes('schema') ||
        f.filePath.endsWith('.sql')
      )

      return {
        frontend,
        backend,
        database
      }
    }

    const { frontend, backend, database } = categorizeFiles()

    const env = files.find(f => f.filePath.includes('.env'))?.content || generateDefaultEnv()
    const pkg = files.find(f => f.filePath.includes('package.json'))?.content || generateDefaultPackage(appName)

    return {
      frontendFiles: frontend,
      backendFiles: backend,
      databaseFiles: database,
      envContent: env,
      packageContent: pkg
    }
  }, [files, appName])

  // File generators
  const generateDefaultEnv = () => `# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=app_db

# Server Configuration
PORT=3001
NODE_ENV=production

# CORS Configuration
CORS_ORIGIN=http://localhost:3000`

  const generateDefaultPackage = (name: string) => {
    return JSON.stringify({
      name: name.toLowerCase().replace(/\s+/g, '-'),
      version: '1.0.0',
      description: `Generated application: ${name}`,
      main: 'server.js',
      scripts: {
        start: 'node server.js',
        dev: 'nodemon server.js',
        build: 'npm run build:frontend && npm run build:backend',
        'build:frontend': 'cd frontend && npm run build',
        'build:backend': 'tsc',
        test: 'jest'
      },
      dependencies: {
        express: '^4.18.2',
        cors: '^2.8.5',
        mysql2: '^3.6.0',
        dotenv: '^16.3.1',
        helmet: '^7.0.0',
        compression: '^1.7.4',
        'express-rate-limit': '^6.9.0'
      },
      devDependencies: {
        '@types/express': '^4.17.17',
        '@types/node': '^20.5.0',
        typescript: '^5.1.6',
        nodemon: '^3.0.1',
        jest: '^29.6.2',
        'ts-jest': '^29.1.1'
      }
    }, null, 2)
  }

  // Generate README content
  const generateReadme = useCallback((name: string, env: string) => {
    return `# ${name}

## Description

This application was generated using RAJ AI Code Generator.

## Setup Instructions

1. Extract all files from this archive
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Create a \`.env\` file in the root directory with the following variables:
   \`\`\`
   ${env}
   \`\`\`

4. Set up the database:
   \`\`\`bash
   mysql -u root -p < database/schema.sql
   \`\`\`

5. Start the backend server:
   \`\`\`bash
   npm run dev:be
   \`\`\`

6. In a new terminal, start the frontend:
   \`\`\`bash
   npm run dev:fe
   \`\`\`

## Project Structure

- \`frontend/\` - React frontend application
- \`backend/\` - Express.js backend server
- \`database/\` - SQL schema files

## Technologies Used

- Frontend: React, Tailwind CSS
- Backend: Express.js, Node.js
- Database: MySQL

## License

Generated by RAJ AI Code Generator
`
  }, [])

  // Render tab content based on active tab
  const renderTabContent = useCallback(() => {
    switch (activeTab) {
      case 'frontend':
        return (
          <div className="space-y-4">
            {frontendFiles.length > 0 ? (
              frontendFiles.map((file, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">
                  <h3 className="font-semibold text-black mb-2">{file.filePath}</h3>
                  <pre className="text-xs bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto max-h-96 overflow-y-auto">
                    <code>{file.content}</code>
                  </pre>
                </div>
              ))
            ) : (
              <p className="text-black opacity-70">No frontend files generated.</p>
            )}
          </div>
        )
      case 'backend':
        return (
          <div className="space-y-4">
            {backendFiles.length > 0 ? (
              backendFiles.map((file, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">
                  <h3 className="font-semibold text-black mb-2">{file.filePath}</h3>
                  <pre className="text-xs bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto max-h-96 overflow-y-auto">
                    <code>{file.content}</code>
                  </pre>
                </div>
              ))
            ) : (
              <p className="text-black opacity-70">No backend files generated.</p>
            )}
          </div>
        )
      case 'database':
        return (
          <div className="space-y-4">
            {databaseFiles.length > 0 ? (
              databaseFiles.map((file, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">
                  <h3 className="font-semibold text-black mb-2">{file.filePath}</h3>
                  <pre className="text-xs bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto">
                    <code>{file.content}</code>
                  </pre>
                </div>
              ))
            ) : (
              <p className="text-black opacity-70">No database files generated.</p>
            )}
          </div>
        )
      case 'preview':
        return (
          <div className="h-[600px] border border-gray-200 rounded-lg overflow-hidden bg-white">
            <LivePreview
              streamedText={streamedText}
              generatedFiles={files}
              appName={appName}
            />
          </div>
        )
      default:
        return null
    }
  }, [activeTab, frontendFiles, backendFiles, databaseFiles, files, streamedText, appName])

  // Download handler with progress
  const handleDownload = async () => {
    if (files.length === 0) {
      alert('No files available to download. Please generate an application first.')
      return
    }

    try {
      setIsDownloading(true)
      setDownloadProgress(0)

      const zip = new JSZip()
      const totalFiles = files.length + 3 // Including .env, package.json, and README

      // Add files with progress tracking
      files.forEach((file, index) => {
        zip.file(file.filePath, file.content)
        setDownloadProgress(((index + 1) / totalFiles) * 100)
      })

      // Add additional files
      zip.file('.env.example', envContent)
      zip.file('package.json', packageContent)
      zip.file('README.md', generateReadme(appName, envContent))

      const blob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 }
      }, (metadata) => {
        setDownloadProgress(metadata.percent)
      })

      const fileName = `${appName.replace(/[^a-zA-Z0-9_-]/g, '_')}_generated_app_${Date.now()}.zip`
      saveAs(blob, fileName)
    } catch (error: any) {
      console.error('Download error:', error)
      alert(`Download failed: ${error?.message || 'Unknown error'}. Please try again.`)
    } finally {
      setIsDownloading(false)
      setDownloadProgress(0)
    }
  }

  return (
    <div className="w-full animate-fade-in">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{appName}</h1>
          <p className="text-sm text-gray-600">Review and download your generated application</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-4">
          <nav className="flex space-x-2 overflow-x-auto">
            {FILE_CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveTab(category.id)}
                className={`px-3 py-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                  activeTab === category.id
                    ? 'text-orange-600 border-b-2 border-orange-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className={category.color}>{category.icon}</span>
                  {category.label}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mb-4 h-[calc(100vh-400px)] max-h-[500px] overflow-y-auto">
          {renderTabContent()}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <button
            onClick={onReset}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Generate New App
          </button>
          <button
            onClick={handleDownload}
            disabled={isDownloading || files.length === 0}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm"
          >
            {isDownloading ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Downloading... {downloadProgress.toFixed(0)}%
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download ZIP
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
