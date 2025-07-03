"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { FiChevronLeft, FiChevronRight, FiCalendar } from "react-icons/fi"
import { AppLayout } from "@/components/app-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events] = useState([
    {
      date: new Date(2024, 4, 9),
      title: "Site Visit - Amit Verma",
      type: "visit",
      address: "Lakeview Residency",
    },
    {
      date: new Date(2024, 4, 12),
      title: "Follow-up - Priya Malhotra",
      type: "follow-up",
    },
    {
      date: new Date(2024, 4, 15),
      title: "Loan Discussion - Rajesh Kumar",
      type: "loan",
    },
    {
      date: new Date(2024, 4, 20),
      title: "Closure Meeting - Vikram Singh",
      type: "closure",
    },
  ])

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()

  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const blankDays = Array.from({ length: firstDayOfMonth }, (_, i) => i)

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const getEventsForDay = (day: number) => {
    return events.filter(
      (event) =>
        event.date.getDate() === day &&
        event.date.getMonth() === currentDate.getMonth() &&
        event.date.getFullYear() === currentDate.getFullYear(),
    )
  }

  return (
    <AppLayout title="Calendar" backUrl="/dashboard">
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <div className="flex space-x-2">
            <Button variant="outline" size="icon" onClick={prevMonth}>
              <FiChevronLeft />
            </Button>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <FiChevronRight />
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-7 gap-1 text-center">
              {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                <div key={i} className="text-xs font-medium text-muted-foreground p-2">
                  {day}
                </div>
              ))}

              {blankDays.map((_, i) => (
                <div key={i} className="h-20"></div>
              ))}

              {days.map((day) => {
                const dayEvents = getEventsForDay(day)
                const hasEvents = dayEvents.length > 0
                const today = new Date()
                const isToday =
                  day === today.getDate() &&
                  currentDate.getMonth() === today.getMonth() &&
                  currentDate.getFullYear() === today.getFullYear()

                return (
                  <motion.div
                    key={day}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`h-20 border rounded-md p-1 overflow-hidden ${
                      isToday ? "border-blue-600" : "border-gray-200"
                    }`}
                  >
                    <div className={`text-right text-sm mb-1 ${isToday ? "font-bold text-blue-600" : ""}`}>{day}</div>

                    {hasEvents && (
                      <div className="space-y-1">
                        {dayEvents.map((event, index) => (
                          <div
                            key={index}
                            className={`text-xs truncate rounded px-1 py-0.5 ${
                              event.type === "visit"
                                ? "bg-blue-100 text-blue-800"
                                : event.type === "follow-up"
                                  ? "bg-purple-100 text-purple-800"
                                  : event.type === "loan"
                                    ? "bg-orange-100 text-orange-800"
                                    : "bg-green-100 text-green-800"
                            }`}
                          >
                            {event.title}
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <h3 className="font-medium">Upcoming Events</h3>
          {events
            .filter((event) => event.date >= new Date())
            .sort((a, b) => a.date.getTime() - b.date.getTime())
            .slice(0, 3)
            .map((event, index) => (
              <Card key={index}>
                <CardContent className="p-3 flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                      event.type === "visit"
                        ? "bg-blue-100 text-blue-800"
                        : event.type === "follow-up"
                          ? "bg-purple-100 text-purple-800"
                          : event.type === "loan"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-green-100 text-green-800"
                    }`}
                  >
                    <FiCalendar />
                  </div>
                  <div>
                    <p className="font-medium">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {event.date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
   </AppLayout>
  )
}
