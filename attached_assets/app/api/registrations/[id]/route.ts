import { type NextRequest, NextResponse } from "next/server"

// Mock registrations database (same as in registrations/route.ts)
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
]

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const registration = registrations.find((r) => r.id === id)

    if (!registration) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 })
    }

    return NextResponse.json(registration)
  } catch (error) {
    console.error("Error fetching registration:", error)
    return NextResponse.json({ error: "Failed to fetch registration" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const body = await request.json()

    const registrationIndex = registrations.findIndex((r) => r.id === id)

    if (registrationIndex === -1) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 })
    }

    // Update registration
    registrations[registrationIndex] = {
      ...registrations[registrationIndex],
      ...body,
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json(registrations[registrationIndex])
  } catch (error) {
    console.error("Error updating registration:", error)
    return NextResponse.json({ error: "Failed to update registration" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const registrationIndex = registrations.findIndex((r) => r.id === id)

    if (registrationIndex === -1) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 })
    }

    registrations.splice(registrationIndex, 1)

    return NextResponse.json({ message: "Registration deleted successfully" })
  } catch (error) {
    console.error("Error deleting registration:", error)
    return NextResponse.json({ error: "Failed to delete registration" }, { status: 500 })
  }
}
