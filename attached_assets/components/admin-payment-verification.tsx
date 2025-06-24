"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Eye, FileText } from "lucide-react"

interface PendingPayment {
  id: number
  registrationId: number
  userName: string
  userEmail: string
  workshopTitle: string
  amount: number
  transactionId: string
  paymentScreenshot: string
  upiId?: string
  submittedAt: string
}

const mockPendingPayments: PendingPayment[] = [
  {
    id: 1,
    registrationId: 1,
    userName: "John Doe",
    userEmail: "john@example.com",
    workshopTitle: "Advanced React Development",
    amount: 2999,
    transactionId: "TXN123456789",
    paymentScreenshot: "/placeholder.svg?height=400&width=300",
    upiId: "john@paytm",
    submittedAt: "2024-01-20T10:30:00Z",
  },
  {
    id: 2,
    registrationId: 2,
    userName: "Sarah Johnson",
    userEmail: "sarah@example.com",
    workshopTitle: "AI & Machine Learning Workshop",
    amount: 4999,
    transactionId: "TXN987654321",
    paymentScreenshot: "/placeholder.svg?height=400&width=300",
    submittedAt: "2024-01-22T14:15:00Z",
  },
]

export function AdminPaymentVerification() {
  const [pendingPayments, setPendingPayments] = useState(mockPendingPayments)
  const [selectedPayment, setSelectedPayment] = useState<PendingPayment | null>(null)
  const [adminNotes, setAdminNotes] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleVerifyPayment = async (action: "approve" | "reject") => {
    if (!selectedPayment) return

    setIsProcessing(true)
    setResult(null)

    try {
      const response = await fetch("/api/admin/payments/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          registrationId: selectedPayment.registrationId,
          action,
          adminNotes,
        }),
      })

      const result = await response.json()
      setResult(result)

      if (result.success) {
        // Remove from pending list
        setPendingPayments(pendingPayments.filter((p) => p.id !== selectedPayment.id))
        setSelectedPayment(null)
        setAdminNotes("")
      }
    } catch (error) {
      setResult({
        success: false,
        message: "Network error occurred",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Verification Dashboard</h1>
        <p className="text-gray-600">Review and verify pending payment submissions</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pending Payments List */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Payment Verifications ({pendingPayments.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingPayments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                  <p>No pending payments to verify</p>
                </div>
              ) : (
                pendingPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedPayment?.id === payment.id ? "border-blue-500 bg-blue-50" : "hover:bg-gray-50"
                    }`}
                    onClick={() => setSelectedPayment(payment)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium">{payment.userName}</h3>
                        <p className="text-sm text-gray-600">{payment.userEmail}</p>
                      </div>
                      <Badge variant="outline">₹{payment.amount}</Badge>
                    </div>
                    <p className="text-sm font-medium text-blue-600 mb-1">{payment.workshopTitle}</p>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>TXN: {payment.transactionId}</span>
                      <span>{new Date(payment.submittedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payment Details & Verification */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Verification</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedPayment ? (
              <div className="space-y-6">
                {/* Payment Details */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-3">Payment Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">User:</span>
                      <span>{selectedPayment.userName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Workshop:</span>
                      <span>{selectedPayment.workshopTitle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-medium">₹{selectedPayment.amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transaction ID:</span>
                      <span className="font-mono">{selectedPayment.transactionId}</span>
                    </div>
                    {selectedPayment.upiId && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">UPI ID:</span>
                        <span>{selectedPayment.upiId}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Submitted:</span>
                      <span>{new Date(selectedPayment.submittedAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Screenshot */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Payment Screenshot
                  </h4>
                  <div className="border rounded-lg p-4">
                    <img
                      src={selectedPayment.paymentScreenshot || "/placeholder.svg"}
                      alt="Payment Screenshot"
                      className="w-full max-w-sm mx-auto rounded-lg"
                    />
                  </div>
                </div>

                {/* Admin Notes */}
                <div className="space-y-2">
                  <Label htmlFor="adminNotes">Admin Notes (Optional)</Label>
                  <Textarea
                    id="adminNotes"
                    placeholder="Add any notes about this payment verification..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleVerifyPayment("approve")}
                    disabled={isProcessing}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {isProcessing ? "Processing..." : "Approve Payment"}
                  </Button>
                  <Button
                    onClick={() => handleVerifyPayment("reject")}
                    disabled={isProcessing}
                    variant="destructive"
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    {isProcessing ? "Processing..." : "Reject Payment"}
                  </Button>
                </div>

                {/* Result */}
                {result && (
                  <Alert>
                    <FileText className="h-4 w-4" />
                    <AlertDescription>
                      {result.message}
                      {result.success && (
                        <div className="mt-2 text-sm">
                          <p>New Status: {result.newStatus}</p>
                          <p>Verified At: {new Date(result.verifiedAt).toLocaleString()}</p>
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-2" />
                <p>Select a payment from the list to verify</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
