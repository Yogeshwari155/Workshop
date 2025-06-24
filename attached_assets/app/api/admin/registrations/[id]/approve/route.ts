import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    // In a real app, update the registration status in the database
    // For now, we'll just simulate the approval

    // Send approval email (mock)
    console.log(`Sending approval email for registration ${id}`)

    return NextResponse.json({
      message: "Registration approved successfully",
      registrationId: id,
      status: "confirmed",
    })
  } catch (error) {
    console.error("Error approving registration:", error)
    return NextResponse.json({ error: "Failed to approve registration" }, { status: 500 })
  }
}
