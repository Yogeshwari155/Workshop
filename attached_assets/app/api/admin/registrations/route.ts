import { type NextRequest, NextResponse } from "next/server"

// Mock registrations with user and workshop details
const registrationsWithDetails = [
  {
    id: 1,
    userId: 1,
    userName: "John Doe",
    userEmail: "john@example.com",
    workshopId: 1,
    workshopTitle: "Advanced React Development",
    workshopPrice: 2999,
    status: "pending_payment",
    registrationType: "automated",
    paymentStatus: "pending",
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
    userId: 2,
    userName: "Sarah Johnson",
    userEmail: "sarah@example.com",
    workshopId: 2,
    workshopTitle: "Digital Marketing Masterclass",
    workshopPrice: 0,
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
    const status = searchParams.get("status")
    const search = searchParams.get("search")

    let filteredRegistrations = [...registrationsWithDetails]

    // Filter by status
    if (status && status !== "all") {
      filteredRegistrations = filteredRegistrations.filter((r) => r.status === status)
    }

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase()
      filteredRegistrations = filteredRegistrations.filter(
        (r) =>
          r.userName.toLowerCase().includes(searchLower) ||
          r.userEmail.toLowerCase().includes(searchLower) ||
          r.workshopTitle.toLowerCase().includes(searchLower),
      )
    }

    return NextResponse.json(filteredRegistrations)
  } catch (error) {
    console.error("Error fetching admin registrations:", error)
    return NextResponse.json({ error: "Failed to fetch registrations" }, { status: 500 })
  }
}
