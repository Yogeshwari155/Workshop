import { type NextRequest, NextResponse } from "next/server"

// Mock database - same as in workshops/route.ts
const workshops = [
  {
    id: 1,
    title: "Advanced React Development",
    organizer: "TechCorp Solutions",
    instructor: "Sarah Johnson",
    date: "2024-02-15",
    time: "10:00 AM",
    location: "Online",
    city: "Mumbai",
    price: 2999,
    mode: "automated",
    rating: 4.8,
    participants: 156,
    category: "Technology",
    duration: "6 hours",
    level: "Advanced",
    image: "/placeholder.svg?height=300&width=400",
    description: "Master advanced React concepts including hooks, context, and performance optimization.",
    tags: ["react", "javascript", "frontend", "hooks", "performance", "web development"],
    featured: true,
    maxSeats: 50,
    availableSeats: 12,
    prerequisites: ["Basic React knowledge", "JavaScript ES6+", "HTML/CSS"],
    whatYouLearn: [
      "Advanced React Hooks patterns",
      "Context API and state management",
      "Performance optimization techniques",
      "Testing React applications",
      "Deployment and CI/CD",
    ],
    agenda: [
      { time: "10:00 - 11:30", topic: "Advanced Hooks and Custom Hooks" },
      { time: "11:45 - 13:00", topic: "Context API and State Management" },
      { time: "14:00 - 15:30", topic: "Performance Optimization" },
      { time: "15:45 - 16:00", topic: "Q&A and Wrap-up" },
    ],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  // Add other workshops...
]

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const workshop = workshops.find((w) => w.id === id)

    if (!workshop) {
      return NextResponse.json({ error: "Workshop not found" }, { status: 404 })
    }

    return NextResponse.json(workshop)
  } catch (error) {
    console.error("Error fetching workshop:", error)
    return NextResponse.json({ error: "Failed to fetch workshop" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const body = await request.json()

    const workshopIndex = workshops.findIndex((w) => w.id === id)

    if (workshopIndex === -1) {
      return NextResponse.json({ error: "Workshop not found" }, { status: 404 })
    }

    // Update workshop
    workshops[workshopIndex] = {
      ...workshops[workshopIndex],
      ...body,
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json(workshops[workshopIndex])
  } catch (error) {
    console.error("Error updating workshop:", error)
    return NextResponse.json({ error: "Failed to update workshop" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const workshopIndex = workshops.findIndex((w) => w.id === id)

    if (workshopIndex === -1) {
      return NextResponse.json({ error: "Workshop not found" }, { status: 404 })
    }

    workshops.splice(workshopIndex, 1)

    return NextResponse.json({ message: "Workshop deleted successfully" })
  } catch (error) {
    console.error("Error deleting workshop:", error)
    return NextResponse.json({ error: "Failed to delete workshop" }, { status: 500 })
  }
}
