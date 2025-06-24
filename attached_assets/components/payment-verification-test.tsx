"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, XCircle, Clock, AlertTriangle, CreditCard, Shield } from "lucide-react"

interface PaymentTestResult {
  verified: boolean
  status: string
  message: string
  payment?: any
  expectedAmount?: number
  actualAmount?: number
}

export function PaymentVerificationTest() {
  const [isLoading, setIsLoading] = useState(false)
  const [testResult, setTestResult] = useState<PaymentTestResult | null>(null)
  const [formData, setFormData] = useState({
    transactionId: "",
    amount: "",
    workshopId: "1",
    registrationId: "1",
  })

  // Predefined test cases
  const testCases = [
    {
      name: "Valid Payment",
      transactionId: "TXN123456789",
      amount: "2999",
      expectedResult: "success",
    },
    {
      name: "Invalid Transaction ID",
      transactionId: "TXN999999999",
      amount: "2999",
      expectedResult: "not_found",
    },
    {
      name: "Amount Mismatch",
      transactionId: "TXN123456789",
      amount: "1999",
      expectedResult: "amount_mismatch",
    },
    {
      name: "Pending Payment",
      transactionId: "TXN555666777",
      amount: "1999",
      expectedResult: "pending",
    },
  ]

  const handleVerifyPayment = async () => {
    setIsLoading(true)
    setTestResult(null)

    try {
      const response = await fetch("/api/payments/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transactionId: formData.transactionId,
          amount: Number.parseInt(formData.amount),
          workshopId: Number.parseInt(formData.workshopId),
          registrationId: Number.parseInt(formData.registrationId),
        }),
      })

      const result = await response.json()
      setTestResult(result)
    } catch (error) {
      setTestResult({
        verified: false,
        status: "error",
        message: "Network error occurred",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const runTestCase = (testCase: any) => {
    setFormData({
      ...formData,
      transactionId: testCase.transactionId,
      amount: testCase.amount,
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "not_found":
      case "amount_mismatch":
      case "failed":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800"
      case "not_found":
      case "amount_mismatch":
      case "failed":
        return "bg-red-100 text-red-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Verification Testing</h1>
        <p className="text-gray-600">Test the payment verification system with different scenarios</p>
      </div>

      <Tabs defaultValue="manual" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual">Manual Testing</TabsTrigger>
          <TabsTrigger value="automated">Test Cases</TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Manual Payment Verification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="transactionId">Transaction ID</Label>
                  <Input
                    id="transactionId"
                    placeholder="Enter transaction ID"
                    value={formData.transactionId}
                    onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (₹)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workshopId">Workshop ID</Label>
                  <Input
                    id="workshopId"
                    type="number"
                    placeholder="Workshop ID"
                    value={formData.workshopId}
                    onChange={(e) => setFormData({ ...formData, workshopId: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registrationId">Registration ID</Label>
                  <Input
                    id="registrationId"
                    type="number"
                    placeholder="Registration ID"
                    value={formData.registrationId}
                    onChange={(e) => setFormData({ ...formData, registrationId: e.target.value })}
                  />
                </div>
              </div>

              <Button
                onClick={handleVerifyPayment}
                disabled={isLoading || !formData.transactionId || !formData.amount}
                className="w-full"
              >
                {isLoading ? "Verifying Payment..." : "Verify Payment"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automated" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Automated Test Cases
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {testCases.map((testCase, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{testCase.name}</h3>
                      <p className="text-sm text-gray-600">
                        Transaction: {testCase.transactionId} | Amount: ₹{testCase.amount}
                      </p>
                    </div>
                    <Button variant="outline" onClick={() => runTestCase(testCase)}>
                      Run Test
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Test Results */}
      {testResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(testResult.status)}
              Verification Result
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(testResult.status)}>
                {testResult.status.toUpperCase().replace("_", " ")}
              </Badge>
              <span className="text-sm text-gray-600">
                {testResult.verified ? "Payment Verified" : "Verification Failed"}
              </span>
            </div>

            <Alert>
              <AlertDescription>{testResult.message}</AlertDescription>
            </Alert>

            {testResult.payment && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Payment Details</h4>
                <div className="space-y-1 text-sm text-green-800">
                  <p>Transaction ID: {testResult.payment.transactionId}</p>
                  <p>Amount: ₹{testResult.payment.amount}</p>
                  <p>Payment Method: {testResult.payment.paymentMethod}</p>
                  <p>Timestamp: {new Date(testResult.payment.timestamp).toLocaleString()}</p>
                  {testResult.payment.upiId && <p>UPI ID: {testResult.payment.upiId}</p>}
                </div>
              </div>
            )}

            {testResult.expectedAmount && testResult.actualAmount && (
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-medium text-red-900 mb-2">Amount Mismatch Details</h4>
                <div className="space-y-1 text-sm text-red-800">
                  <p>Expected Amount: ₹{testResult.expectedAmount}</p>
                  <p>Actual Amount: ₹{testResult.actualAmount}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Testing Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Testing Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Available Test Transaction IDs:</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between p-2 bg-gray-50 rounded">
                <span>TXN123456789</span>
                <span className="text-green-600">₹2999 - Success</span>
              </div>
              <div className="flex justify-between p-2 bg-gray-50 rounded">
                <span>TXN987654321</span>
                <span className="text-green-600">₹4999 - Success</span>
              </div>
              <div className="flex justify-between p-2 bg-gray-50 rounded">
                <span>TXN555666777</span>
                <span className="text-yellow-600">₹1999 - Pending</span>
              </div>
              <div className="flex justify-between p-2 bg-gray-50 rounded">
                <span>Any other ID</span>
                <span className="text-red-600">Not Found</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Test Scenarios:</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Use correct transaction ID and amount for successful verification</li>
              <li>• Use wrong amount with correct transaction ID to test amount mismatch</li>
              <li>• Use non-existent transaction ID to test not found scenario</li>
              <li>• Use pending transaction ID to test pending status</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
