"use client"

import { useState } from "react"
import Image from "next/image"
import { ArrowLeft, Search, Clock, BookmarkPlus, Users, Filter } from "lucide-react"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Checkbox } from "@/components/ui/checkbox"

interface Tutorial {
  id: string
  title: string
  description: string
  image: string
  instructor: {
    name: string
    avatar: string
  }
  duration: string
  category: string
  level: "Beginner" | "Intermediate" | "Advanced"
  viewCount: number
  progress?: number
  isBookmarked?: boolean
}

const categories = ["All", "Programming", "Design", "Business", "Marketing", "Photography", "Music"]

export default function TutorialPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedLevels, setSelectedLevels] = useState<string[]>([])
  const [tutorials, setTutorials] = useState<Tutorial[]>([
    {
      id: "1",
      title: "How to Make Tutorial Videos",
      description: "Learn the fundamentals of creating engaging tutorial videos that educate and inspire.",
      image: "/placeholder.svg?height=400&width=600",
      instructor: {
        name: "John Smith",
        avatar: "/placeholder.svg?height=100&width=100",
      },
      duration: "45 min",
      category: "Design",
      level: "Beginner",
      viewCount: 1234,
      progress: 45,
    },
    {
      id: "2",
      title: "Intro to OOP PHP Course",
      description: "Master object-oriented programming concepts in PHP with practical examples.",
      image: "/placeholder.svg?height=400&width=600",
      instructor: {
        name: "Mike Johnson",
        avatar: "/placeholder.svg?height=100&width=100",
      },
      duration: "2h 15min",
      category: "Programming",
      level: "Intermediate",
      viewCount: 892,
      isBookmarked: true,
    },
    {
      id: "3",
      title: "UI/UX Design Principles",
      description: "Learn essential design principles for creating user-friendly interfaces.",
      image: "/placeholder.svg?height=400&width=600",
      instructor: {
        name: "Sarah Wilson",
        avatar: "/placeholder.svg?height=100&width=100",
      },
      duration: "1h 30min",
      category: "Design",
      level: "Beginner",
      viewCount: 2156,
    },
    {
      id: "4",
      title: "Advanced React Patterns",
      description: "Deep dive into advanced React patterns and best practices.",
      image: "/placeholder.svg?height=400&width=600",
      instructor: {
        name: "David Chen",
        avatar: "/placeholder.svg?height=100&width=100",
      },
      duration: "3h 45min",
      category: "Programming",
      level: "Advanced",
      viewCount: 1567,
      progress: 75,
    },
    {
      id: "5",
      title: "Digital Marketing Essentials",
      description: "Learn the fundamentals of digital marketing and grow your online presence.",
      image: "/placeholder.svg?height=400&width=600",
      instructor: {
        name: "Emma Davis",
        avatar: "/placeholder.svg?height=100&width=100",
      },
      duration: "2h",
      category: "Marketing",
      level: "Beginner",
      viewCount: 3421,
      isBookmarked: true,
    },
    {
      id: "6",
      title: "Photography Masterclass",
      description: "Master the art of photography with professional techniques.",
      image: "/placeholder.svg?height=400&width=600",
      instructor: {
        name: "Alex Turner",
        avatar: "/placeholder.svg?height=100&width=100",
      },
      duration: "4h 30min",
      category: "Photography",
      level: "Intermediate",
      viewCount: 892,
    },
  ])

  // Toggle bookmark
  const toggleBookmark = (id: string) => {
    setTutorials(
      tutorials.map((tutorial) =>
        tutorial.id === id ? { ...tutorial, isBookmarked: !tutorial.isBookmarked } : tutorial,
      ),
    )
  }

  // Format view count
  const formatViewCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`
    }
    return count
  }

  // Filter tutorials
  const filteredTutorials = tutorials.filter((tutorial) => {
    const matchesSearch =
      tutorial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutorial.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "All" || tutorial.category === selectedCategory
    const matchesLevel = selectedLevels.length === 0 || selectedLevels.includes(tutorial.level)

    return matchesSearch && matchesCategory && matchesLevel
  })

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="container px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">Tutorials</h1>
          </div>
        </div>
      </header>

      {/* Search and Filters */}
      <div className="sticky top-[57px] z-10 bg-white border-b">
        <div className="container px-4 py-3 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tutorials..."
              className="pl-9 pr-4"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
            <ScrollArea className="w-full">
              <div className="flex space-x-2 pb-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    className={`rounded-full px-4 py-1.5 text-sm shrink-0 h-auto
                      ${selectedCategory === category ? "bg-sky-500 hover:bg-sky-600" : ""}`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0">
                  <Filter className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="py-4">
                  <h3 className="font-medium mb-2">Level</h3>
                  <div className="space-y-2">
                    {["Beginner", "Intermediate", "Advanced"].map((level) => (
                      <div key={level} className="flex items-center space-x-2">
                        <Checkbox
                          id={level}
                          checked={selectedLevels.includes(level)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedLevels([...selectedLevels, level])
                            } else {
                              setSelectedLevels(selectedLevels.filter((l) => l !== level))
                            }
                          }}
                        />
                        <label
                          htmlFor={level}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {level}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Tutorial List */}
      <main className="flex-1 container px-4 py-6">
        <div className="grid gap-4">
          {filteredTutorials.map((tutorial) => (
            <motion.div
              key={tutorial.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="overflow-hidden">
                <div className="sm:flex">
                  <div className="relative w-full sm:w-48 h-48 sm:h-auto shrink-0">
                    <Image
                      src={tutorial.image || "/placeholder.svg"}
                      alt={tutorial.title}
                      fill
                      className="object-cover"
                    />
                    {tutorial.progress !== undefined && (
                      <div className="absolute left-0 bottom-0 w-full h-1 bg-black/20">
                        <div className="h-full bg-sky-500" style={{ width: `${tutorial.progress}%` }} />
                      </div>
                    )}
                  </div>

                  <CardContent className="p-4 flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Badge variant="secondary" className="mb-2 bg-sky-50 text-sky-700 hover:bg-sky-100">
                          {tutorial.category}
                        </Badge>
                        <h3 className="font-semibold text-lg mb-1">{tutorial.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{tutorial.description}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`shrink-0 ${tutorial.isBookmarked ? "text-sky-500" : ""}`}
                        onClick={() => toggleBookmark(tutorial.id)}
                      >
                        <BookmarkPlus className="h-5 w-5" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-3 mt-auto">
                      <div className="flex items-center gap-2">
                        <Image
                          src={tutorial.instructor.avatar || "/placeholder.svg"}
                          alt={tutorial.instructor.name}
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                        <span className="text-sm font-medium">{tutorial.instructor.name}</span>
                      </div>
                      <div className="flex items-center gap-3 ml-auto text-muted-foreground text-sm">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {tutorial.duration}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {formatViewCount(tutorial.viewCount)}
                        </div>
                        <Badge variant="outline" className="ml-2">
                          {tutorial.level}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  )
}

