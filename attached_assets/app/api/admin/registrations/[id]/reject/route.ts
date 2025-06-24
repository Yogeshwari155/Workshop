import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const { reason } = await request.json()

    // In a real app, update the registration status in the database
    // For now, we'll just simulate the rejection

    // Send rejection email (mock)
    console.log(`Sending rejection email for registration ${id} with reason: ${reason}`)

    return NextResponse.json({
      message: "Registration rejected successfully",
      registrationId: id,
      status: "rejected",
      reason,
    })
  } catch (error) {
    console.error("Error rejecting registration:", error)
    return NextResponse.json({ error: "Failed to reject registration" }, { status: 500 })
  }
}
