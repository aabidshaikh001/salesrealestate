"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Heart, MapPin, Search, Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"
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
  id: string
  title: string
  location: string
  price: string

  images: string[] | string

  brokerage: string
  tag: string
  readyToMove: boolean
  discount: string
  visitBonus: string

  bhkOptions: string[]
  isSaved?: boolean
  isFeatured?: boolean
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  const [priceRange, setPriceRange] = useState([1000, 8000])
  const [viewType, setViewType] = useState<"grid" | "list">("list")
  const [sortOption, setSortOption] = useState("recommended")

  // Fetch properties from API
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch("https://api.realestatecompany.co.in/api/properties") // Replace with your actual API URL
        if (!response.ok) throw new Error("Failed to fetch properties")
        const data: Property[] = await response.json()
        setProperties(data)
      } catch (err) {
        console.error(err)
        console.log("Failed to load properties. Please try again later.")
      }
    }

    fetchProperties()
  }, [])

  // Toggle saved status
  const toggleSaved = (id: string) => {
    setProperties(
      properties.map((property) => (property.id === id ? { ...property, isSaved: !property.isSaved } : property)),
    )
  }

  // Filter properties based on search query
  const filteredProperties = properties.filter(
    (property) =>
      property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.location.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <Header />
      {/* Search and Filter Bar */}
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by location or property name"
            className="pl-9 pr-4 h-9 rounded-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1.5 h-6 w-6 rounded-full"
              onClick={() => setSearchQuery("")}
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Clear search</span>
            </Button>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="rounded-full text-xs h-8 px-3 flex-1">
                <Filter className="h-3.5 w-3.5 mr-1.5" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh] rounded-t-xl">
              <SheetHeader className="mb-4">
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>

              <div className="space-y-4 overflow-auto h-[calc(100%-8rem)]">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="price">
                    <AccordionTrigger>Price Range</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 px-1">
                        <Slider
                          defaultValue={[1000, 8000]}
                          max={10000}
                          min={0}
                          step={100}
                          onValueChange={(value) => setPriceRange(value as [number, number])}
                        />
                        <div className="flex justify-between">
                          <div className="text-sm font-medium">${priceRange[0]}</div>
                          <div className="text-sm font-medium">${priceRange[1]}</div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="property-type">
                    <AccordionTrigger>Property Type</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        {["Apartment", "Villa", "House", "Penthouse", "Studio"].map((type) => (
                          <div key={type} className="flex items-center space-x-2">
                            <Checkbox id={`type-${type}`} />
                            <label
                              htmlFor={`type-${type}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {type}
                            </label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="bhk">
                    <AccordionTrigger>BHK Options</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        {["Studio", "1 BHK", "2 BHK", "3 BHK", "4 BHK", "5+ BHK"].map((bhk) => (
                          <div key={bhk} className="flex items-center space-x-2">
                            <Checkbox id={`bhk-${bhk}`} />
                            <label
                              htmlFor={`bhk-${bhk}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {bhk}
                            </label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="ready">
                    <AccordionTrigger>Ready to Move</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="ready-yes" />
                          <label
                            htmlFor="ready-yes"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Ready to Move
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="ready-no" />
                          <label
                            htmlFor="ready-no"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Under Construction
                          </label>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="amenities">
                    <AccordionTrigger>Amenities</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        {["Swimming Pool", "Gym", "Parking", "Security", "Elevator", "Garden"].map((amenity) => (
                          <div key={amenity} className="flex items-center space-x-2">
                            <Checkbox id={`amenity-${amenity}`} />
                            <label
                              htmlFor={`amenity-${amenity}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {amenity}
                            </label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>

              <SheetFooter className="flex-row gap-3 mt-4">
                <Button variant="outline" className="flex-1">
                  Reset
                </Button>
                <SheetClose asChild>
                  <Button className="flex-1 bg-red-500 hover:bg-red-600">Apply Filters</Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>

          <Select value={sortOption} onValueChange={setSortOption}>
            <SelectTrigger className="rounded-full text-xs h-8 px-3 flex-1">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recommended">Recommended</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex rounded-full bg-gray-100 p-0.5">
            <Button
              variant="ghost"
              size="sm"
              className={`rounded-full h-7 w-7 p-0 ${viewType === "grid" ? "bg-white shadow-sm" : ""}`}
              onClick={() => setViewType("grid")}
            >
              <div className="grid grid-cols-2 gap-0.5">
                <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
              </div>
              <span className="sr-only">Grid view</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`rounded-full h-7 w-7 p-0 ${viewType === "list" ? "bg-white shadow-sm" : ""}`}
              onClick={() => setViewType("list")}
            >
              <div className="flex flex-col gap-0.5 items-center">
                <div className="w-3.5 h-1.5 bg-current rounded-sm"></div>
                <div className="w-3.5 h-1.5 bg-current rounded-sm"></div>
                <div className="w-3.5 h-1.5 bg-current rounded-sm"></div>
              </div>
              <span className="sr-only">List view</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Properties List */}
      <div className="flex-1 overflow-auto px-4 py-3">
        <div className={`space-y-3 pb-4 ${viewType === "grid" ? "grid grid-cols-2 gap-3 space-y-0" : ""}`}>
          {filteredProperties.length > 0 ? (
            filteredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} viewType={viewType} onToggleSaved={toggleSaved} />
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

  if (viewType === "grid") {
    return (
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

          <Badge className="absolute left-1 top-1 bg-red-500 text-xs py-0 px-1.5">{property.tag}</Badge>

          <Button
            variant="ghost"
            size="icon"
            className={`absolute right-1 top-1 h-7 w-7 rounded-full bg-white/80 hover:bg-white ${property.isSaved ? "text-red-500" : "text-gray-500"}`}
            onClick={() => onToggleSaved(property.id)}
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
    )
  }

  // List View
  return (
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

          <Badge className="absolute left-1 top-1 bg-red-500 text-xs py-0 px-1.5">{property.tag}</Badge>

          <Button
            variant="ghost"
            size="icon"
            className={`absolute right-1 top-1 h-7 w-7 rounded-full bg-white/80 hover:bg-white ${property.isSaved ? "text-red-500" : "text-gray-500"}`}
            onClick={() => onToggleSaved(property.id)}
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
          <div className="flex flex-wrap gap-2 justify-between sm:justify-start">
            <Button size="sm" className="bg-red-500 hover:bg-red-600 text-xs h-8 px-3 rounded-full flex-1 sm:flex-none">
              Contact
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-red-500 text-red-500 hover:bg-red-50 text-xs h-8 px-3 rounded-full flex-1"
              onClick={() => router.push(`/property/${property.id}`)}
            >
              Details
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  )
}
