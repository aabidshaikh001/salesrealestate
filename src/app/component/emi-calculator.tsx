"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface EMICalculatorProps {
  isOpen: boolean
  onClose: () => void
}

export default function EMICalculator({ isOpen, onClose }: EMICalculatorProps) {
  const [loanAmount, setLoanAmount] = useState<string>("300000")
  const [interestRate, setInterestRate] = useState<string>("10")
  const [loanTenure, setLoanTenure] = useState<string>("4")
  const [emiAmount, setEmiAmount] = useState<number>(0)
  const [amountInWords, setAmountInWords] = useState<string>("")
  const [totalInterest, setTotalInterest] = useState<number>(0)
  const [totalAmount, setTotalAmount] = useState<number>(0)

  // Convert number to Indian currency format
  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString("en-IN", {
      maximumFractionDigits: 0,
      style: "decimal",
    })
  }

  // Convert number to words (Indian system)
  const convertToWords = (amount: number): string => {
    if (isNaN(amount)) return ""

    if (amount >= 10000000) {
      return `Rupees ${(amount / 10000000).toFixed(2)} Crore`
    } else if (amount >= 100000) {
      return `Rupees ${(amount / 100000).toFixed(2)} Lakh`
    } else if (amount >= 1000) {
      return `Rupees ${(amount / 1000).toFixed(2)} Thousand`
    }
    return `Rupees ${amount}`
  }

  // Handle input changes with validation
  const handleLoanAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "")
    setLoanAmount(value)
  }

  const handleInterestRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, "")
    if (value === "" || (Number.parseFloat(value) >= 0 && Number.parseFloat(value) <= 100)) {
      setInterestRate(value)
    }
  }

  const handleLoanTenureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "")
    if (value === "" || (Number.parseInt(value) >= 0 && Number.parseInt(value) <= 30)) {
      setLoanTenure(value)
    }
  }

  // Calculate EMI, total interest and total amount
  const calculateEMI = () => {
    const principal = Number.parseFloat(loanAmount) || 0
    const rate = (Number.parseFloat(interestRate) || 0) / 12 / 100 // Monthly interest rate
    const time = (Number.parseFloat(loanTenure) || 0) * 12 // Total months

    if (principal > 0 && rate > 0 && time > 0) {
      // EMI formula: P × r × (1 + r)^n / ((1 + r)^n - 1)
      const emi = (principal * rate * Math.pow(1 + rate, time)) / (Math.pow(1 + rate, time) - 1)
      const totalPayment = emi * time
      const interestPayment = totalPayment - principal

      setEmiAmount(Math.round(emi))
      setTotalInterest(Math.round(interestPayment))
      setTotalAmount(Math.round(totalPayment))
    } else {
      setEmiAmount(0)
      setTotalInterest(0)
      setTotalAmount(0)
    }
  }

  // Update EMI calculation whenever inputs change
  useEffect(() => {
    calculateEMI()
  }, [loanAmount, interestRate, loanTenure])

  // Update amount in words when loan amount changes
  useEffect(() => {
    setAmountInWords(convertToWords(Number.parseFloat(loanAmount) || 0))
  }, [loanAmount])

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[90vh] sm:h-[550px] rounded-t-xl overflow-y-auto">
        <SheetHeader className="relative">
          <SheetTitle className="text-center">EMI Calculator</SheetTitle>
          
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="loanAmount">Loan Amount (₹)</Label>
            <Input
              id="loanAmount"
              value={loanAmount}
              onChange={handleLoanAmountChange}
              className="bg-gray-50"
              placeholder="Enter loan amount"
              inputMode="numeric"
            />
            <p className="text-xs text-gray-500">{amountInWords}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="interestRate">Interest Rate (%)</Label>
            <Input
              id="interestRate"
              value={interestRate}
              onChange={handleInterestRateChange}
              className="bg-gray-50"
              placeholder="Enter interest rate"
              inputMode="decimal"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="loanTenure">Loan Tenure (Years)</Label>
            <Input
              id="loanTenure"
              value={loanTenure}
              onChange={handleLoanTenureChange}
              className="bg-gray-50"
              placeholder="Enter loan tenure"
              inputMode="numeric"
            />
          </div>

          {emiAmount > 0 && (
            <div className="space-y-4 mt-4 pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="font-medium">Loan EMI Amount Per Month</span>
                <span className="font-bold text-xl">₹ {formatCurrency(emiAmount)}</span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Total Interest Payable</span>
                <span className="font-medium">₹ {formatCurrency(totalInterest)}</span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Total Payment (Principal + Interest)</span>
                <span className="font-medium">₹ {formatCurrency(totalAmount)}</span>
              </div>

              <div className="mt-4 pt-4 border-t">
                <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{
                      width: `${(Number.parseFloat(loanAmount) / totalAmount) * 100}%`,
                    }}
                  ></div>
                </div>
                <div className="flex justify-between mt-1 text-xs">
                  <span>Principal: {Math.round((Number.parseFloat(loanAmount) / totalAmount) * 100)}%</span>
                  <span>Interest: {Math.round((totalInterest / totalAmount) * 100)}%</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

