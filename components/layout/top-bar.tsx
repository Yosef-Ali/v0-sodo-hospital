"use client"

import { X } from "lucide-react"
import { useState } from "react"

export function TopBar() {
  const [showAnnouncement, setShowAnnouncement] = useState(true)

  if (!showAnnouncement) return null

  return (
    <div className="bg-gray-800 py-3 px-6 flex items-center justify-center text-sm">
      <span className="mr-2">We might win Hospital of the Year!</span>
      <a href="#" className="text-blue-400 hover:text-blue-300">
        SUPPORT US
      </a>
      <button className="ml-auto text-gray-400 hover:text-gray-300" onClick={() => setShowAnnouncement(false)}>
        <span className="sr-only">Close</span>
        <X size={20} />
      </button>
    </div>
  )
}
