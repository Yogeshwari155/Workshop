"use client"

import type React from "react"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Upload, CheckCircle, CreditCard, Copy, Smartphone } from "lucide-react"
import Link from "next/link"

// Mock workshop data - in real app, fetch from API
const workshopData = {
  1: {
    id: 1,
    title: "Advanced React Development",
    price: 2999,
    organizer: "TechCorp Solutions",
  },
  2: {
    id: 2,
    title: "Digital Marketing Masterclass",
    price: 0,
    organizer: "Marketing Pro Inc",
  },
  3: {
    id: 3,
    title: "AI & Machine Learning Workshop",
    price: 4999,
    organizer: "DataScience Hub",
  },
  4: {
    id: 4,
    title: "UX/UI Design Fundamentals",
    price: 1999,
    organizer: "Design Studio",
  },
  5: {
    id: 5,
    title: "Financial Planning Workshop",
    price: 0,
    organizer: "FinanceGuru Ltd",
  },
  6: {
    id: 6,
    title: "Cloud Computing with AWS",
    price: 3499,
    organizer: "CloudTech Solutions",
  },
}

export default function PaymentPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [isUploading, setIsUploading] = useState(false)
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [transactionId, setTransactionId] = useState("")
  const [notes, setNotes] = useState("")
  const [upiId, setUpiId] = useState("")

  const workshopId = Number.parseInt(params.id as string)
  const workshop = workshopData[workshopId as keyof typeof workshopData]

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 5MB",
          variant: "destructive",
        })
        return
      }
      setScreenshot(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!screenshot) {
      toast({
        title: "Screenshot required",
        description: "Please upload a payment screenshot",
        variant: "destructive",
      })
      return
    }

    if (!transactionId.trim()) {
      toast({
        title: "Transaction ID required",
        description: "Please enter the transaction ID",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      // In real app, upload to server
      await new Promise((resolve) => setTimeout(resolve, 2000)) // Simulate upload

      // Redirect to confirmation page
      router.push(`/workshops/${workshopId}/confirmation?type=paid`)
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: "Payment details copied to clipboard",
    })
  }

  if (!user) {
    router.push("/auth")
    return null
  }

  if (!workshop) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Workshop Not Found</h1>
            <Button asChild>
              <Link href="/workshops">Back to Workshops</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href={`/workshops/${workshopId}`} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Workshop
            </Link>
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Payment Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Instructions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Workshop Details</h3>
                <div className="space-y-1 text-blue-800">
                  <p className="font-medium">{workshop.title}</p>
                  <p className="text-sm">{workshop.organizer}</p>
                  <p className="text-lg font-bold">Amount: ₹{workshop.price}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    UPI Payment (Recommended)
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">UPI ID:</p>
                        <p className="font-medium">workshophub@paytm</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => copyToClipboard("workshophub@paytm")}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Phone Number:</p>
                        <p className="font-medium">+91 98765 43210</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => copyToClipboard("+91 98765 43210")}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Bank Transfer Details</h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Account Name:</span>
                      <span className="font-medium">WorkshopHub Pvt Ltd</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Account Number:</span>
                      <span className="font-medium">1234567890</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">IFSC Code:</span>
                      <span className="font-medium">HDFC0001234</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bank:</span>
                      <span className="font-medium">HDFC Bank</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">Payment Steps</h3>
                <ol className="text-green-800 text-sm space-y-1 list-decimal list-inside">
                  <li>Make payment using UPI or Bank Transfer</li>
                  <li>Take a screenshot of the transaction</li>
                  <li>Upload the screenshot and enter transaction details</li>
                  <li>Submit the form to complete registration</li>
                </ol>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <h3 className="font-semibold text-orange-900 mb-2">Important Notes</h3>
                <ul className="text-orange-800 text-sm space-y-1">
                  <li>• Payment verification may take 24-48 hours</li>
                  <li>• Keep the transaction receipt for your records</li>
                  <li>• Contact support if you face any issues</li>
                  <li>• Refunds will be processed within 5-7 business days</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Upload Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Payment Proof
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="upiId">UPI ID Used (Optional)</Label>
                  <Input
                    id="upiId"
                    placeholder="Enter the UPI ID you used for payment"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="screenshot">Payment Screenshot *</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                    <input
                      id="screenshot"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label htmlFor="screenshot" className="cursor-pointer">
                      {screenshot ? (
                        <div className="space-y-2">
                          <CheckCircle className="h-8 w-8 text-green-500 mx-auto" />
                          <p className="text-sm font-medium">{screenshot.name}</p>
                          <p className="text-xs text-gray-500">Click to change</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                          <p className="text-sm font-medium">Click to upload screenshot</p>
                          <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transactionId">Transaction ID *</Label>
                  <Input
                    id="transactionId"
                    placeholder="Enter transaction/reference ID"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any additional information about the payment"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isUploading || !screenshot || !transactionId.trim()}
                >
                  {isUploading ? "Uploading..." : "Submit Payment Proof"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
