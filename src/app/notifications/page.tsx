"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, type PanInfo } from "framer-motion"
import { Bell, Check, Trash2, ArrowLeft, MoreVertical, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"

// Mock notification data - replace with your actual data source
const mockNotifications = [
  {
    id: 1,
    title: "New Property Listed",
    message: "A new property has been listed in your area of interest.",
    time: "5 minutes ago",
    read: false,
    type: "property",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 2,
    title: "Document Verification",
    message: "Your RERA document has been verified successfully.",
    time: "2 hours ago",
    read: false,
    type: "document",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 3,
    title: "Payment Received",
    message: "You have received a payment of ₹25,000.",
    time: "Yesterday",
    read: true,
    type: "payment",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 4,
    title: "Property Inquiry",
    message: "Someone is interested in your listed property. Check details now.",
    time: "2 days ago",
    read: true,
    type: "property",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 5,
    title: "Renewal Reminder",
    message: "Your subscription is due for renewal in 5 days.",
    time: "3 days ago",
    read: true,
    type: "document",
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState(mockNotifications)
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearch, setShowSearch] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Count unread notifications
  const unreadCount = notifications.filter((n) => !n.read).length

  // Filter notifications based on active tab and search query
  const getFilteredNotifications = (tabValue: string) => {
    return notifications
      .filter((n) => tabValue === "all" || n.type === tabValue)
      .filter(
        (n) =>
          searchQuery === "" ||
          n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.message.toLowerCase().includes(searchQuery.toLowerCase()),
      )
  }

  // Mark a notification as read
  const markAsRead = (id: number) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })))
  }

  // Delete a notification
  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter((n) => n.id !== id))
  }

  // Go back to previous page
  const goBack = () => {
    router.back()
  }

  // Focus search input when search is shown
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [showSearch])

  // Handle swipe to delete/mark as read
  const handleDragEnd = (info: PanInfo, id: number, isRead: boolean) => {
    if (info.offset.x < -100) {
      deleteNotification(id)
    } else if (info.offset.x > 100 && !isRead) {
      markAsRead(id)
    }
  }

  // Render notification list
  const renderNotificationList = (tabValue: string) => {
    const filteredNotifications = getFilteredNotifications(tabValue)

    if (filteredNotifications.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-full mb-4">
            <Bell className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium mb-2">No notifications</h3>
          <p className="text-gray-500 text-center max-w-xs">
            {searchQuery
              ? "No notifications match your search criteria."
              : "You're all caught up! Check back later for new notifications."}
          </p>
        </div>
      )
    }

    return (
      <AnimatePresence initial={false}>
        {filteredNotifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.2 }}
            className="relative"
          >
            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.1}
              onDragEnd={(_, info) => handleDragEnd(info, notification.id, notification.read)}
              className={`p-4 mx-4 my-2 rounded-xl border bg-white dark:bg-gray-800 shadow-sm ${
                notification.read ? "" : "border-l-4 border-l-blue-500"
              }`}
            >
              <div className="absolute inset-0 flex items-center justify-between px-6 pointer-events-none opacity-0">
                <div className="bg-green-100 text-green-600 p-2 rounded-full">
                  <Check className="h-5 w-5" />
                </div>
                <div className="bg-red-100 text-red-600 p-2 rounded-full">
                  <Trash2 className="h-5 w-5" />
                </div>
              </div>

              <div className="flex gap-3">
                <Avatar className="h-10 w-10 rounded-full">
                  <img src={notification.avatar || "/placeholder.svg"} alt="" className="object-cover" />
                </Avatar>

                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className={`font-medium text-sm ${!notification.read ? "font-semibold" : ""}`}>
                      {notification.title}
                    </h3>
                    <span className="text-xs text-gray-500">{notification.time}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">{notification.message}</p>

                  <div className="flex justify-between items-center mt-2">
                    <div className="flex gap-2">
                      <Badge
                        variant="outline"
                        className={`
                          text-xs px-2 py-0 h-5
                          ${
                            notification.type === "property"
                              ? "bg-blue-50 text-blue-600 border-blue-200"
                              : notification.type === "document"
                                ? "bg-green-50 text-green-600 border-green-200"
                                : "bg-purple-50 text-purple-600 border-purple-200"
                          }
                        `}
                      >
                        {notification.type}
                      </Badge>
                      {!notification.read && (
                        <Badge variant="secondary" className="text-xs px-2 py-0 h-5 bg-blue-50 text-blue-600">
                          New
                        </Badge>
                      )}
                    </div>

                    <div className="flex gap-1">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          className="h-7 w-7 p-0 rounded-full"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotification(notification.id)}
                        className="h-7 w-7 p-0 rounded-full text-gray-500"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Hint text for swipe actions */}
            <div className="text-xs text-center text-gray-400 mt-1 mb-3">
              <span>Swipe right to mark as read • Swipe left to delete</span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    )
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="container max-w-md mx-auto">
        {/* Mobile-style header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 shadow-sm">
          <div className="flex items-center h-16 px-4">
            {!showSearch ? (
              <>
                <Button variant="ghost" size="icon" onClick={goBack} className="mr-2">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-xl font-semibold flex-1">
                  Notifications
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {unreadCount}
                    </Badge>
                  )}
                </h1>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => setShowSearch(true)}>
                    <Search className="h-5 w-5" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {unreadCount > 0 && (
                        <DropdownMenuItem onClick={markAllAsRead}>
                          <Check className="mr-2 h-4 w-4" />
                          Mark all as read
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => setNotifications([])}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Clear all notifications
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            ) : (
              <div className="flex items-center w-full gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowSearch(false)
                    setSearchQuery("")
                  }}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1">
                  <Input
                    ref={searchInputRef}
                    placeholder="Search notifications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs and content - properly nested */}
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="sticky top-16 z-10 bg-white dark:bg-gray-800 shadow-sm">
            <TabsList className="grid grid-cols-4 p-0 h-12 bg-transparent w-full">
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:rounded-none rounded-none"
              >
                All
              </TabsTrigger>
              <TabsTrigger
                value="property"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:rounded-none rounded-none"
              >
                Properties
              </TabsTrigger>
              <TabsTrigger
                value="document"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:rounded-none rounded-none"
              >
                Documents
              </TabsTrigger>
              <TabsTrigger
                value="payment"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:rounded-none rounded-none"
              >
                Payments
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Notification content - now properly nested inside Tabs */}
          <div className="pb-20 pt-4">
            <TabsContent value="all" className="mt-0 p-0">
              {renderNotificationList("all")}
            </TabsContent>
            <TabsContent value="property" className="mt-0 p-0">
              {renderNotificationList("property")}
            </TabsContent>
            <TabsContent value="document" className="mt-0 p-0">
              {renderNotificationList("document")}
            </TabsContent>
            <TabsContent value="payment" className="mt-0 p-0">
              {renderNotificationList("payment")}
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Floating action button for mark all as read */}
      {unreadCount > 0 && (
        <motion.div
          className="fixed bottom-6 right-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          <Button onClick={markAllAsRead} className="rounded-full h-12 w-12 shadow-lg">
            <Check className="h-5 w-5" />
          </Button>
        </motion.div>
      )}
    </div>
  )
}

