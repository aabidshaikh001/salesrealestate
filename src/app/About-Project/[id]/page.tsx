"use client"

import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Share2, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useEffect, useState } from "react"

interface AboutProjectPageProps {
  onBuilderIdChange?: (builderId: string) => void
}

interface PropertyData {
  projectId?: string
}

interface ProjectData {
  projectName?: string
  projectDescription?: string
  projectDetails?: string
  builderId?: string
  location?: string
  launchDate?: string
  completionDate?: string
  reraNumber?: string
  priceRange?: string
  areaRange?: string
  status?: string
  amenities?: string
  coverImage?: string
  galleryImages?: string[]
}

export default function AboutProjectPage({ onBuilderIdChange }: AboutProjectPageProps) {
  const router = useRouter()
  const params = useParams()
  const propertyId = params.id as string

  const [aboutData, setAboutData] = useState<string | null>(null)
  const [projectData, setProjectData] = useState<ProjectData>({})
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const parseJsonField = (field: string) => {
    try {
      return field ? JSON.parse(field) : []
    } catch {
      return field ? field.split(",").map((item) => item.trim()) : []
    }
  }

  useEffect(() => {
    const fetchAboutProperty = async () => {
      try {
        const res = await fetch(`https://api.realestatecompany.co.in/api/aboutproperty/${propertyId}`)
        const data = await res.json()
        setAboutData(data.description)
      } catch (error) {
        console.error("Failed to fetch about property data:", error)
        setAboutData("Failed to load property information.")
      }
    }

    fetchAboutProperty()
  }, [propertyId])

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        setLoading(true)
        setError(null)

        // Step 1: Fetch property data to get projectId
        const propertyRes = await fetch(`https://api.realestatecompany.co.in/api/properties/${propertyId}`)
        if (!propertyRes.ok) throw new Error("Property not found")
        const propertyDataRes = await propertyRes.json()
        const propertyData: PropertyData = propertyDataRes.data || propertyDataRes

        if (!propertyData.projectId) {
          setError("No project associated with this property.")
          return
        }

        // Step 2: Fetch project details using projectId
        const projectRes = await fetch(`https://api.realestatecompany.co.in/api/aboutproject/${propertyData.projectId}`)
        if (!projectRes.ok) throw new Error("Project not found")
        const projectDataRes = await projectRes.json()
        const projectData: ProjectData = projectDataRes.data || projectDataRes

        setProjectData(projectData)

        // Notify parent component about builderId
        if (onBuilderIdChange && projectData.builderId) {
          onBuilderIdChange(projectData.builderId)
        }
      } catch (error) {
        console.error("Error fetching project details:", error)
        setError("Failed to load project details.")
      } finally {
        setLoading(false)
      }
    }

    fetchProjectDetails()
  }, [propertyId, onBuilderIdChange])

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "About This Project",
          url: window.location.href,
        })
      } catch (error) {
        console.error("Error sharing:", error)
      }
    }
  }

  const amenitiesList = parseJsonField(projectData.amenities || "")
  const galleryImagesList = Array.isArray(projectData.galleryImages)
  ? projectData.galleryImages
  : parseJsonField(projectData.galleryImages || "")


  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-10 bg-white border-b">
        <div className="flex items-center justify-between px-4 h-14">
          <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">About Project</h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleShare}>
              <Share2 className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Report</DropdownMenuItem>
                <DropdownMenuItem>Copy Link</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="pt-14 pb-4">
        <div className="p-4 space-y-6">
          {projectData.coverImage && (
            <div className="rounded-lg overflow-hidden">
              <img 
                src={projectData.coverImage} 
                alt="Project cover" 
                className="w-full h-48 object-cover"
              />
            </div>
          )}

          <h2 className="text-xl font-semibold">Project Overview</h2>
          {aboutData && <p className="text-gray-600 leading-relaxed">{aboutData}</p>}
          
          {loading ? (
            <p className="text-gray-600">Loading project details...</p>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : (
            <>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">{projectData.projectName}</h3>
                <p className="text-gray-600 leading-relaxed">{projectData.projectDescription}</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-700">Location</h4>
                    <p className="text-gray-600">{projectData.location || "N/A"}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700">Status</h4>
                    <p className="text-gray-600">{projectData.status || "N/A"}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700">Launch Date</h4>
                    <p className="text-gray-600">{formatDate(projectData.launchDate || "")}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700">Completion Date</h4>
                    <p className="text-gray-600">{formatDate(projectData.completionDate || "")}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700">RERA Number</h4>
                    <p className="text-gray-600">{projectData.reraNumber || "N/A"}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700">Price Range</h4>
                    <p className="text-gray-600">{projectData.priceRange || "N/A"}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700">Area Range</h4>
                    <p className="text-gray-600">{projectData.areaRange || "N/A"}</p>
                  </div>
                </div>

                {projectData.projectDetails && (
                  <>
                    <hr />
                    <h4 className="font-medium text-gray-700">Project Details</h4>
                    <p className="text-gray-600 leading-relaxed">{projectData.projectDetails}</p>
                  </>
                )}

                {amenitiesList.length > 0 && (
                  <>
                    <hr />
                    <h4 className="font-medium text-gray-700">Amenities</h4>
                    <div className="flex flex-wrap gap-2">
                      {amenitiesList.map((amenity:string, index:number) => (
                        <span key={index} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </>
                )}

                {galleryImagesList.length > 0 && (
                  <>
                    <hr />
                    <h4 className="font-medium text-gray-700">Gallery</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {galleryImagesList.map((image:string, index:number) => (
                        <div key={index} className="rounded-lg overflow-hidden">
                          <img 
                            src={image} 
                            alt={`Gallery image ${index + 1}`} 
                            className="w-full h-32 object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}