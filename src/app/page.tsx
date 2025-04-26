"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect, useMemo, type FormEvent, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Mic, Building2, HomeIcon, Map, Store, ChevronRight, Share2, Home, Award, Clock, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import Header from "./component/header"
import Footer from "./component/footer"
import ShareModal from "@/app/component/share-modal"

type SpeechRecognitionType = {
  new (): SpeechRecognition
  prototype: SpeechRecognition
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionType
    webkitSpeechRecognition: SpeechRecognitionType
  }
}

interface Property {
  id: string
  title: string
  location: string
  price: string
  pricePerSqft: string | null
  latitude: number | null
  longitude: number | null
  propertyType: string
  status: string
  propertyFor: string
  images: string[] | string
  brokerage: string | null
  tag: string
  readyToMove: boolean
  discount: string | null
  visitBonus: string | null
  bhkOptions: Array<string | { bhk?: string; size?: string; type?: string }> | string
  superBuiltUpArea: string
  carpetArea: string | null
  isSaved: boolean
  isFeatured: boolean
  type: string | null
}

function PropertyCard({ property }: { property: Property }) {
  // Safely parse images
  const imagesArray = useMemo(() => {
    try {
      if (Array.isArray(property.images)) return property.images
      if (typeof property.images === "string") return JSON.parse(property.images || "[]")
      return []
    } catch {
      return []
    }
  }, [property.images])

  // Safely parse bhkOptions
  const bhkOptions = useMemo(() => {
    try {
      if (Array.isArray(property.bhkOptions)) return property.bhkOptions
      if (typeof property.bhkOptions === "string") return JSON.parse(property.bhkOptions || "[]")
      return []
    } catch {
      return []
    }
  }, [property.bhkOptions])

  // Format price per sqft display
  const pricePerSqftDisplay = property.pricePerSqft ? `@ ${property.pricePerSqft}/sq.ft` : ""

  const [isShareOpen, setIsShareOpen] = useState(false)

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 max-w-sm">
      <div className="relative">
        <div className="relative h-[180px] bg-gray-100">
          {imagesArray.length > 0 ? (
            <Image
              src={imagesArray[0] || "/placeholder.svg"}
              alt={property.title}
              fill
              className="object-cover"
              onError={(e) => {
                ;(e.target as HTMLImageElement).src = "/placeholder.svg"
              }}
            />
          ) : (
            <Image src="/placeholder.svg" alt="Placeholder" fill className="object-cover" />
          )}
        </div>

        <div className="absolute top-3 left-3">
          <span className="bg-red-500 text-white text-xs font-medium px-3 py-1 rounded-full">
            {property.brokerage || "0%"}
          </span>
        </div>

        <div className="absolute top-3 right-3">
          <span className="bg-amber-400 text-white text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
            <Award className="w-3 h-3" />
            {property.tag}
          </span>
        </div>

        {property.readyToMove && (
          <div className="absolute bottom-3 left-3">
            <span className="bg-black/70 text-white text-xs font-medium px-3 py-1 rounded-md flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Ready to Move
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-lg text-gray-800">{property.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{property.location}</p>
          </div>
          <button className="text-gray-400 hover:text-gray-600" onClick={() => setIsShareOpen(true)}>
            <Share2 size={18} />
          </button>
        </div>

        <div className="flex gap-2 mt-4 flex-wrap">
          {bhkOptions.map((option: string | { bhk?: string; size?: string; type?: string }, index: number) => {
            let displayText = ""
            if (typeof option === "string") {
              displayText = option
            } else if (option.bhk) {
              displayText = option.bhk
            } else if (option.type) {
              displayText = option.type
            } else if (option.size) {
              displayText = option.size
            }

            return displayText ? (
              <div key={index} className="flex flex-col items-center">
                <div className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-md">
                  <Home size={16} className="text-gray-500" />
                </div>
                <span className="text-xs text-gray-600 mt-1">{displayText}</span>
              </div>
            ) : null
          })}
        </div>

        {pricePerSqftDisplay && <p className="text-xs text-gray-500 mt-1">{pricePerSqftDisplay}</p>}

        <div className="mt-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-xl text-gray-900">{property.price}</h4>
              {property.discount && <p className="text-xs text-gray-500 mt-1">{property.discount}</p>}
            </div>
            <div>
              <Link href={`/property/${property.id}`}>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button className="bg-white text-blue-600 border border-blue-600 hover:bg-blue-50">Book Visit</Button>
                </motion.div>
              </Link>
            </div>
          </div>
        </div>

        {property.visitBonus && (
          <div className="mt-3">
            <span className="bg-red-100 text-red-600 text-xs font-medium px-3 py-1 rounded-md">
              {property.visitBonus}
            </span>
          </div>
        )}
        <ShareModal
          isOpen={isShareOpen}
          onOpenChange={setIsShareOpen}
          propertyName={property.title}
          shareUrl={
            typeof window !== "undefined"
              ? window.location.href + `/property/${property.id}`
              : `https://sales.realestatecompany.co.in/property/${property.id}`
          }
        />
      </div>
    </div>
  )
}

const bannerImages = [
  "https://destinationcompress.s3.ap-south-1.amazonaws.com/d939795c-e1c2-4e56-9bc5-16d7b9f6f35f.jpg",
  "https://cbvalueaddrealty.in/wp-content/uploads/2021/07/Raffles-Park-Luxury-Villa.jpg",
  "https://5.imimg.com/data5/SELLER/Default/2022/7/QA/GZ/BO/79515996/whatsapp-image-2022-06-25-at-2-13-17-pm-500x500.jpeg",
]

export default function HomeMain() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [voiceError, setVoiceError] = useState("")
  const router = useRouter()

  const recognitionRef = useRef<SpeechRecognition | null>(null)

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch("https://api.realestatecompany.co.in/api/properties")
        const data = await response.json()
        setProperties(data)
      } catch (error) {
        console.error("Error fetching properties:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProperties()
  }, [])

  // Preload images

  useEffect(() => {
    properties.forEach((property) => {
      const images = Array.isArray(property.images)
        ? property.images
        : typeof property.images === "string"
          ? JSON.parse(property.images || "[]")
          : []

      images.slice(0, 2).forEach((url: string) => {
        const img = new window.Image()
        img.src = url
      })
    })
  }, [properties])
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % bannerImages.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognitionRef.current = recognition
        recognition.continuous = false
        recognition.interimResults = false
        recognition.lang = "en-US"

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = event.results[0][0].transcript
          setSearchTerm(transcript)
          setIsListening(false)

          if (transcript.trim()) {
            router.push(`/Properties/${encodeURIComponent(transcript.trim())}`)
          }
        }

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error("Speech recognition error", event.error)
          setVoiceError(`Error: ${event.error}`)
          setIsListening(false)
        }

        recognition.onend = () => {
          setIsListening(false)
        }
      } else {
        setVoiceError("Your browser doesn't support speech recognition")
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [router])

  const handleSearch = (e: FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      router.push(`/Properties/${encodeURIComponent(searchTerm.trim())}`)
    }
  }

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
      setIsListening(false)
    } else {
      setVoiceError("")
      if (recognitionRef.current) {
        recognitionRef.current.start()
        setIsListening(true)
      } else {
        setVoiceError("Speech recognition not available")
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50 pb-16"
    >
      <Header />

      <motion.div
        className="p-4 max-w-3xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <form onSubmit={handleSearch} className="relative flex items-center w-full">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={isListening ? "Listening..." : "Search here..."}
              className={`pl-10 pr-10 h-10 rounded-l-full md:rounded-l-full border-gray-200 ${isListening ? "bg-red-50" : ""}`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
            >
              <Button
                type="button"
                onClick={toggleListening}
                variant="ghost"
                size="icon"
                className={`h-8 w-8 ${isListening ? "text-red-500" : ""}`}
              >
                {isListening ? <X className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
            </motion.div>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button type="submit" className="bg-red-500 hover:bg-red-600 text-white h-10 rounded-r-full">
              <Search className="h-4 w-4 md:mr-1" />
              <span className="hidden md:inline">Search</span>
            </Button>
          </motion.div>
        </form>

        {voiceError && <p className="text-red-500 text-xs mt-1 ml-2">{voiceError}</p>}
      </motion.div>

      {/* Voice Listening Modal */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center"
          >
            <div className="absolute top-4 right-4">
              <Button variant="ghost" size="icon" onClick={toggleListening} className="text-white hover:bg-white/10">
                <X className="h-6 w-6" />
              </Button>
            </div>

            <motion.h2
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-white text-xl mb-16"
            >
              Listening...
            </motion.h2>

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                }}
                className="absolute inset-0 bg-red-500/30 rounded-full"
                style={{ padding: "30px" }}
              />
              <motion.div
                whileTap={{ scale: 0.95 }}
                className="relative bg-red-500 rounded-full p-6 cursor-pointer"
                onClick={toggleListening}
              >
                <Mic className="h-8 w-8 text-white" />
              </motion.div>
            </motion.div>

            {voiceError && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 mt-8">
                {voiceError}
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="relative h-48 mx-4 rounded-lg overflow-hidden mb-6"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        whileHover={{ scale: 1.02 }}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={bannerImages[currentIndex]}
            src={bannerImages[currentIndex]}
            alt="Featured Property Banner"
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <motion.div
          className="absolute bottom-0 left-0 p-4 text-white"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold">Summer Vacation</h2>
          <p className="flex items-center">
            All discount up to
            <motion.span
              className="ml-1 text-yellow-400 font-bold"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
            >
              40%
            </motion.span>
          </p>
        </motion.div>
      </motion.div>

      <motion.div className="px-4 mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Categories</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { name: "Flats / Apartment", icon: Building2, slug: "flat-apartment" },
            { name: "Farmhouse / Villa", icon: HomeIcon, slug: "farmhouse-villa" },
            { name: "Plots / Lands", icon: Map, slug: "plots-land" },
            { name: "Commercial", icon: Store, slug: "commercial" },
          ].map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index + 0.4 }}
              whileHover={{ scale: 1.05, backgroundColor: "#f0f7ff" }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                href={`/Properties/${category.slug}`}
                className="bg-white p-4 rounded-lg flex items-center gap-3 shadow-sm h-full"
              >
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                  <category.icon className="h-5 w-5" />
                </div>
                <span className="font-medium text-sm">{category.name}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div className="px-4 mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Promoted Property</h3>
          <Link href="/Properties" className="text-sm text-red-500 flex items-center">
            View All
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 h-[400px] animate-pulse"
              />
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No properties found</p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
              Refresh
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {properties.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
              >
                <PropertyCard property={property} />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      <Footer />
    </motion.div>
  )
}
