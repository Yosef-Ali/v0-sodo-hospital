/**
 * Permit Sheet Component
 * Sheet for creating and editing permits with comprehensive form
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface PermitSheetProps {
  trigger?: React.ReactNode
  permitId?: string
  initialData?: {
    category?: string
    status?: string
    personId?: string
    notes?: string
    dueDate?: string
  }
  onSuccess?: () => void
}

export function PermitSheet({
  trigger,
  permitId,
  initialData,
  onSuccess,
}: PermitSheetProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // Form state
  const [formData, setFormData] = useState({
    category: initialData?.category || "",
    status: initialData?.status || "PENDING",
    personId: initialData?.personId || "",
    notes: initialData?.notes || "",
    dueDate: initialData?.dueDate || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // TODO: Implement actual server action
      // await createPermit(formData) or await updatePermit(permitId, formData)

      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call

      toast({
        title: permitId ? "Permit updated" : "Permit created",
        description: permitId
          ? "The permit has been updated successfully."
          : "A new permit has been created successfully.",
      })

      setOpen(false)
      onSuccess?.()

      // Reset form if creating new
      if (!permitId) {
        setFormData({
          category: "",
          status: "PENDING",
          personId: "",
          notes: "",
          dueDate: "",
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
            New Permit
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="sm:max-w-[540px] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <SheetHeader>
            <SheetTitle>{permitId ? "Edit Permit" : "Create New Permit"}</SheetTitle>
            <SheetDescription>
              {permitId
                ? "Update the permit information below."
                : "Fill in the details to create a new permit."}
            </SheetDescription>
          </SheetHeader>

          <div className="grid gap-4 py-6">
            {/* Category */}
            <div className="grid gap-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WORK_PERMIT">Work Permit</SelectItem>
                  <SelectItem value="RESIDENCE_ID">Residence ID</SelectItem>
                  <SelectItem value="LICENSE">License</SelectItem>
                  <SelectItem value="PIP">PIP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="grid gap-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="SUBMITTED">Submitted</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                  <SelectItem value="EXPIRED">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Person ID */}
            <div className="grid gap-2">
              <Label htmlFor="personId">Person ID *</Label>
              <Input
                id="personId"
                placeholder="Enter person ID"
                value={formData.personId}
                onChange={(e) =>
                  setFormData({ ...formData, personId: e.target.value })
                }
                required
              />
              <p className="text-xs text-gray-500">
                The person this permit is for
              </p>
            </div>

            {/* Due Date */}
            <div className="grid gap-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
              />
            </div>

            {/* Notes */}
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional notes or comments..."
                rows={4}
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />
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
              disabled={isSubmitting || !formData.category || !formData.personId}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {permitId ? "Update" : "Create"} Permit
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
