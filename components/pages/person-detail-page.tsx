"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  User,
  Users,
  FileText,
  Shield,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ArrowLeft,
  Edit,
  Plus,
} from "lucide-react"
import { getPersonById } from "@/lib/actions/v2/people"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface PersonDetailPageProps {
  personId: string
}

export function PersonDetailPage({ personId }: PersonDetailPageProps) {
  const { t } = useTranslation()
  const router = useRouter()

  const [person, setPerson] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPerson()
  }, [personId])

  const loadPerson = async () => {
    setLoading(true)
    setError(null)

    const result = await getPersonById(personId)
    if (result.success) {
      setPerson(result.data)
    } else {
      setError(result.error || "Failed to load person")
    }

    setLoading(false)
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          <p className="text-gray-400 mt-4">{t("common.loading")}</p>
        </div>
      </div>
    )
  }

  if (error || !person) {
    return (
      <div className="p-8">
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-8 text-center">
          <p className="text-red-400 mb-4">{error || "Person not found"}</p>
          <Button onClick={() => router.push("/people")} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to People
          </Button>
        </div>
      </div>
    )
  }

  const personData = person.person
  const documents = person.documents || []
  const permits = person.permits || []
  const dependents = person.dependents || []
  const guardian = person.guardian

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/people")}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <PageHeader
            title={`${personData.firstName} ${personData.lastName}`}
            description={personData.nationality || "Person Details"}
          />
        </div>

        <div className="flex items-center space-x-2">
          {personData.guardianId && (
            <Badge className="bg-blue-900 text-blue-300">
              {t("person.dependents").slice(0, -1) || "Dependent"}
            </Badge>
          )}
          <Button
            onClick={() => router.push(`/people/${personId}/edit`)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card className="bg-gray-800 border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <User className="h-5 w-5 mr-2 text-green-500" />
              Personal Information
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">First Name</p>
                <p className="text-white font-medium">{personData.firstName}</p>
              </div>

              <div>
                <p className="text-sm text-gray-400">Last Name</p>
                <p className="text-white font-medium">{personData.lastName}</p>
              </div>

              {personData.nationality && (
                <div>
                  <p className="text-sm text-gray-400">Nationality</p>
                  <p className="text-white">{personData.nationality}</p>
                </div>
              )}

              {personData.passportNo && (
                <div>
                  <p className="text-sm text-gray-400">Passport Number</p>
                  <p className="text-white">{personData.passportNo}</p>
                </div>
              )}

              {personData.email && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-400 mb-1">Email</p>
                  <div className="flex items-center text-white">
                    <Mail className="h-4 w-4 mr-2 text-gray-500" />
                    <a href={`mailto:${personData.email}`} className="hover:text-green-400 transition-colors">
                      {personData.email}
                    </a>
                  </div>
                </div>
              )}

              {personData.phone && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-400 mb-1">Phone</p>
                  <div className="flex items-center text-white">
                    <Phone className="h-4 w-4 mr-2 text-gray-500" />
                    <a href={`tel:${personData.phone}`} className="hover:text-green-400 transition-colors">
                      {personData.phone}
                    </a>
                  </div>
                </div>
              )}
            </div>

            <Separator className="bg-gray-700 my-4" />

            <div className="flex items-center text-xs text-gray-500">
              <Calendar className="h-4 w-4 mr-2" />
              <span>
                Created: {new Date(personData.createdAt).toLocaleDateString()}
              </span>
              {personData.updatedAt && new Date(personData.updatedAt) > new Date(personData.createdAt) && (
                <>
                  <span className="mx-2">•</span>
                  <span>Updated: {new Date(personData.updatedAt).toLocaleDateString()}</span>
                </>
              )}
            </div>
          </Card>

          {/* Guardian/Dependents */}
          {(guardian || dependents.length > 0) && (
            <Card className="bg-gray-800 border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Users className="h-5 w-5 mr-2 text-green-500" />
                Family Relations
              </h3>

              {guardian && (
                <div className="mb-4">
                  <p className="text-sm text-gray-400 mb-2">Guardian</p>
                  <Link
                    href={`/people/${guardian.id}`}
                    className="flex items-center space-x-3 p-3 rounded-lg bg-gray-900/50 border border-gray-700 hover:border-green-500/50 transition-colors"
                  >
                    <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-full p-2">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        {guardian.firstName} {guardian.lastName}
                      </p>
                      {guardian.nationality && (
                        <p className="text-sm text-gray-400">{guardian.nationality}</p>
                      )}
                    </div>
                  </Link>
                </div>
              )}

              {dependents.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-400">Dependents ({dependents.length})</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => router.push(`/people/new?guardianId=${personId}`)}
                      className="text-green-400 hover:text-green-300"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {dependents.map((dependent: any) => (
                      <Link
                        key={dependent.id}
                        href={`/people/${dependent.id}`}
                        className="flex items-center space-x-3 p-3 rounded-lg bg-gray-900/50 border border-gray-700 hover:border-green-500/50 transition-colors"
                      >
                        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full p-2">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium">
                            {dependent.firstName} {dependent.lastName}
                          </p>
                          {dependent.nationality && (
                            <p className="text-sm text-gray-400">{dependent.nationality}</p>
                          )}
                        </div>
                        <Badge className="bg-blue-900 text-blue-300 text-xs">
                          Dependent
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {!guardian && dependents.length === 0 && (
                <p className="text-sm text-gray-400">No family relations</p>
              )}
            </Card>
          )}

          {/* Documents */}
          <Card className="bg-gray-800 border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <FileText className="h-5 w-5 mr-2 text-green-500" />
                Documents ({documents.length})
              </h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => router.push(`/people/${personId}/documents/new`)}
                className="text-green-400 hover:text-green-300"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Document
              </Button>
            </div>

            {documents.length === 0 ? (
              <p className="text-sm text-gray-400">No documents uploaded</p>
            ) : (
              <div className="space-y-2">
                {documents.map((doc: any) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-900/50 border border-gray-700"
                  >
                    <div className="flex items-center space-x-3">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-white text-sm font-medium">{doc.type}</p>
                        {doc.number && (
                          <p className="text-xs text-gray-500">{doc.number}</p>
                        )}
                      </div>
                    </div>
                    {doc.expiryDate && (
                      <Badge className="text-xs bg-gray-700 text-gray-300">
                        Exp: {new Date(doc.expiryDate).toLocaleDateString()}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Permits */}
          <Card className="bg-gray-800 border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <Shield className="h-5 w-5 mr-2 text-green-500" />
                Permits ({permits.length})
              </h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => router.push(`/permits/new?personId=${personId}`)}
                className="text-green-400 hover:text-green-300"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>

            {permits.length === 0 ? (
              <p className="text-sm text-gray-400">No permits associated</p>
            ) : (
              <div className="space-y-2">
                {permits.map((permit: any) => (
                  <Link
                    key={permit.id}
                    href={`/permits/${permit.id}`}
                    className="block p-3 rounded-lg bg-gray-900/50 border border-gray-700 hover:border-green-500/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm text-white font-medium">
                        {permit.category.replace(/_/g, " ")}
                      </p>
                      <Badge className="text-xs bg-gray-700 text-gray-300">
                        {permit.status}
                      </Badge>
                    </div>
                    {permit.dueDate && (
                      <p className="text-xs text-gray-500">
                        Due: {new Date(permit.dueDate).toLocaleDateString()}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </Card>

          {/* Quick Actions */}
          <Card className="bg-gray-800 border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start border-gray-700"
                onClick={() => router.push(`/people/${personId}/edit`)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Person
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start border-gray-700"
                onClick={() => router.push(`/permits/new?personId=${personId}`)}
              >
                <Shield className="h-4 w-4 mr-2" />
                Create Permit
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start border-gray-700"
                onClick={() => router.push(`/people/new?guardianId=${personId}`)}
              >
                <Users className="h-4 w-4 mr-2" />
                Add Dependent
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
