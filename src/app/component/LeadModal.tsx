"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { X, CheckCircle, Loader2, Phone, Mail, User, Search, ChevronDown } from "lucide-react"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/providers/auth-provider"

interface MakeNewLeadSheetProps {
  isOpen: boolean
  onClose: () => void
}

interface Property {
  PropertyId: string
  title: string
  propertyFor: "Buy" | "Rent"
  propertyType: string
  status: string
  REMCategoryCode?: string
  REMPropTagCode?: string
}

interface Category {
  REMCategoryCode: string
  Name: string
  REMPropStatusCode: string
}

interface Tag {
  REMPropTagCode: string
  Name: string
  REMPropStatusCode: string
}

export default function MakeNewLeadSheet({ isOpen, onClose }: MakeNewLeadSheetProps) {
  const { user, token } = useAuth()
  const [formData, setFormData] = useState({
    propertyId: "",
    propertyName: "",
    propertyFor: "" as "Buy" | "Rent" | "",
    propertyType: "",
    propertyStatus: "",
    name: "",
    email: "",
    phone: "",
    REMCategoryCode: "",
    REMPropTagCode: "",
  })

  const [propertyOptions, setPropertyOptions] = useState<Property[]>([])
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)
  const [isLoadingTags, setIsLoadingTags] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)

  // Search dropdown states
  const [searchQuery, setSearchQuery] = useState("")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const fetchProperties = async () => {
    try {
      const res = await fetch("https://api.realestatecompany.co.in/api/properties")
      const data = await res.json()
      if (Array.isArray(data)) {
        setPropertyOptions(data)
        setFilteredProperties(data)
      }
    } catch (error) {
      console.error("Error fetching properties:", error)
    }
  }

  const fetchCategories = async () => {
    setIsLoadingCategories(true)
    try {
      const response = await fetch("https://api.realestatecompany.co.in/api/property-category-and-tag/categories")
      const data = await response.json()
      if (data.success) {
        setCategories(data.data)
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    } finally {
      setIsLoadingCategories(false)
    }
  }

  const fetchTags = async () => {
    setIsLoadingTags(true)
    try {
      const response = await fetch("https://api.realestatecompany.co.in/api/property-category-and-tag/tags")
      const data = await response.json()
      if (data.success) {
        setTags(data.data)
      }
    } catch (error) {
      console.error("Error fetching tags:", error)
    } finally {
      setIsLoadingTags(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true)
      Promise.all([fetchProperties(), fetchCategories(), fetchTags()]).finally(() => setIsLoading(false))
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  // Filter properties based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredProperties(propertyOptions)
    } else {
      const filtered = propertyOptions.filter(
        (property) =>
          property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          property.propertyFor.toLowerCase().includes(searchQuery.toLowerCase()) ||
          property.propertyType.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredProperties(filtered)
    }
  }, [searchQuery, propertyOptions])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setIsDropdownOpen(true)
  }

  const handlePropertySelect = (property: Property) => {
    setSelectedProperty(property)
    setSearchQuery(property.title)
    setIsDropdownOpen(false)
    setFormData((prev) => ({
      ...prev,
      propertyId: property.PropertyId,
      propertyName: property.title,
      propertyFor: property.propertyFor,
      propertyType: property.propertyType,
      propertyStatus: property.status,
      REMCategoryCode: property.REMCategoryCode || "",
      REMPropTagCode: property.REMPropTagCode || "",
    }))
  }

  const clearPropertySelection = () => {
    setSelectedProperty(null)
    setSearchQuery("")
    setFormData((prev) => ({
      ...prev,
      propertyId: "",
      propertyName: "",
      propertyFor: "",
      propertyType: "",
      propertyStatus: "",
      REMCategoryCode: "",
      REMPropTagCode: "",
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Validate required fields
    // Convert empty strings to null explicitly
const categoryCode = formData.REMCategoryCode || null
const tagCode = formData.REMPropTagCode || null

if (!categoryCode || !tagCode) {
  toast.error("Please select both Property Status and Property Type")
  setIsSubmitting(false)
  return
}

    // Validate user is available
    if (!user?.id) {
      toast.error("User information is missing. Please try again.")
      setIsSubmitting(false)
      return
    }

    const leadData = {
      propertyId: formData.propertyId,
      propertyName: formData.propertyName,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      LeadSourceId: "1",
      LeadTypeId: formData.propertyFor === "Buy" ? 1 : 2,
      propertyType: formData.propertyType,
      propertyStatus: formData.propertyStatus,
  REMCategoryCode: categoryCode,
REMPropTagCode: tagCode,
    }

    try {
      // First, create the lead
      const response = await fetch("https://api.realestatecompany.co.in/api/propertylead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(leadData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create lead")
      }

      const leadResponse = await response.json()

      // Check the actual response structure - it might be leadResponse.LeadId or leadResponse.id
      const leadId = leadResponse.LeadId || leadResponse.id || leadResponse.data?.LeadId

      if (!leadId) {
        throw new Error("Lead ID not found in response")
      }

      // Then assign the lead to the current user
      const assignmentResponse = await fetch("https://api.realestatecompany.co.in/api/lead-assignment/assign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user.id.toString(), // Ensure string type
          leadId: leadId.toString(), // Ensure string type
          assignedBy: user.id.toString(),
          assignedRemark: "Auto-assigned on lead creation",
        }),
      })

      if (!assignmentResponse.ok) {
        const errorData = await assignmentResponse.json()
        throw new Error(errorData.message || "Lead assignment failed")
      }

      const assignmentData = await assignmentResponse.json()
      if (!assignmentData.success) {
        throw new Error(assignmentData.message || "Lead assignment failed")
      }

      setSubmitSuccess(true)
      toast.success("Lead created and assigned successfully!")
      setTimeout(onClose, 2000)
    } catch (error) {
      console.error("Error in lead creation/assignment:", error)
      toast.error("An error occurred. Please try again later.")
    } finally {
      setIsSubmitting(false)
    }
  }
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      <motion.div
        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-xl z-50 max-h-[90vh] overflow-y-auto"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        drag="y"
        dragConstraints={{ top: 0 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 100) onClose()
        }}
      >
        <div className="flex justify-center pt-3 pb-1 sticky top-0 bg-white z-10">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>

        <button
          onClick={onClose}
          className="absolute top-3 right-4 p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <X size={20} className="text-gray-600" />
        </button>

        <div className="p-6 pt-2">
          <h2 className="text-xl font-bold text-center mb-6">Make A New Lead</h2>

          {submitSuccess ? (
            <div className="text-center py-8">
              <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Lead Created!</h3>
              <p className="text-gray-600 mb-4">The new lead has been successfully created.</p>
              <button onClick={onClose} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium">
                Close
              </button>
            </div>
          ) : isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Property</label>
                <div className="relative" ref={dropdownRef}>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      onFocus={() => setIsDropdownOpen(true)}
                      className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Search for a property..."
                      required
                    />
                    {selectedProperty && (
                      <button
                        type="button"
                        onClick={clearPropertySelection}
                        className="absolute right-8 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
                      >
                        <X className="h-4 w-4 text-gray-400" />
                      </button>
                    )}
                    <ChevronDown
                      className={`absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 transition-transform ${
                        isDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </div>

                  {isDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredProperties.length > 0 ? (
                        filteredProperties.map((property) => (
                          <button
                            key={property.PropertyId}
                            type="button"
                            onClick={() => handlePropertySelect(property)}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 focus:bg-blue-50 focus:outline-none"
                          >
                            <div className="font-medium text-gray-900">{property.title}</div>
                            <div className="text-sm text-gray-500">
                              {property.propertyFor} • {property.propertyType}
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-gray-500 text-center">No properties found</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Property Status</label>
                  <select
                    name="REMCategoryCode"
                    value={formData.REMCategoryCode}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    disabled={isLoadingCategories}
                  >
                    <option value="">Select Property Status</option>
                    {categories
                      .filter((category) =>
                        formData.propertyFor === "Buy"
                          ? category.REMPropStatusCode === "PS-0001"
                          : formData.propertyFor === "Rent"
                            ? category.REMPropStatusCode === "PS-0002"
                            : true,
                      )
                      .map((category) => (
                        <option key={category.REMCategoryCode} value={category.REMCategoryCode}>
                          {category.Name}
                        </option>
                      ))}
                  </select>
                  {isLoadingCategories && (
                    <div className="text-sm text-gray-500 flex items-center">
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                      Loading statuses...
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                  <select
                    name="REMPropTagCode"
                    value={formData.REMPropTagCode}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    disabled={isLoadingTags}
                  >
                    <option value="">Select Property Type</option>
                    {tags
                      .filter((tag) =>
                        formData.propertyFor === "Buy"
                          ? tag.REMPropStatusCode === "PS-0001"
                          : formData.propertyFor === "Rent"
                            ? tag.REMPropStatusCode === "PS-0002"
                            : true,
                      )
                      .map((tag) => (
                        <option key={tag.REMPropTagCode} value={tag.REMPropTagCode}>
                          {tag.Name}
                        </option>
                      ))}
                  </select>
                  {isLoadingTags && (
                    <div className="text-sm text-gray-500 flex items-center">
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                      Loading types...
                    </div>
                  )}
                </div>
              </div> */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Full name"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Phone number"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Email address"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin h-5 w-5 mr-2" />
                      Creating Lead...
                    </>
                  ) : (
                    "Create Lead"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
