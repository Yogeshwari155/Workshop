import { type NextRequest, NextResponse } from "next/server"

// Mock registrations database
const registrations = [
  {
    id: 1,
    userId: 1,
    workshopId: 1,
    status: "confirmed",
    registrationType: "automated",
    paymentStatus: "completed",
    paymentAmount: 2999,
    transactionId: "TXN123456789",
    paymentScreenshot: "/placeholder.svg?height=200&width=300",
    upiId: "user@paytm",
    notes: "",
    registeredAt: "2024-01-20T00:00:00Z",
    updatedAt: "2024-01-20T00:00:00Z",
  },
  {
    id: 2,
    userId: 1,
    workshopId: 2,
    status: "pending_approval",
    registrationType: "manual",
    paymentStatus: "not_required",
    paymentAmount: 0,
    transactionId: null,
    paymentScreenshot: null,
    upiId: null,
    notes: "",
    registeredAt: "2024-01-22T00:00:00Z",
    updatedAt: "2024-01-22T00:00:00Z",
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const workshopId = searchParams.get("workshopId")
    const status = searchParams.get("status")

    let filteredRegistrations = [...registrations]

    if (userId) {
      filteredRegistrations = filteredRegistrations.filter((r) => r.userId === Number.parseInt(userId))
    }

    if (workshopId) {
      filteredRegistrations = filteredRegistrations.filter((r) => r.workshopId === Number.parseInt(workshopId))
    }

    if (status) {
      filteredRegistrations = filteredRegistrations.filter((r) => r.status === status)
    }

    return NextResponse.json(filteredRegistrations)
  } catch (error) {
    console.error("Error fetching registrations:", error)
    return NextResponse.json({ error: "Failed to fetch registrations" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, workshopId, registrationType, paymentAmount, transactionId, paymentScreenshot, upiId, notes } = body

    // Validate required fields
    if (!userId || !workshopId || !registrationType) {
      return NextResponse.json(
        { error: "Missing required fields: userId, workshopId, registrationType" },
        { status: 400 },
      )
    }

    // Check if user is already registered for this workshop
    const existingRegistration = registrations.find((r) => r.userId === userId && r.workshopId === workshopId)
    if (existingRegistration) {
      return NextResponse.json({ error: "User is already registered for this workshop" }, { status: 409 })
    }

    // Determine status based on registration type and payment
    let status = "pending_approval"
    let paymentStatus = "not_required"

    if (registrationType === "automated") {
      if (paymentAmount > 0) {
        status = "payment_pending"
        paymentStatus = "pending"
      } else {
        status = "confirmed"
        paymentStatus = "not_required"
      }
    }

    // Create new registration
    const newRegistration = {
      id: registrations.length + 1,
      userId,
      workshopId,
      status,
      registrationType,
      paymentStatus,
      paymentAmount: paymentAmount || 0,
      transactionId: transactionId || null,
      paymentScreenshot: paymentScreenshot || null,
      upiId: upiId || null,
      notes: notes || "",
      registeredAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    registrations.push(newRegistration)

    return NextResponse.json(newRegistration, { status: 201 })
  } catch (error) {
    console.error("Error creating registration:", error)
    return NextResponse.json({ error: "Failed to create registration" }, { status: 500 })
  }
}
