"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SUPPORT_CATEGORIES } from "@/lib/customer-support-context"
import type { SupportTicket } from "@/lib/customer-support-context"
import { CheckCircle, Loader2 } from "lucide-react"

interface TicketFormProps {
  onSubmit: (ticket: Partial<SupportTicket>) => void
  onCancel?: () => void
}

export function TicketForm({ onSubmit, onCancel }: TicketFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    category: "" as SupportTicket["category"],
    priority: "medium" as SupportTicket["priority"],
    description: ""
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))

    onSubmit(formData)
    setIsSuccess(true)

    // Reset after showing success
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSuccess(false)
      setFormData({
        name: "",
        email: "",
        subject: "",
        category: "" as SupportTicket["category"],
        priority: "medium",
        description: ""
      })
    }, 2000)
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Ticket Submitted!</h3>
        <p className="text-gray-400">
          We've received your support request. Our team will respond within 24 hours.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-gray-300">
            Full Name *
          </Label>
          <Input
            id="name"
            required
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            placeholder="John Doe"
            className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-300">
            Email Address *
          </Label>
          <Input
            id="email"
            type="email"
            required
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            placeholder="john@example.com"
            className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="category" className="text-gray-300">
            Category *
          </Label>
          <Select
            required
            value={formData.category}
            onValueChange={(value: SupportTicket["category"]) =>
              setFormData({ ...formData, category: value })
            }
          >
            <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              {SUPPORT_CATEGORIES.map(cat => (
                <SelectItem key={cat.value} value={cat.value} className="text-white">
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Priority */}
        <div className="space-y-2">
          <Label htmlFor="priority" className="text-gray-300">
            Priority *
          </Label>
          <Select
            required
            value={formData.priority}
            onValueChange={(value: SupportTicket["priority"]) =>
              setFormData({ ...formData, priority: value })
            }
          >
            <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="low" className="text-white">Low</SelectItem>
              <SelectItem value="medium" className="text-white">Medium</SelectItem>
              <SelectItem value="high" className="text-white">High</SelectItem>
              <SelectItem value="urgent" className="text-white">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Subject */}
      <div className="space-y-2">
        <Label htmlFor="subject" className="text-gray-300">
          Subject *
        </Label>
        <Input
          id="subject"
          required
          value={formData.subject}
          onChange={e => setFormData({ ...formData, subject: e.target.value })}
          placeholder="Brief description of your issue"
          className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-gray-300">
          Description *
        </Label>
        <Textarea
          id="description"
          required
          value={formData.description}
          onChange={e => setFormData({ ...formData, description: e.target.value })}
          placeholder="Please provide detailed information about your request..."
          rows={6}
          className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 resize-none"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Ticket"
          )}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}
