"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Search, Plus, User, Users, FileText, Shield } from "lucide-react"
import { getPeople, getPeopleStats, type Person } from "@/lib/actions/v2/people"
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

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <PageHeader
          title={t('person.person' + 's') || 'People'}
          description="Manage hospital staff, patients, and their dependents"
        />

        <Button
          onClick={() => router.push("/people/new")}
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('person.createPerson')}
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
          <Input
            placeholder={t('actions.search') + " people..."}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 bg-gray-800/60 backdrop-blur-sm border-gray-700 text-gray-300"
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          <p className="text-gray-400 mt-4">{t('common.loading')}</p>
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
            onClick={() => router.push("/people/new")}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('person.createPerson')}
          </Button>
        </div>
      )}

      {/* People List */}
      {!loading && !error && people.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {people.map((person) => (
            <Card
              key={person.id}
              className="bg-gray-800 border-gray-700 p-5 hover:border-green-500/50 transition-all cursor-pointer"
              onClick={() => router.push(`/people/${person.id}`)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-full p-2">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">
                      {person.firstName} {person.lastName}
                    </h3>
                    {person.nationality && (
                      <p className="text-sm text-gray-400">{person.nationality}</p>
                    )}
                  </div>
                </div>

                {person.guardianId && (
                  <Badge className="bg-blue-900 text-blue-300 text-xs">
                    {t('person.dependents').slice(0, -1) || 'Dependent'}
                  </Badge>
                )}
              </div>

              <div className="space-y-2 text-sm">
                {person.passportNo && (
                  <div className="flex items-center text-gray-300">
                    <FileText className="h-4 w-4 mr-2 text-gray-500" />
                    {person.passportNo}
                  </div>
                )}

                {person.email && (
                  <div className="flex items-center text-gray-300">
                    <span className="text-gray-500 mr-2">✉</span>
                    {person.email}
                  </div>
                )}

                {person.phone && (
                  <div className="flex items-center text-gray-300">
                    <span className="text-gray-500 mr-2">📞</span>
                    {person.phone}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-700 flex items-center justify-between text-xs text-gray-500">
                <span>
                  {t('common.createdAt')}: {new Date(person.createdAt).toLocaleDateString()}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-green-400 hover:text-green-300 h-7 px-2"
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push(`/people/${person.id}`)
                  }}
                >
                  {t('actions.view')} →
                </Button>
              </div>
            </Card>
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
    </div>
  )
}
