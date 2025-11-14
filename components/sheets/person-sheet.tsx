"use client"

import type React from "react"

import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface PersonFormData {
  firstName: string
  lastName: string
  nationality: string
  passportNo: string
  email: string
  phone: string
  dateOfBirth: string
  gender: string
  guardianId?: string
}

interface PersonSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (person: PersonFormData) => void
}

export function PersonSheet({ open, onOpenChange, onSubmit }: PersonSheetProps) {
  const [formData, setFormData] = useState<PersonFormData>({
    firstName: "",
    lastName: "",
    nationality: "",
    passportNo: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
  })

  // Predefined options
  const nationalities = [
    { value: "ethiopian", label: "Ethiopian" },
    { value: "american", label: "American" },
    { value: "british", label: "British" },
    { value: "canadian", label: "Canadian" },
    { value: "indian", label: "Indian" },
    { value: "kenyan", label: "Kenyan" },
    { value: "nigerian", label: "Nigerian" },
    { value: "south_african", label: "South African" },
    { value: "other", label: "Other" },
  ]

  const genders = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" },
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    onOpenChange(false)

    // Reset form
    setFormData({
      firstName: "",
      lastName: "",
      nationality: "",
      passportNo: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      gender: "",
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-gray-800 border-gray-700 w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-white">Add New Person</SheetTitle>
          <SheetDescription className="text-gray-400">
            Fill in the personal details below to create a new person record.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-gray-300">
                First Name *
              </Label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Enter first name"
                className="bg-gray-700 border-gray-600 text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-gray-300">
                Last Name *
              </Label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Enter last name"
                className="bg-gray-700 border-gray-600 text-white"
                required
              />
            </div>
          </div>

          {/* Nationality */}
          <div className="space-y-2">
            <Label htmlFor="nationality" className="text-gray-300">
              Nationality *
            </Label>
            <Select
              value={formData.nationality}
              onValueChange={(value) => setFormData({ ...formData, nationality: value })}
            >
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Select nationality" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                {nationalities.map((nat) => (
                  <SelectItem key={nat.value} value={nat.value} className="text-white">
                    {nat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Passport Number */}
          <div className="space-y-2">
            <Label htmlFor="passportNo" className="text-gray-300">
              Passport Number *
            </Label>
            <Input
              id="passportNo"
              name="passportNo"
              value={formData.passportNo}
              onChange={handleChange}
              placeholder="Enter passport number"
              className="bg-gray-700 border-gray-600 text-white"
              required
            />
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="email@example.com"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-300">
                Phone
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+251 912 345 678"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
          </div>

          {/* Date of Birth and Gender */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth" className="text-gray-300">
                Date of Birth *
              </Label>
              <Input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="bg-gray-700 border-gray-600 text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender" className="text-gray-300">
                Gender *
              </Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => setFormData({ ...formData, gender: value })}
              >
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  {genders.map((gender) => (
                    <SelectItem key={gender.value} value={gender.value} className="text-white">
                      {gender.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 bg-gray-700 border-gray-600 hover:bg-gray-600"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={!formData.firstName || !formData.lastName || !formData.nationality || !formData.passportNo || !formData.dateOfBirth || !formData.gender}
            >
              Add Person
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
