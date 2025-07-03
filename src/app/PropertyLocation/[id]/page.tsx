"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"
import { ArrowLeft, Search, MapPin, Clock, Filter, Navigation, Star, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

interface LocationData {
  propertyId: string
  Location: string
  Time: string
  LocationTypeId: string
  Label: string
  Icon: string
}

const categoryColors: { [key: string]: { bg: string; text: string; accent: string } } = {
  Airport: { bg: "bg-gradient-to-r from-blue-50 to-sky-50", text: "text-blue-700", accent: "bg-blue-500" },
  University: { bg: "bg-gradient-to-r from-purple-50 to-violet-50", text: "text-purple-700", accent: "bg-purple-500" },
  Hotel: { bg: "bg-gradient-to-r from-emerald-50 to-green-50", text: "text-emerald-700", accent: "bg-emerald-500" },
  Mall: { bg: "bg-gradient-to-r from-pink-50 to-rose-50", text: "text-pink-700", accent: "bg-pink-500" },
  Hospital: { bg: "bg-gradient-to-r from-red-50 to-rose-50", text: "text-red-700", accent: "bg-red-500" },
  Restaurant: { bg: "bg-gradient-to-r from-orange-50 to-amber-50", text: "text-orange-700", accent: "bg-orange-500" },
  School: { bg: "bg-gradient-to-r from-yellow-50 to-amber-50", text: "text-yellow-700", accent: "bg-yellow-500" },
  Bank: { bg: "bg-gradient-to-r from-indigo-50 to-blue-50", text: "text-indigo-700", accent: "bg-indigo-500" },
}

const getTimeCategory = (time: string) => {
  const minutes = Number.parseInt(time)
  if (minutes <= 5) return { label: "Very Close", color: "text-green-600", bg: "bg-green-100" }
  if (minutes <= 10) return { label: "Close", color: "text-blue-600", bg: "bg-blue-100" }
  if (minutes <= 20) return { label: "Nearby", color: "text-orange-600", bg: "bg-orange-100" }
  return { label: "Far", color: "text-gray-600", bg: "bg-gray-100" }
}

export default function PropertyLocationPage() {
  const router = useRouter()
  const params = useParams()
  const propertyId = params.id as string

  const [locations, setLocations] = useState<LocationData[]>([])
  const [filteredLocations, setFilteredLocations] = useState<LocationData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await fetch(`https://api.realestatecompany.co.in/api/location/${propertyId}`)
        if (!res.ok) throw new Error("Failed to fetch location data")
        const data = await res.json()
        setLocations(data)
        setFilteredLocations(data)
      } catch (error) {
        console.error("Error fetching locations:", error)
        setError("Failed to load location data")
      } finally {
        setLoading(false)
      }
    }

    if (propertyId) {
      fetchLocations()
    }
  }, [propertyId])

  useEffect(() => {
    let filtered = locations

    if (searchTerm) {
      filtered = filtered.filter(
        (location) =>
          location.Location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          location.Label.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (selectedCategory) {
      filtered = filtered.filter((location) => location.Label === selectedCategory)
    }

    // Sort by time (closest first)
    filtered.sort((a, b) => Number.parseInt(a.Time) - Number.parseInt(b.Time))

    setFilteredLocations(filtered)
  }, [searchTerm, selectedCategory, locations])

  const categories = Array.from(new Set(locations.map((loc) => loc.Label)))
  const stats = {
    total: locations.length,
    veryClose: locations.filter((loc) => Number.parseInt(loc.Time) <= 5).length,
    categories: categories.length,
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0, scale: 0.95 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 100, damping: 15 },
    },
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="fixed top-0 left-0 right-0 z-10 bg-white/80 backdrop-blur-lg border-b border-gray-200">
          <div className="flex items-center justify-between px-4 h-16">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Nearby Locations
            </h1>
            <div className="w-10"></div>
          </div>
        </div>
        <div className="pt-16 flex justify-center items-center h-64">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-500 mx-auto"></div>
              <div className="absolute inset-0 rounded-full h-12 w-12 border-4 border-transparent border-t-blue-300 animate-ping mx-auto"></div>
            </div>
            <p className="text-gray-600 mt-4 font-medium">Loading locations...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
        <div className="fixed top-0 left-0 right-0 z-10 bg-white/80 backdrop-blur-lg border-b border-gray-200">
          <div className="flex items-center justify-between px-4 h-16">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold">Nearby Locations</h1>
            <div className="w-10"></div>
          </div>
        </div>
        <div className="pt-16 flex justify-center items-center h-64">
          <Card className="p-8 text-center max-w-sm mx-4">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} className="w-full">
              Try Again
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      {/* Enhanced Header */}
      <div className="fixed top-0 left-0 right-0 z-10 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
        <div className="flex items-center justify-between px-4 h-16">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="hover:bg-gray-100/80">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="text-center">
            <h1 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Nearby Locations
            </h1>
            <p className="text-xs text-gray-500">{filteredLocations.length} places found</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 font-medium">
              {stats.veryClose} close
            </Badge>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="pt-20 px-4">
        <div className="grid grid-cols-3 gap-3 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white"
          >
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="h-4 w-4" />
              <span className="text-xs font-medium opacity-90">Total</span>
            </div>
            <p className="text-2xl font-bold">{stats.total}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-4 text-white"
          >
            <div className="flex items-center gap-2 mb-1">
              <Zap className="h-4 w-4" />
              <span className="text-xs font-medium opacity-90">Close</span>
            </div>
            <p className="text-2xl font-bold">{stats.veryClose}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl p-4 text-white"
          >
            <div className="flex items-center gap-2 mb-1">
              <Star className="h-4 w-4" />
              <span className="text-xs font-medium opacity-90">Types</span>
            </div>
            <p className="text-2xl font-bold">{stats.categories}</p>
          </motion.div>
        </div>
      </div>

      {/* Enhanced Search and Filter */}
      <div className="px-4 mb-6">
        <Card className="p-4 bg-white/70 backdrop-blur-sm border-gray-200/50">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/80 border-gray-200/50 focus:bg-white transition-colors"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
                className="whitespace-nowrap bg-gradient-to-r from-gray-900 to-gray-700 hover:from-gray-800 hover:to-gray-600"
              >
                <Filter className="h-3 w-3 mr-1" />
                All
              </Button>
              {categories.map((category) => {
                const colors = categoryColors[category] || categoryColors.Bank
                return (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                    className={`whitespace-nowrap ${
                      selectedCategory === category
                        ? `bg-gradient-to-r ${colors.accent} hover:opacity-90`
                        : "hover:bg-gray-50"
                    }`}
                  >
                    {category}
                  </Button>
                )
              })}
            </div>
          </div>
        </Card>
      </div>

      {/* Enhanced Location List */}
      <main className="px-4 pb-8">
        {filteredLocations.length > 0 ? (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredLocations.map((location, index) => {
                const colors = categoryColors[location.Label] || categoryColors.Bank
                const timeCategory = getTimeCategory(location.Time)

                return (
                  <motion.div
                    key={`${location.propertyId}-${index}`}
                    variants={itemVariants}
                    layout
                    exit={{ opacity: 0, scale: 0.95, y: -20 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="group"
                  >
                    <Card className="overflow-hidden bg-white/80 backdrop-blur-sm border-gray-200/50 hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300">
                      <CardContent className="p-0">
                        <div className={`h-1 ${colors.accent}`}></div>
                        <div className="p-5">
                          <div className="flex items-start gap-4">
                            {/* Enhanced Icon */}
                            <div
                              className={`w-16 h-16 flex items-center justify-center ${colors.bg} rounded-2xl border-2 border-white shadow-sm group-hover:scale-110 transition-transform duration-300`}
                            >
                              <Image
                                src={location.Icon || "/placeholder.svg"}
                                alt={location.Label}
                                width={32}
                                height={32}
                                className="object-contain"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.style.display = "none"
                                }}
                              />
                            </div>

                            {/* Enhanced Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-3 mb-3">
                                <div>
                                  <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1 group-hover:text-blue-600 transition-colors">
                                    {location.Location}
                                  </h3>
                                  <Badge className={`${colors.text} ${colors.bg} border-0 font-medium`}>
                                    {location.Label}
                                  </Badge>
                                </div>
                                <div className="text-right">
                                  <div
                                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${timeCategory.bg} ${timeCategory.color}`}
                                  >
                                    <Clock className="h-3 w-3" />
                                    {location.Time} min
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1">{timeCategory.label}</p>
                                </div>
                              </div>

                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    <span>Walking distance</span>
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                >
                                  <Navigation className="h-4 w-4 mr-1" />
                                  Directions
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-12 text-center bg-white/70 backdrop-blur-sm">
              <div className="text-6xl mb-6">🔍</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">No locations found</h3>
              <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                {searchTerm || selectedCategory
                  ? "Try adjusting your search terms or removing filters to see more results."
                  : "No location data is available for this property at the moment."}
              </p>
              {(searchTerm || selectedCategory) && (
                <Button
                  onClick={() => {
                    setSearchTerm("")
                    setSelectedCategory(null)
                  }}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                >
                  Clear all filters
                </Button>
              )}
            </Card>
          </motion.div>
        )}
      </main>
    </div>
  )
}
