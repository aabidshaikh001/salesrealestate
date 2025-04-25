"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  TrendingUp,
  BarChart3,
  MapPin,
  Download,
  IndianRupee,
  Home,
  Clock,
  Calculator,
  X,
  Printer,
  Plus,
  Minus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { useRouter } from "next/navigation"

// Import React Chart.js components
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import { Line, Bar, Pie } from "react-chartjs-2"
import { jsPDF } from "jspdf"
import "jspdf-autotable"
import * as XLSX from "xlsx"
import Header from "../component/header"
import Footer from "../component/footer"

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend)

// Mock data - replace with API data later
const revenueData = {
  totalRevenue: 4875000,
  lastMonthRevenue: 3250000,
  growthRate: 12.5,
  pendingAmount: 750000,
  totalTransactions: 42,
  activeListings: 28,
  topCities: [
    { name: "Delhi", revenue: 1850000, percentage: 38 },
    { name: "Jaipur", revenue: 1425000, percentage: 29 },
    { name: "Gurgaon", revenue: 950000, percentage: 19 },
    { name: "Noida", revenue: 650000, percentage: 14 },
  ],
  revenueByType: [
    { type: "Residential", revenue: 2750000, percentage: 56 },
    { type: "Commercial", revenue: 1250000, percentage: 26 },
    { type: "Land", revenue: 875000, percentage: 18 },
  ],
  monthlyRevenue: [
    { month: "Jan", revenue: 2100000 },
    { month: "Feb", revenue: 2450000 },
    { month: "Mar", revenue: 2300000 },
    { month: "Apr", revenue: 2800000 },
    { month: "May", revenue: 3100000 },
    { month: "Jun", revenue: 3250000 },
    { month: "Jul", revenue: 4875000 },
  ],
  recentTransactions: [
    {
      id: "TRX-001",
      property: "3 BHK Apartment, Malviya Nagar",
      client: "Rahul Sharma",
      amount: 250000,
      date: "2023-07-15",
      status: "completed",
      city: "Delhi",
      type: "Residential",
    },
    {
      id: "TRX-002",
      property: "Commercial Space, Connaught Place",
      client: "Tata Consultancy",
      amount: 450000,
      date: "2023-07-12",
      status: "completed",
      city: "Delhi",
      type: "Commercial",
    },
    {
      id: "TRX-003",
      property: "2 BHK Villa, Vaishali Nagar",
      client: "Priya Patel",
      amount: 180000,
      date: "2023-07-10",
      status: "pending",
      city: "Jaipur",
      type: "Residential",
    },
    {
      id: "TRX-004",
      property: "Plot in Sector 45",
      client: "Vikram Singh",
      amount: 320000,
      date: "2023-07-05",
      status: "completed",
      city: "Gurgaon",
      type: "Land",
    },
    {
      id: "TRX-005",
      property: "Office Space, Bani Park",
      client: "Infosys Ltd",
      amount: 275000,
      date: "2023-07-03",
      status: "pending",
      city: "Jaipur",
      type: "Commercial",
    },
  ],
  topPerformers: [
    {
      name: "Amit Kumar",
      revenue: 1250000,
      transactions: 12,
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      name: "Neha Gupta",
      revenue: 980000,
      transactions: 9,
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      name: "Rajesh Verma",
      revenue: 750000,
      transactions: 7,
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ],
}

// Format currency in Indian format
const formatIndianCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount)
}

// Format date in Indian format
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date)
}

export default function RevenuePage() {
  const router = useRouter()
  const [timeFilter, setTimeFilter] = useState("monthly")
  const [cityFilter, setCityFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [filteredTransactions, setFilteredTransactions] = useState(revenueData.recentTransactions)
  const [showCalculator, setShowCalculator] = useState(false)
  const [showExportOptions, setShowExportOptions] = useState(false)

  // Commission Calculator State
  const [propertyValue, setPropertyValue] = useState(5000000)
  const [commissionRate, setCommissionRate] = useState(2)
  const [tdsRate, setTdsRate] = useState(1)
  const [gstRate, setGstRate] = useState(18)
  const [calculatorResults, setCalculatorResults] = useState({
    commission: 0,
    gstAmount: 0,
    tdsAmount: 0,
    netCommission: 0,
  })

  // Calculate commission, GST, and TDS
  useEffect(() => {
    const commission = (propertyValue * commissionRate) / 100
    const gstAmount = (commission * gstRate) / 100
    const tdsAmount = (commission * tdsRate) / 100
    const netCommission = commission + gstAmount - tdsAmount

    setCalculatorResults({
      commission,
      gstAmount,
      tdsAmount,
      netCommission,
    })
  }, [propertyValue, commissionRate, tdsRate, gstRate])

  // Filter transactions based on selected filters
  useEffect(() => {
    let filtered = revenueData.recentTransactions

    if (cityFilter !== "all") {
      filtered = filtered.filter((t) => t.city === cityFilter)
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((t) => t.type === typeFilter)
    }

    setFilteredTransactions(filtered)
  }, [cityFilter, typeFilter])

  // Chart data for revenue trend
  const lineChartData = {
    labels: revenueData.monthlyRevenue.map((item) => item.month),
    datasets: [
      {
        label: "Monthly Revenue",
        data: revenueData.monthlyRevenue.map((item) => item.revenue),
        borderColor: "rgb(99, 102, 241)",
        backgroundColor: "rgba(99, 102, 241, 0.1)",
        tension: 0.3,
        fill: true,
      },
    ],
  }

  // Chart data for revenue by city
  const pieChartData = {
    labels: revenueData.topCities.map((city) => city.name),
    datasets: [
      {
        data: revenueData.topCities.map((city) => city.revenue),
        backgroundColor: [
          "rgba(99, 102, 241, 0.8)",
          "rgba(59, 130, 246, 0.8)",
          "rgba(16, 185, 129, 0.8)",
          "rgba(245, 158, 11, 0.8)",
        ],
        borderWidth: 1,
      },
    ],
  }

  // Chart data for revenue by property type
  const barChartData = {
    labels: revenueData.revenueByType.map((item) => item.type),
    datasets: [
      {
        label: "Revenue by Property Type",
        data: revenueData.revenueByType.map((item) => item.revenue),
        backgroundColor: "rgba(99, 102, 241, 0.8)",
        borderRadius: 6,
      },
    ],
  }

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
  }

  // Go back to previous page
  const goBack = () => {
    router.back()
  }

  // Export functions
  const exportAsPDF = () => {
    const doc = new jsPDF() 

    // Add title
    doc.setFontSize(18)
    doc.text("Revenue Report", 14, 22)

    // Add date
    doc.setFontSize(11)
    doc.text(`Generated on: ${new Date().toLocaleDateString("en-IN")}`, 14, 30)

    // Add summary
    doc.setFontSize(14)
    doc.text("Revenue Summary", 14, 40)

    doc.setFontSize(10)
    doc.text(`Total Revenue: ${formatIndianCurrency(revenueData.totalRevenue)}`, 14, 50)
    doc.text(`Growth Rate: ${revenueData.growthRate}%`, 14, 55)
    doc.text(`Total Transactions: ${revenueData.totalTransactions}`, 14, 60)
    doc.text(`Pending Amount: ${formatIndianCurrency(revenueData.pendingAmount)}`, 14, 65)

    // Add transactions table
    doc.setFontSize(14)
    doc.text("Recent Transactions", 14, 80)

    // @ts-expect-error - autoTable exists but TypeScript may not recognize it
doc.autoTable({
    startY: 85,
    head: [["ID", "Property", "Client", "City", "Date", "Amount", "Status"]],
    body: filteredTransactions.map((t) => [
      t.id,
      t.property,
      t.client,
      t.city,
      formatDate(t.date),
      formatIndianCurrency(t.amount),
      t.status,
    ]),
    theme: "grid",
    headStyles: { fillColor: [99, 102, 241] },
  });
  

    // Save the PDF
    doc.save("revenue-report.pdf")
    setShowExportOptions(false)
  }

  const exportAsExcel = () => {
    // Create workbook
    const wb = XLSX.utils.book_new()

    // Create summary worksheet
    const summaryData = [
      ["Revenue Report"],
      [`Generated on: ${new Date().toLocaleDateString("en-IN")}`],
      [],
      ["Revenue Summary"],
      ["Total Revenue", revenueData.totalRevenue],
      ["Growth Rate", `${revenueData.growthRate}%`],
      ["Total Transactions", revenueData.totalTransactions],
      ["Pending Amount", revenueData.pendingAmount],
      [],
      ["Top Cities"],
      ["City", "Revenue", "Percentage"],
      ...revenueData.topCities.map((city) => [city.name, city.revenue, `${city.percentage}%`]),
    ]

    const summaryWs = XLSX.utils.aoa_to_sheet(summaryData)
    XLSX.utils.book_append_sheet(wb, summaryWs, "Summary")

    // Create transactions worksheet
    const transactionsData = [
      ["Recent Transactions"],
      ["ID", "Property", "Client", "City", "Date", "Amount", "Status"],
      ...filteredTransactions.map((t) => [t.id, t.property, t.client, t.city, t.date, t.amount, t.status]),
    ]

    const transactionsWs = XLSX.utils.aoa_to_sheet(transactionsData)
    XLSX.utils.book_append_sheet(wb, transactionsWs, "Transactions")

    // Save the Excel file
    XLSX.writeFile(wb, "revenue-report.xlsx")
    setShowExportOptions(false)
  }

  const printReport = () => {
    window.print()
    setShowExportOptions(false)
  }

  // Increment/decrement functions for calculator
  const incrementCommissionRate = () => {
    setCommissionRate((prev) => Math.min(prev + 0.5, 10))
  }

  const decrementCommissionRate = () => {
    setCommissionRate((prev) => Math.max(prev - 0.5, 0))
  }

  const incrementGstRate = () => {
    setGstRate((prev) => Math.min(prev + 1, 28))
  }

  const decrementGstRate = () => {
    setGstRate((prev) => Math.max(prev - 1, 0))
  }

  const incrementTdsRate = () => {
    setTdsRate((prev) => Math.min(prev + 0.5, 10))
  }

  const decrementTdsRate = () => {
    setTdsRate((prev) => Math.max(prev - 0.5, 0))
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pb-20">
    <Header/>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto">
          <div className="flex items-center justify-between h-16 px-4">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={goBack} className="mr-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-semibold">Revenue</h1>
            </div>

            <div className="flex items-center gap-2">
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-[100px] h-9 md:w-[130px]">
                  <SelectValue placeholder="Time Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="sm" className="h-9" onClick={() => setShowExportOptions(true)}>
                <Download className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Export</span>
              </Button>

              <Button variant="default" size="sm" className="h-9 bg-red-600" onClick={() => setShowCalculator(true)}>
                <Calculator className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Calculator</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Revenue Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs md:text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <h3 className="text-lg md:text-2xl font-bold mt-1">
                    {formatIndianCurrency(revenueData.totalRevenue)}
                  </h3>
                  <div className="flex items-center mt-1">
                    <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 text-xs">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {revenueData.growthRate}%
                    </Badge>
                  </div>
                </div>
                <div className="bg-indigo-100 p-2 md:p-3 rounded-full">
                  <IndianRupee className="h-4 w-4 md:h-5 md:w-5 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs md:text-sm font-medium text-muted-foreground">Transactions</p>
                  <h3 className="text-lg md:text-2xl font-bold mt-1">{revenueData.totalTransactions}</h3>
                  <div className="flex items-center mt-1">
                    <span className="text-xs text-muted-foreground">This month</span>
                  </div>
                </div>
                <div className="bg-blue-100 p-2 md:p-3 rounded-full">
                  <BarChart3 className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs md:text-sm font-medium text-muted-foreground">Pending</p>
                  <h3 className="text-lg md:text-2xl font-bold mt-1">
                    {formatIndianCurrency(revenueData.pendingAmount)}
                  </h3>
                  <div className="flex items-center mt-1">
                    <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      Pending
                    </Badge>
                  </div>
                </div>
                <div className="bg-amber-100 p-2 md:p-3 rounded-full">
                  <Clock className="h-4 w-4 md:h-5 md:w-5 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs md:text-sm font-medium text-muted-foreground">Listings</p>
                  <h3 className="text-lg md:text-2xl font-bold mt-1">{revenueData.activeListings}</h3>
                  <div className="flex items-center mt-1">
                    <span className="text-xs text-muted-foreground">Properties</span>
                  </div>
                </div>
                <div className="bg-green-100 p-2 md:p-3 rounded-full">
                  <Home className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card className="lg:col-span-2">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base md:text-lg">Revenue Trend</CardTitle>
              <CardDescription className="text-xs md:text-sm">Monthly revenue performance</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <div className="h-[250px] md:h-[300px]">
                <Line data={lineChartData} options={chartOptions} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base md:text-lg">Revenue by City</CardTitle>
              <CardDescription className="text-xs md:text-sm">Distribution across locations</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <div className="h-[250px] md:h-[300px] flex items-center justify-center">
                <Pie data={pieChartData} options={chartOptions} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue by Property Type */}
        <Card className="mb-6">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base md:text-lg">Revenue by Property Type</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Performance across different property categories
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-[200px] md:h-[250px]">
              <Bar data={barChartData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        {/* Top Cities Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base md:text-lg">Top Cities</CardTitle>
              <CardDescription className="text-xs md:text-sm">Revenue by location</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                {revenueData.topCities.map((city, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="font-medium text-sm">{city.name}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-xs md:text-sm font-medium">{formatIndianCurrency(city.revenue)}</span>
                        <span className="text-xs text-muted-foreground ml-2">({city.percentage}%)</span>
                      </div>
                    </div>
                    <Progress value={city.percentage} className="h-2 text-red-600" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base md:text-lg">Top Performers</CardTitle>
              <CardDescription className="text-xs md:text-sm">Agents with highest revenue</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                {revenueData.topPerformers.map((performer, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 md:h-10 md:w-10 mr-2 md:mr-3">
                        <img src={performer.avatar || "/placeholder.svg"} alt={performer.name} />
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{performer.name}</p>
                        <p className="text-xs text-muted-foreground">{performer.transactions} transactions</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">{formatIndianCurrency(performer.revenue)}</p>
                      <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 mt-1 text-xs">
                        Top {index + 1}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader className="p-4">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <CardTitle className="text-base md:text-lg">Recent Transactions</CardTitle>
                <CardDescription className="text-xs md:text-sm">Latest property deals and commissions</CardDescription>
              </div>
              <div className="flex gap-2">
                <Select value={cityFilter} onValueChange={setCityFilter}>
                  <SelectTrigger className="w-full md:w-[120px] h-9 text-xs md:text-sm">
                    <SelectValue placeholder="City" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cities</SelectItem>
                    <SelectItem value="Delhi">Delhi</SelectItem>
                    <SelectItem value="Jaipur">Jaipur</SelectItem>
                    <SelectItem value="Gurgaon">Gurgaon</SelectItem>
                    <SelectItem value="Noida">Noida</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full md:w-[140px] h-9 text-xs md:text-sm">
                    <SelectValue placeholder="Property Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Residential">Residential</SelectItem>
                    <SelectItem value="Commercial">Commercial</SelectItem>
                    <SelectItem value="Land">Land</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 md:p-4">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground text-xs">ID</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground text-xs">Property</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground text-xs hidden md:table-cell">
                      Client
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground text-xs hidden md:table-cell">
                      City
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground text-xs hidden md:table-cell">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground text-xs">Amount</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground text-xs">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((transaction, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-3 px-4 text-xs">{transaction.id}</td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-xs md:text-sm">{transaction.property}</p>
                            <p className="text-xs text-muted-foreground md:hidden">{transaction.client}</p>
                            <p className="text-xs text-muted-foreground md:hidden">
                              {transaction.city} • {formatDate(transaction.date)}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-xs hidden md:table-cell">{transaction.client}</td>
                        <td className="py-3 px-4 text-xs hidden md:table-cell">{transaction.city}</td>
                        <td className="py-3 px-4 text-xs hidden md:table-cell">{formatDate(transaction.date)}</td>
                        <td className="py-3 px-4 font-medium text-xs">{formatIndianCurrency(transaction.amount)}</td>
                        <td className="py-3 px-4">
                          <Badge
                            variant="outline"
                            className={
                              transaction.status === "completed"
                                ? "bg-green-50 text-green-600 border-green-200 text-xs"
                                : "bg-amber-50 text-amber-600 border-amber-200 text-xs"
                            }
                          >
                            {transaction.status === "completed" ? "Completed" : "Pending"}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-muted-foreground text-sm">
                        No transactions found matching your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t p-4">
            <p className="text-xs md:text-sm text-muted-foreground">
              Showing {filteredTransactions.length} of {revenueData.recentTransactions.length} transactions
            </p>
            <Button variant="outline" size="sm" className="text-xs">
              View All
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Mobile App Style Bottom Sheet for Commission Calculator */}
      <AnimatePresence>
        {showCalculator && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCalculator(false)}
            />

            {/* Bottom Sheet */}
            <motion.div
              className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-3xl z-50 overflow-hidden"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              {/* Drag Handle */}
              <div className="flex justify-center pt-2 pb-4">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
              </div>

              <div className="px-6 pb-8">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-xl font-semibold">Commission Calculator</h3>
                    <p className="text-sm text-muted-foreground">Calculate with GST & TDS</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowCalculator(false)}
                    className="rounded-full h-8 w-8"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <div className="space-y-6">
                  {/* Property Value Slider */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label htmlFor="propertyValue" className="text-sm font-medium">
                        Property Value
                      </Label>
                      <span className="text-lg font-semibold text-indigo-600">
                        {formatIndianCurrency(propertyValue)}
                      </span>
                    </div>
                    <Slider
                      id="propertyValue"
                      value={[propertyValue]}
                      min={1000000}
                      max={50000000}
                      step={100000}
                      onValueChange={(value) => setPropertyValue(value[0])}
                      className="my-4"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>₹10L</span>
                      <span>₹5Cr</span>
                    </div>
                  </div>

                  {/* Rate Controls */}
                  <div className="grid grid-cols-3 gap-4">
                    {/* Commission Rate */}
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl">
                      <Label className="text-xs text-muted-foreground">Commission</Label>
                      <div className="flex items-center justify-between mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={decrementCommissionRate}
                          className="h-8 w-8 rounded-full"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-lg font-semibold">{commissionRate}%</span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={incrementCommissionRate}
                          className="h-8 w-8 rounded-full"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {/* GST Rate */}
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl">
                      <Label className="text-xs text-muted-foreground">GST</Label>
                      <div className="flex items-center justify-between mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={decrementGstRate}
                          className="h-8 w-8 rounded-full"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-lg font-semibold">{gstRate}%</span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={incrementGstRate}
                          className="h-8 w-8 rounded-full"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {/* TDS Rate */}
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl">
                      <Label className="text-xs text-muted-foreground">TDS</Label>
                      <div className="flex items-center justify-between mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={decrementTdsRate}
                          className="h-8 w-8 rounded-full"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-lg font-semibold">{tdsRate}%</span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={incrementTdsRate}
                          className="h-8 w-8 rounded-full"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Results Card */}
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-5 mt-4">
                    <h4 className="text-sm font-medium text-indigo-900 dark:text-indigo-300 mb-4">
                      Calculation Results
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-indigo-700 dark:text-indigo-300">
                          Commission ({commissionRate}%)
                        </span>
                        <span className="font-medium">{formatIndianCurrency(calculatorResults.commission)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-indigo-700 dark:text-indigo-300">GST ({gstRate}%)</span>
                        <span className="font-medium text-amber-600">
                          + {formatIndianCurrency(calculatorResults.gstAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-indigo-700 dark:text-indigo-300">TDS ({tdsRate}%)</span>
                        <span className="font-medium text-red-600">
                          - {formatIndianCurrency(calculatorResults.tdsAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between pt-3 border-t border-indigo-200 dark:border-indigo-700">
                        <span className="font-medium text-indigo-900 dark:text-indigo-100">Net Commission</span>
                        <span className="text-xl font-bold text-indigo-600">
                          {formatIndianCurrency(calculatorResults.netCommission)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full py-6 text-base rounded-xl mt-4" onClick={() => setShowCalculator(false)}>
                    Done
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile App Style Bottom Sheet for Export Options */}
      <AnimatePresence>
        {showExportOptions && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowExportOptions(false)}
            />

            {/* Bottom Sheet */}
            <motion.div
              className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-3xl z-50 overflow-hidden"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              {/* Drag Handle */}
              <div className="flex justify-center pt-2 pb-4">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
              </div>

              <div className="px-6 pb-8">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-xl font-semibold">Export Options</h3>
                    <p className="text-sm text-muted-foreground">Choose export format</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowExportOptions(false)}
                    className="rounded-full h-8 w-8"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start h-14 text-base" onClick={exportAsPDF}>
                    <div className="bg-red-100 p-2 rounded-full mr-3">
                      <Download className="h-5 w-5 text-red-600" />
                    </div>
                    Export as PDF
                  </Button>

                  <Button variant="outline" className="w-full justify-start h-14 text-base" onClick={exportAsExcel}>
                    <div className="bg-green-100 p-2 rounded-full mr-3">
                      <Download className="h-5 w-5 text-green-600" />
                    </div>
                    Export as Excel
                  </Button>

                  <Button variant="outline" className="w-full justify-start h-14 text-base" onClick={printReport}>
                    <div className="bg-blue-100 p-2 rounded-full mr-3">
                      <Printer className="h-5 w-5 text-blue-600" />
                    </div>
                    Print Report
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <Footer/>
    </div>
  )
}

