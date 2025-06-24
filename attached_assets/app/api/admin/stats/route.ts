import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Mock statistics - in production, calculate from database
    const stats = {
      totalUsers: 1247,
      totalWorkshops: 89,
      totalRevenue: 245000,
      pendingApprovals: 12,
      totalRegistrations: 456,
      confirmedRegistrations: 389,
      pendingRegistrations: 45,
      rejectedRegistrations: 22,
      monthlyRevenue: [
        { month: "Jan", revenue: 35000 },
        { month: "Feb", revenue: 42000 },
        { month: "Mar", revenue: 38000 },
        { month: "Apr", revenue: 45000 },
        { month: "May", revenue: 52000 },
        { month: "Jun", revenue: 48000 },
      ],
      topCategories: [
        { category: "Technology", count: 45 },
        { category: "Marketing", count: 23 },
        { category: "Design", count: 18 },
        { category: "Finance", count: 12 },
      ],
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return NextResponse.json({ error: "Failed to fetch statistics" }, { status: 500 })
  }
}
