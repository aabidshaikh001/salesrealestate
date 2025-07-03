"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Bed, Bath, Maximize, Eye, Calculator, Download, Share2, ZoomIn, ZoomOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface PropertyFloorPlansProps {
  propertyId: string
}

interface FloorPlan {
  id: number
  propertyId: string
  name: string
  image: string
  area: string
  bedrooms: number
  bathrooms: number
}

export default function PropertyFloorPlans({ propertyId }: PropertyFloorPlansProps) {
  const [floorPlans, setFloorPlans] = useState<FloorPlan[]>([])
  const [selectedBHK, setSelectedBHK] = useState("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<FloorPlan | null>(null)
  const [isViewerOpen, setIsViewerOpen] = useState(false)
  const [imageZoom, setImageZoom] = useState(1)
  const [downloading, setDownloading] = useState<number | null>(null)

  useEffect(() => {
    const fetchFloorPlans = async () => {
      try {
        setLoading(true)
        const response = await fetch(`https://api.realestatecompany.co.in/api/floorplan/${propertyId}`)
        if (!response.ok) throw new Error("Failed to fetch floor plans")
        const data = await response.json()
        setFloorPlans(data || [])
      } catch (error) {
        console.error("Error fetching floor plans:", error)
        setError("Failed to load floor plans")
        setFloorPlans([])
      } finally {
        setLoading(false)
      }
    }

    if (propertyId) {
      fetchFloorPlans()
    }
  }, [propertyId])

  // Extract BHK from name (e.g., "3 BHK Premium" -> "3")
  const extractBHK = (name: string): string => {
    const match = name.match(/(\d+)\s*BHK/i)
    return match ? match[1] : "0"
  }

  // Get unique BHK options from floor plans
  const bhkOptions = Array.from(new Set(floorPlans.map((plan) => extractBHK(plan.name))))
    .filter((bhk) => bhk !== "0")
    .sort((a, b) => Number.parseInt(a) - Number.parseInt(b))

  const filteredPlans =
    selectedBHK === "all" ? floorPlans : floorPlans.filter((plan) => extractBHK(plan.name) === selectedBHK)

  // Handle view floor plan
  const handleViewPlan = (plan: FloorPlan) => {
    setSelectedPlan(plan)
    setIsViewerOpen(true)
    setImageZoom(1)
  }

  // Handle download floor plan
  const handleDownloadPlan = async (plan: FloorPlan) => {
    try {
      setDownloading(plan.id)

      // Fetch the image
      const response = await fetch(plan.image)
      if (!response.ok) throw new Error("Failed to fetch image")

      // Convert to blob
      const blob = await response.blob()

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${plan.name.replace(/\s+/g, "_")}_FloorPlan.jpg`
      document.body.appendChild(link)
      link.click()

      // Cleanup
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Download failed:", error)
      alert("Failed to download floor plan. Please try again.")
    } finally {
      setDownloading(null)
    }
  }

  // Handle zoom controls
  const handleZoomIn = () => {
    setImageZoom((prev) => Math.min(prev + 0.25, 3))
  }

  const handleZoomOut = () => {
    setImageZoom((prev) => Math.max(prev - 0.25, 0.5))
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
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
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg text-gray-900">Floor Plans & Pricing</h3>
              <p className="text-sm text-gray-600 mt-1">Available configurations</p>
            </div>
          </div>
        </div>
        <div className="p-8 flex justify-center items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto mb-3"></div>
            <p className="text-gray-600 font-medium">Loading floor plans...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg text-gray-900">Floor Plans & Pricing</h3>
              <p className="text-sm text-gray-600 mt-1">Available configurations</p>
            </div>
          </div>
        </div>
        <div className="p-8 text-center">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="text-red-500 text-3xl mb-3">⚠️</div>
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      >
        {/* Enhanced Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg text-gray-900">Floor Plans & Pricing</h3>
              <p className="text-sm text-gray-600 mt-1">
                {floorPlans.length} configuration{floorPlans.length !== 1 ? "s" : ""} available
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 font-medium">
                {filteredPlans.length} shown
              </Badge>
            </div>
          </div>
        </div>

        <div className="p-5">
          {/* BHK Filter Buttons */}
          {bhkOptions.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
              <Button
                variant={selectedBHK === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedBHK("all")}
                className={`whitespace-nowrap ${
                  selectedBHK === "all"
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                    : "hover:bg-gray-50"
                }`}
              >
                All Types
              </Button>
              {bhkOptions.map((bhk) => (
                <Button
                  key={bhk}
                  variant={selectedBHK === bhk ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedBHK(bhk)}
                  className={`whitespace-nowrap ${
                    selectedBHK === bhk
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                      : "hover:bg-gray-50"
                  }`}
                >
                  {bhk} BHK
                </Button>
              ))}
            </div>
          )}

          {/* Floor Plans Grid */}
          {filteredPlans.length > 0 ? (
            <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredPlans.map((plan) => (
                  <motion.div
                    key={plan.id}
                    variants={itemVariants}
                    layout
                    exit={{ opacity: 0, scale: 0.95, y: -20 }}
                    whileHover={{ y: -4, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="group"
                  >
                    <Card className="overflow-hidden bg-white border-gray-200/50 hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300">
                      <CardContent className="p-0">
                        {/* Image Section */}
                        <div className="relative overflow-hidden">
                          <Image
                            src={plan.image || "/placeholder.svg"}
                            alt={plan.name}
                            width={400}
                            height={250}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                          />

                          {/* Overlay Badges */}
                          <div className="absolute top-3 left-3">
                            <Badge className="bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold">
                              {extractBHK(plan.name)} BHK
                            </Badge>
                          </div>

                       

                          {/* Hover Overlay */}
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="bg-white/90 text-gray-900 hover:bg-white"
                                onClick={() => handleViewPlan(plan)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="bg-white/90 border-white/50 text-gray-900 hover:bg-white"
                                onClick={() => handleDownloadPlan(plan)}
                                disabled={downloading === plan.id}
                              >
                                {downloading === plan.id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-900 border-t-transparent" />
                                ) : (
                                  <Download className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Content Section */}
                        <div className="p-4">
                          <div className="mb-4">
                            <h4 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                              {plan.name}
                            </h4>

                            {/* Stats Row */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1 text-gray-600">
                                  <Maximize className="h-4 w-4" />
                                  <span className="text-sm font-medium">{plan.area}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-1 text-gray-600">
                                    <Bed className="h-4 w-4" />
                                    <span className="text-sm font-medium">{plan.bedrooms}</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-gray-600">
                                    <Bath className="h-4 w-4" />
                                    <span className="text-sm font-medium">{plan.bathrooms}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                              onClick={() => handleViewPlan(plan)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1 hover:bg-gray-50 bg-transparent"
                              onClick={() => handleDownloadPlan(plan)}
                            disabled={downloading === plan.id}
              >
                              <Download className="h-4 w-4 mr-1" />
                              Download Plan 
                            </Button>
                          </div>

                          
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No floor plans found</h3>
              <p className="text-gray-600 mb-4">
                {selectedBHK !== "all"
                  ? `No ${selectedBHK} BHK configurations available`
                  : "No floor plans available for this property"}
              </p>
              {selectedBHK !== "all" && (
                <Button variant="outline" onClick={() => setSelectedBHK("all")}>
                  View All Plans
                </Button>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Floor Plan Viewer Modal */}
      <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
        <DialogContent className="max-w-4xl w-full h-[90vh] p-0">
          <DialogHeader className="p-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl font-bold">{selectedPlan?.name}</DialogTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedPlan?.area} • {selectedPlan?.bedrooms} Bed • {selectedPlan?.bathrooms} Bath
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => selectedPlan && handleDownloadPlan(selectedPlan)}
                  disabled={downloading === selectedPlan?.id}
                >
                  {downloading === selectedPlan?.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-900 border-t-transparent mr-1" />
                  ) : (
                    <Download className="h-4 w-4 mr-1" />
                  )}
                  Download
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 relative overflow-hidden">
            {/* Zoom Controls */}
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
              <Button
                size="sm"
                variant="outline"
                className="bg-white/90 backdrop-blur-sm"
                onClick={handleZoomIn}
                disabled={imageZoom >= 3}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="bg-white/90 backdrop-blur-sm"
                onClick={handleZoomOut}
                disabled={imageZoom <= 0.5}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <div className="bg-white/90 backdrop-blur-sm rounded px-2 py-1 text-xs font-medium">
                {Math.round(imageZoom * 100)}%
              </div>
            </div>

            {/* Image Container */}
            <div className="w-full h-full overflow-auto bg-gray-50 flex items-center justify-center p-4">
              {selectedPlan && (
                <Image
                  src={selectedPlan.image || "/placeholder.svg"}
                  alt={selectedPlan.name}
                  width={800}
                  height={600}
                  className="max-w-none transition-transform duration-200"
                  style={{
                    transform: `scale(${imageZoom})`,
                    transformOrigin: "center",
                  }}
                />
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
