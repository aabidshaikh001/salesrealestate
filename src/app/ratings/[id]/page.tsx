"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Share2, MoreVertical, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Define the type for reviews
type Review = {
  id: number
  name: string
  avatar: string
  rating: number
  review: string
}

export default function RatingsPage() {
  const router = useRouter()
  const params = useParams()
  const propertyId = params.id as string
  const [propertyReviews, setPropertyReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch ratings from API
  useEffect(() => {
    const fetchRatings = async () => {
      try {
     
        const res = await fetch(`http://localhost:5000/api/ratings/${propertyId}`)
     
        if (!res.ok) throw new Error("Failed to fetch ratings")

        const data = await res.json()
        setPropertyReviews(data) // Assuming API returns an array of reviews
      } catch (error) {
        console.error("Error fetching ratings:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRatings()
  }, [propertyId])

  // Share button functionality
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Property Ratings",
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
          <h1 className="text-lg font-semibold">Ratings</h1>
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
        <div className="space-y-4 p-4">
          {loading ? (
            <p className="text-center text-gray-500">Loading...</p>
          ) : propertyReviews.length > 0 ? (
            propertyReviews.map((review) => (
              <div key={review.id} className="bg-white border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={review.avatar} alt={review.name} />
                    <AvatarFallback>{review.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{review.name}</h3>
                    <div className="flex">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{review.review}</p>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">No reviews available for this property.</p>
          )}
        </div>
      </main>
    </div>
  )
}
