"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence, type PanInfo, useAnimation } from "framer-motion"
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Edit, X, Check, Maximize, Minimize } from "lucide-react"

interface PropertyImagesProps {
  propertyId: string
}

// Available filters for image editing
const filters = [
  { name: "Normal", value: "none" },
  { name: "Grayscale", value: "grayscale(100%)" },
  { name: "Sepia", value: "sepia(100%)" },
  { name: "Brightness", value: "brightness(150%)" },
  { name: "Contrast", value: "contrast(150%)" },
]

export default function PropertyImages({ propertyId }: PropertyImagesProps) {
  const [propertyData, setPropertyData] = useState<{
    images: string[]
    title: string
    brokerage: string
    tag: string
    readyToMove: boolean
  } | null>(null)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState("none")
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 })
  const [isFullscreen, setIsFullscreen] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const controls = useAnimation()

  // Fetch data from API
  useEffect(() => {
    const fetchPropertyData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/properties/${propertyId}`)
        if (!response.ok) throw new Error("Failed to fetch property data")

        const data = await response.json()

        let parsedImages: string[] = []
        if (data.images) {
          try {
            parsedImages = typeof data.images === "string" ? JSON.parse(data.images) : data.images
          } catch (error) {
            console.error("Error parsing images:", error)
            parsedImages = []
          }
        }

        setPropertyData({
          ...data,
          images: parsedImages,
        })
      } catch (err) {
        console.error("Could not load property data:", err)
      }
    }

    fetchPropertyData()
  }, [propertyId])

  // Reset zoom and position when changing images
  useEffect(() => {
    setZoomLevel(1)
    setDragPosition({ x: 0, y: 0 })
    controls.start({ x: 0, y: 0, scale: 1 })
  }, [currentIndex, controls])

  const nextImage = () => setCurrentIndex((prev) => (prev + 1) % propertyData!.images.length)
  const prevImage = () =>
    setCurrentIndex((prev) => (prev - 1 + propertyData!.images.length) % propertyData!.images.length)

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // Only change image if not zoomed in
    if (zoomLevel === 1) {
      if (info.offset.x < -100) {
        nextImage()
      } else if (info.offset.x > 100) {
        prevImage()
      }
    } else {
      // Update drag position when zoomed in
      setDragPosition({
        x: dragPosition.x + info.offset.x,
        y: dragPosition.y + info.offset.y,
      })
    }
  }

  const handleZoomIn = () => {
    if (zoomLevel < 3) {
      const newZoom = zoomLevel + 0.5
      setZoomLevel(newZoom)
      controls.start({ scale: newZoom })
    }
  }

  const handleZoomOut = () => {
    if (zoomLevel > 1) {
      const newZoom = zoomLevel - 0.5
      setZoomLevel(newZoom)
      controls.start({ scale: newZoom })

      // Reset position if zooming back to 1
      if (newZoom === 1) {
        setDragPosition({ x: 0, y: 0 })
        controls.start({ x: 0, y: 0 })
      }
    }
  }

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
    setIsFullscreen(!isFullscreen)
  }

  // Listen for fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden bg-black"
      style={{ height: isFullscreen ? "100vh" : "300px" }}
    >
      {/* Main Image Carousel */}
      <motion.div
        drag={zoomLevel > 1}
        dragConstraints={{
          left: -300 * zoomLevel,
          right: 300 * zoomLevel,
          top: -150 * zoomLevel,
          bottom: 150 * zoomLevel,
        }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        animate={controls}
        className="w-full h-full relative"
      >
        <AnimatePresence initial={false}>
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Image
              src={propertyData?.images[currentIndex] || "/placeholder.svg"}
              alt={`${propertyData?.title} - Image ${currentIndex + 1}`}
              width={800}
              height={400}
              className="w-full h-full object-cover"
              style={{ filter: selectedFilter }}
              priority
            />
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Navigation Controls */}
      {!isEditing && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 rounded-full p-2 shadow-md"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 rounded-full p-2 shadow-md"
            aria-label="Next image"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Pagination Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
        {propertyData?.images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full ${index === currentIndex ? "bg-white" : "bg-white/50"}`}
            aria-label={`Go to image ${index + 1}`}
          />
        ))}
      </div>

      {/* Tags */}
      {!isEditing && (
        <>
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-md">RERA</span>
            <span className="bg-blue-500 text-white text-xs px-3 py-1 rounded-md">{propertyData?.brokerage}</span>
          </div>

          <div className="absolute top-4 right-4">
            <span className="bg-amber-400 text-white text-xs px-3 py-1 rounded-md">{propertyData?.tag}</span>
          </div>

          <div className="absolute bottom-16 left-4">
            <span className="bg-gray-800 text-white text-xs px-3 py-1 rounded-md">
              {propertyData?.readyToMove ? "Ready to Move" : "Under Construction"}
            </span>
          </div>
        </>
      )}

      {/* Thumbnails */}
      <div className="absolute bottom-4 right-4 flex gap-2">
        {propertyData?.images?.slice(0, 3).map((image, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentIndex(index)}
            className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md ${
              currentIndex === index ? "ring-2 ring-blue-500" : "bg-white"
            }`}
          >
            <Image
              src={image || "/placeholder.svg"}
              alt={`Thumbnail ${index + 1}`}
              width={40}
              height={40}
              className="w-full h-full rounded-full object-cover"
            />
          </motion.button>
        ))}
        {propertyData?.images && propertyData.images.length > 3 && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentIndex(3)}
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md"
          >
            <span className="text-gray-700 font-medium">+{propertyData.images.length - 3}</span>
          </motion.button>
        )}
      </div>

      {/* Controls Toolbar */}
      <div className="absolute top-16 right-4 flex flex-col gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleZoomIn}
          disabled={zoomLevel >= 3}
          className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md disabled:opacity-50"
          aria-label="Zoom in"
        >
          <ZoomIn className="w-5 h-5" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleZoomOut}
          disabled={zoomLevel <= 1}
          className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md disabled:opacity-50"
          aria-label="Zoom out"
        >
          <ZoomOut className="w-5 h-5" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsEditing(!isEditing)}
          className={`w-10 h-10 rounded-full ${isEditing ? "bg-blue-500 text-white" : "bg-white"} flex items-center justify-center shadow-md`}
          aria-label="Edit image"
        >
          <Edit className="w-5 h-5" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleFullscreen}
          className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md"
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
        </motion.button>
      </div>

      {/* Editing Panel */}
      {isEditing && (
        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center">
          <div className="bg-white rounded-lg p-4 w-[90%] max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Edit Image</h3>
              <button onClick={() => setIsEditing(false)} className="text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Filters</h4>
              <div className="grid grid-cols-3 gap-2">
                {filters.map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setSelectedFilter(filter.value)}
                    className={`text-xs p-2 rounded ${
                      selectedFilter === filter.value ? "bg-blue-100 border border-blue-500" : "bg-gray-100"
                    }`}
                  >
                    {filter.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setIsEditing(false)}
                className="bg-blue-500 text-white px-4 py-2 rounded-md flex items-center"
              >
                <Check className="w-4 h-4 mr-1" /> Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Counter */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
        {currentIndex + 1} / {propertyData?.images.length}
      </div>
    </div>
  )
}
