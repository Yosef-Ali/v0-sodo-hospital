import { getPersonById } from "@/lib/actions/v2/people"
import { unstable_cache } from "next/cache"
import { notFound } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, User, Mail, Phone, Globe, Calendar, UserCheck } from "lucide-react"
import Link from "next/link"

interface PersonPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function PersonPage({ params }: PersonPageProps) {
  const { id } = await params

  const getCachedPerson = unstable_cache(
    async (personId: string) => {
      const result = await getPersonById(personId)
      return result.success ? result.data : null
    },
    [`person-${id}`],
    {
      revalidate: 60,
      tags: [`person-${id}`]
    }
  )

  const data = await getCachedPerson(id)

  if (!data) {
    notFound()
  }

  const { person, guardian, dependents, permits, documents } = data

  return (
    <div className="p-8">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link href="/people">
            <Button variant="outline" size="sm" className="border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {person.firstName} {person.lastName}
            </h1>
            <p className="text-sm text-gray-400 mt-1">Person Details</p>
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
                  <Link href={`/people/${guardian.id}`} className="text-green-400 hover:text-green-300 mt-1 block">
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
                {dependents.map((dependent) => (
                  <div key={dependent.id} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                    <div>
                      <Link href={`/people/${dependent.id}`} className="text-green-400 hover:text-green-300 font-medium">
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
          {/* Quick Stats */}
          <Card className="bg-gray-800 border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Quick Stats</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Permits</span>
                <span className="text-white font-medium">{permits?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Documents</span>
                <span className="text-white font-medium">{documents?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Dependents</span>
                <span className="text-white font-medium">{dependents?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Status</span>
                <Badge className="bg-green-900 text-green-300 text-xs">Active</Badge>
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
        </div>
      </div>
    </div>
  )
}
