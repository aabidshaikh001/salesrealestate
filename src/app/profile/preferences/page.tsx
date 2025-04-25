"use client"

import { useState } from "react"
import { ArrowLeft, Edit2, ChevronDown, MapPin, Home, Briefcase, Building, Plus, X, Check, Search } from "lucide-react"
import Link from "next/link"
import Header from "@/app/component/header"

interface ChipItem {
  id: string
  label: string
  selected: boolean
}

export default function PreferencesPage() {
  const [isEditing, setIsEditing] = useState(false)
  const [showAddLocality, setShowAddLocality] = useState(false)
  const [showAddProperty, setShowAddProperty] = useState(false)
  const [showAddBuilder, setShowAddBuilder] = useState(false)
  const [newLocalityInput, setNewLocalityInput] = useState("")
  const [newPropertyInput, setNewPropertyInput] = useState("")
  const [newBuilderInput, setNewBuilderInput] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  // Form state
  const [localities, setLocalities] = useState<ChipItem[]>([
    { id: "loc1", label: "Gurgaon, Haryana", selected: true },
    { id: "loc2", label: "Karnal, Haryana", selected: true },
    { id: "loc3", label: "Delhi, NCR", selected: false },
    { id: "loc4", label: "Noida, UP", selected: false },
    { id: "loc5", label: "Chandigarh", selected: false },
  ])

  const [propertyTypes, setPropertyTypes] = useState<ChipItem[]>([
    { id: "prop1", label: "Residential", selected: true },
    { id: "prop2", label: "Commercial", selected: true },
    { id: "prop3", label: "Industrial", selected: false },
    { id: "prop4", label: "Land", selected: false },
    { id: "prop5", label: "Agricultural", selected: false },
  ])

  const [experience, setExperience] = useState("5-10 years")

  const [builders, setBuilders] = useState<ChipItem[]>([
    { id: "build1", label: "DLF Builders", selected: true },
    { id: "build2", label: "Godrej Properties", selected: true },
    { id: "build3", label: "Prestige Group", selected: false },
    { id: "build4", label: "Lodha Group", selected: false },
    { id: "build5", label: "Sobha Limited", selected: false },
  ])

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleEditToggle = () => {
    if (isEditing) {
      // If we're currently editing, this acts as a cancel button
      setIsEditing(false)
      // Reset any changes
      // In a real app, you would fetch the latest data from the server
    } else {
      setIsEditing(true)
    }
  }

  const toggleChipSelection = (id: string, type: "locality" | "property" | "builder") => {
    if (!isEditing) return

    if (type === "locality") {
      setLocalities((prev) => prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item)))
    } else if (type === "property") {
      setPropertyTypes((prev) => prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item)))
    } else if (type === "builder") {
      setBuilders((prev) => prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item)))
    }
  }

  const handleAddNewLocality = () => {
    if (!newLocalityInput.trim()) return

    const newId = `loc${localities.length + 1}`
    setLocalities((prev) => [...prev, { id: newId, label: newLocalityInput, selected: true }])
    setNewLocalityInput("")
    setShowAddLocality(false)
  }

  const handleAddNewProperty = () => {
    if (!newPropertyInput.trim()) return

    const newId = `prop${propertyTypes.length + 1}`
    setPropertyTypes((prev) => [...prev, { id: newId, label: newPropertyInput, selected: true }])
    setNewPropertyInput("")
    setShowAddProperty(false)
  }

  const handleAddNewBuilder = () => {
    if (!newBuilderInput.trim()) return

    const newId = `build${builders.length + 1}`
    setBuilders((prev) => [...prev, { id: newId, label: newBuilderInput, selected: true }])
    setNewBuilderInput("")
    setShowAddBuilder(false)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    const selectedLocalities = localities.filter((item) => item.selected)
    if (selectedLocalities.length === 0) {
      newErrors.locality = "Please select at least one locality"
    }

    const selectedPropertyTypes = propertyTypes.filter((item) => item.selected)
    if (selectedPropertyTypes.length === 0) {
      newErrors.property = "Please select at least one property type"
    }

    if (!experience) {
      newErrors.experience = "Please select your experience"
    }

    const selectedBuilders = builders.filter((item) => item.selected)
    if (selectedBuilders.length === 0) {
      newErrors.builders = "Please select at least one builder"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (validateForm()) {
      // In a real app, you would send this data to your server
      alert("Preferences saved successfully!")
      setIsEditing(false)
    }
  }

  const filteredLocalities = localities.filter((item) => item.label.toLowerCase().includes(searchTerm.toLowerCase()))

  const filteredPropertyTypes = propertyTypes.filter((item) =>
    item.label.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredBuilders = builders.filter((item) => item.label.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="pb-20">
       <Header/> 
      <header className="flex items-center p-4 border-b">
        <Link href="/profile" className="mr-4">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-medium">Preferences</h1>
        <button className="ml-auto" onClick={handleEditToggle}>
          {isEditing ? <X className="h-5 w-5 text-red-500" /> : <Edit2 className="h-5 w-5" />}
        </button>
      </header>

      <div className="p-4 space-y-6">
        {isEditing && (
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search preferences..."
                className="w-full p-3 pl-10 border border-gray-300 rounded-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              {searchTerm && (
                <button
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  onClick={() => setSearchTerm("")}
                >
                  <X className="h-4 w-4 text-gray-400" />
                </button>
              )}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1 text-gray-500" />
              Locality*
            </div>
          </label>
          {errors.locality && <p className="text-red-500 text-xs mb-1">{errors.locality}</p>}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex flex-wrap gap-2">
              {filteredLocalities.map((item) => (
                <Chip
                  key={item.id}
                  label={item.label}
                  selected={item.selected}
                  onClick={() => toggleChipSelection(item.id, "locality")}
                  onRemove={
                    isEditing
                      ? () => {
                          setLocalities((prev) => prev.filter((loc) => loc.id !== item.id))
                        }
                      : undefined
                  }
                />
              ))}
             {isEditing && !showAddLocality && (
  <Chip
    label="Add more"
    isAdd
    onClick={() => setShowAddLocality(true)}
  />
)}

              {showAddLocality && (
                <div className="w-full mt-2">
                  <div className="flex">
                    <input
                      type="text"
                      placeholder="Enter locality"
                      className="flex-1 p-2 border border-gray-300 rounded-l-lg"
                      value={newLocalityInput}
                      onChange={(e) => setNewLocalityInput(e.target.value)}
                    />
                    <button className="bg-red-500 text-white px-3 rounded-r-lg" onClick={handleAddNewLocality}>
                      <Check className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center">
              <Home className="h-4 w-4 mr-1 text-gray-500" />
              Property Type*
            </div>
          </label>
          {errors.property && <p className="text-red-500 text-xs mb-1">{errors.property}</p>}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex flex-wrap gap-2">
              {filteredPropertyTypes.map((item) => (
                <Chip
                  key={item.id}
                  label={item.label}
                  selected={item.selected}
                  onClick={() => toggleChipSelection(item.id, "property")}
                  onRemove={
                    isEditing
                      ? () => {
                          setPropertyTypes((prev) => prev.filter((prop) => prop.id !== item.id))
                        }
                      : undefined
                  }
                />
              ))}
              {isEditing && !showAddProperty && (
                <Chip label="Add more" isAdd onClick={() => setShowAddProperty(true)} />
              )}

              {showAddProperty && (
                <div className="w-full mt-2">
                  <div className="flex">
                    <input
                      type="text"
                      placeholder="Enter property type"
                      className="flex-1 p-2 border border-gray-300 rounded-l-lg"
                      value={newPropertyInput}
                      onChange={(e) => setNewPropertyInput(e.target.value)}
                    />
                    <button className="bg-red-500 text-white px-3 rounded-r-lg" onClick={handleAddNewProperty}>
                      <Check className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center">
              <Briefcase className="h-4 w-4 mr-1 text-gray-500" />
              Experience (in years)*
            </div>
          </label>
          {errors.experience && <p className="text-red-500 text-xs mb-1">{errors.experience}</p>}
          <div className="relative">
            <select
              className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 appearance-none"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              disabled={!isEditing}
            >
              <option value="5-10 years">5-10 years</option>
              <option value="Less than 2 years">Less than 2 years</option>
              <option value="2-5 years">2-5 years</option>
              <option value="10+ years">10+ years</option>
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <ChevronDown className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center">
              <Building className="h-4 w-4 mr-1 text-gray-500" />
              Top 3 Builders with whom you have work*
            </div>
          </label>
          {errors.builders && <p className="text-red-500 text-xs mb-1">{errors.builders}</p>}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex flex-wrap gap-2">
              {filteredBuilders.map((item) => (
                <Chip
                  key={item.id}
                  label={item.label}
                  selected={item.selected}
                  onClick={() => toggleChipSelection(item.id, "builder")}
                  onRemove={
                    isEditing
                      ? () => {
                          setBuilders((prev) => prev.filter((build) => build.id !== item.id))
                        }
                      : undefined
                  }
                />
              ))}
              {isEditing && !showAddBuilder && <Chip label="Add more" isAdd onClick={() => setShowAddBuilder(true)} />}

              {showAddBuilder && (
                <div className="w-full mt-2">
                  <div className="flex">
                    <input
                      type="text"
                      placeholder="Enter builder name"
                      className="flex-1 p-2 border border-gray-300 rounded-l-lg"
                      value={newBuilderInput}
                      onChange={(e) => setNewBuilderInput(e.target.value)}
                    />
                    <button className="bg-red-500 text-white px-3 rounded-r-lg" onClick={handleAddNewBuilder}>
                      <Check className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {isEditing ? (
          <div className="flex space-x-3 mt-6">
            <button className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg" onClick={() => setIsEditing(false)}>
              Cancel
            </button>
            <button className="flex-1 bg-red-500 text-white py-3 rounded-lg" onClick={handleSave}>
              Save
            </button>
          </div>
        ) : (
          <button className="w-full bg-red-500 text-white py-3 rounded-lg mt-6" onClick={() => setIsEditing(true)}>
            Edit
          </button>
        )}
      </div>

      
    </div>
  )
}

interface ChipProps {
  label: string
  selected?: boolean
  isAdd?: boolean
  onClick?: () => void
  onRemove?: () => void
}

function Chip({ label, selected = false, isAdd = false, onClick, onRemove }: ChipProps) {
  return (
    <div
      className={`px-3 py-1 rounded-full text-sm flex items-center ${
        isAdd
          ? "bg-white border border-gray-200 text-red-500 cursor-pointer"
          : selected
            ? "bg-white border border-gray-200 shadow-sm cursor-pointer"
            : "bg-white border border-gray-200 text-gray-500 cursor-pointer"
      }`}
      onClick={onClick}
    >
      {isAdd && <Plus className="h-3 w-3 mr-1" />}
      {label}
      {selected && onRemove && (
        <button
          className="ml-1 text-gray-400 hover:text-red-500"
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  )
}

