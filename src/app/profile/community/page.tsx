"use client"

import { ArrowLeft, Edit2, Users, MessageSquare, ThumbsUp, Share2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import Header from "@/app/component/header"


export default function CommunityPage() {
  return (
    <div className="pb-20">
       <Header/> 
      <header className="flex items-center p-4 border-b">
        <Link href="/profile" className="mr-4">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-medium">Community Support</h1>
        <button className="ml-auto">
          <Edit2 className="h-5 w-5" />
        </button>
      </header>

      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold flex items-center">
            <Users className="h-5 w-5 mr-2 text-red-500" />
            Community Posts
          </h2>
          <button className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm">New Post</button>
        </div>

        <div className="space-y-6">
          <CommunityPost
            name="Sameer Verma"
            avatar="/placeholder.svg?height=40&width=40"
            time="2 hours ago"
            content="Has anyone worked with DLF Phase 5 properties recently? Looking for insights on pricing trends."
            likes={24}
            comments={8}
          />

          <CommunityPost
            name="Priya Sharma"
            avatar="/placeholder.svg?height=40&width=40"
            time="5 hours ago"
            content="Just closed a deal in Sector 12! The market is looking good for residential properties this quarter."
            likes={42}
            comments={15}
            hasImage={true}
          />

          <CommunityPost
            name="Rahul Kapoor"
            avatar="/placeholder.svg?height=40&width=40"
            time="1 day ago"
            content="Any recommendations for good property lawyers in Gurgaon area? Need help with some documentation."
            likes={18}
            comments={32}
          />
        </div>
      </div>

     
    </div>
  )
}

function CommunityPost({
  name,
  avatar,
  time,
  content,
  likes,
  comments,
  hasImage = false,
}: {
  name: string
  avatar: string
  time: string
  content: string
  likes: number
  comments: number
  hasImage?: boolean
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center mb-3">
        <Image src={avatar || "/placeholder.svg"} alt={name} width={40} height={40} className="rounded-full mr-3" />
        <div>
          <h4 className="font-medium">{name}</h4>
          <p className="text-xs text-gray-500">{time}</p>
        </div>
      </div>

      <p className="mb-4">{content}</p>

      {hasImage && (
        <div className="mb-4">
          <Image
            src="/placeholder.svg?height=200&width=400"
            alt="Post image"
            width={400}
            height={200}
            className="rounded-lg w-full h-48 object-cover"
          />
        </div>
      )}

      <div className="flex border-t pt-3">
        <button className="flex items-center mr-6 text-gray-600">
          <ThumbsUp className="h-4 w-4 mr-1" />
          <span className="text-sm">{likes}</span>
        </button>
        <button className="flex items-center mr-6 text-gray-600">
          <MessageSquare className="h-4 w-4 mr-1" />
          <span className="text-sm">{comments}</span>
        </button>
        <button className="flex items-center text-gray-600 ml-auto">
          <Share2 className="h-4 w-4 mr-1" />
          <span className="text-sm">Share</span>
        </button>
      </div>
    </div>
  )
}

