"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Check, Circle, X, File, Plus, Loader2, Sparkles } from "lucide-react"
import { UploadDropzone } from "@/lib/uploadthing-utils"

// ===================== TYPES =====================
export interface DocumentSection {
  id: string
  type: string
  customTitle?: string
  files: string[]
  isComplete?: boolean
}

export interface DocumentRequirement {
  value: string
  label: string
}

export interface Stage {
  value: string
  label: string
}

// ===================== DOCUMENT PREVIEW =====================
export function DocumentPreview({ 
  url, 
  index, 
  onRemove 
}: { 
  url: string
  index: number
  onRemove: () => void 
}) {
  const isImage = url.match(/\.(jpg|jpeg|png|gif|webp)$/i)
  const [error, setError] = useState(false)
  const [refreshParam, setRefreshParam] = useState("")

  const handleRefresh = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setError(false)
    setRefreshParam(`?t=${Date.now()}`)
  }

  const displayUrl = `${url}${refreshParam}`

  return (
    <div className="relative group">
      <div className="border border-gray-600 rounded-lg p-2 bg-gray-700/50 h-20 w-20 relative overflow-hidden">
        {isImage ? (
          <>
            <img 
              src={displayUrl} 
              alt={`Doc ${index + 1}`} 
              className={`w-full h-full object-cover rounded ${error ? 'opacity-0' : 'opacity-100'}`}
              onError={() => setError(true)}
            />
            {error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800/80 p-1">
                <span className="text-[9px] text-red-400 mb-1 text-center leading-tight">Failed</span>
                <button 
                  onClick={handleRefresh}
                  className="bg-gray-700 hover:bg-gray-600 text-white rounded p-1 transition-colors"
                  title="Retry loading"
                  type="button"
                >
                  <div className="h-3 w-3 flex items-center justify-center">↻</div>
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
            <File className="h-5 w-5 mb-1" />
            <span className="text-[9px]">PDF</span>
          </div>
        )}
      </div>
      <button type="button" onClick={onRemove}
        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <X className="h-3 w-3" />
      </button>
    </div>
  )
}

// ===================== STAGE PROGRESS =====================
export function StageProgress({ 
  stages,
  currentStage,
  onStageChange
}: { 
  stages: Stage[]
  currentStage: string
  onStageChange?: (stage: string) => void
}) {
  if (stages.length === 0) return null
  
  const stageIndex = stages.findIndex(s => s.value === currentStage)
  
  return (
    <div className="space-y-3">
      {/* Progress Bar */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs text-gray-400">
          Stage <span className="text-green-400 font-medium">{stageIndex + 1}</span> of {stages.length}
        </span>
        <div className="w-24 h-1.5 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-green-500 transition-all duration-300" 
            style={{ width: `${((stageIndex + 1) / stages.length) * 100}%` }}
          />
        </div>
      </div>
      
      {/* Stage Indicators */}
      <div className="flex items-center justify-between px-2">
        {stages.map((stage, idx) => {
          const isCompleted = idx < stageIndex
          const isCurrent = stage.value === currentStage
          
          return (
            <button
              key={stage.value}
              type="button"
              onClick={() => onStageChange?.(stage.value)}
              className="flex flex-col items-center group"
              disabled={!onStageChange}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all
                ${isCompleted ? 'bg-green-600 border-green-600 text-white' : 
                  isCurrent ? 'border-green-500 text-green-500' : 'border-gray-600 text-gray-500'}
                ${onStageChange ? 'group-hover:border-green-400 cursor-pointer' : ''}`}>
                {isCompleted ? <Check className="h-4 w-4" /> : <Circle className="h-3 w-3" />}
              </div>
              <span className={`text-[9px] mt-1 text-center max-w-[60px] ${isCurrent ? 'text-green-400' : 'text-gray-500'}`}>
                {stage.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ===================== SMART DOCUMENT CHECKLIST =====================
export function SmartDocumentChecklist({
  documents,
  documentSections,
  onAddFile,
  onRemoveFile,
  onAddCustomDocument,
  ocrDocumentTypes = {},
  onOcrExtract,
  isOcrLoading = false,
  uploadEndpoint = "permitDocumentUploader"
}: {
  documents: DocumentRequirement[]
  documentSections: DocumentSection[]
  onAddFile: (docType: string, url: string) => void
  onRemoveFile: (docType: string, fileIndex: number) => void
  onAddCustomDocument?: (title: string) => void
  ocrDocumentTypes?: Record<string, string>
  onOcrExtract?: (docType: string, url: string) => Promise<void>
  isOcrLoading?: boolean
  uploadEndpoint?: string
}) {
  const [activeUpload, setActiveUpload] = useState<string | null>(null)
  const [ocrDocType, setOcrDocType] = useState<string | null>(null)
  const [showCompleted, setShowCompleted] = useState(true)
  const [showRemaining, setShowRemaining] = useState(true)
  const [customTitle, setCustomTitle] = useState("")
  const [showCustomInput, setShowCustomInput] = useState(false)

  // Separate completed and remaining
  const completedDocs = documents.filter(doc => {
    const section = documentSections.find(s => s.type === doc.value)
    return section && section.files.length > 0
  })
  const remainingDocs = documents.filter(doc => {
    const section = documentSections.find(s => s.type === doc.value)
    return !section || section.files.length === 0
  })

  // Get custom documents
  const customDocs = documentSections.filter(s => 
    s.customTitle && !documents.some(d => d.value === s.type)
  )

  const renderDocumentItem = (doc: { value: string; label: string }, isCustom = false) => {
    const section = documentSections.find(s => s.type === doc.value)
    const hasFiles = section && section.files.length > 0
    const hasOcr = ocrDocumentTypes[doc.value]
    const isScanning = isOcrLoading && ocrDocType === doc.value

    return (
      <div key={doc.value} className={`rounded-lg p-3 border transition-all duration-300
        ${isScanning 
          ? 'bg-blue-500/10 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
          : 'bg-gray-700/30 border-gray-600'
        }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all
              ${hasFiles ? 'bg-green-600 border-green-600' : 'border-gray-500'}`}>
              {hasFiles && <Check className="h-3 w-3 text-white" />}
            </div>
            <span className={`text-sm ${hasFiles ? 'text-green-400' : 'text-gray-300'}`}>
              {doc.label}
              {isCustom && <span className="text-xs text-gray-500 ml-1">(custom)</span>}
            </span>
            {isScanning && (
              <span className="flex items-center gap-1.5 ml-2 px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-medium animate-pulse border border-blue-500/30">
                <Loader2 className="h-2.5 w-2.5 animate-spin" />
                Analyzing Document...
              </span>
            )}
          </div>
          <Button type="button" variant="ghost" size="sm" 
            onClick={() => setActiveUpload(activeUpload === doc.value ? null : doc.value)}
            disabled={isScanning}
            className="text-xs text-gray-400 hover:text-white h-7">
            {isScanning ? (
              <span className="text-blue-400 font-medium">Processing...</span>
            ) : hasFiles ? (
              `${section?.files.length} file(s)`
            ) : hasOcr ? (
              <><Sparkles className="h-3 w-3 mr-1 text-amber-400" /> Auto-fill</>
            ) : 'Upload'}
          </Button>
        </div>
        
        {hasFiles && (
          <div className="flex gap-2 mt-2 flex-wrap">
            {section?.files.map((url, idx) => {
              // Highlight the last uploaded file if currently scanning
              const isLatestAndScanning = isScanning && idx === section.files.length - 1
              
              return (
                <div key={idx} className="relative">
                  <DocumentPreview url={url} index={idx} onRemove={() => onRemoveFile(doc.value, idx)} />
                  {isLatestAndScanning && (
                    <div className="absolute inset-0 bg-gray-900/60 rounded-lg flex items-center justify-center backdrop-blur-[1px] z-20">
                      <div className="bg-gray-800 p-1.5 rounded-full shadow-lg border border-gray-700">
                         <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
        
        {activeUpload === doc.value && !isScanning && (
          <div className="mt-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <UploadDropzone
              endpoint={uploadEndpoint as any}
              onClientUploadComplete={async (res) => {
                if (res) {
                  for (const file of res) {
                    if (file.url) {
                      onAddFile(doc.value, file.url)
                      if (onOcrExtract && hasOcr) {
                        setOcrDocType(doc.value)
                        await onOcrExtract(doc.value, file.url)
                        setOcrDocType(null)
                      }
                    }
                  }
                }
                setActiveUpload(null)
              }}
              onUploadError={(error: Error) => { console.error("Upload error:", error); setActiveUpload(null) }}
              className="ut-label:text-gray-400 ut-allowed-content:text-gray-500 ut-button:bg-green-600 border-gray-600 bg-gray-700/30 ut-button:text-xs"
            />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Progress Summary */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs text-gray-400">
          <span className="text-green-400 font-medium">{completedDocs.length}</span> of {documents.length} completed
        </span>
        <div className="w-24 h-1.5 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-green-500 transition-all duration-300" 
            style={{ width: `${documents.length > 0 ? (completedDocs.length / documents.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Completed Section */}
      {completedDocs.length > 0 && (
        <div>
          <button 
            type="button"
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex items-center gap-2 text-xs text-green-400 hover:text-green-300 mb-2 w-full"
          >
            <Check className="h-3 w-3" />
            <span>Completed ({completedDocs.length})</span>
            <span className="text-gray-500">{showCompleted ? '▼' : '▶'}</span>
          </button>
          {showCompleted && (
            <div className="space-y-2 pl-2 border-l-2 border-green-600/30">
              {completedDocs.map(doc => renderDocumentItem(doc))}
            </div>
          )}
        </div>
      )}

      {/* Remaining Section */}
      {remainingDocs.length > 0 && (
        <div>
          <button 
            type="button"
            onClick={() => setShowRemaining(!showRemaining)}
            className="flex items-center gap-2 text-xs text-amber-400 hover:text-amber-300 mb-2 w-full"
          >
            <Circle className="h-3 w-3" />
            <span>Remaining ({remainingDocs.length})</span>
            <span className="text-gray-500">{showRemaining ? '▼' : '▶'}</span>
          </button>
          {showRemaining && (
            <div className="space-y-2 pl-2 border-l-2 border-amber-600/30">
              {remainingDocs.map(doc => renderDocumentItem(doc))}
            </div>
          )}
        </div>
      )}

      {/* Custom Documents */}
      {customDocs.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-gray-600">
          <span className="text-xs text-gray-400">Other Documents</span>
          {customDocs.map(section => renderDocumentItem({ 
            value: section.type, 
            label: section.customTitle || 'Custom Document' 
          }, true))}
        </div>
      )}

      {/* Add Other Document */}
      {onAddCustomDocument && (
        <div className="pt-2 border-t border-gray-600">
          {showCustomInput ? (
            <div className="flex gap-2">
              <Input 
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="Document name..."
                className="bg-gray-700 border-gray-600 text-white h-8 text-xs flex-1"
                autoFocus
              />
              <Button 
                type="button" 
                size="sm"
                onClick={() => {
                  if (customTitle.trim()) {
                    onAddCustomDocument(customTitle.trim())
                    setCustomTitle("")
                    setShowCustomInput(false)
                  }
                }}
                disabled={!customTitle.trim()}
                className="bg-green-600 hover:bg-green-700 h-8 text-xs"
              >
                Add
              </Button>
              <Button 
                type="button" 
                variant="ghost"
                size="sm"
                onClick={() => { setShowCustomInput(false); setCustomTitle("") }}
                className="h-8 text-xs text-gray-400"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <Button 
              type="button" 
              variant="ghost" 
              size="sm"
              onClick={() => setShowCustomInput(true)}
              className="w-full border border-dashed border-gray-600 text-gray-400 hover:text-white hover:border-gray-500 h-9"
            >
              <Plus className="h-3 w-3 mr-2" /> Add Other Document
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
