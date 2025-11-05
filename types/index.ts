export interface GeneratedFile {
  filePath: string
  content: string
}

export interface StreamChunk {
  chunk?: string
  type?: 'chunk' | 'complete' | 'error'
  files?: GeneratedFile[]
  error?: string
}

export interface GenerationProcessProps {
  appName: string
  description: string
  onReset: () => void
}

export interface LivePreviewProps {
  streamedText: string
  generatedFiles: GeneratedFile[]
  appName: string
}

export interface ReviewExportProps {
  files: GeneratedFile[]
  appName: string
  onReset: () => void
  streamedText?: string
}

export type CodeCategory = 'frontend' | 'backend' | 'database' | 'env' | 'package' | 'preview'
export type GenerationStatus = 'idle' | 'generating' | 'complete' | 'error'
