"use client"

import { useState } from "react"
import {
  ArrowLeft,
  Edit2,
  MessageSquare,
  Send,
  Paperclip,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import Header from "@/app/component/header"


type QueryStatus = "pending" | "in-progress" | "resolved" | "closed"

interface Query {
  id: string
  title: string
  description: string
  date: string
  status: QueryStatus
  category: string
  messages: {
    id: string
    sender: "user" | "support"
    message: string
    timestamp: string
    attachments?: string[]
  }[]
}

export default function QueryPage() {
  const [activeTab, setActiveTab] = useState("new")
  const [queryTitle, setQueryTitle] = useState("")
  const [queryDescription, setQueryDescription] = useState("")
  const [queryCategory, setQueryCategory] = useState("")
  const [attachment, setAttachment] = useState<File | null>(null)
  const [selectedQuery, setSelectedQuery] = useState<Query | null>(null)
  const [replyMessage, setReplyMessage] = useState("")

  // Dummy data for past queries
  const pastQueries: Query[] = [
    {
      id: "q1",
      title: "Issue with property listing",
      description: "I'm unable to add images to my property listing.",
      date: "Mar 12, 2025",
      status: "in-progress",
      category: "Technical",
      messages: [
        {
          id: "m1",
          sender: "user",
          message:
            "I'm trying to upload images to my property listing but keep getting an error message. Can you help?",
          timestamp: "Mar 12, 2025 10:30 AM",
        },
        {
          id: "m2",
          sender: "support",
          message:
            "Hello Sameer, I'm sorry you're experiencing this issue. Could you please tell me what error message you're seeing?",
          timestamp: "Mar 12, 2025 11:15 AM",
        },
        {
          id: "m3",
          sender: "user",
          message: "It says 'File format not supported' but I'm trying to upload JPG images which should be supported.",
          timestamp: "Mar 12, 2025 11:30 AM",
          attachments: ["/placeholder.svg?height=200&width=300"],
        },
      ],
    },
    {
      id: "q2",
      title: "Payment not reflecting",
      description: "I made a payment but it's not showing in my account.",
      date: "Mar 10, 2025",
      status: "resolved",
      category: "Billing",
      messages: [
        {
          id: "m1",
          sender: "user",
          message: "I made a payment of ₹5000 yesterday but it's not showing in my account.",
          timestamp: "Mar 10, 2025 09:45 AM",
        },
        {
          id: "m2",
          sender: "support",
          message:
            "Hello Sameer, thank you for reaching out. Let me check this for you. Could you please provide the transaction ID?",
          timestamp: "Mar 10, 2025 10:20 AM",
        },
        {
          id: "m3",
          sender: "user",
          message: "The transaction ID is TXN123456789",
          timestamp: "Mar 10, 2025 10:35 AM",
        },
        {
          id: "m4",
          sender: "support",
          message:
            "Thank you for providing the transaction ID. I've checked and the payment has been processed. It should now be reflected in your account. Please refresh and check.",
          timestamp: "Mar 10, 2025 11:05 AM",
        },
        {
          id: "m5",
          sender: "user",
          message: "Yes, I can see it now. Thank you for your help!",
          timestamp: "Mar 10, 2025 11:15 AM",
        },
      ],
    },
    {
      id: "q3",
      title: "Need help with preferences",
      description: "How do I update my locality preferences?",
      date: "Mar 05, 2025",
      status: "closed",
      category: "Account",
      messages: [
        {
          id: "m1",
          sender: "user",
          message: "I need to update my locality preferences but can't find where to do it.",
          timestamp: "Mar 05, 2025 02:30 PM",
        },
        {
          id: "m2",
          sender: "support",
          message:
            "Hello Sameer, you can update your locality preferences by going to Profile > Preferences. There you'll see a section for Locality where you can add or remove locations.",
          timestamp: "Mar 05, 2025 03:00 PM",
        },
        {
          id: "m3",
          sender: "user",
          message: "Found it, thank you!",
          timestamp: "Mar 05, 2025 03:10 PM",
        },
      ],
    },
  ]

  const handleSubmitQuery = () => {
    if (!queryTitle || !queryDescription || !queryCategory) {
      alert("Please fill in all required fields")
      return
    }

    alert("Your query has been submitted successfully!")
    setQueryTitle("")
    setQueryDescription("")
    setQueryCategory("")
    setAttachment(null)
    setActiveTab("history")
  }

  const handleSendReply = () => {
    if (!replyMessage || !selectedQuery) return

    alert("Your reply has been sent!")
    setReplyMessage("")
  }

  const getStatusIcon = (status: QueryStatus) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-orange-500" />
      case "in-progress":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "closed":
        return <XCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusText = (status: QueryStatus) => {
    switch (status) {
      case "pending":
        return "Pending"
      case "in-progress":
        return "In Progress"
      case "resolved":
        return "Resolved"
      case "closed":
        return "Closed"
    }
  }

  return (
    <div className="pb-20">
      <Header/>
      <header className="flex items-center p-4 border-b">
        <Link href="/profile" className="mr-4">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-medium">{selectedQuery ? "Query Details" : "Raise Query"}</h1>
        <button className="ml-auto">
          <Edit2 className="h-5 w-5" />
        </button>
      </header>

      {!selectedQuery ? (
        <>
          <div className="flex border-b">
            <button
              className={`flex-1 py-3 text-center font-medium ${
                activeTab === "new" ? "text-white bg-red-500 rounded-full mx-2 my-2" : "text-gray-500"
              }`}
              onClick={() => setActiveTab("new")}
            >
              New Query
            </button>
            <button
              className={`flex-1 py-3 text-center font-medium ${
                activeTab === "history" ? "text-white bg-red-500 rounded-full mx-2 my-2" : "text-gray-500"
              }`}
              onClick={() => setActiveTab("history")}
            >
              History
            </button>
          </div>

          {activeTab === "new" ? (
            <div className="p-4">
              <div className="flex items-center mb-6">
                <div className="bg-red-100 rounded-full p-2 mr-3">
                  <MessageSquare className="h-6 w-6 text-red-500" />
                </div>
                <h2 className="text-lg font-semibold">Submit a New Query</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Query Title*</label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    placeholder="Enter a title for your query"
                    value={queryTitle}
                    onChange={(e) => setQueryTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category*</label>
                  <select
                    className="w-full p-3 border border-gray-300 rounded-lg bg-white"
                    value={queryCategory}
                    onChange={(e) => setQueryCategory(e.target.value)}
                  >
                    <option value="">Select a category</option>
                    <option value="technical">Technical</option>
                    <option value="billing">Billing</option>
                    <option value="account">Account</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description*</label>
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-lg min-h-[120px]"
                    placeholder="Describe your issue in detail"
                    value={queryDescription}
                    onChange={(e) => setQueryDescription(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Attachment (optional)</label>
                  <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <input
                      type="file"
                      id="attachment"
                      className="hidden"
                      onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                    />
                    <label htmlFor="attachment" className="cursor-pointer">
                      <Paperclip className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">{attachment ? attachment.name : "Click to upload a file"}</p>
                    </label>
                  </div>
                </div>

                <button className="w-full bg-red-500 text-white py-3 rounded-lg mt-4" onClick={handleSubmitQuery}>
                  Submit Query
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4">
              <div className="flex items-center mb-6">
                <div className="bg-red-100 rounded-full p-2 mr-3">
                  <Clock className="h-6 w-6 text-red-500" />
                </div>
                <h2 className="text-lg font-semibold">Query History</h2>
              </div>

              <div className="space-y-3">
                {pastQueries.map((query) => (
                  <div
                    key={query.id}
                    className="border border-gray-200 rounded-lg p-4"
                    onClick={() => setSelectedQuery(query)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{query.title}</h3>
                      <div className="flex items-center text-sm">
                        {getStatusIcon(query.status)}
                        <span className="ml-1">{getStatusText(query.status)}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{query.description}</p>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>{query.date}</span>
                      <span>{query.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col h-[calc(100vh-144px)]">
          <div className="p-4 border-b bg-gray-50">
            <div className="flex justify-between items-start mb-2">
              <h2 className="font-medium">{selectedQuery.title}</h2>
              <div className="flex items-center text-sm">
                {getStatusIcon(selectedQuery.status)}
                <span className="ml-1">{getStatusText(selectedQuery.status)}</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">{selectedQuery.description}</p>
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>{selectedQuery.date}</span>
              <span>{selectedQuery.category}</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {selectedQuery.messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender === "user" ? "bg-red-500 text-white" : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <p className="text-sm">{message.message}</p>
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-2">
                      {message.attachments.map((attachment, index) => (
                        <Image
                          key={index}
                          src={attachment || "/placeholder.svg"}
                          alt="Attachment"
                          width={200}
                          height={150}
                          className="rounded-md mt-2"
                        />
                      ))}
                    </div>
                  )}
                  <p className={`text-xs mt-1 ${message.sender === "user" ? "text-red-100" : "text-gray-500"}`}>
                    {message.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {selectedQuery.status !== "closed" && (
            <div className="p-3 border-t">
              <div className="flex items-center">
                <input
                  type="text"
                  className="flex-1 p-3 border border-gray-300 rounded-lg"
                  placeholder="Type your reply..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                />
                <button className="ml-2 bg-red-500 text-white p-3 rounded-lg" onClick={handleSendReply}>
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          <div className="p-3 border-t">
            <button className="text-red-500 text-sm" onClick={() => setSelectedQuery(null)}>
              Back to Queries
            </button>
          </div>
        </div>
      )}

    
    </div>
  )
}

