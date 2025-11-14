"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Plus, User, Users, FileText, Shield } from "lucide-react"
import { getPeople, getPeopleStats, type Person } from "@/lib/actions/v2/people"
import { PersonSheet } from "@/components/sheets/person-sheet"
import Link from "next/link"
import { useRouter } from "next/navigation"

export function PeoplePage() {
  const { t } = useTranslation()
  const router = useRouter()

  const [people, setPeople] = useState<any[]>([])
  const [stats, setStats] = useState({ total: 0, dependents: 0, withPermits: 0 })
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [selectedPerson, setSelectedPerson] = useState<any>(null)

  // Load data on mount and when search changes
  useEffect(() => {
    loadPeople()
    loadStats()
  }, [])

  const loadPeople = async (query?: string) => {
    setLoading(true)
    setError(null)

    const result = await getPeople({ query, limit: 100 })
    if (result.success) {
      setPeople(result.data)
    } else {
      setError(result.error || "Failed to load people")
    }

    setLoading(false)
  }

  const loadStats = async () => {
    const result = await getPeopleStats()
    if (result.success) {
      setStats(result.data)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    loadPeople(query)
  }

  const handleCreatePerson = (personData: any) => {
    if (personData.id) {
      // Edit mode
      console.log("Update person data:", personData)
      // TODO: Call updatePerson API action
    } else {
      // Create mode
      console.log("New person data:", personData)
      // TODO: Call createPerson API action
    }
    // After successful operation, reload the list
    loadPeople()
    loadStats()
    setSelectedPerson(null)
  }

  const handleEditPerson = (person: any) => {
    setSelectedPerson(person)
    setSheetOpen(true)
  }

  const handleCreateNew = () => {
    setSelectedPerson(null)
    setSheetOpen(true)
  }

  return (
    <div className="p-8">
      {/* Header */}
      <PageHeader
        title={t('person.person' + 's') || 'People'}
        description="Manage hospital staff, patients, and their dependents"
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 mb-6">
        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">{t('common.total') || 'Total People'}</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
            </div>
            <User className="h-8 w-8 text-green-500" />
          </div>
        </Card>

        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">{t('person.dependents')}</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.dependents}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </Card>

        <Card className="bg-gray-800 border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">With Permits</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.withPermits}</p>
            </div>
            <Shield className="h-8 w-8 text-purple-500" />
          </div>
        </Card>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="relative flex-1 md:max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
          <Input
            placeholder={t('actions.search') + " people..."}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 bg-gray-800/60 backdrop-blur-sm border-gray-700 text-gray-300 w-full"
          />
        </div>

        <Button
          onClick={handleCreateNew}
          size="sm"
          className="text-sm font-normal bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('person.createPerson')}
        </Button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden flex flex-col">
              <div className="p-5 flex-1">
                {/* Person Header */}
                <div className="flex justify-between items-start mb-3">
                  <Skeleton className="h-9 w-9 rounded-md" />
                  <Skeleton className="h-6 w-16" />
                </div>

                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-32 mb-4" />

                {/* Person Details */}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 py-3 border-t border-gray-700 flex justify-between items-center">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
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
          <h3 className="text-lg font-medium text-white mb-2">No people found</h3>
          <p className="text-gray-400 mb-6">
            {searchQuery
              ? "No people match your search criteria."
              : "Get started by adding your first person."}
          </p>
          <Button
            onClick={handleCreateNew}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('person.createPerson')}
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
                  <div className="bg-gray-700 p-2 rounded-md">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  {person.guardianId && (
                    <Badge className="bg-blue-900 text-blue-300 text-xs">
                      {t('person.dependents').slice(0, -1) || 'Dependent'}
                    </Badge>
                  )}
                </div>

                <h3 className="font-medium text-lg mb-2 text-white">
                  {person.firstName} {person.lastName}
                </h3>
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
                  onClick={() => router.push(`/people/${person.id}`)}
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
            Showing first 100 results. Use search to find specific people.
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
