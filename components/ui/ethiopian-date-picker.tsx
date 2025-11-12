"use client"

import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  gregorianToEC,
  ecToGregorian,
  formatEC,
  parseECDate,
  isValidECDate,
  type ECDate
} from "@/lib/dates/ethiopian"
import { format } from "date-fns"
import { useTranslation } from "react-i18next"

interface EthiopianDatePickerProps {
  value?: Date
  onChange: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function EthiopianDatePicker({
  value,
  onChange,
  placeholder,
  disabled = false,
  className,
}: EthiopianDatePickerProps) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as 'en' | 'am'

  const [ecDate, setEcDate] = useState<ECDate | null>(null)
  const [manualInput, setManualInput] = useState("")
  const [showCalendar, setShowCalendar] = useState(false)

  // Sync EC date when value changes
  useEffect(() => {
    if (value) {
      const ec = gregorianToEC(value)
      setEcDate(ec)
      setManualInput(formatEC(ec, locale, 'iso'))
    } else {
      setEcDate(null)
      setManualInput("")
    }
  }, [value, locale])

  // Handle calendar date selection
  const handleCalendarChange = (date: Date | undefined) => {
    if (date) {
      const ec = gregorianToEC(date)
      setEcDate(ec)
      setManualInput(formatEC(ec, locale, 'iso'))
      onChange(date)
    } else {
      setEcDate(null)
      setManualInput("")
      onChange(undefined)
    }
    setShowCalendar(false)
  }

  // Handle manual input (EC format: YYYY-MM-DD)
  const handleManualInput = (input: string) => {
    setManualInput(input)

    try {
      const ec = parseECDate(input)
      if (isValidECDate(ec)) {
        const gregDate = ecToGregorian(ec)
        setEcDate(ec)
        onChange(gregDate)
      }
    } catch {
      // Invalid date format, don't update
    }
  }

  // Clear date
  const handleClear = () => {
    setEcDate(null)
    setManualInput("")
    onChange(undefined)
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={showCalendar} onOpenChange={setShowCalendar}>
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              type="text"
              placeholder={placeholder || "YYYY-MM-DD (EC)"}
              value={manualInput}
              onChange={(e) => handleManualInput(e.target.value)}
              disabled={disabled}
              className="font-mono"
            />
            {ecDate && (
              <p className="text-xs text-gray-500 mt-1">
                {formatEC(ecDate, locale, 'long')}
                {" "}({format(value!, 'MMM d, yyyy')})
              </p>
            )}
          </div>

          <PopoverTrigger asChild>
            <Button
              variant="outline"
              disabled={disabled}
              className={cn(
                "w-10 p-0",
                !value && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
        </div>

        <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700" align="start">
          <div className="p-3 border-b border-gray-700">
            <p className="text-sm font-medium text-white">
              {t('calendar.ethiopian')}
            </p>
            {ecDate && (
              <p className="text-xs text-gray-400 mt-1">
                {formatEC(ecDate, locale, 'long')}
              </p>
            )}
          </div>

          <Calendar
            mode="single"
            selected={value}
            onSelect={handleCalendarChange}
            disabled={disabled}
            initialFocus
            className="bg-gray-800"
          />

          {value && (
            <div className="p-3 border-t border-gray-700">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="w-full text-gray-400 hover:text-white"
              >
                Clear Date
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
}

/**
 * Simplified Ethiopian date display component
 */
interface EthiopianDateDisplayProps {
  date: Date
  showGregorian?: boolean
  className?: string
}

export function EthiopianDateDisplay({
  date,
  showGregorian = true,
  className
}: EthiopianDateDisplayProps) {
  const { i18n } = useTranslation()
  const locale = i18n.language as 'en' | 'am'
  const ec = gregorianToEC(date)

  return (
    <span className={className}>
      {formatEC(ec, locale, 'long')}
      {showGregorian && (
        <span className="text-gray-500 text-sm ml-2">
          ({format(date, 'MMM d, yyyy')})
        </span>
      )}
    </span>
  )
}
