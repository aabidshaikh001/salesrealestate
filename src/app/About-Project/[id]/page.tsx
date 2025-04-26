"use client"

import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Share2, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useEffect, useState } from "react"
// Dummy about data based on property ID


export default function AboutProjectPage() {
  const router = useRouter()
  const params = useParams()
  const propertyId = params.id as string // Get dynamic property ID
     
  const [aboutData, setAboutData] = useState<string | null>(null)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/aboutproperty/${propertyId}`)
        const data = await res.json()
        setAboutData(data.description)
      } catch (error) {
        console.error("Failed to fetch project data", error)
        setAboutData("Failed to load project information.")
      }
    }
  
    fetchData()
  }, [propertyId])
  
  const [projectName, setProjectName] = useState("");
const [projectDescription, setProjectDescription] = useState("");
const [projectDetails, setProjectDetails] = useState("");

useEffect(() => {
  const fetchData = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/aboutproject/${propertyId}`);
      const data = await res.json();
      setProjectName(data.projectName || "");
      setProjectDescription(data.projectDescription || "");
      setProjectDetails(data.projectDetails || "");
    } catch (error) {
      console.error("Failed to fetch project data", error);
      setProjectDescription("Failed to load project information.");
    }
  };

  fetchData();
}, [propertyId]);
     

  // Share button functionality
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
        <div className="p-4 space-y-4">
          <h2 className="text-xl font-semibold">Project Overview</h2>
     
          <p className="text-gray-600 leading-relaxed">{aboutData}</p>
  
          <h3 className="text-xl font-semibold">{projectName}</h3>
<p className="text-gray-600 leading-relaxed">{projectDescription}</p>
<hr />
<p className="text-gray-600 leading-relaxed">{projectDetails}</p>

     
        </div>
      </main>
    </div>
  )
}
