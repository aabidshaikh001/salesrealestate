"use client"

import { ArrowLeft, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"

import { useRouter } from "next/navigation"


export default function TermsPage() {
    const router = useRouter()
  const handleShare = async () => {
    try {
      await navigator.share({
        title: "Terms & Conditions",
        url: window.location.href,
      })
    } catch (error) {
      console.log("Sharing failed", error)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="fixed top-0 left-0 right-0 bg-white border-b z-10">
        <div className="flex items-center justify-between px-4 h-14 bg-white">
        <Button
  onClick={() => router.back()}
  className="flex items-center gap-2 bg-white px-3 py-2 rounded-md shadow hover:bg-gray-100 transition"
  aria-label="Go back"
>
  <ArrowLeft className="h-5 w-5 text-gray-700" />
  <span className="text-gray-700">Back</span>
</Button>

          <h1 className="text-lg font-semibold">Terms & Conditions</h1>
          <Button variant="ghost" size="icon" className="text-gray-700" onClick={handleShare}>
            <Share2 className="h-5 w-5" />
          </Button>
          
        </div>
      </header>

      <main className="pt-14 px-4 pb-8">
        <div className="space-y-6">
          <section>
            <h2 className="text-lg font-semibold mb-2">Lorem Ipsum</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
              dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
              ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
              fugiat nulla pariatur.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Usage Terms</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
              dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
              ea commodo consequat.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Privacy Policy</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
              dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
              ea commodo consequat.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Disclaimer</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
              dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
              ea commodo consequat.
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}

