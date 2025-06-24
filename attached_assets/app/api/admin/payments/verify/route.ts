import { type NextRequest, NextResponse } from "next/server"

// Admin endpoint to manually verify payments
export async function POST(request: NextRequest) {
  try {
    const { registrationId, action, adminNotes } = await request.json()

    if (!registrationId || !action) {
      return NextResponse.json({ error: "Missing required fields: registrationId, action" }, { status: 400 })
    }

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid action. Must be 'approve' or 'reject'" }, { status: 400 })
    }

    // Simulate admin verification process
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (action === "approve") {
      // Approve payment and confirm registration
      console.log(`Admin approved payment for registration ${registrationId}`)

      return NextResponse.json({
        success: true,
        message: "Payment approved and registration confirmed",
        registrationId,
        newStatus: "confirmed",
        adminNotes,
        verifiedAt: new Date().toISOString(),
      })
    } else {
      // Reject payment
      console.log(`Admin rejected payment for registration ${registrationId}`)

      return NextResponse.json({
        success: true,
        message: "Payment rejected",
        registrationId,
        newStatus: "payment_rejected",
        adminNotes,
        verifiedAt: new Date().toISOString(),
      })
    }
  } catch (error) {
    console.error("Admin payment verification error:", error)
    return NextResponse.json({ error: "Admin verification failed" }, { status: 500 })
  }
}
