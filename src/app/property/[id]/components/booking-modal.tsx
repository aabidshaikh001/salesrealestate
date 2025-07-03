  "use client"

  import type React from "react"

  import { useState, useEffect } from "react"
  import { X, Calendar, Clock, Check, Loader2 } from "lucide-react"
  import { motion, AnimatePresence } from "framer-motion"
  import { Button } from "@/components/ui/button"
  import { Input } from "@/components/ui/input"
  import { Label } from "@/components/ui/label"
  import { Slider } from "@/components/ui/slider"
  import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
  import { Calendar as CalendarComponent } from "@/components/ui/calendar"
  import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
  import { format } from "date-fns"
  import { cn } from "@/lib/utils"
     
  import { toast, ToastContainer } from "react-toastify"

     
  import "react-toastify/dist/ReactToastify.css"
  import Image from "next/image"

  interface BookingModalProps {
    isOpen: boolean
    onClose: () => void
    propertyId?: string // Make propertyId optional
    propertyName?: string // Make propertyName optional
    isFromFooter?: boolean // Add a flag to indicate if opened from footer
  }

  interface FormData {
    propertyId?: string // Make propertyId optional in form data
    propertyName: string
    clientName: string
    phoneNumber: string
    email: string
    requirement: string
    priceRange: number[]
    date: Date | undefined
    timeSlot: string
  }

  interface Country {
    name: string
    code: string
    dialCode: string
    flag: string
  }

  interface CountryApiResponse {
    name: {
      common: string
    }
    idd: {
      root: string
      suffixes: string[]
    }
    flags: {
      svg: string
      png: string
    }
  }

  // Add property options for when opened from footer
  const propertyOptions = [
    { id: "prop1", name: "Godrej Splendour" },
    { id: "prop2", name: "Prestige City" },
    { id: "prop3", name: "Brigade Cornerstone" },
    { id: "prop4", name: "Sobha Dream Acres" },
  ]

  const requirementOptions = [
    "2 BHK, 3 BHK - ₹ 3.94 - 6.01 Cr - Jakarta, Malang",
    "2 BHK, 3 BHK - ₹ 3.94 - 6.01 Cr - Jakarta, Malang",
    "2 BHK, 3 BHK - ₹ 3.94 - 6.01 Cr - Jakarta, Malang",
    "2 BHK, 3 BHK - ₹ 3.94 - 6.01 Cr - Jakarta, Malang",
  ]

  const timeSlots = {
    morning: ["10:00 AM", "11:00 AM", "12:00 PM"],
    afternoon: ["01:00 PM", "02:00 PM", "03:00 PM"],
    evening: ["04:00 PM", "05:00 PM", "06:00 PM"],
  }

  // Change the createBooking function to use the data parameter
  const createBooking = async (data: {
    propertyId?: string // Make propertyId optional
    propertyName: string
    clientName: string
    phoneNumber: string
    email: string
    requirement: string
    priceRange: string
    date: string
    timeSlot: string
    country?: string
  }): Promise<{ success: boolean; bookingId: string }> => {
    try {
     
     
  
      const response = await fetch("https://api.realestatecompany.co.in/api/booking", {
     
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const result = await response.json()
      return {
        success: true,
        bookingId: result.bookingId || `BK-${Date.now()}`,
      }
    } catch (error) {
      console.error("Error creating booking:", error)
      throw error
    }
  }

  export default function BookingModal({
    isOpen,
    onClose,
    propertyId,
    propertyName = "",
    isFromFooter = false,
  }: BookingModalProps) {
    const [loading, setLoading] = useState(false)
    const [loadingCountries, setLoadingCountries] = useState(true)
    const [countries, setCountries] = useState<Country[]>([])
    const [formData, setFormData] = useState<FormData>({
      propertyId: isFromFooter ? "" : propertyId, // Don't set propertyId if from footer
      propertyName: isFromFooter ? "" : propertyName, // Don't set propertyName if from footer
      clientName: "",
      phoneNumber: "",
      email: "",
      requirement: "",
      priceRange: [40, 140],
      date: undefined,
      timeSlot: "",
    })
    const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
    const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)

    // Fetch countries from REST Countries API
    useEffect(() => {
      const fetchCountries = async () => {
        try {
          setLoadingCountries(true)
          const response = await fetch("https://restcountries.com/v3.1/all?fields=name,flags,idd")
          const data = await response.json()

          const formattedCountries: Country[] = data
            .filter((country: CountryApiResponse) => country.idd.root && country.idd.suffixes && country.idd.suffixes[0])
            .map((country: CountryApiResponse) => ({
              name: country.name.common,
              code: country.name.common.substring(0, 2).toUpperCase(),
              dialCode: `${country.idd.root}${country.idd.suffixes[0]}`,
              flag: country.flags.svg || country.flags.png,
            }))
            .sort((a: Country, b: Country) => a.name.localeCompare(b.name))

          setCountries(formattedCountries)

          // Set India as default if available
          const india = formattedCountries.find((c) => c.name === "India")
          if (india) {
            setSelectedCountry(india)
          } else if (formattedCountries.length > 0) {
            setSelectedCountry(formattedCountries[0])
          }
        } catch (error) {
          console.error("Error fetching countries:", error)
          // Fallback to basic country list
          const fallbackCountries: Country[] = [
            { name: "India", code: "IN", dialCode: "+91", flag: "https://flagcdn.com/in.svg" },
            { name: "United States", code: "US", dialCode: "+1", flag: "https://flagcdn.com/us.svg" },
            { name: "United Kingdom", code: "GB", dialCode: "+44", flag: "https://flagcdn.com/gb.svg" },
          ]
          setCountries(fallbackCountries)
          setSelectedCountry(fallbackCountries[0])
        } finally {
          setLoadingCountries(false)
        }
      }

      fetchCountries()
    }, [])

    // Reset form when modal opens
    useEffect(() => {
      if (isOpen) {
        setFormData({
          propertyId: isFromFooter ? "" : propertyId, // Don't set propertyId if from footer
          propertyName: isFromFooter ? "" : propertyName, // Don't set propertyName if from footer
          clientName: "",
          phoneNumber: "",
          email: "",
          requirement: "",
          priceRange: [40, 140],
          date: undefined,
          timeSlot: "",
        })
        setErrors({})
      }
    }, [isOpen, propertyId, propertyName, isFromFooter])

    const validateForm = () => {
      const newErrors: Partial<Record<keyof FormData, string>> = {}

      // If opened from footer, property selection is required
      if (isFromFooter && !formData.propertyName) newErrors.propertyName = "Property selection is required"
      if (!formData.clientName) newErrors.clientName = "Client name is required"
      if (!formData.phoneNumber) newErrors.phoneNumber = "Phone number is required"
      if (!formData.email) newErrors.email = "Email is required"
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid"
      if (!formData.requirement) newErrors.requirement = "Requirement is required"
      if (!formData.date) newErrors.date = "Date is required"
      if (!formData.timeSlot) newErrors.timeSlot = "Time slot is required"

      setErrors(newErrors)
      return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()

      if (!validateForm()) return

      setLoading(true)

      try {
        // Prepare booking data
        const bookingData = {
          propertyId: formData.propertyId,
          propertyName: formData.propertyName,
          clientName: formData.clientName,
          phoneNumber: selectedCountry ? `${selectedCountry.dialCode}-${formData.phoneNumber}` : formData.phoneNumber,
          email: formData.email,
          requirement: formData.requirement,
          priceRange: `₹${formData.priceRange[0]}k - ₹${formData.priceRange[1]}k`,
          date: formData.date ? format(formData.date, "yyyy-MM-dd") : "",
          timeSlot: formData.timeSlot,
          country: selectedCountry?.name,
        }

        // Call booking service
        try {
          const result = await createBooking(bookingData)

          if (result.success) {
            toast.success(
              `Booking Successful! Your visit has been scheduled for ${format(formData.date!, "PPP")} at ${formData.timeSlot}. Booking ID: ${result.bookingId}`,
            )
            onClose()
          }
        } catch (error) {
          console.error("Booking failed:", error)
          toast.error("Booking failed. Please try again later.")
        }
      } finally {
        setLoading(false)
      }
    }

    const handleTimeSlotSelect = (slot: string) => {
      setFormData((prev) => ({ ...prev, timeSlot: slot }))
      setErrors((prev) => ({ ...prev, timeSlot: undefined }))
    }

    const handlePropertySelect = (propertyId: string, propertyName: string) => {
      setFormData((prev) => ({ ...prev, propertyId, propertyName }))
      setErrors((prev) => ({ ...prev, propertyName: undefined }))
    }

    return (
      <AnimatePresence>
     
        <ToastContainer />
  
    
     
        {isOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />

            {/* Bottom Sheet */}
            <motion.div
              className="absolute inset-x-0 bottom-0 w-full bg-white rounded-t-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
              style={{ maxHeight: "90vh", touchAction: "pan-y" }}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              drag={!isOpen ? "y" : false}
              dragConstraints={{ top: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                if (info.offset.y > 100) {
                  onClose()
                }
              }}
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-2 pb-1">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
              </div>

              <div className="p-6 relative">
                <button
                  onClick={onClose}
                  className="absolute right-6 top-6 text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full p-1.5 transition-colors"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>

                <h2 className="text-2xl font-bold text-center mb-8">Make A New Lead</h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Property field - either dropdown (from footer) or disabled input (from property page) */}
                  <div className="space-y-1.5">
                    <Label htmlFor="propertyName" className="text-sm font-medium">
                      Property Name*
                    </Label>

                    {isFromFooter ? (
                      <>
                        <Select
                          value={formData.propertyId}
                          onValueChange={(value) => {
                            const property = propertyOptions.find((p) => p.id === value)
                            if (property) {
                              handlePropertySelect(property.id, property.name)
                            }
                          }}
                        >
                          <SelectTrigger
                            className={cn(
                              "rounded-lg",
                              errors.propertyName && "border-red-500 focus-visible:ring-red-500",
                            )}
                          >
                            <SelectValue placeholder="Select property" />
                          </SelectTrigger>
                          <SelectContent>
                            {propertyOptions.map((property) => (
                              <SelectItem key={property.id} value={property.id}>
                                {property.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </>
                    ) : (
                      <Input id="propertyName" value={formData.propertyName} className="rounded-lg" disabled />
                    )}

                    {errors.propertyName && <p className="text-red-500 text-xs mt-1">{errors.propertyName}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="clientName" className="text-sm font-medium">
                      Client Name*
                    </Label>
                    <Input
                      id="clientName"
                      value={formData.clientName}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, clientName: e.target.value }))
                        setErrors((prev) => ({ ...prev, clientName: undefined }))
                      }}
                      className={cn("rounded-lg", errors.clientName && "border-red-500 focus-visible:ring-red-500")}
                      placeholder="Enter your full name"
                    />
                    {errors.clientName && <p className="text-red-500 text-xs mt-1">{errors.clientName}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="phoneNumber" className="text-sm font-medium">
                      Phone Number*
                    </Label>
                    <div className="flex mt-1">
                      <div className="flex-shrink-0">
                        <Select
                          value={selectedCountry?.code || ""}
                          onValueChange={(value) => {
                            const country = countries.find((c) => c.code === value)
                            if (country) setSelectedCountry(country)
                          }}
                          disabled={loadingCountries}
                        >
                          <SelectTrigger className="w-[100px] border-r-0 rounded-r-none rounded-l-lg">
                            <SelectValue>
                              {loadingCountries ? (
                                <div className="flex items-center">
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Loading
                                </div>
                              ) : selectedCountry ? (
                                <div className="flex items-center">
                                  <Image
                                    src={selectedCountry.flag || "/placeholder.svg"}
                                    alt={selectedCountry.name}
                                    width={20}
                                    height={15}
                                    className="w-5 h-5 mr-1 object-cover rounded-sm"
                                  />
                                  {selectedCountry.dialCode}
                                </div>
                              ) : (
                                "Select"
                              )}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent className="max-h-[300px]">
                            {countries.map((country) => (
                              <SelectItem key={country.code} value={country.code}>
                                <div className="flex items-center">
                                  <Image
                                    src={country.flag || "/placeholder.svg"}
                                    alt={country.name}
                                    width={20}
                                    height={15}
                                    className="w-5 h-5 mr-2 object-cover rounded-sm"
                                  />
                                  <span className="mr-1">{country.dialCode}</span>
                                  <span className="text-xs text-gray-500 truncate max-w-[100px]">{country.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Input
                        id="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={(e) => {
                          setFormData((prev) => ({ ...prev, phoneNumber: e.target.value }))
                          setErrors((prev) => ({ ...prev, phoneNumber: undefined }))
                        }}
                        className={cn(
                          "flex-grow rounded-l-none rounded-r-lg",
                          errors.phoneNumber && "border-red-500 focus-visible:ring-red-500",
                        )}
                        placeholder="Phone number"
                      />
                    </div>
                    {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email*
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, email: e.target.value }))
                        setErrors((prev) => ({ ...prev, email: undefined }))
                      }}
                      className={cn("rounded-lg", errors.email && "border-red-500 focus-visible:ring-red-500")}
                      placeholder="your.email@example.com"
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="requirement" className="text-sm font-medium">
                      Requirement*
                    </Label>
                    <Select
                      value={formData.requirement}
                      onValueChange={(value) => {
                        setFormData((prev) => ({ ...prev, requirement: value }))
                        setErrors((prev) => ({ ...prev, requirement: undefined }))
                      }}
                    >
                      <SelectTrigger
                        className={cn("rounded-lg", errors.requirement && "border-red-500 focus-visible:ring-red-500")}
                      >
                        <SelectValue placeholder="Choose" />
                      </SelectTrigger>
                      <SelectContent>
                        {requirementOptions.map((option, index) => (
                          <SelectItem key={index} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.requirement && <p className="text-red-500 text-xs mt-1">{errors.requirement}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Price range*</Label>
                    <div className="pt-6 px-2">
                      <Slider
                        defaultValue={[40, 140]}
                        max={200}
                        step={1}
                        value={formData.priceRange}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, priceRange: value as number[] }))}
                        className="mt-1"
                      />
                      <div className="flex justify-between mt-2 text-sm">
                        <span className="font-medium">₹{formData.priceRange[0]}k</span>
                        <span className="font-medium">₹{formData.priceRange[1]}k</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="date" className="text-sm font-medium">
                      Date*
                    </Label>
                    <div className="mt-1">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal rounded-lg",
                              !formData.date && "text-muted-foreground",
                              errors.date && "border-red-500 focus-visible:ring-red-500",
                            )}
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {formData.date ? format(formData.date, "PPP") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <CalendarComponent
                            mode="single"
                            selected={formData.date}
                            onSelect={(date) => {
                              setFormData((prev) => ({ ...prev, date }))
                              setErrors((prev) => ({ ...prev, date: undefined }))
                            }}
                            initialFocus
                            disabled={(date) => date < new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Choose Slot*</Label>
                    {errors.timeSlot && <p className="text-red-500 text-xs mt-1">{errors.timeSlot}</p>}

                    <div className="mt-2 space-y-5">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                          <Clock className="w-4 h-4 mr-1.5 text-blue-500" />
                          Morning Slots
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          {timeSlots.morning.map((slot) => (
                            <motion.button
                              key={slot}
                              type="button"
                              onClick={() => handleTimeSlotSelect(slot)}
                              className={cn(
                                "py-2 px-1 rounded-lg text-xs font-medium transition-all",
                                formData.timeSlot === slot
                                  ? "bg-blue-500 text-white shadow-md"
                                  : "bg-white border border-gray-200 text-gray-700 hover:border-blue-300",
                              )}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              {slot}
                              {formData.timeSlot === slot && (
                                <motion.span
                                  className="ml-1 inline-block"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                >
                                  <Check className="w-3 h-3 inline" />
                                </motion.span>
                              )}
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                          <Clock className="w-4 h-4 mr-1.5 text-blue-500" />
                          Afternoon Slots
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          {timeSlots.afternoon.map((slot) => (
                            <motion.button
                              key={slot}
                              type="button"
                              onClick={() => handleTimeSlotSelect(slot)}
                              className={cn(
                                "py-2 px-1 rounded-lg text-xs font-medium transition-all",
                                formData.timeSlot === slot
                                  ? "bg-blue-500 text-white shadow-md"
                                  : "bg-white border border-gray-200 text-gray-700 hover:border-blue-300",
                              )}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              {slot}
                              {formData.timeSlot === slot && (
                                <motion.span
                                  className="ml-1 inline-block"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                >
                                  <Check className="w-3 h-3 inline" />
                                </motion.span>
                              )}
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                          <Clock className="w-4 h-4 mr-1.5 text-blue-500" />
                          Evening Slots
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          {timeSlots.evening.map((slot) => (
                            <motion.button
                              key={slot}
                              type="button"
                              onClick={() => handleTimeSlotSelect(slot)}
                              className={cn(
                                "py-2 px-1 rounded-lg text-xs font-medium transition-all",
                                formData.timeSlot === slot
                                  ? "bg-blue-500 text-white shadow-md"
                                  : "bg-white border border-gray-200 text-gray-700 hover:border-blue-300",
                              )}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              {slot}
                              {formData.timeSlot === slot && (
                                <motion.span
                                  className="ml-1 inline-block"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                >
                                  <Check className="w-3 h-3 inline" />
                                </motion.span>
                              )}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <motion.div
                    className="pt-4 pb-6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Button
                      type="submit"
                      className="w-full bg-blue-500 hover:bg-blue-600 rounded-lg py-6 text-base font-medium"
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="flex items-center">
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating Lead...
                        </span>
                      ) : (
                        "Create Lead"
                      )}
                    </Button>
                  </motion.div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    )
  }

