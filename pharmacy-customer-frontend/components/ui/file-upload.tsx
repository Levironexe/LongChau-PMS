"use client"

import React, { useState, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { 
  Upload, 
  X, 
  File, 
  Image as ImageIcon, 
  FileText, 
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react'
import { UploadedFile } from '@/lib/types'

interface FileUploadProps {
  files: UploadedFile[]
  onFilesChange: (files: UploadedFile[]) => void
  maxFiles?: number
  maxSize?: number // in MB
  acceptedTypes?: string[]
  disabled?: boolean
  className?: string
}

const DEFAULT_ACCEPTED_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/gif',
  'application/pdf'
]

const MAX_FILE_SIZE_MB = 10

export function FileUpload({
  files = [],
  onFilesChange,
  maxFiles = 5,
  maxSize = MAX_FILE_SIZE_MB,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  disabled = false,
  className = ""
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set())
  const fileInputRef = useRef<HTMLInputElement>(null)
  const currentFilesRef = useRef<UploadedFile[]>(files)
  const { toast } = useToast()

  // Keep ref in sync with files
  React.useEffect(() => {
    currentFilesRef.current = files
  }, [files])

  const validateFile = useCallback((file: File): string | null => {
    // Check file type
    if (!acceptedTypes.includes(file.type)) {
      return `File type ${file.type} is not allowed. Please upload images (PNG, JPG, GIF) or PDF files.`
    }

    // Check file size
    const sizeInMB = file.size / (1024 * 1024)
    if (sizeInMB > maxSize) {
      return `File size (${sizeInMB.toFixed(1)}MB) exceeds maximum allowed size of ${maxSize}MB.`
    }

    // Check total files limit
    if (files.length >= maxFiles) {
      return `Maximum ${maxFiles} files allowed. Please remove some files first.`
    }

    return null
  }, [acceptedTypes, maxSize, maxFiles, files.length])

  const processFiles = useCallback(async (fileList: FileList) => {
    const newFiles: UploadedFile[] = []
    const errors: string[] = []

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i]
      const error = validateFile(file)

      if (error) {
        errors.push(`${file.name}: ${error}`)
        continue
      }

      // Create uploaded file object
      const uploadedFile: UploadedFile = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
        uploadedAt: new Date().toISOString(),
        status: 'uploading',
        progress: 0
      }

      newFiles.push(uploadedFile)
    }

    if (errors.length > 0) {
      toast({
        title: "Upload errors",
        description: errors.join('\n'),
        variant: "destructive",
      })
    }

    if (newFiles.length > 0) {
      // Simulate upload progress
      const updatedFiles = [...files, ...newFiles]
      onFilesChange(updatedFiles)

      // Simulate upload for each file
      newFiles.forEach(async (file) => {
        setUploadingFiles(prev => new Set(prev).add(file.id))
        
        try {
          // Simulate upload progress
          for (let progress = 10; progress <= 100; progress += 10) {
            await new Promise(resolve => setTimeout(resolve, 100))
            
            // Update files using current ref
            const updatedFiles = currentFilesRef.current.map(f => 
              f.id === file.id 
                ? { ...f, progress, status: (progress === 100 ? 'uploaded' : 'uploading') as UploadedFile['status'] }
                : f
            )
            currentFilesRef.current = updatedFiles
            onFilesChange(updatedFiles)
          }

          toast({
            title: "Upload successful",
            description: `${file.name} uploaded successfully`,
            variant: "success",
          })
        } catch (error) {
          const updatedFiles = currentFilesRef.current.map(f => 
            f.id === file.id 
              ? { ...f, status: 'failed' as UploadedFile['status'], error: 'Upload failed' }
              : f
          )
          currentFilesRef.current = updatedFiles
          onFilesChange(updatedFiles)

          toast({
            title: "Upload failed",
            description: `Failed to upload ${file.name}`,
            variant: "destructive",
          })
        } finally {
          setUploadingFiles(prev => {
            const newSet = new Set(prev)
            newSet.delete(file.id)
            return newSet
          })
        }
      })
    }
  }, [files, onFilesChange, validateFile, toast])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragOver(true)
    }
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    if (disabled) return

    const fileList = e.dataTransfer.files
    if (fileList.length > 0) {
      processFiles(fileList)
    }
  }, [disabled, processFiles])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files
    if (fileList && fileList.length > 0) {
      processFiles(fileList)
    }
    // Reset input value to allow same file selection
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [processFiles])

  const removeFile = useCallback((fileId: string) => {
    const fileToRemove = files.find(f => f.id === fileId)
    if (fileToRemove?.url.startsWith('blob:')) {
      URL.revokeObjectURL(fileToRemove.url)
    }
    
    onFilesChange(files.filter(f => f.id !== fileId))
    
    toast({
      title: "File removed",
      description: "File has been removed from upload queue",
    })
  }, [files, onFilesChange, toast])

  const getFileIcon = (file: UploadedFile) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon className="h-4 w-4" />
    } else if (file.type === 'application/pdf') {
      return <FileText className="h-4 w-4" />
    }
    return <File className="h-4 w-4" />
  }

  const getStatusIcon = (file: UploadedFile) => {
    switch (file.status) {
      case 'uploading':
        return <Loader2 className="h-4 w-4 animate-spin" />
      case 'uploaded':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return null
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <Card
        className={`
          relative border-2 border-dashed transition-all duration-200 cursor-pointer
          ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400 hover:bg-gray-50'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <div className="p-8 text-center">
          <Upload className={`mx-auto h-12 w-12 mb-4 ${isDragOver ? 'text-blue-500' : 'text-gray-400'}`} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {isDragOver ? 'Drop files here' : 'Upload prescription files'}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Drag and drop files here, or click to select files
          </p>
          <p className="text-xs text-gray-500 mb-4">
            Accepted: Images (PNG, JPG, GIF) and PDF • Max {maxSize}MB per file • Up to {maxFiles} files
          </p>
          <Button type="button" disabled={disabled}>
            <Upload className="h-4 w-4 mr-2" />
            Choose Files
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />
      </Card>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900">
            Uploaded Files ({files.length}/{maxFiles})
          </h4>
          <div className="space-y-2">
            {files.map((file) => (
              <div key={file.id} className="flex items-center gap-3 p-3 border rounded-lg bg-white">
                <div className="flex-shrink-0">
                  {getFileIcon(file)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <Badge variant={
                      file.status === 'uploaded' ? 'default' :
                      file.status === 'failed' ? 'destructive' :
                      'secondary'
                    }>
                      {file.status}
                    </Badge>
                    {getStatusIcon(file)}
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{formatFileSize(file.size)}</span>
                    <span>{new Date(file.uploadedAt).toLocaleString()}</span>
                  </div>

                  {file.status === 'uploading' && file.progress !== undefined && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div
                          className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                          style={{ width: `${file.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {file.status === 'failed' && file.error && (
                    <p className="text-xs text-red-600 mt-1">{file.error}</p>
                  )}
                </div>

                {/* Preview for images */}
                {file.type.startsWith('image/') && file.status !== 'failed' && (
                  <div className="flex-shrink-0">
                    <img
                      src={file.url}
                      alt={file.name}
                      className="w-12 h-12 object-cover rounded border"
                    />
                  </div>
                )}

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFile(file.id)
                  }}
                  disabled={disabled || uploadingFiles.has(file.id)}
                  className="flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}