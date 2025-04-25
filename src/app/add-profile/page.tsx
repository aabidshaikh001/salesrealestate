"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/providers/auth-provider"
import { useRouter } from "next/navigation"
import { toast } from 'react-toastify';

import Image from "next/image"
import Link from "next/link"
import {
  ArrowLeft,
  Edit2,
  Mail,
  Phone,
  MapPin,
  Key,
  FileText,
  Upload,
  User,
  Eye,
  EyeOff,
  Search,
  Plus,
  Trash2,
  CreditCard,
  Building,
} from "lucide-react"
import LoadingSpinner from "@/components/loading-spinner"

// Document type interface
interface DocumentItem {
  id: string
  name: string
  type: string
  file?: File
}

export default function AddProfilePage() {
  const { user, isLoading, updateUserProfile } = useAuth()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState("personal")
  const [isEditing, setIsEditing] = useState(true) // Start in editing mode
  const [showPassword, setShowPassword] = useState(false)
  const [isSearchingIFSC, setIsSearchingIFSC] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const documentInputRef = useRef<HTMLInputElement>(null)

  // Personal Info Form State
  const [personalInfo, setPersonalInfo] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
    pinNumber: user?.pinNumber || "",
    reraNumber: user?.reraNumber || "",
  })

  // Bank Info Form State
  const [bankInfo, setBankInfo] = useState({
    bankName: user?.bankName || "",
    accountNumber: user?.accountNumber || "",
    confirmAccountNumber: user?.confirmAccountNumber || "",
    ifscCode: user?.ifscCode || "",
    recipientName: user?.recipientName || "",
  })

  // Form Validation State
  const [errors, setErrors] = useState<Record<string, string>>({})

  // File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(user?.image || null)

  // Documents State
  const [documents, setDocuments] = useState<DocumentItem[]>(
    user?.document
      ? user.document.map((doc, index) => ({
          id: `existing-${index}`,
          name: doc,
          type: index === 0 ? "Aadhaar Card" : "PAN Card",
        }))
      : [],
  )
  const [currentDocType, setCurrentDocType] = useState("Aadhaar Card")
  const [tempDocName, setTempDocName] = useState("")

  // Document type options
  const documentTypes = ["Aadhaar Card", "PAN Card", "Driving License", "Passport", "Voter ID", "Other"]

  // IFSC Search Results
  const [ifscResults, setIfscResults] = useState([
    { code: "SBIN0001234", bank: "State Bank of India", branch: "Karnal Main" },
    { code: "SBIN0005678", bank: "State Bank of India", branch: "Sector 12" },
    { code: "HDFC0001234", bank: "HDFC Bank", branch: "Karnal" },
  ])

  useEffect(() => {
    // Redirect if not authenticated
    if (!user && !isLoading) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      setPersonalInfo({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        pinNumber: user.pinNumber || "",
        reraNumber: user.reraNumber || "",
      })

      setBankInfo({
        bankName: user.bankName || "",
        accountNumber: user.accountNumber || "",
        confirmAccountNumber: user.confirmAccountNumber || "",
        ifscCode: user.ifscCode || "",
        recipientName: user.recipientName || "",
      })

      setPreviewUrl(user.image || null)

      setDocuments(
        user.document
          ? user.document.map((doc, index) => ({
              id: `existing-${index}`,
              name: doc,
              type: index === 0 ? "Aadhaar Card" : "PAN Card",
            }))
          : [],
      )
    }
  }, [user])

  const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPersonalInfo((prev) => ({ ...prev, [name]: value }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleBankInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setBankInfo((prev) => ({ ...prev, [name]: value }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }

    // If changing account number, clear confirm account number if it doesn't match
    if (name === "accountNumber" && bankInfo.confirmAccountNumber && value !== bankInfo.confirmAccountNumber) {
      setErrors((prev) => ({ ...prev, confirmAccountNumber: "Account numbers do not match" }))
    } else if (name === "confirmAccountNumber" && value !== bankInfo.accountNumber) {
      setErrors((prev) => ({ ...prev, confirmAccountNumber: "Account numbers do not match" }))
    } else if (name === "confirmAccountNumber" && value === bankInfo.accountNumber) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.confirmAccountNumber
        return newErrors
      })
    }
  }

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)

      // Create a preview URL for the file
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  console.log(setIsEditing)
  console.log(tempDocName)

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const newDoc: DocumentItem = {
        id: Date.now().toString(),
        name: file.name,
        type: currentDocType,
        file: file,
      }

      setDocuments((prev) => [...prev, newDoc])
      setTempDocName("")

      // Reset the file input
      if (documentInputRef.current) {
        documentInputRef.current.value = ""
      }
    }
  }

  const handleRemoveDocument = (id: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id))
  }

  const validatePersonalInfo = () => {
    const newErrors: Record<string, string> = {}

    if (!personalInfo.name) newErrors.name = "Name is required"

    if (!personalInfo.email) newErrors.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(personalInfo.email)) newErrors.email = "Email is invalid"

    if (!personalInfo.phone) newErrors.phone = "Phone number is required"
    else if (!/^\d{10}$/.test(personalInfo.phone.replace(/\D/g, ""))) newErrors.phone = "Phone number must be 10 digits"

    if (!personalInfo.address) newErrors.address = "Address is required"
    if (!personalInfo.pinNumber) newErrors.pinNumber = "PIN number is required"
    if (!personalInfo.reraNumber) newErrors.reraNumber = "RERA number is required"

    if (documents.length === 0) newErrors.documents = "At least one document is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateBankInfo = () => {
    const newErrors: Record<string, string> = {}
  
    if (!bankInfo.bankName) newErrors.bankName = "Bank name is required"
  
    if (!bankInfo.accountNumber) newErrors.accountNumber = "Account number is required"
    else if (!/^\d{9,18}$/.test(bankInfo.accountNumber.replace(/\D/g, "")))
      newErrors.accountNumber = "Account number must be 9-18 digits"
  
    // Remove the validation for confirmAccountNumber
    // if (!bankInfo.confirmAccountNumber) newErrors.confirmAccountNumber = "Confirm account number is required"
    // else if (bankInfo.accountNumber !== bankInfo.confirmAccountNumber)
    //   newErrors.confirmAccountNumber = "Account numbers do not match"
  
    if (!bankInfo.ifscCode) newErrors.ifscCode = "IFSC code is required"
    else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(bankInfo.ifscCode)) newErrors.ifscCode = "IFSC code is invalid"
  
    if (!bankInfo.recipientName) newErrors.recipientName = "Recipient name is required"
  
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  const handleSavePersonalInfo = async () => {
    if (validatePersonalInfo()) {
      setIsSaving(true)
      try {
        // In a real app, you would upload the profile image and documents first
        // Then get the URLs and include them in the userData object
  
        // For now, we'll just use the existing image URL if no new file is selected
        const imageUrl = selectedFile ? previewUrl : user?.image
  
        // Get document names
        const documentNames = documents.map((doc) => doc.name)
  
        // Prepare user data for update
        const userData = {
          ...personalInfo,
          image: imageUrl || undefined, // Convert null to undefined
          document: documentNames,
        }
  
        // Update user profile
        const success = await updateUserProfile(userData)
  
        if (success) {
            toast.success("Personal information saved successfully", {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            });
            setActiveTab("bank");
          }
        } catch (error) {
          console.error("Save error:", error);
          toast.error("Failed to save personal information. Please try again.", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        } finally {
          setIsSaving(false);
        }
      }
    };

    const handleSaveBankInfo = async () => {
      if (validateBankInfo()) {
        setIsSaving(true);
        try {
          // Prepare bank data for update
          const userData = {
            id: user?.id, // Include the user ID
            bankName: bankInfo.bankName,
            accountNumber: bankInfo.accountNumber,
            ifscCode: bankInfo.ifscCode,
            recipientName: bankInfo.recipientName,
          };
    
          // Update user profile
          const success = await updateUserProfile(userData);
    
          if (success) {
            toast.success("Your profile has been completed!", {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            });
          }
        } catch (error) {
          console.error("Save error:", error);
          toast.error("Failed to save bank information. Please try again.", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        } finally {
          setIsSaving(false);
        }
      }
    };
  const handleSelectIFSC = (ifsc: string) => {
    setBankInfo((prev) => ({ ...prev, ifscCode: ifsc }))
    setIsSearchingIFSC(false)
  }

  const searchIFSC = async (query: string) => {
    // In a real app, you would fetch IFSC codes from an API
    // For now, we'll just filter the mock data
    if (query.length < 3) return

    // Mock API call
    setIfscResults(
      [
        { code: "SBIN0001234", bank: "State Bank of India", branch: "Karnal Main" },
        { code: "SBIN0005678", bank: "State Bank of India", branch: "Sector 12" },
        { code: "HDFC0001234", bank: "HDFC Bank", branch: "Karnal" },
      ].filter(
        (result) =>
          result.code.includes(query.toUpperCase()) ||
          result.bank.toLowerCase().includes(query.toLowerCase()) ||
          result.branch.toLowerCase().includes(query.toLowerCase()),
      ),
    )
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="pb-20 min-h-screen bg-gray-50">
      
      <header className="flex items-center p-4 border-b bg-white shadow-sm sticky top-0 z-10">
        <Link href="/" className="mr-4">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-medium">Complete Your Profile</h1>
      </header>

      <div className="flex border-b bg-white shadow-sm sticky top-16 z-10">
        <button
          className={`flex-1 py-3 text-center font-medium ${
            activeTab === "personal" ? "text-white bg-primary rounded-full mx-2 my-2" : "text-gray-500"
          }`}
          onClick={() => setActiveTab("personal")}
        >
          Personal Info
        </button>
        <button
          className={`flex-1 py-3 text-center font-medium ${
            activeTab === "bank" ? "text-white bg-primary rounded-full mx-2 my-2" : "text-gray-500"
          }`}
          onClick={() => setActiveTab("bank")}
        >
          Bank Info
        </button>
      </div>

      {activeTab === "personal" ? (
        <div className="p-4 space-y-4">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex flex-col items-center mb-6">
              <div className="relative">
                <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden mb-3 border-4 border-white shadow">
                  {previewUrl ? (
                    <Image
                      src={previewUrl || "/placeholder.svg"}
                      alt="Profile"
                      width={96}
                      height={96}
                      className="object-cover"
                    />
                  ) : (
                    <User className="h-12 w-12 text-blue-500" />
                  )}
                </div>
                <button
                  className="absolute bottom-0 right-0 bg-primary rounded-full p-1.5 shadow-md"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Edit2 className="h-4 w-4 text-white" />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProfileImageChange}
                  />
                </button>
              </div>
              <h2 className="text-lg font-semibold mt-2">{personalInfo.name || "Your Name"}</h2>
              <p className="text-gray-500 text-sm">{user?.id || ""}</p>
            </div>

            <div className="space-y-5">
              <FormField
                label="Full Name*"
                name="name"
                value={personalInfo.name}
                icon={<User className="h-5 w-5 text-gray-400" />}
                isEditing={isEditing}
                onChange={handlePersonalInfoChange}
                error={errors.name}
              />

              <FormField
                label="Email*"
                name="email"
                value={personalInfo.email}
                icon={<Mail className="h-5 w-5 text-gray-400" />}
                isEditing={isEditing}
                onChange={handlePersonalInfoChange}
                error={errors.email}
              />

              <FormField
                label="Phone Number*"
                name="phone"
                value={personalInfo.phone}
                icon={<Phone className="h-5 w-5 text-gray-400" />}
                isEditing={isEditing}
                onChange={handlePersonalInfoChange}
                error={errors.phone}
              />

              <FormField
                label="Address*"
                name="address"
                value={personalInfo.address}
                icon={<MapPin className="h-5 w-5 text-gray-400" />}
                isEditing={isEditing}
                onChange={handlePersonalInfoChange}
                error={errors.address}
              />

              <FormField
                label="Pin Number*"
                name="pinNumber"
                value={personalInfo.pinNumber}
                icon={<Key className="h-5 w-5 text-gray-400" />}
                isEditing={isEditing}
                onChange={handlePersonalInfoChange}
                error={errors.pinNumber}
              />

              <FormField
                label="RERA Registration Number*"
                name="reraNumber"
                value={personalInfo.reraNumber}
                icon={<FileText className="h-5 w-5 text-gray-400" />}
                isEditing={isEditing}
                onChange={handlePersonalInfoChange}
                error={errors.reraNumber}
              />

              <div className="mt-6">
                <div className="flex justify-between items-center mb-3">
                  <p className="font-medium">Upload Documents*</p>
                  <button
                    className="text-primary text-sm flex items-center"
                    onClick={() => documentInputRef.current?.click()}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Document
                    <input
                      ref={documentInputRef}
                      id="document-upload"
                      type="file"
                      className="hidden"
                      onChange={handleDocumentChange}
                    />
                  </button>
                </div>

                {errors.documents && <p className="text-red-500 text-xs mb-2">{errors.documents}</p>}

                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
                  <select
                    className="w-full p-3 border border-gray-300 rounded-lg bg-white"
                    value={currentDocType}
                    onChange={(e) => setCurrentDocType(e.target.value)}
                  >
                    {documentTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {documents.length > 0 ? (
                  <div className="space-y-3">
                    {documents.map((doc) => (
                      <div key={doc.id} className="flex items-center border border-gray-200 rounded-lg p-3">
                        <div className="flex-shrink-0 mr-3">
                          <div className="w-10 h-14 bg-gray-100 rounded flex items-center justify-center">
                            <FileText className="h-6 w-6 text-gray-400" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{doc.name}</span>
                            <span className="text-xs text-gray-500">{doc.type}</span>
                          </div>
                        </div>
                        <button className="text-red-500 p-2" onClick={() => handleRemoveDocument(doc.id)}>
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <div className="flex flex-col items-center">
                      <Upload className="h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-gray-500 mb-2">No documents uploaded</p>
                      <button className="text-primary text-sm" onClick={() => documentInputRef.current?.click()}>
                        Click to upload
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                className="w-full bg-primary text-white py-3 rounded-lg mt-6 font-medium shadow-sm hover:bg-primary/90 transition-colors flex items-center justify-center"
                onClick={handleSavePersonalInfo}
                disabled={isSaving}
              >
                {isSaving ? <LoadingSpinner /> : "Continue to Bank Details"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 space-y-4">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-6">Bank Information</h2>

            <div className="space-y-5">
              <FormField
                label="Bank Name*"
                name="bankName"
                value={bankInfo.bankName}
                icon={<Building className="h-5 w-5 text-gray-400" />}
                isEditing={isEditing}
                onChange={handleBankInfoChange}
                error={errors.bankName}
              />

              <FormField
                label="Account Number*"
                name="accountNumber"
                value={bankInfo.accountNumber}
                type={showPassword ? "text" : "password"}
                icon={<CreditCard className="h-5 w-5 text-gray-400" />}
                isEditing={isEditing}
                onChange={handleBankInfoChange}
                error={errors.accountNumber}
                endAdornment={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                }
              />

              <FormField
                label="Confirm Account Number*"
                name="confirmAccountNumber"
                value={bankInfo.confirmAccountNumber}
                type={showPassword ? "text" : "password"}
                icon={<CreditCard className="h-5 w-5 text-gray-400" />}
                isEditing={isEditing}
                onChange={handleBankInfoChange}
                error={errors.confirmAccountNumber}
              />

              <div className="relative">
                <FormField
                  label="IFSC CODE*"
                  name="ifscCode"
                  value={bankInfo.ifscCode}
                  icon={<FileText className="h-5 w-5 text-gray-400" />}
                  isEditing={isEditing}
                  onChange={handleBankInfoChange}
                  error={errors.ifscCode}
                  helpText="Search for IFSC"
                  onHelpTextClick={() => setIsSearchingIFSC(true)}
                />

                {isSearchingIFSC && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
                    <div className="p-2">
                      <div className="relative mb-2">
                        <input
                          type="text"
                          placeholder="Search IFSC code..."
                          className="w-full p-2 pl-8 border border-gray-300 rounded"
                          onChange={(e) => searchIFSC(e.target.value)}
                        />
                        <Search className="h-4 w-4 text-gray-400 absolute left-2 top-1/2 transform -translate-y-1/2" />
                      </div>
                      <div className="max-h-40 overflow-y-auto">
                        {ifscResults.map((result, index) => (
                          <div
                            key={index}
                            className="p-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => handleSelectIFSC(result.code)}
                          >
                            <div className="font-medium">{result.code}</div>
                            <div className="text-xs text-gray-500">
                              {result.bank} - {result.branch}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <FormField
                label="Recipient Name*"
                name="recipientName"
                value={bankInfo.recipientName}
                icon={<User className="h-5 w-5 text-gray-400" />}
                isEditing={isEditing}
                onChange={handleBankInfoChange}
                error={errors.recipientName}
              />

              <div className="flex space-x-3 mt-8">
                <button
                  className="flex-1 bg-gray-100 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  onClick={() => setActiveTab("personal")}
                  disabled={isSaving}
                >
                  Back
                </button>
                <button
                  className="flex-1 bg-primary text-white py-3 rounded-lg font-medium shadow-sm hover:bg-primary/90 transition-colors flex items-center justify-center"
                  onClick={handleSaveBankInfo}
                  disabled={isSaving}
                >
                  {isSaving ? <LoadingSpinner /> : "Complete Profile"}
                </button>
              </div>
            </div>
          </div>
        </div>
        
      )}
     
    </div>
  )
}

interface FormFieldProps {
  label: string
  name: string
  value: string
  icon?: React.ReactNode
  type?: string
  helpText?: string
  isEditing: boolean
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  error?: string
  endAdornment?: React.ReactNode
  onHelpTextClick?: () => void
}

function FormField({
  label,
  name,
  value,
  type = "text",
  helpText,
  icon,
  isEditing,
  onChange,
  error,
  endAdornment,
  onHelpTextClick,
}: FormFieldProps) {
  return (
    <div className="mb-1">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <input
          type={type}
          name={name}
          className={`w-full p-3 border ${error ? "border-red-500" : "border-gray-300"} rounded-lg ${
            icon ? "pl-10" : ""
          } ${isEditing ? "bg-white" : "bg-gray-50"} focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all`}
          value={value}
          onChange={onChange}
          readOnly={!isEditing}
        />
        {icon && <div className="absolute left-3 top-1/2 transform -translate-y-1/2">{icon}</div>}
        {endAdornment}
        {helpText && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2" onClick={onHelpTextClick}>
            <span className="text-primary text-sm cursor-pointer">{helpText}</span>
          </div>
        )}
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}

