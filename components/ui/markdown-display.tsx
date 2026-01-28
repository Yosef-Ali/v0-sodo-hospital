"use client"

import ReactMarkdown from "react-markdown"

interface MarkdownDisplayProps {
  content: string | null | undefined
}

export function MarkdownDisplay({ content }: MarkdownDisplayProps) {
  if (!content) return null

  return (
    <div className="prose prose-invert prose-sm max-w-none text-gray-300">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  )
}
