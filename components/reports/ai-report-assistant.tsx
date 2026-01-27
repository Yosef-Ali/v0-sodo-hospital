"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Sparkles, FileText, Languages, Search, Check, Copy, RefreshCw, Upload } from "lucide-react"
import { toast } from "sonner"
import { UploadButton } from "@/lib/uploadthing-utils"

interface GeneratedContent {
  subject: string
  content: string
}

interface AIReportAssistantProps {
  onApply?: (data: { title: string; description: string }) => void
}

export function AIReportAssistant({ onApply }: AIReportAssistantProps) {
  const [prompt, setPrompt] = useState("")
  const [type, setType] = useState<"report" | "letter">("report")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isOcrProcessing, setIsOcrProcessing] = useState(false)
  const [ocrData, setOcrData] = useState<any>(null)
  const [generatedResult, setGeneratedResult] = useState<{
    english: GeneratedContent
    amharic: GeneratedContent
  } | null>(null)
  const [activeTab, setActiveTab] = useState<"en" | "am">("en")

  const handleOcr = async (fileUrl: string) => {
    setIsOcrProcessing(true)
    try {
      const response = await fetch("/api/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: fileUrl, documentType: "general" }),
      })
      const result = await response.json()
      if (result.success) {
        setOcrData(result.data)
        toast.success("Document analyzed successfully!")
      } else {
        toast.error("Failed to analyze document")
      }
    } catch (error) {
      console.error("OCR Error:", error)
      toast.error("Error processing document")
    } finally {
      setIsOcrProcessing(false)
    }
  }

  const handleGenerate = async () => {
    if (!prompt && !ocrData) {
      toast.error("Please provide instructions or upload a document")
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          ocrData,
          type,
        }),
      })
      const result = await response.json()
      if (result.success) {
        setGeneratedResult(result.data)
        toast.success("Report generated successfully!")
      } else {
        toast.error("Failed to generate report")
      }
    } catch (error) {
      console.error("Generation Error:", error)
      toast.error("Error generating report")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard")
  }

  const handleApply = () => {
    if (generatedResult && onApply) {
      onApply({
        title: generatedResult.english.subject,
        description: generatedResult.english.content,
      })
      toast.success("Applied to report draft")
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900 border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">AI Expert Assistant</h3>
        </div>

        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <Label className="text-gray-300">Tone & Context Instructions</Label>
              <Textarea
                placeholder="e.g., Write a formal medical status report for a work permit extension..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white min-h-[100px]"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Document Type</Label>
              <Select value={type} onValueChange={(v: any) => setType(v)}>
                <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="report">Formal Report</SelectItem>
                  <SelectItem value="letter">Support Letter</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Add Context (OCR)</Label>
              <div className="flex items-center gap-2">
                <UploadButton
                  endpoint="permitDocumentUploader"
                  onClientUploadComplete={(res) => {
                    if (res?.[0]) handleOcr(res[0].url)
                  }}
                  onUploadError={(error: Error) => {
                    toast.error(`Upload failed: ${error.message}`)
                  }}
                  appearance={{
                    button: "bg-gray-800 border-gray-700 hover:bg-gray-700 text-sm h-10 px-4 py-2 ring-offset-background transition-colors",
                    allowedContent: "hidden",
                  }}
                  content={{
                    button({ ready }) {
                      if (ready) return <div className="flex items-center gap-2"><Upload className="h-4 w-4" /> Upload Document</div>
                      return "Loading..."
                    }
                  }}
                />
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || isOcrProcessing}
              className="bg-purple-600 hover:bg-purple-700 ml-auto"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Generate Multilingual
                </>
              )}
            </Button>
          </div>

          {ocrData && (
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-md p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-blue-300 uppercase tracking-wider flex items-center gap-1">
                  <Search className="h-3 w-3" /> Context Extracted
                </span>
                <Button variant="ghost" size="sm" className="h-6 text-blue-400 hover:text-blue-300" onClick={() => setOcrData(null)}>
                  Clear
                </Button>
              </div>
              <pre className="text-[10px] text-gray-400 overflow-x-auto max-h-[100px]">
                {JSON.stringify(ocrData, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </Card>

      {generatedResult && (
        <Card className="bg-gray-900 border-gray-700 overflow-hidden">
          <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="w-full">
            <div className="px-4 pt-4 flex items-center justify-between border-b border-gray-800">
              <TabsList className="bg-gray-800 border-gray-700">
                <TabsTrigger value="en" className="data-[state=active]:bg-gray-700">English</TabsTrigger>
                <TabsTrigger value="am" className="data-[state=active]:bg-gray-700">Amharic (አማርኛ)</TabsTrigger>
              </TabsList>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                   size="sm" 
                   className="h-8 text-xs border-gray-700 hover:bg-gray-800"
                   onClick={() => handleCopy(activeTab === "en" ? generatedResult.english.content : generatedResult.amharic.content)}
                >
                  <Copy className="h-3 w-3 mr-1" /> Copy
                </Button>
                <Button 
                  size="sm" 
                   className="h-8 text-xs bg-green-600 hover:bg-green-700 text-white"
                   onClick={handleApply}
                >
                  <Check className="h-3 w-3 mr-1" /> Apply to Draft
                </Button>
              </div>
            </div>

            <TabsContent value="en" className="p-6">
              <h4 className="text-lg font-bold text-white mb-2">{generatedResult.english.subject}</h4>
              <div className="prose prose-invert max-w-none text-gray-300 text-sm whitespace-pre-wrap">
                {generatedResult.english.content}
              </div>
            </TabsContent>

            <TabsContent value="am" className="p-6">
              <h4 className="text-lg font-bold text-white mb-2 font-amharic">{generatedResult.amharic.subject}</h4>
              <div className="prose prose-invert max-w-none text-gray-300 text-sm whitespace-pre-wrap font-amharic">
                {generatedResult.amharic.content}
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      )}
    </div>
  )
}
