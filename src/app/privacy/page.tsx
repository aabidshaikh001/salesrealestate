"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"

export default function PrivacyPolicyPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  }

  return (
    <motion.div
      className="flex flex-col min-h-screen bg-white"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Mobile app status bar area - simulated */}
      <div className="h-6 bg-white w-full"></div>

      {/* Mobile app header with back button */}
      <motion.div className="flex items-center px-4 py-3 border-b border-gray-100" variants={itemVariants}>
        <Link href="/dashboard" className="text-gray-800">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <div className="flex-1 text-center font-medium">Privacy Policy</div>
        <div className="w-6"></div> {/* Empty div for balanced header */}
      </motion.div>

      {/* Main content */}
      <motion.div className="flex-1 flex flex-col px-5 py-6" variants={itemVariants}>
        <div className="prose prose-sm max-w-none">
          <motion.div variants={itemVariants}>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">1. Information We Collect</h2>
            <p className="text-gray-600 mb-4">
              We collect several types of information from and about users of our application, including:
            </p>
            <ul className="list-disc pl-5 text-gray-600 mb-4">
              <li>Personal information such as name, email address, phone number, and mailing address</li>
              <li>Property preferences and search criteria</li>
              <li>Usage data including how you interact with our application</li>
              <li>Device information such as IP address, browser type, and operating system</li>
            </ul>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">2. How We Use Your Information</h2>
            <p className="text-gray-600 mb-4">
              We use the information we collect about you for various purposes, including:
            </p>
            <ul className="list-disc pl-5 text-gray-600 mb-4">
              <li>Providing and improving our services</li>
              <li>Communicating with you about properties and services</li>
              <li>Personalizing your experience</li>
              <li>Analyzing usage patterns to enhance our application</li>
              <li>Complying with legal obligations</li>
            </ul>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">3. Information Sharing</h2>
            <p className="text-gray-600 mb-4">We may share your personal information with:</p>
            <ul className="list-disc pl-5 text-gray-600 mb-4">
              <li>Real estate agents and property owners when you express interest in a property</li>
              <li>Service providers who perform functions on our behalf</li>
              <li>Legal authorities when required by law</li>
              <li>Business partners with your consent</li>
            </ul>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">4. Data Security</h2>
            <p className="text-gray-600 mb-4">
              We implement appropriate security measures to protect your personal information from unauthorized access,
              alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic
              storage is 100% secure.
            </p>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">5. Your Choices</h2>
            <p className="text-gray-600 mb-4">You have several choices regarding the use of your information:</p>
            <ul className="list-disc pl-5 text-gray-600 mb-4">
              <li>Access, update, or delete your personal information</li>
              <li>Opt-out of marketing communications</li>
              <li>Disable location services</li>
              <li>Manage cookie preferences</li>
            </ul>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">6. Children&apos;s Privacy</h2>
            <p className="text-gray-600 mb-4">
              Our application is not intended for children under 13 years of age. We do not knowingly collect personal
              information from children under 13. If you are a parent or guardian and believe your child has provided us
              with personal information, please contact us.
            </p>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">7. Changes to Our Privacy Policy</h2>
            <p className="text-gray-600 mb-4">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new
              Privacy Policy on this page and updating the &quot;Last Updated&quot; date.
            </p>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">8. Contact Us</h2>
            <p className="text-gray-600 mb-4">
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <p className="text-gray-600 mb-4">
              Email: info@realestatecompany.co.in
              <br />
              Phone: +91 96949 67000
            </p>
          </motion.div>

          <motion.div variants={itemVariants}>
            <p className="text-gray-500 text-sm mt-8">Last Updated: April 24, 2024</p>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )
}
