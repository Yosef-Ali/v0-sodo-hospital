"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useRouter, useSearchParams } from "next/navigation"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Save } from "lucide-react"
import { createPerson, updatePerson, getPersonById } from "@/lib/actions/v2/people"

interface PersonFormPageProps {
  personId?: string
  mode: "create" | "edit"
}

export function PersonFormPage({ personId, mode }: PersonFormPageProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const guardianId = searchParams.get("guardianId")

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    nationality: "",
    passportNo: "",
    phone: "",
    email: "",
    guardianId: guardianId || "",
  })

  useEffect(() => {
    if (mode === "edit" && personId) {
      loadPerson()
    }
  }, [personId, mode])

  const loadPerson = async () => {
    if (!personId) return

    setLoading(true)
    const result = await getPersonById(personId)
    if (result.success && result.data) {
      const person = result.data.person
      setFormData({
        firstName: person.firstName || "",
        lastName: person.lastName || "",
        nationality: person.nationality || "",
        passportNo: person.passportNo || "",
        phone: person.phone || "",
        email: person.email || "",
        guardianId: person.guardianId || "",
      })
    } else {
      setError(result.error || "Failed to load person")
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    // Validation
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError("First name and last name are required")
      setSaving(false)
      return
    }

    const result = mode === "create"
      ? await createPerson(formData)
      : await updatePerson(personId!, formData)

    if (result.success) {
      const id = result.data.id
      router.push(`/people/${id}`)
    } else {
      setError(result.error || "Failed to save person")
    }

    setSaving(false)
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
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

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="text-gray-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <PageHeader
          title={mode === "create" ? (t("person.createPerson") || "Create Person") : "Edit Person"}
          description={mode === "create" ? "Add a new person to the system" : `Update ${formData.firstName} ${formData.lastName}`}
        />
      </div>

      <div className="max-w-2xl">
        <Card className="bg-gray-800 border-gray-700 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-gray-300">
                  First Name <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  className="bg-gray-900 border-gray-700 text-white"
                  placeholder="Enter first name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-gray-300">
                  Last Name <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  className="bg-gray-900 border-gray-700 text-white"
                  placeholder="Enter last name"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nationality" className="text-gray-300">
                Nationality
              </Label>
              <Input
                id="nationality"
                value={formData.nationality}
                onChange={(e) => handleChange("nationality", e.target.value)}
                className="bg-gray-900 border-gray-700 text-white"
                placeholder="e.g., Ethiopian, American, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="passportNo" className="text-gray-300">
                Passport Number
              </Label>
              <Input
                id="passportNo"
                value={formData.passportNo}
                onChange={(e) => handleChange("passportNo", e.target.value)}
                className="bg-gray-900 border-gray-700 text-white"
                placeholder="Enter passport number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="bg-gray-900 border-gray-700 text-white"
                placeholder="email@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-300">
                Phone
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="bg-gray-900 border-gray-700 text-white"
                placeholder="+251 XXX XXX XXX"
              />
            </div>

            {guardianId && mode === "create" && (
              <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                <p className="text-blue-400 text-sm">
                  This person will be added as a dependent
                </p>
              </div>
            )}

            <div className="flex items-center justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={saving}
                className="border-gray-700"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-green-600 hover:bg-green-700"
              >
                {saving ? (
                  <>
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {mode === "create" ? "Create Person" : "Save Changes"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
