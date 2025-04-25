"use client"

import { useState } from "react"
import { ArrowLeft, Edit2, FileText, Check, ChevronDown, ChevronUp } from "lucide-react"
import Link from "next/link"



export default function TermsPage() {
  const [accepted, setAccepted] = useState(false)
  const [expandedSection, setExpandedSection] = useState<string | null>("privacy")

  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null)
    } else {
      setExpandedSection(section)
    }
  }

  return (
    <div className="pb-20">
      <header className="flex items-center p-4 border-b">
        <Link href="/profile" className="mr-4">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-medium">Terms & Conditions</h1>
        <button className="ml-auto">
          <Edit2 className="h-5 w-5" />
        </button>
      </header>

      <div className="p-4">
        <div className="flex items-center mb-6">
          <div className="bg-red-100 rounded-full p-2 mr-3">
            <FileText className="h-6 w-6 text-red-500" />
          </div>
          <h2 className="text-lg font-semibold">Legal Agreements</h2>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 text-sm mb-4">
            Please review and accept our terms and conditions to continue using our services. Last updated: March 10,
            2025.
          </p>

          <div className="space-y-3">
            <TermsSection
              title="Privacy Policy"
              id="privacy"
              isExpanded={expandedSection === "privacy"}
              onToggle={() => toggleSection("privacy")}
              content="We collect personal information to provide and improve our services. This includes your name, contact information, and preferences. We use this data to personalize your experience and communicate with you about our services. We do not sell your personal information to third parties. You can request access to, correction of, or deletion of your personal information at any time."
            />

            <TermsSection
              title="User Agreement"
              id="user"
              isExpanded={expandedSection === "user"}
              onToggle={() => toggleSection("user")}
              content="By using our services, you agree to abide by these terms and conditions. You must provide accurate information when creating an account. You are responsible for maintaining the confidentiality of your account credentials. You agree not to use our services for any illegal or unauthorized purpose. We reserve the right to terminate your account if you violate these terms."
            />

            <TermsSection
              title="Payment Terms"
              id="payment"
              isExpanded={expandedSection === "payment"}
              onToggle={() => toggleSection("payment")}
              content="All payments are processed securely through our payment partners. Fees are non-refundable unless otherwise specified. You agree to provide accurate billing information and authorize us to charge the applicable fees to your payment method. Subscription fees are billed in advance on a monthly or annual basis, depending on your plan."
            />

            <TermsSection
              title="Intellectual Property"
              id="ip"
              isExpanded={expandedSection === "ip"}
              onToggle={() => toggleSection("ip")}
              content="All content and materials available through our services, including but not limited to text, graphics, logos, and software, are the property of our company or our licensors and are protected by copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, or create derivative works without our express permission."
            />
          </div>
        </div>

        <div className="flex items-center mb-6">
          <button
            className={`w-6 h-6 rounded-md border mr-3 flex items-center justify-center ${accepted ? "bg-red-500 border-red-500" : "border-gray-300"}`}
            onClick={() => setAccepted(!accepted)}
          >
            {accepted && <Check className="h-4 w-4 text-white" />}
          </button>
          <span className="text-sm">I have read and accept the Terms & Conditions</span>
        </div>

        <button
          className={`w-full py-3 rounded-lg ${accepted ? "bg-red-500 text-white" : "bg-gray-200 text-gray-500"}`}
          disabled={!accepted}
        >
          Continue
        </button>
      </div>

     
    </div>
  )
}

function TermsSection({
  title,
  content,
  isExpanded,
  onToggle,
}: {
  title: string
  id: string
  content: string
  
  isExpanded: boolean
  onToggle: () => void
}) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      
      <button className="w-full p-4 flex items-center justify-between bg-gray-50" onClick={onToggle}>
        <span className="font-medium">{title}</span>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-500" />
        )}
      </button>

      {isExpanded && (
        <div className="p-4 bg-white">
          <p className="text-sm text-gray-600">{content}</p>
        </div>
      )}
    </div>
  )
}

