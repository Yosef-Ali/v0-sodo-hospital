"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
  User,
  ArrowLeft,
  Mail,
  Phone,
  Globe,
  Calendar,
  UserCheck,
  FileText,
  Copy,
  Check,
  Loader2,
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { PersonActionsCard } from "@/components/foreigners/person-actions-card"
import { updatePerson } from "@/lib/actions/v2/foreigners"
import { toast } from "sonner"
import { PersonSheet } from "@/components/sheets/person-sheet"

interface ForeignerDetailPageProps {
  initialData: {
    person: any
    guardian?: any
    dependents?: any[]
    permits?: any[]
    documents?: any[]
    calendarEvents?: any[]
  }
}

export function ForeignerDetailPage({ initialData }: ForeignerDetailPageProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  
  // Use local state for person data so we can update it after edit
  const [personData, setPersonData] = useState(initialData.person)
  const { guardian, dependents, permits, documents, calendarEvents } = initialData
  
  const [editSheetOpen, setEditSheetOpen] = useState(false)
  const [ticketCopied, setTicketCopied] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const copyTicketNumber = async () => {
    if (personData.ticketNumber) {
      await navigator.clipboard.writeText(personData.ticketNumber)
      setTicketCopied(true)
      setTimeout(() => setTicketCopied(false), 2000)
    }
  }

  const handleEditSubmit = async (data: any) => {
    setIsSaving(true)
    try {
      console.log("Submitting update for person:", personData.id, data)
      const result = await updatePerson(personData.id, data)
      console.log("Update result:", result)
      
      if (result.success && result.data) {
        // Update local state immediately with the returned data
        setPersonData(result.data)
        toast.success("Person updated successfully")
        setEditSheetOpen(false)
        
        // Also refresh the page data in background
        startTransition(() => {
          router.refresh()
        })
      } else {
        toast.error("Failed to update", { description: result.error || "Unknown error" })
      }
    } catch (error) {
      console.error("Update error:", error)
      toast.error("An error occurred while saving")
    } finally {
      setIsSaving(false)
    }
  }
  
  // Use personData for rendering
  const person = personData

  return (
    <div className="p-8">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link href="/foreigners">
            <Button variant="outline" size="sm" className="border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-4">
              {person.photoUrl ? (
                <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-green-500/50 shadow-lg glow-icon flex-shrink-0">
                  <img src={person.photoUrl} alt="Profile" className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="h-12 w-12 rounded-full bg-gray-700 flex items-center justify-center text-gray-500 border-2 border-gray-600 flex-shrink-0">
                  <User className="h-6 w-6" />
                </div>
              )}
            <div>
                {person.firstName} {person.lastName}
                {person.ticketNumber && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-mono text-green-400">{person.ticketNumber}</span>
                    <button
                      onClick={copyTicketNumber}
                      className="p-1 text-gray-400 hover:text-green-400 hover:bg-green-500/10 rounded transition-colors"
                    >
                      {ticketCopied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}
                {!person.ticketNumber && (
                  <p className="text-sm font-normal text-gray-400 mt-0.5">Person Details</p>
                )}
              </div>
            </h1>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information Card */}
          <Card className="bg-gray-800 border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-green-500" />
              Personal Information
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">First Name</p>
                <p className="text-white mt-1">{person.firstName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Last Name</p>
                <p className="text-white mt-1">{person.lastName}</p>
              </div>
              {person.nationality && (
                <div>
                  <p className="text-sm text-gray-400 flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    Nationality
                  </p>
                  <p className="text-white mt-1">{person.nationality}</p>
                </div>
              )}
              {person.passportNo && (
                <div>
                  <p className="text-sm text-gray-400">Passport Number</p>
                  <p className="text-white mt-1">{person.passportNo}</p>
                </div>
              )}
              {person.email && (
                <div>
                  <p className="text-sm text-gray-400 flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    Email
                  </p>
                  <p className="text-white mt-1">{person.email}</p>
                </div>
              )}
              {person.phone && (
                <div>
                  <p className="text-sm text-gray-400 flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    Phone
                  </p>
                  <p className="text-white mt-1">{person.phone}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-400 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Created
                </p>
                <p className="text-white mt-1">{new Date(person.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Last Updated</p>
                <p className="text-white mt-1">{new Date(person.updatedAt).toLocaleDateString()}</p>
              </div>
            </div>
          </Card>

          {/* Documents Information - Show from both sources */}
          {(() => {
            // Gather documents from documentSections JSONB field
            const sectionDocs = person.documentSections?.flatMap((section: any) => 
              (section.files || []).map((fileUrl: string, idx: number) => ({
                id: `${section.type}-${idx}`,
                type: section.type,
                title: section.type?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
                fileUrl: fileUrl,
                fileType: fileUrl?.split('.').pop()?.toUpperCase() || 'Document',
                createdAt: person.updatedAt || person.createdAt
              }))
            ) || []
            // Combine with documents from documentsV2 table
            const allDocs = [...sectionDocs, ...(documents || [])]
            
            if (allDocs.length === 0) return null
            
            return (
              <Card className="bg-gray-800 border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                  Uploaded Documents
                  <Badge className="bg-blue-900/50 text-blue-300 text-xs ml-2">{allDocs.length}</Badge>
                </h2>
                <div className="grid grid-cols-1 gap-3">
                  {allDocs.map((doc: any) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-800 rounded-md border border-gray-700 group-hover:border-blue-500/50 transition-colors">
                          <FileText className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{doc.title || doc.type}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="outline" className="text-[10px] text-gray-400 border-gray-700 h-5 px-1.5">
                              {doc.fileType || "Document"}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {new Date(doc.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {doc.fileUrl ? (
                           <Link 
                             href={doc.fileUrl} 
                             target="_blank"
                             prefetch={false}
                           >
                             <Button variant="ghost" size="sm" className="h-8 text-green-400 hover:text-green-300 hover:bg-green-900/20">
                               View
                             </Button>
                           </Link>
                        ) : (
                          <span className="text-xs text-gray-500 italic px-2">No file</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )
          })()}

          {/* Guardian Information */}
          {guardian && (
            <Card className="bg-gray-800 border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-blue-500" />
                Guardian Information
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Name</p>
                  <Link href={`/foreigners/${guardian.id}`} className="text-green-400 hover:text-green-300 mt-1 block">
                    {guardian.firstName} {guardian.lastName}
                  </Link>
                </div>
                {guardian.email && (
                  <div>
                    <p className="text-sm text-gray-400">Email</p>
                    <p className="text-white mt-1">{guardian.email}</p>
                  </div>
                )}
                {guardian.phone && (
                  <div>
                    <p className="text-sm text-gray-400">Phone</p>
                    <p className="text-white mt-1">{guardian.phone}</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Dependents */}
          {dependents && dependents.length > 0 && (
            <Card className="bg-gray-800 border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Dependents</h2>
              <div className="space-y-3">
                {dependents.map((dependent: any) => (
                  <div key={dependent.id} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                    <div>
                      <Link href={`/foreigners/${dependent.id}`} className="text-green-400 hover:text-green-300 font-medium">
                        {dependent.firstName} {dependent.lastName}
                      </Link>
                      <p className="text-sm text-gray-400">{dependent.nationality || 'N/A'}</p>
                    </div>
                    <Badge className="bg-blue-900 text-blue-300 text-xs">
                      Dependent
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Stats - Enhanced with real-time document counts */}
          <Card className="bg-gray-800 border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              Quick Stats
            </h2>
            <div className="space-y-3">
              {/* Permits */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-gray-900/50 hover:bg-gray-900 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded bg-blue-500/20">
                    <FileText className="h-3.5 w-3.5 text-blue-400" />
                  </div>
                  <span className="text-sm text-gray-400">Permits</span>
                </div>
                <span className="text-white font-semibold bg-gray-700 px-2.5 py-0.5 rounded-full text-sm">
                  {permits?.length || 0}
                </span>
              </div>
              
              {/* Documents - Count from documentSections JSONB field */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-gray-900/50 hover:bg-gray-900 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded bg-emerald-500/20">
                    <FileText className="h-3.5 w-3.5 text-emerald-400" />
                  </div>
                  <span className="text-sm text-gray-400">Documents</span>
                </div>
                <span className="text-white font-semibold bg-gray-700 px-2.5 py-0.5 rounded-full text-sm">
                  {(() => {
                    // Count documents from documentSections JSONB field
                    const sectionsCount = person.documentSections?.reduce((total: number, section: any) => {
                      return total + (section.files?.length || 0)
                    }, 0) || 0
                    // Also include documents from documentsV2 table
                    const dbDocsCount = documents?.length || 0
                    return sectionsCount + dbDocsCount
                  })()}
                </span>
              </div>
              
              {/* Dependents */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-gray-900/50 hover:bg-gray-900 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded bg-purple-500/20">
                    <User className="h-3.5 w-3.5 text-purple-400" />
                  </div>
                  <span className="text-sm text-gray-400">Dependents</span>
                </div>
                <span className="text-white font-semibold bg-gray-700 px-2.5 py-0.5 rounded-full text-sm">
                  {dependents?.length || 0}
                </span>
              </div>
              
              {/* Status */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-gray-900/50 hover:bg-gray-900 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded bg-green-500/20">
                    <UserCheck className="h-3.5 w-3.5 text-green-400" />
                  </div>
                  <span className="text-sm text-gray-400">Status</span>
                </div>
                <Badge className="bg-green-900 text-green-300 text-xs font-medium px-2.5">Active</Badge>
              </div>
            </div>
          </Card>

          {/* Related Permits */}
          {permits && permits.length > 0 && (
            <Card className="bg-gray-800 border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Permits</h2>
              <div className="space-y-3">
                {permits.map((permit: any) => (
                  <Link
                    key={permit.id}
                    href={`/permits/${permit.id}`}
                    className="block p-3 bg-gray-900/50 rounded-lg border border-gray-700 hover:border-green-500/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm font-medium text-white">{permit.category.replace(/_/g, ' ')}</p>
                      <Badge className="bg-blue-900 text-blue-300 text-xs">{permit.status}</Badge>
                    </div>
                    <p className="text-xs text-gray-400">
                      Due: {permit.dueDate ? new Date(permit.dueDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </Link>
                ))}
              </div>
            </Card>
          )}

          {/* Actions Card */}
          <PersonActionsCard 
            personId={person.id} 
            hasRelatedData={Boolean((permits && permits.length > 0) || (dependents && dependents.length > 0) || (documents && documents.length > 0) || (calendarEvents && calendarEvents.length > 0))}
            onEdit={() => setEditSheetOpen(true)}
          />
        </div>
      </div>

      {/* Edit Sheet */}
      <PersonSheet
        open={editSheetOpen}
        onOpenChange={setEditSheetOpen}
        onSubmit={handleEditSubmit}
        person={person}
      />
    </div>
  )
}
