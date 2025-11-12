"use client"

import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Languages } from "lucide-react"
import { useEffect } from "react"

export function LanguageSwitcher() {
  const { i18n } = useTranslation()

  // Load saved language preference on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem("language")
    if (savedLanguage && (savedLanguage === "en" || savedLanguage === "am")) {
      i18n.changeLanguage(savedLanguage)
    }
  }, [i18n])

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
    localStorage.setItem("language", lng)
    // Force page revalidation to update all server-rendered content
    window.location.reload()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-300 hover:text-white hover:bg-gray-700"
        >
          <Languages className="h-4 w-4 mr-2" />
          <span className="text-sm font-medium">
            {i18n.language === "am" ? "አማርኛ" : "English"}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-gray-800 border-gray-700"
      >
        <DropdownMenuItem
          onClick={() => changeLanguage("en")}
          className={`cursor-pointer ${
            i18n.language === "en"
              ? "bg-green-900/20 text-green-400"
              : "text-gray-300 hover:bg-gray-700 hover:text-white"
          }`}
        >
          <span className="mr-2">🇬🇧</span>
          English
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => changeLanguage("am")}
          className={`cursor-pointer ${
            i18n.language === "am"
              ? "bg-green-900/20 text-green-400"
              : "text-gray-300 hover:bg-gray-700 hover:text-white"
          }`}
        >
          <span className="mr-2">🇪🇹</span>
          አማርኛ
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
