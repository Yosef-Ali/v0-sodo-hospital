"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useRouter, useSearchParams } from "next/navigation"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Save } from "lucide-react"
import { createPermit, updatePermit, getPermitById } from "@/lib/actions/v2/permits"
import { getPeople } from "@/lib/actions/v2/people"
import { getChecklists } from "@/lib/actions/v2/checklists"
import { gregorianToEC, ecToGregorian, formatEC } from "@/lib/dates/ethiopian"

interface PermitFormPageProps {
  permitId?: string
  mode: "create" | "edit"
}

type PermitCategory = "WORK_PERMIT" | "RESIDENCE_ID" | "LICENSE" | "PIP"

export function PermitFormPage({ permitId, mode }: PermitFormPageProps) {
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedPersonId = searchParams.get("personId")

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [people, setPeople] = useState<any[]>([])
  const [checklists, setChecklists] = useState<any[]>([])

  const [formData, setFormData] = useState({
    category: "WORK_PERMIT" as PermitCategory,
    personId: preselectedPersonId || "",
    checklistId: "",
    dueDate: "",
    notes: "",
  })

  useEffect(() => {
    loadOptions()
    if (mode === "edit" && permitId) {
      loadPermit()
    }
  }, [permitId, mode])

  const loadOptions = async () => {
    // Load people
    const peopleResult = await getPeople({ limit: 1000 })
    if (peopleResult.success) {
      setPeople(peopleResult.data)
    }

    // Load checklists
    const checklistsResult = await getChecklists({ activeOnly: true })
    if (checklistsResult.success) {
      setChecklists(checklistsResult.data)
    }
  }

  const loadPermit = async () => {
    if (!permitId) return

    setLoading(true)
    const result = await getPermitById(permitId)
    if (result.success && result.data) {
      const permit = result.data.permit
      setFormData({
        category: permit.category,
        personId: permit.personId,
        checklistId: permit.checklistId || "",
        dueDate: permit.dueDate ? new Date(permit.dueDate).toISOString().split("T")[0] : "",
        notes: permit.notes || "",
      })
    } else {
      setError(result.error || "Failed to load permit")
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    // Validation
    if (!formData.category || !formData.personId) {
      setError("Category and person are required")
      setSaving(false)
      return
    }

    const submitData: any = {
      category: formData.category,
      personId: formData.personId,
      checklistId: formData.checklistId || undefined,
      notes: formData.notes || undefined,
    }

    // Handle date conversion
    if (formData.dueDate) {
      const date = new Date(formData.dueDate)
      submitData.dueDate = date
      const ec = gregorianToEC(date)
      submitData.dueDateEC = `${ec.year}-${String(ec.month).padStart(2, "0")}-${String(ec.day).padStart(2, "0")}`
    }

    const result = mode === "create"
      ? await createPermit(submitData)
      : await updatePermit(permitId!, submitData)

    if (result.success) {
      const id = result.data.id
      router.push(`/permits/${id}`)
    } else {
      setError(result.error || "Failed to save permit")
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
          title={mode === "create" ? (t("permit.createPermit") || "Create Permit") : "Edit Permit"}
          description={mode === "create" ? "Create a new permit record" : "Update permit information"}
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

            <div className="space-y-2">
              <Label htmlFor="category" className="text-gray-300">
                Permit Category <span className="text-red-400">*</span>
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleChange("category", value)}
              >
                <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="WORK_PERMIT" className="text-gray-300">
                    Work Permit
                  </SelectItem>
                  <SelectItem value="RESIDENCE_ID" className="text-gray-300">
                    Residence ID
                  </SelectItem>
                  <SelectItem value="LICENSE" className="text-gray-300">
                    License (MOH)
                  </SelectItem>
                  <SelectItem value="PIP" className="text-gray-300">
                    PIP (EFDA Pre-Import)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="personId" className="text-gray-300">
                Person <span className="text-red-400">*</span>
              </Label>
              <Select
                value={formData.personId}
                onValueChange={(value) => handleChange("personId", value)}
                disabled={!!preselectedPersonId}
              >
                <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                  <SelectValue placeholder="Select person" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 max-h-[300px]">
                  {people.map((person) => (
                    <SelectItem key={person.id} value={person.id} className="text-gray-300">
                      {person.firstName} {person.lastName}
                      {person.nationality && ` - ${person.nationality}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="checklistId" className="text-gray-300">
                Checklist Template (Optional)
              </Label>
              <Select
                value={formData.checklistId}
                onValueChange={(value) => handleChange("checklistId", value)}
              >
                <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                  <SelectValue placeholder="Select checklist (optional)" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="" className="text-gray-300">
                    No Checklist
                  </SelectItem>
                  {checklists.map((checklist) => (
                    <SelectItem key={checklist.id} value={checklist.id} className="text-gray-300">
                      {checklist.name} ({checklist.items.length} items)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate" className="text-gray-300">
                Due Date (Gregorian)
              </Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleChange("dueDate", e.target.value)}
                className="bg-gray-900 border-gray-700 text-white"
              />
              {formData.dueDate && (
                <p className="text-xs text-gray-400">
                  Ethiopian Calendar: {formatEC(gregorianToEC(new Date(formData.dueDate)), i18n.language as "en" | "am", "long")}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-gray-300">
                Notes
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                className="bg-gray-900 border-gray-700 text-white min-h-[100px]"
                placeholder="Add any additional notes or comments..."
              />
            </div>

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
                    {mode === "create" ? "Create Permit" : "Save Changes"}
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
