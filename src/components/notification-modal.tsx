"use client"

import { useState, useEffect } from "react"
import { Check, X, AlertTriangle, Info } from "lucide-react"
import { createPortal } from "react-dom"

export type NotificationType = "success" | "error" | "info" | "warning"

interface NotificationModalProps {
  type: NotificationType
  title: string
  message: string
  isOpen: boolean
  onClose: () => void
  actionLabel?: string
  onAction?: () => void
}

export default function NotificationModal({
  type,
  title,
  message,
  isOpen,
  onClose,
  actionLabel,
  onAction,
}: NotificationModalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Auto-close after 5 seconds for non-error notifications
    if (isOpen && type !== "error") {
      const timer = setTimeout(() => {
        onClose()
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [isOpen, onClose, type])

  const getIcon = () => {
    switch (type) {
      case "success":
        return <Check className="h-12 w-12 text-white" />
      case "error":
        return <X className="h-12 w-12 text-white" />
      case "warning":
        return <AlertTriangle className="h-12 w-12 text-white" />
      case "info":
        return <Info className="h-12 w-12 text-white" />
    }
  }

  const getIconBgColor = () => {
    switch (type) {
      case "success":
        return "bg-green-500"
      case "error":
        return "bg-red-500"
      case "warning":
        return "bg-yellow-500"
      case "info":
        return "bg-blue-500"
    }
  }

  if (!mounted) return null

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="fixed inset-0 bg-black/40 transition-opacity" onClick={onClose} />
      <div
        className="fixed bottom-0 w-full max-w-md transform rounded-t-2xl bg-white p-6 shadow-lg transition-all duration-300 ease-in-out"
        style={{
          transform: isOpen ? "translateY(0)" : "translateY(100%)",
          opacity: isOpen ? 1 : 0,
        }}
      >
        <div className="flex flex-col items-center text-center">
          <div className={`flex h-24 w-24 items-center justify-center rounded-full ${getIconBgColor()} mb-4`}>
            {getIcon()}
          </div>
          <h3 className="text-2xl font-bold mb-2">{title}</h3>
          <p className="text-gray-500 mb-6">{message}</p>

          <button onClick={onAction || onClose} className="w-full rounded-md bg-blue-500 py-3 text-white font-medium">
            {actionLabel || "OK"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

