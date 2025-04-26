"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { motion, AnimatePresence } from "framer-motion"

type Review = {
  id: number
  name: string
  avatar: string
  rating: number
  review: string
}

interface RatingsProps {
  propertyId: string
}

export function Ratings({ propertyId }: RatingsProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedReview, setExpandedReview] = useState<number | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchReviews = async () => {
      try {
     
     
  
        const response = await fetch(`https://api.realestatecompany.co.in/api/ratings/${propertyId}`)
     
        if (!response.ok) {
          throw new Error("Failed to fetch ratings")
        }
        const data = await response.json()
        setReviews(data) // Assuming API returns an array of reviews
      } catch (err) {
        console.error("Error loading ratings:", err); // Logs the actual error for debugging
        setError(`Failed to load ratings: ${err instanceof Error ? err.message : String(err)}`); // Uses the error
      }
       finally {
        setLoading(false)
      }
    }

    fetchReviews()
  }, [propertyId])

  return (
    <Card className="border-0 shadow-sm bg-white">
      <CardHeader className="flex-row items-center justify-between pb-2 pt-4 px-4">
        <h2 className="text-lg font-bold">Ratings</h2>
        <Button
          variant="link"
          className="text-blue-600 font-semibold p-0 h-auto text-sm"
          onClick={() => router.push(`/ratings/${propertyId}`)}
        >
          View All
        </Button>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-4">
        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : reviews.length > 0 ? (
          reviews.slice(0, 2).map((review) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-gray-50/50 shadow-sm">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={review.avatar || "/placeholder-user.jpg"} alt={review.name} />
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
                  <div className="text-sm text-gray-600 leading-relaxed">
                    <AnimatePresence>
                      {expandedReview === review.id ? (
                        <motion.p
                          initial={{ height: 0 }}
                          animate={{ height: "auto" }}
                          exit={{ height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          {review.review}
                        </motion.p>
                      ) : (
                        <p>{review.review.slice(0, 100)}...</p>
                      )}
                    </AnimatePresence>
                    <Button
                      variant="link"
                      className="text-blue-600 p-0 h-auto text-sm font-semibold mt-1"
                      onClick={() => setExpandedReview(expandedReview === review.id ? null : review.id)}
                    >
                      {expandedReview === review.id ? "Read less" : "Read more"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          <p className="text-center text-gray-500 py-4">No ratings available for this property.</p>
        )}
      </CardContent>
    </Card>
  )
}
