/**
 * Person Sheet Component
 * Sheet for creating and editing people in the system
 */

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Plus, Loader2, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface PersonSheetProps {
  trigger?: React.ReactNode
  personId?: string
  initialData?: {
    firstName?: string
    lastName?: string
    nationality?: string
    passportNo?: string
    phone?: string
    email?: string
    guardianId?: string
  }
  onSuccess?: () => void
}

export function PersonSheet({
  trigger,
  personId,
  initialData,
  onSuccess,
}: PersonSheetProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // Form state
  const [formData, setFormData] = useState({
    firstName: initialData?.firstName || "",
    lastName: initialData?.lastName || "",
    nationality: initialData?.nationality || "",
    passportNo: initialData?.passportNo || "",
    phone: initialData?.phone || "",
    email: initialData?.email || "",
    guardianId: initialData?.guardianId || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // TODO: Implement actual server action
      // await createPerson(formData) or await updatePerson(personId, formData)

      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call

      toast({
        title: personId ? "Person updated" : "Person created",
        description: personId
          ? "The person has been updated successfully."
          : "A new person has been created successfully.",
      })

      setOpen(false)
      onSuccess?.()

      // Reset form if creating new
      if (!personId) {
        setFormData({
          firstName: "",
          lastName: "",
          nationality: "",
          passportNo: "",
          phone: "",
          email: "",
          guardianId: "",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            New Person
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="sm:max-w-[540px] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <SheetHeader>
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <User className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <SheetTitle>{personId ? "Edit Person" : "Create New Person"}</SheetTitle>
                <SheetDescription>
                  {personId
                    ? "Update the person information below."
                    : "Fill in the details to add a new person."}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <div className="grid gap-4 py-6">
            {/* Name Section */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  placeholder="Enter first name"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  placeholder="Enter last name"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            {/* Nationality */}
            <div className="grid gap-2">
              <Label htmlFor="nationality">Nationality</Label>
              <Input
                id="nationality"
                placeholder="e.g., Ethiopian, Kenyan, etc."
                value={formData.nationality}
                onChange={(e) =>
                  setFormData({ ...formData, nationality: e.target.value })
                }
              />
            </div>

            {/* Passport Number */}
            <div className="grid gap-2">
              <Label htmlFor="passportNo">Passport Number</Label>
              <Input
                id="passportNo"
                placeholder="Enter passport number"
                value={formData.passportNo}
                onChange={(e) =>
                  setFormData({ ...formData, passportNo: e.target.value })
                }
              />
            </div>

            {/* Contact Information */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+251 XXX XXX XXX"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Guardian ID (for dependents) */}
            <div className="grid gap-2">
              <Label htmlFor="guardianId">Guardian ID (Optional)</Label>
              <Input
                id="guardianId"
                placeholder="Enter guardian's person ID if this is a dependent"
                value={formData.guardianId}
                onChange={(e) =>
                  setFormData({ ...formData, guardianId: e.target.value })
                }
              />
              <p className="text-xs text-gray-500">
                Leave blank if this person is not a dependent
              </p>
            </div>
          </div>

          <SheetFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.firstName || !formData.lastName}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {personId ? "Update" : "Create"} Person
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
