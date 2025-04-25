"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ChevronRight, ChevronDown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

export function TermsConditions() {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <Card className="border-0 shadow-sm bg-white">
      <CardHeader className="flex-row items-center justify-between pb-2 pt-4 px-4">
        <h2 className="text-lg font-bold">Terms & Conditions</h2>
        <Button
          variant="ghost"
          size="sm"
          className="text-blue-600 font-semibold p-1 h-auto"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </Button>
      </CardHeader>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CardContent className="px-4 pb-4">
              <p className="text-gray-600 text-sm leading-relaxed">
                Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the
                industry&apos;s standard dummy text ever since the 1500s, when an unknown printer took a galley of type
                and scrambled it to make a type specimen book.
              </p>
              <Link href="/terms">
                <Button variant="link" className="text-blue-600 font-semibold p-0 h-auto mt-2">
                  View Full Terms
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}

