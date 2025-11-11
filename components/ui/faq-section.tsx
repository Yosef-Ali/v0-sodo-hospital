"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { FAQ_ITEMS } from "@/lib/customer-support-context"
import { Badge } from "@/components/ui/badge"

export function FAQSection() {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-white mb-2">Frequently Asked Questions</h3>
        <p className="text-gray-400">Find quick answers to common questions</p>
      </div>

      {FAQ_ITEMS.map((categoryGroup, idx) => (
        <div key={idx} className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-blue-500 text-blue-400">
              {categoryGroup.category}
            </Badge>
          </div>

          <Accordion type="single" collapsible className="space-y-2">
            {categoryGroup.items.map((item, itemIdx) => (
              <AccordionItem
                key={itemIdx}
                value={`item-${idx}-${itemIdx}`}
                className="border border-gray-700 rounded-lg px-4 bg-gray-800/50 hover:bg-gray-800 transition-colors"
              >
                <AccordionTrigger className="text-left text-white hover:text-blue-400 hover:no-underline">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-400 pt-2">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      ))}
    </div>
  )
}
