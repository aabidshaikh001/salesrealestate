"use client"
import { FaLink, FaFacebookF, FaTwitter, FaWhatsapp, FaTelegramPlane } from "react-icons/fa"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { toast } from "@/hooks/use-toast"

interface ShareModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  propertyName: string
  shareUrl: string
}

export default function ShareModal({ isOpen, onOpenChange, propertyName, shareUrl }: ShareModalProps) {
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast({
        title: "Link copied!",
        description: "The property link has been copied to your clipboard.",
        duration: 3000,
      })
      onOpenChange(false)
    } catch (err) {
      console.error("Failed to copy: ", err)
      toast({
        title: "Copy failed",
        description: "Could not copy the link. Please try again.",
        variant: "destructive",
        duration: 3000,
      })
    }
  }

  const shareOptions = [
    {
      name: "Copy Link",
      icon: <FaLink className="text-gray-600" />,
      action: copyToClipboard,
      color: "bg-gray-100",
    },
    {
      name: "Facebook",
      icon: <FaFacebookF className="text-white" />,
      action: () =>
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank"),
      color: "bg-blue-600",
    },
    {
      name: "Twitter",
      icon: <FaTwitter className="text-white" />,
      action: () =>
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`Check out this property: ${propertyName}`)}`,
          "_blank",
        ),
      color: "bg-sky-500",
    },
    {
      name: "WhatsApp",
      icon: <FaWhatsapp className="text-white" />,
      action: () =>
        window.open(
          `https://wa.me/?text=${encodeURIComponent(`Check out this property: ${propertyName} ${shareUrl}`)}`,
          "_blank",
        ),
      color: "bg-green-500",
    },
    {
      name: "Telegram",
      icon: <FaTelegramPlane className="text-white" />,
      action: () =>
        window.open(
          `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`Check out this property: ${propertyName}`)}`,
          "_blank",
        ),
      color: "bg-blue-500",
    },
  ]

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-xl px-0 sm:max-w-none">
        <SheetHeader className="px-4">
          <SheetTitle>Share this property</SheetTitle>
          <SheetDescription>Choose how you want to share {propertyName}</SheetDescription>
        </SheetHeader>
        <div className="mt-6 px-4">
          <div className="grid grid-cols-5 gap-4">
            {shareOptions.map((option, index) => (
              <motion.div
                key={option.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex flex-col items-center gap-2"
              >
                <button
                  onClick={option.action}
                  className={`w-12 h-12 rounded-full ${option.color} flex items-center justify-center shadow-sm`}
                >
                  {option.icon}
                </button>
                <span className="text-xs text-center">{option.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="mt-8 px-4">
          <Button variant="outline" className="w-full" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
