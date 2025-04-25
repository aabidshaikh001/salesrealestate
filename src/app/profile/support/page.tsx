"use client"

import type React from "react"

import { useState } from "react"
import { ArrowLeft, Edit2, HelpCircle, Phone, Mail, MessageSquare, ChevronDown, ChevronUp, Search } from "lucide-react"
import Link from "next/link"
import Header from "@/app/component/header"


export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedFaq, setExpandedFaq] = useState<string | null>("faq1")
  const [activeTab, setActiveTab] = useState("faq")

  const toggleFaq = (faqId: string) => {
    if (expandedFaq === faqId) {
      setExpandedFaq(null)
    } else {
      setExpandedFaq(faqId)
    }
  }

  const faqs = [
    {
      id: "faq1",
      question: "How do I update my profile information?",
      answer:
        "You can update your profile information by going to the Personal Details section in your profile. Tap on the edit icon to make changes to your information.",
    },
    {
      id: "faq2",
      question: "How do I change my password?",
      answer:
        "To change your password, go to the Security section in your account settings. You'll need to enter your current password and then your new password twice to confirm.",
    },
    {
      id: "faq3",
      question: "How do I refer a friend?",
      answer:
        "You can refer a friend by going to the Refer & Earn section in your profile. There you'll find your unique referral code that you can share with friends.",
    },
    {
      id: "faq4",
      question: "What payment methods are accepted?",
      answer:
        "We accept all major credit and debit cards, net banking, UPI, and wallet payments. You can manage your payment methods in the Payment section.",
    },
    {
      id: "faq5",
      question: "How do I contact customer support?",
      answer:
        "You can contact our customer support team through the Contact section in this Support page. We offer phone, email, and chat support options.",
    },
  ]

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="pb-20">
      <Header/>
      <header className="flex items-center p-4 border-b">
        <Link href="/profile" className="mr-4">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-medium">Support</h1>
        <button className="ml-auto">
          <Edit2 className="h-5 w-5" />
        </button>
      </header>

      <div className="flex border-b">
        <button
          className={`flex-1 py-3 text-center font-medium ${
            activeTab === "faq" ? "text-white bg-red-500 rounded-full mx-2 my-2" : "text-gray-500"
          }`}
          onClick={() => setActiveTab("faq")}
        >
          FAQs
        </button>
        <button
          className={`flex-1 py-3 text-center font-medium ${
            activeTab === "contact" ? "text-white bg-red-500 rounded-full mx-2 my-2" : "text-gray-500"
          }`}
          onClick={() => setActiveTab("contact")}
        >
          Contact
        </button>
      </div>

      {activeTab === "faq" ? (
        <div className="p-4">
          <div className="flex items-center mb-6">
            <div className="bg-red-100 rounded-full p-2 mr-3">
              <HelpCircle className="h-6 w-6 text-red-500" />
            </div>
            <h2 className="text-lg font-semibold">Frequently Asked Questions</h2>
          </div>

          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Search for help..."
              className="w-full p-3 pl-10 border border-gray-300 rounded-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>

          <div className="space-y-3">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq) => (
                <FaqItem
                  key={faq.id}
                  question={faq.question}
                  answer={faq.answer}
                  isExpanded={expandedFaq === faq.id}
                  onToggle={() => toggleFaq(faq.id)}
                />
              ))
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500">No results found for &quot;{searchQuery}&quot;</p>
                <button className="text-red-500 mt-2" onClick={() => setSearchQuery("")}>
                  Clear search
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-4">
          <div className="flex items-center mb-6">
            <div className="bg-red-100 rounded-full p-2 mr-3">
              <Phone className="h-6 w-6 text-red-500" />
            </div>
            <h2 className="text-lg font-semibold">Contact Support</h2>
          </div>

          <div className="space-y-4">
            <ContactOption
              icon={<Phone className="h-5 w-5 text-red-500" />}
              title="Call Us"
              description="Available 24/7 for urgent issues"
              actionText="Call Now"
              action={() => (window.location.href = "tel:+918001234567")}
            />

            <ContactOption
              icon={<Mail className="h-5 w-5 text-red-500" />}
              title="Email Support"
              description="Response within 24 hours"
              actionText="Send Email"
              action={() => (window.location.href = "mailto:support@example.com")}
            />

            <ContactOption
              icon={<MessageSquare className="h-5 w-5 text-red-500" />}
              title="Live Chat"
              description="Chat with our support team"
              actionText="Start Chat"
              action={() => alert("Live chat would open here")}
            />
          </div>

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium mb-2">Support Hours</h3>
            <p className="text-sm text-gray-600 mb-2">Monday - Friday: 9 AM - 8 PM</p>
            <p className="text-sm text-gray-600 mb-2">Saturday: 10 AM - 6 PM</p>
            <p className="text-sm text-gray-600">Sunday: Closed (Email support only)</p>
          </div>
        </div>
      )}

     
    </div>
  )
}

function FaqItem({
  question,
  answer,
  isExpanded,
  onToggle,
}: {
  question: string
  answer: string
  isExpanded: boolean
  onToggle: () => void
}) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button className="w-full p-4 flex items-center justify-between bg-gray-50" onClick={onToggle}>
        <span className="font-medium text-left">{question}</span>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
        )}
      </button>

      {isExpanded && (
        <div className="p-4 bg-white">
          <p className="text-sm text-gray-600">{answer}</p>
        </div>
      )}
    </div>
  )
}

function ContactOption({
  icon,
  title,
  description,
  actionText,
  action,
}: {
  icon: React.ReactNode
  title: string
  description: string
  actionText: string
  action: () => void
}) {
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-start">
        <div className="bg-red-50 rounded-full p-2 mr-3">{icon}</div>
        <div className="flex-1">
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm text-gray-600 mb-3">{description}</p>
          <button className="text-red-500 font-medium" onClick={action}>
            {actionText}
          </button>
        </div>
      </div>
    </div>
  )
}

