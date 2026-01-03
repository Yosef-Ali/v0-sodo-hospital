"use client"

import { useState } from "react"
import { useTranslation } from "react-i18next"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Plus, User, Filter } from "lucide-react"
import { getPeople, getPeopleStats } from "@/lib/actions/v2/foreigners"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { PersonSheet } from "@/components/sheets/person-sheet"

interface ForeignersPageProps {
  initialData: {
    people: any[]
    stats: {
      total: number
      dependents: number
      withPermits: number
    }
  }
}

export function ForeignersPage({ initialData }: ForeignersPageProps) {
  const { t } = useTranslation()
  const router = useRouter()

  const [people, setPeople] = useState<any[]>(initialData.people)
  const [stats, setStats] = useState(initialData.stats)
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeStatTab, setActiveStatTab] = useState<"all" | "dependents" | "permits">("all")
  const [sheetOpen, setSheetOpen] = useState(false)
  const [selectedPerson, setSelectedPerson] = useState<any>(null)

  const loadPeople = async (query?: string) => {
    setLoading(true)
    setError(null)

    const result = await getPeople({ query, limit: 100 })
    if (result.success && result.data) {
      setPeople(result.data)
    } else {
      setPeople([])
      setError(result.error || "Failed to load people")
    }

    setLoading(false)
  }

  const loadStats = async () => {
    const result = await getPeopleStats()
    if (result.success && result.data) {
      setStats(result.data)
    } else {
      setStats({ total: 0, dependents: 0, withPermits: 0 })
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    loadPeople(query)
  }

  const translateWithFallback = (key: string, fallback: string) => {
    const value = t(key)
    return !value || value === key ? fallback : value
  }

  const handleCreatePerson = async (personData: any) => {
    try {
      if (personData.id) {
        // Edit mode - call updatePerson
        const { updatePerson } = await import("@/lib/actions/v2/foreigners")
        const result = await updatePerson(personData.id, personData)
        if (result.success) {
          console.log("Person updated successfully")
        } else {
          console.error("Failed to update person:", result.error)
        }
      } else {
        // Create mode - call createPerson
        const { createPerson } = await import("@/lib/actions/v2/foreigners")
        const result = await createPerson(personData)

        if (result.success) {
          console.log("Person created successfully")
        } else {
          console.error("Failed to create person:", result.error)
        }
      }
      // After successful operation, reload the list
      loadPeople()
      loadStats()
      setSelectedPerson(null)
    } catch (error) {
      console.error("Error saving person:", error)
    }
  }

  const handleEditPerson = (person: any) => {
    setSelectedPerson(person)
    setSheetOpen(true)
  }

  const handleCreateNew = () => {
    setSelectedPerson(null)
    setSheetOpen(true)
  }

  const pageTitle = translateWithFallback("person.persons", "Foreigners")
  const createPersonText = translateWithFallback("person.createPerson", "Add Foreigner")

  return (
    <div className="p-8">
      <PageHeader
        title={pageTitle}
        description="Manage foreign staff, their permits, and dependents"
      />

      <div className="mt-8 md:mt-10 lg:mt-12 mb-6 flex flex-col gap-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Tabs
            value={activeStatTab}
            onValueChange={(value) => setActiveStatTab(value as "all" | "dependents" | "permits")}
            className="w-full md:w-auto"
          >
            <div className="w-full overflow-x-auto">
              <TabsList className="bg-gray-800 border border-gray-700 inline-flex min-w-max gap-2 rounded-md">
                <TabsTrigger
                  value="all"
                  className="text-sm whitespace-nowrap flex-shrink-0 data-[state=active]:bg-gray-700 data-[state=active]:text-white"
                >
                  All
                  <Badge className="ml-1 bg-slate-500/20 text-slate-300 text-xs border border-slate-500/30">
                    {stats.total}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger
                  value="dependents"
                  className="text-sm whitespace-nowrap flex-shrink-0 data-[state=active]:bg-gray-700 data-[state=active]:text-white"
                >
                  Dependents
                  <Badge className="ml-1 bg-blue-500/20 text-blue-300 text-xs border border-blue-500/30">
                    {stats.dependents}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger
                  value="permits"
                  className="text-sm whitespace-nowrap flex-shrink-0 data-[state=active]:bg-gray-700 data-[state=active]:text-white"
                >
                  With Permits
                  <Badge className="ml-1 bg-emerald-500/20 text-emerald-300 text-xs border border-emerald-500/30">
                    {stats.withPermits}
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </div>
          </Tabs>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
              <Input
                placeholder={t("actions.search") + " foreigners..."}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-800/60 backdrop-blur-sm border border-gray-700 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 w-full text-gray-300"
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              className="text-sm font-normal border-gray-700 bg-gray-800/60 backdrop-blur-sm hover:bg-gray-700 text-gray-300"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>

            <Button
              onClick={handleCreateNew}
              className="text-sm font-normal bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              {createPersonText}
            </Button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="bg-gray-800 border-gray-700 overflow-hidden flex flex-col">
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-3">
                  <Skeleton className="h-9 w-9 rounded-md" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-14" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              </div>
              <div className="px-5 py-3 border-t border-gray-700 flex justify-between items-center">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 text-center">
          <p className="text-red-400">{error}</p>
          <Button
            onClick={() => loadPeople()}
            variant="outline"
            size="sm"
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && people.length === 0 && (
        <div className="bg-gray-800/60 backdrop-blur-sm rounded-lg border border-gray-700 p-12 text-center">
          <User className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No foreigners found</h3>
          <p className="text-gray-400 mb-6">
            {searchQuery
              ? "No foreigners match your search criteria."
              : "Get started by adding your first foreigner."}
          </p>
          <Button
            onClick={handleCreateNew}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            {createPersonText}
          </Button>
        </div>
      )}

      {/* People List */}
      {!loading && !error && people.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {people.map((person) => (
            <div
              key={person.id}
              className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden hover:border-gray-600 transition-all duration-200 flex flex-col"
            >
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-3">
                  <div className="bg-gray-700 rounded-md overflow-hidden h-9 w-9 flex items-center justify-center">
                    {person.photoUrl ? (
                      <img src={person.photoUrl} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  {person.guardianId && (
                    <Badge className="bg-blue-900 text-blue-300 text-xs">
                      {t('person.dependents').slice(0, -1) || 'Dependent'}
                    </Badge>
                  )}
                </div>

                <h3 className="font-medium text-lg mb-1 text-white">
                  {person.firstName} {person.lastName}
                </h3>
                {person.ticketNumber && (
                  <p className="text-xs text-green-400 font-mono mb-2">{person.ticketNumber}</p>
                )}
                {person.nationality && (
                  <p className="text-sm text-gray-400 mb-4">{person.nationality}</p>
                )}

                <div className="text-xs text-gray-500 space-y-1">
                  {person.passportNo && (
                    <div className="flex justify-between">
                      <span>Passport:</span>
                      <span className="text-gray-400">{person.passportNo}</span>
                    </div>
                  )}
                  {person.email && (
                    <div className="flex justify-between">
                      <span>Email:</span>
                      <span className="text-gray-400 truncate ml-2">{person.email}</span>
                    </div>
                  )}
                  {person.phone && (
                    <div className="flex justify-between">
                      <span>Phone:</span>
                      <span className="text-gray-400">{person.phone}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Created:</span>
                    <span className="text-gray-400">{new Date(person.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="px-5 py-3 border-t border-gray-700 flex justify-between items-center">
                <button
                  onClick={() => router.push(`/foreigners/${person.id}`)}
                  className="text-xs text-green-400 hover:text-green-300 font-medium"
                >
                  View Profile
                </button>
                <button
                  onClick={() => handleEditPerson(person)}
                  className="text-xs text-gray-400 hover:text-gray-300 font-medium"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination hint */}
      {people.length >= 100 && (
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            Showing first 100 results. Use search to find specific foreigners.
          </p>
        </div>
      )}

      {/* Person Sheet */}
      <PersonSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onSubmit={handleCreatePerson}
        person={selectedPerson}
      />
    </div>
  )
}
