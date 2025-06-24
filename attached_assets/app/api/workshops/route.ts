import { type NextRequest, NextResponse } from "next/server"

// Mock database - in production, this would be a real database
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
  {
    id: 2,
    title: "Digital Marketing Masterclass",
    organizer: "Marketing Pro Inc",
    instructor: "Rahul Sharma",
    date: "2024-02-20",
    time: "2:00 PM",
    location: "Bandra, Mumbai",
    city: "Mumbai",
    price: 0,
    mode: "manual",
    rating: 4.9,
    participants: 89,
    category: "Marketing",
    duration: "4 hours",
    level: "Intermediate",
    image: "/placeholder.svg?height=300&width=400",
    description: "Learn cutting-edge digital marketing strategies from industry experts.",
    tags: ["digital marketing", "seo", "social media", "advertising", "analytics"],
    featured: false,
    maxSeats: 100,
    availableSeats: 25,
    prerequisites: ["Basic marketing knowledge", "Social media familiarity", "Computer literacy"],
    whatYouLearn: [
      "Social media marketing strategies",
      "Search Engine Optimization (SEO)",
      "Content marketing best practices",
      "Google Ads and Facebook Ads",
      "Analytics and performance tracking",
    ],
    agenda: [
      { time: "14:00 - 15:00", topic: "Digital Marketing Fundamentals" },
      { time: "15:15 - 16:15", topic: "Social Media and Content Strategy" },
      { time: "16:30 - 17:30", topic: "SEO and Paid Advertising" },
      { time: "17:30 - 18:00", topic: "Analytics and Q&A" },
    ],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  // Add more workshops...
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Extract query parameters
    const search = searchParams.get("search")
    const category = searchParams.get("category")
    const city = searchParams.get("city")
    const level = searchParams.get("level")
    const instructor = searchParams.get("instructor")
    const priceFilter = searchParams.get("price")
    const sortBy = searchParams.get("sort") || "relevance"
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    let filteredWorkshops = [...workshops]

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase()
      filteredWorkshops = filteredWorkshops.filter(
        (workshop) =>
          workshop.title.toLowerCase().includes(searchLower) ||
          workshop.instructor.toLowerCase().includes(searchLower) ||
          workshop.organizer.toLowerCase().includes(searchLower) ||
          workshop.description.toLowerCase().includes(searchLower) ||
          workshop.category.toLowerCase().includes(searchLower) ||
          workshop.tags.some((tag) => tag.toLowerCase().includes(searchLower)),
      )
    }

    // Apply filters
    if (category && category !== "All Categories") {
      filteredWorkshops = filteredWorkshops.filter((workshop) => workshop.category === category)
    }

    if (city && city !== "All Cities") {
      filteredWorkshops = filteredWorkshops.filter((workshop) => workshop.city === city)
    }

    if (level && level !== "All Levels") {
      filteredWorkshops = filteredWorkshops.filter((workshop) => workshop.level === level)
    }

    if (instructor && instructor !== "All Instructors") {
      filteredWorkshops = filteredWorkshops.filter((workshop) => workshop.instructor === instructor)
    }

    if (priceFilter === "Free") {
      filteredWorkshops = filteredWorkshops.filter((workshop) => workshop.price === 0)
    } else if (priceFilter === "Paid") {
      filteredWorkshops = filteredWorkshops.filter((workshop) => workshop.price > 0)
    }

    // Apply sorting
    switch (sortBy) {
      case "price-low":
        filteredWorkshops.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        filteredWorkshops.sort((a, b) => b.price - a.price)
        break
      case "rating":
        filteredWorkshops.sort((a, b) => b.rating - a.rating)
        break
      case "date":
        filteredWorkshops.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        break
      case "popularity":
        filteredWorkshops.sort((a, b) => b.participants - a.participants)
        break
      default: // relevance
        filteredWorkshops.sort((a, b) => {
          if (a.featured && !b.featured) return -1
          if (!a.featured && b.featured) return 1
          return b.rating - a.rating
        })
    }

    // Apply pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedWorkshops = filteredWorkshops.slice(startIndex, endIndex)

    return NextResponse.json({
      workshops: paginatedWorkshops,
      pagination: {
        page,
        limit,
        total: filteredWorkshops.length,
        totalPages: Math.ceil(filteredWorkshops.length / limit),
        hasNext: endIndex < filteredWorkshops.length,
        hasPrev: page > 1,
      },
      filters: {
        categories: [...new Set(workshops.map((w) => w.category))],
        cities: [...new Set(workshops.map((w) => w.city))],
        levels: [...new Set(workshops.map((w) => w.level))],
        instructors: [...new Set(workshops.map((w) => w.instructor))],
      },
    })
  } catch (error) {
    console.error("Error fetching workshops:", error)
    return NextResponse.json({ error: "Failed to fetch workshops" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    const requiredFields = ["title", "organizer", "instructor", "date", "time", "location", "category", "level"]
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    // Create new workshop
    const newWorkshop = {
      id: workshops.length + 1,
      ...body,
      participants: 0,
      rating: 0,
      featured: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    workshops.push(newWorkshop)

    return NextResponse.json(newWorkshop, { status: 201 })
  } catch (error) {
    console.error("Error creating workshop:", error)
    return NextResponse.json({ error: "Failed to create workshop" }, { status: 500 })
  }
}
