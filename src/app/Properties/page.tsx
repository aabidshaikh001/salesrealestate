"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import ProtectedRoute from "@/providers/ProtectedRoute"
import MakeNewLeadSheet from "../component/LeadModal"
import { Heart, MapPin, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Type } from "lucide-react"
import { Info } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import Header from "../component/header"
import Footer from "../component/footer"

import { useRouter } from "next/navigation"


// Define the Property type
interface Property {
  PropertyId: string
  title: string
  location: string
  price: string

  images: string[] | string

  brokerage: string

  readyToMove: boolean
  discount: string
  visitBonus: string
  propertyType: string
  propertyFor: "Rent" | "Buy"
  status: string
  bhkOptions: string[]
  isSaved?: boolean
  isFeatured?: boolean
}

// Add these interfaces after the Property interface
interface ApiResponse {
  success: boolean
  data: {
    Status: string[]
    PropertyType: string[]
  }
}

interface SearchParams {
  propertyTag: string
  propertyType: string
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)

  const [priceRange, setPriceRange] = useState([1000, 8000])
  const [viewType, setViewType] = useState<"grid" | "list">("list")

  const [listingType, setListingType] = useState<"Buy" | "Rent">("Buy")
  const [propertyTags, setPropertyTags] = useState<string[]>([])
  const [propertyTypes, setPropertyTypes] = useState<string[]>([])
  const [searchParams, setSearchParams] = useState<SearchParams>({
    propertyTag: "",
    propertyType: "",
  })
  

  // Fetch properties from API
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch("https://api.realestatecompany.co.in/api/properties")
        const data: Property[] = await response.json()

        // Fetch brokerage info for all properties in parallel
        const enrichedProperties = await Promise.all(
          data.map(async (property) => {
            try {
              const brokerageRes = await fetch(
                `https://api.realestatecompany.co.in/api/brokerages/${property.PropertyId}`,
              )
              const brokerageData = await brokerageRes.json()

              // Assuming API returns an array, pick first item or fallback
              const brokerageInfo = Array.isArray(brokerageData) && brokerageData.length > 0 ? brokerageData[0] : null

              return {
                ...property,
                brokerage: brokerageInfo?.brokerage || property.brokerage || null,
                tag: brokerageInfo?.tag || property.status || "",
                discount: brokerageInfo?.discount || property.discount || null,
                visitBonus: brokerageInfo?.visitBonus || property.visitBonus || null,
              }
            } catch (error) {
              // On error, return property as is
              return property
            }
          }),
        )

        setProperties(enrichedProperties)
      } catch (error) {
        console.error("Error fetching properties:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProperties()
  }, [])

  // Fetch category data from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const endpoint =
          listingType === "Buy"
            ? "https://api.realestatecompany.co.in/api/buycategory"
            : "https://api.realestatecompany.co.in/api/rentcategory"

        const response = await fetch(endpoint)
        const result: ApiResponse = await response.json()

        if (result.success && result.data) {
          setPropertyTags(result.data.Status || [])
          setPropertyTypes(result.data.PropertyType || [])

          // Reset search params when switching listing type
          setSearchParams({
            propertyTag: "",
            propertyType: "",
          })
        }
      } catch (error) {
        console.error(`Error fetching ${listingType.toLowerCase()} categories:`, error)
        // Don't set any default values if API fails
        setPropertyTags([])
        setPropertyTypes([])
        setSearchParams({
          propertyTag: "",
          propertyType: "",
        })
      }
    }

    fetchCategories()
  }, [listingType])

  // Toggle saved status
  const toggleSaved = (id: string) => {
    setProperties(
      properties.map((property) =>
        property.PropertyId === id ? { ...property, isSaved: !property.isSaved } : property,
      ),
    )
  }

  // Filter properties based on search query
  const filteredProperties = properties.filter((property) => {
    // First filter by listing type (Buy/Rent)
    const matchesListingType = property.propertyFor === listingType

    // Filter by search query
    const matchesSearch =
      property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.location.toLowerCase().includes(searchQuery.toLowerCase())

    // Filter by selected property tag (status)
    const matchesPropertyTag = !searchParams.propertyTag || property.status === searchParams.propertyTag

    // Filter by selected property type
    const matchesPropertyType = !searchParams.propertyType || property.propertyType === searchParams.propertyType

    return matchesListingType && matchesSearch && matchesPropertyTag && matchesPropertyType
  })

  return (
    <ProtectedRoute>
    <div className="flex flex-col h-full bg-gray-50">
      <Header />
      {/* Mobile Search Bar */}
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 space-y-3">
        {/* First Line: Buy/Rent Toggle + Search Bar */}
        <div className="flex items-center gap-3">
          {/* Buy/Rent Toggle */}
          <div className="flex rounded-xl bg-gray-100 p-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className={`rounded-lg h-10 px-4 text-sm font-semibold transition-all ${
                listingType === "Buy" ? "bg-red-500 text-white shadow-sm" : "text-gray-600"
              }`}
              onClick={() => setListingType("Buy")}
            >
              Buy
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`rounded-lg h-10 px-4 text-sm font-semibold transition-all ${
                listingType === "Rent" ? "bg-red-500 text-white shadow-sm" : "text-gray-600"
              }`}
              onClick={() => setListingType("Rent")}
            >
              Rent
            </Button>
          </div>

          {/* Location Search */}
          <div className="relative flex-1">
            <MapPin className="absolute left-4 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search location (e.g., Jaipur)"
              className="pl-11 pr-11 h-10 rounded-xl border-gray-200 bg-gray-50 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button variant="ghost" size="icon" className="absolute right-2 top-2 h-6 w-6 rounded-lg hover:bg-gray-200">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
              <span className="sr-only">Voice search</span>
            </Button>
          </div>
        </div>

        {/* Second Line: Compact Filter Options + View Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {/* Ready to Move - Compact */}
            <Select
              value={searchParams.propertyTag}
              onValueChange={(value) => setSearchParams((prev) => ({ ...prev, propertyTag: value }))}
            >
              <SelectTrigger className="rounded-full h-8 px-3 border-gray-200 bg-white shadow-sm w-[100px] text-xs flex-shrink-0">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {propertyTags.map((tag) => (
                  <SelectItem key={tag} value={tag}>
                    {tag.charAt(0).toUpperCase() + tag.slice(1).replace("-", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Property Type - Compact */}
            <Select
              value={searchParams.propertyType}
              onValueChange={(value) => setSearchParams((prev) => ({ ...prev, propertyType: value }))}
            >
              <SelectTrigger className="rounded-full h-8 px-3 border-gray-200 bg-white shadow-sm w-[110px] text-xs flex-shrink-0">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {propertyTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1).replace("-", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* More Filters - Compact */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full h-8 w-8 border-gray-200 bg-white shadow-sm flex-shrink-0"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                    />
                  </svg>
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl">
                <SheetHeader className="mb-6">
                  <SheetTitle className="text-xl">Filter Properties</SheetTitle>
                </SheetHeader>

                <div className="space-y-6 overflow-auto h-[calc(100%-10rem)]">
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="price" className="border-gray-100">
                      <AccordionTrigger className="text-base font-semibold">Price Range</AccordionTrigger>
                      <AccordionContent className="pt-4">
                        <div className="space-y-6 px-2">
                          <Slider
                            defaultValue={[1000, 8000]}
                            max={10000}
                            min={0}
                            step={100}
                            onValueChange={(value) => setPriceRange(value as [number, number])}
                            className="w-full"
                          />
                          <div className="flex justify-between">
                            <div className="text-base font-semibold text-red-600">${priceRange[0]}</div>
                            <div className="text-base font-semibold text-red-600">${priceRange[1]}</div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                  </Accordion>
                </div>

                <SheetFooter className="flex-row gap-4 mt-6 pt-4 border-t">
                  <Button variant="outline" className="flex-1 h-12 text-base font-semibold rounded-xl">
                    Reset All
                  </Button>
                  <SheetClose asChild>
                    <Button className="flex-1 h-12 text-base font-semibold bg-red-500 hover:bg-red-600 rounded-xl">
                      Apply Filters
                    </Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>

          {/* View Toggle - Fixed on the right */}
          <div className="flex rounded-lg bg-gray-100 p-0.5 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className={`rounded-md h-7 w-7 p-0 ${viewType === "grid" ? "bg-white shadow-sm" : ""}`}
              onClick={() => setViewType("grid")}
            >
              <div className="grid grid-cols-2 gap-0.5">
                <div className="w-1 h-1 bg-current rounded-sm"></div>
                <div className="w-1 h-1 bg-current rounded-sm"></div>
                <div className="w-1 h-1 bg-current rounded-sm"></div>
                <div className="w-1 h-1 bg-current rounded-sm"></div>
              </div>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`rounded-md h-7 w-7 p-0 ${viewType === "list" ? "bg-white shadow-sm" : ""}`}
              onClick={() => setViewType("list")}
            >
              <div className="flex flex-col gap-0.5 items-center">
                <div className="w-3 h-0.5 bg-current rounded-sm"></div>
                <div className="w-3 h-0.5 bg-current rounded-sm"></div>
                <div className="w-3 h-0.5 bg-current rounded-sm"></div>
              </div>
            </Button>
          </div>
        </div>
      </div>

      {/* Properties List */}
      <div className="flex-1 overflow-auto px-4 py-3">
        <div className={`space-y-3 pb-4 ${viewType === "grid" ? "grid grid-cols-2 gap-3 space-y-0" : ""}`}>
          {filteredProperties.length > 0 ? (
            filteredProperties.map((property) => (
              <PropertyCard
                key={property.PropertyId}
                property={property}
                viewType={viewType}
                onToggleSaved={toggleSaved}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="h-10 w-10 text-muted-foreground mb-4" />
              <h2 className="text-lg font-semibold mb-1">No properties found</h2>
              <p className="text-sm text-muted-foreground max-w-xs">
                We couldn&apos;t find any properties matching your search criteria. Try adjusting your filters.
              </p>
              <Button className="mt-4 bg-red-500 hover:bg-red-600" onClick={() => setSearchQuery("")}>
                Clear Search
              </Button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
    </ProtectedRoute>
  )
}

function PropertyCard({
  property,
  viewType,
  onToggleSaved,
}: {
  property: Property
  viewType: "grid" | "list"
  onToggleSaved: (id: string) => void
}) {
  const router = useRouter()

  // Parse images array
  const imagesArray: string[] = Array.isArray(property.images)
    ? property.images
    : typeof property.images === "string"
      ? JSON.parse(property.images || "[]")
      : []

  // Parse BHK options
  const bhkOptionsArray = Array.isArray(property.bhkOptions)
    ? property.bhkOptions
    : typeof property.bhkOptions === "string"
      ? JSON.parse(property.bhkOptions || "[]")
      : []
       const [isModalOpen, setIsModalOpen] = useState(false)

  if (viewType === "grid") {
    return (
      <>
      <Card className="overflow-hidden shadow-sm border-gray-100 h-full flex flex-col">
        <div className="relative">
          <div className="relative aspect-[4/3] w-full overflow-hidden">
            {imagesArray.length > 0 ? (
              <Image
                src={imagesArray[0] || "/placeholder.svg"}
                alt={property.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <Image
                  src="/placeholder.svg"
                  alt="No image available"
                  width={100}
                  height={100}
                  className="opacity-50"
                />
              </div>
            )}
          </div>
          <div className="absolute top-[2px] left-[2px] flex flex-col gap-[1px] sm:gap-1">
            <Badge className="flex items-center gap-[1px] sm:gap-1 px-[2px] py-[1px] sm:px-2 sm:py-1 rounded bg-neutral-900/70 text-white shadow border border-neutral-700 backdrop-blur-sm">
              <div className="w-1 h-1 sm:w-2 sm:h-2 rounded-full bg-red-400 animate-ping"></div>
              <span className="text-[8px] sm:text-xs font-medium tracking-tight">
                {property.propertyFor === "Rent" ? "FOR RENT" : "FOR SALE"}
              </span>
            </Badge>

            {property.propertyType && (
              <Badge className="flex items-center px-[2px] py-[1px] sm:px-2 sm:py-1 rounded bg-green-500/80 text-white shadow border border-green-400 backdrop-blur-sm">
                <Type className="w-1 h-1 sm:w-2.5 sm:h-2.5 mr-0.5" />
                <span className="text-[8px] sm:text-xs font-medium tracking-tight">{property.propertyType}</span>
              </Badge>
            )}

            {property.status && (
              <Badge className="flex items-center px-[2px] py-[1px] sm:px-2 sm:py-1 rounded bg-yellow-500/80 text-white shadow border border-yellow-400 backdrop-blur-sm">
                <Info className="w-1 h-1 sm:w-2.5 sm:h-2.5 mr-0.5" />
                <span className="text-[8px] sm:text-xs font-medium tracking-tight">{property.status}</span>
              </Badge>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className={`absolute right-1 top-1 h-7 w-7 rounded-full bg-white/80 hover:bg-white ${property.isSaved ? "text-red-500" : "text-gray-500"}`}
            onClick={() => onToggleSaved(property.PropertyId)}
          >
            <Heart className={`h-4 w-4 ${property.isSaved ? "fill-current" : ""}`} />
            <span className="sr-only">Save property</span>
          </Button>

          {property.readyToMove && (
            <Badge
              variant="outline"
              className="absolute left-1 bottom-1 bg-green-500 text-white border-none text-xs py-0 px-1.5"
            >
              Ready
            </Badge>
          )}
        </div>

        <CardContent className="p-2 flex-1 flex flex-col">
          <div className="mb-1">
            <div className="font-bold text-red-600 text-sm">{property.price}</div>
            <h3 className="font-medium text-xs line-clamp-1">{property.title}</h3>
            <div className="flex items-center text-muted-foreground">
              <MapPin className="h-2.5 w-2.5 mr-0.5 flex-shrink-0" />
              <span className="text-xs line-clamp-1">{property.location}</span>
            </div>
          </div>

          <div className="mt-auto pt-1 flex flex-wrap gap-1">
            {Array.isArray(bhkOptionsArray) && bhkOptionsArray.length > 0 ? (
              bhkOptionsArray.map((option, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-xs bg-red-50 text-red-700 border-red-100 px-1 py-0"
                >
                  {typeof option === "object" && option !== null ? `${option.bhk} - ${option.size}` : option}
                </Badge>
              ))
            ) : (
              <span className="text-gray-500 text-xs">No options available</span>
            )}
          </div>
        </CardContent>
      </Card>
      </>
    )
  }

  // List View
  return (
    <>
    <Card className="overflow-hidden shadow-sm border-gray-100">
      <div className="flex flex-col sm:flex-row">
        {/* Image Section */}
        <div className="relative h-48 w-full sm:w-1/3">
          <div className="relative h-full w-full aspect-[4/3] sm:aspect-square">
            {imagesArray.length > 0 ? (
              <Image
                src={imagesArray[0] || "/placeholder.svg"}
                alt={property.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <Image
                  src="/placeholder.svg"
                  alt="No image available"
                  width={100}
                  height={100}
                  className="opacity-50"
                />
              </div>
            )}
          </div>
          <div className="absolute top-2 left-2 flex flex-col gap-0.5 sm:gap-1">
            <Badge className="flex items-center gap-0.5 sm:gap-1 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded bg-neutral-900/70 text-white shadow border border-neutral-700 backdrop-blur-sm">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-400 animate-ping"></div>
              <span className="text-[10px] sm:text-xs font-medium tracking-tight">
                {property.propertyFor === "Rent" ? "FOR RENT" : "FOR SALE"}
              </span>
            </Badge>

            {property.propertyType && (
              <Badge className="flex items-center px-1.5 py-0.5 sm:px-2 sm:py-1 rounded bg-green-500/80 text-white shadow border border-green-400 backdrop-blur-sm">
                <Type className="w-2 h-2 sm:w-2.5 sm:h-2.5 mr-1" />
                <span className="text-[10px] sm:text-xs font-medium tracking-tight">{property.propertyType}</span>
              </Badge>
            )}

            {property.status && (
              <Badge className="flex items-center px-1.5 py-0.5 sm:px-2 sm:py-1 rounded bg-yellow-500/80 text-white shadow border border-yellow-400 backdrop-blur-sm">
                <Info className="w-2 h-2 sm:w-2.5 sm:h-2.5 mr-1" />
                <span className="text-[10px] sm:text-xs font-medium tracking-tight">{property.status}</span>
              </Badge>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className={`absolute right-1 top-1 h-7 w-7 rounded-full bg-white/80 hover:bg-white ${property.isSaved ? "text-red-500" : "text-gray-500"}`}
            onClick={() => onToggleSaved(property.PropertyId)}
          >
            <Heart className={`h-4 w-4 ${property.isSaved ? "fill-current" : ""}`} />
            <span className="sr-only">Save property</span>
          </Button>

          {property.readyToMove && (
            <Badge
              variant="outline"
              className="absolute left-1 bottom-1 bg-green-500 text-white border-none text-xs py-0 px-1.5"
            >
              Ready
            </Badge>
          )}
        </div>

        {/* Content Section */}
        <CardContent className="p-3 w-full sm:w-2/3">
          <div className="mb-1.5">
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-sm line-clamp-1">{property.title}</h3>
              <span className="font-bold text-red-600 text-sm">{property.price}</span>
            </div>
            <div className="flex items-center text-muted-foreground">
              <MapPin className="h-3 w-3 mr-0.5 flex-shrink-0" />
              <span className="text-xs line-clamp-1">{property.location}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-y-1 mb-2.5 text-xs">
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-red-500 mr-1.5"></div>
              <span className="text-muted-foreground">Brokerage:</span>
              <span className="ml-1 font-medium">{property.brokerage}</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-1.5"></div>
              <span className="text-muted-foreground">Discount:</span>
              <span className="ml-1 font-medium">
                {property.discount && typeof property.discount === "string"
                  ? property.discount.split(" ")[0]
                  : "No discount available"}
              </span>
            </div>
          </div>

          {/* BHK Options */}
          <div className="flex flex-wrap gap-1 mb-2">
            {Array.isArray(bhkOptionsArray) && bhkOptionsArray.length > 0 ? (
              bhkOptionsArray.map((option, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-xs bg-red-50 text-red-700 border-red-100 px-1.5 py-0"
                >
                  {typeof option === "object" && option !== null ? `${option.bhk} - ${option.size}` : option}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-gray-400">No BHK options available</p>
            )}
          </div>

         {/* Action Buttons */}
<div className="flex flex-wrap gap-2 sm:gap-3 justify-between sm:justify-start w-full">
  <Button
    size="sm"
    className="bg-red-500 hover:bg-red-600 text-white text-xs h-8 px-4 rounded-full w-full sm:w-auto"
    onClick={() => setIsModalOpen(true)}
  >
    Create Lead
  </Button>
  
  <Button
    size="sm"
    variant="outline"
    className="border border-red-500 text-red-500 hover:bg-red-100 text-xs h-8 px-4 rounded-full w-full sm:w-auto"
    onClick={() => router.push(`/property/${property.PropertyId}`)}
  >
    View Details
  </Button>
</div>

        </CardContent>
      </div>
    </Card>
    
          <MakeNewLeadSheet 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
          />
          </>
  )
}
