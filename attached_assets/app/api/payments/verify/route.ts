import { type NextRequest, NextResponse } from "next/server"

// Mock payment verification service
interface PaymentVerification {
  transactionId: string
  amount: number
  status: "success" | "failed" | "pending"
  paymentMethod: "upi" | "bank_transfer" | "card"
  timestamp: string
  merchantId?: string
  upiId?: string
}

// Mock payment database - in production, this would be your payment gateway's API
const mockPayments: PaymentVerification[] = [
  {
    transactionId: "TXN123456789",
    amount: 2999,
    status: "success",
    paymentMethod: "upi",
    timestamp: "2024-01-20T10:30:00Z",
    upiId: "user@paytm",
  },
  {
    transactionId: "TXN987654321",
    amount: 4999,
    status: "success",
    paymentMethod: "bank_transfer",
    timestamp: "2024-01-25T14:15:00Z",
  },
  {
    transactionId: "TXN555666777",
    amount: 1999,
    status: "pending",
    paymentMethod: "upi",
    timestamp: "2024-01-26T09:45:00Z",
    upiId: "test@gpay",
  },
]

export async function POST(request: NextRequest) {
  try {
    const { transactionId, amount, workshopId, registrationId } = await request.json()

    // Validate required fields
    if (!transactionId || !amount || !workshopId || !registrationId) {
      return NextResponse.json(
        { error: "Missing required fields: transactionId, amount, workshopId, registrationId" },
        { status: 400 },
      )
    }

    // Simulate payment verification delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Find payment in mock database
    const payment = mockPayments.find((p) => p.transactionId === transactionId)

    if (!payment) {
      return NextResponse.json(
        {
          verified: false,
          status: "not_found",
          message: "Transaction not found. Please check the transaction ID.",
        },
        { status: 404 },
      )
    }

    // Verify amount matches
    if (payment.amount !== amount) {
      return NextResponse.json(
        {
          verified: false,
          status: "amount_mismatch",
          message: `Amount mismatch. Expected: ₹${amount}, Found: ₹${payment.amount}`,
          expectedAmount: amount,
          actualAmount: payment.amount,
        },
        { status: 400 },
      )
    }

    // Check payment status
    if (payment.status === "failed") {
      return NextResponse.json(
        {
          verified: false,
          status: "failed",
          message: "Payment failed. Please try again with a different payment method.",
        },
        { status: 400 },
      )
    }

    if (payment.status === "pending") {
      return NextResponse.json(
        {
          verified: false,
          status: "pending",
          message: "Payment is still being processed. Please wait a few minutes and try again.",
        },
        { status: 202 },
      )
    }

    // Payment verified successfully
    return NextResponse.json({
      verified: true,
      status: "success",
      message: "Payment verified successfully",
      payment: {
        transactionId: payment.transactionId,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        timestamp: payment.timestamp,
        upiId: payment.upiId,
      },
      registrationId,
      workshopId,
    })
  } catch (error) {
    console.error("Payment verification error:", error)
    return NextResponse.json({ error: "Payment verification failed" }, { status: 500 })
  }
}
