"use client"

import { useState, useEffect, useMemo } from "react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  Calendar,
  MapPin,
  Star,
  Clock,
  ArrowRight,
  Filter,
  Sparkles,
  X,
  SlidersHorizontal,
  User,
  Building2,
} from "lucide-react"
import Link from "next/link"

// Mock workshop data with enhanced search fields
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
  },
  {
    id: 3,
    title: "AI & Machine Learning Workshop",
    organizer: "DataScience Hub",
    instructor: "Dr. Priya Patel",
    date: "2024-02-25",
    time: "11:00 AM",
    location: "Koramangala, Bangalore",
    city: "Bangalore",
    price: 4999,
    mode: "automated",
    rating: 4.7,
    participants: 234,
    category: "Technology",
    duration: "8 hours",
    level: "Advanced",
    image: "/placeholder.svg?height=300&width=400",
    description: "Dive deep into AI and ML algorithms with hands-on projects.",
    tags: ["ai", "machine learning", "python", "tensorflow", "data science", "neural networks"],
    featured: true,
  },
  {
    id: 4,
    title: "UX/UI Design Fundamentals",
    organizer: "Design Studio",
    instructor: "Anjali Mehta",
    date: "2024-03-01",
    time: "9:00 AM",
    location: "Online",
    city: "Delhi",
    price: 1999,
    mode: "automated",
    rating: 4.6,
    participants: 78,
    category: "Design",
    duration: "5 hours",
    level: "Beginner",
    image: "/placeholder.svg?height=300&width=400",
    description: "Learn the fundamentals of user experience and interface design.",
    tags: ["ux", "ui", "design", "figma", "prototyping", "user research"],
    featured: false,
  },
  {
    id: 5,
    title: "Financial Planning Workshop",
    organizer: "FinanceGuru Ltd",
    instructor: "Vikram Singh",
    date: "2024-03-05",
    time: "3:00 PM",
    location: "Connaught Place, Delhi",
    city: "Delhi",
    price: 0,
    mode: "manual",
    rating: 4.5,
    participants: 45,
    category: "Finance",
    duration: "3 hours",
    level: "Beginner",
    image: "/placeholder.svg?height=300&width=400",
    description: "Master personal financial planning and investment strategies.",
    tags: ["finance", "investment", "budgeting", "mutual funds", "tax planning"],
    featured: false,
  },
  {
    id: 6,
    title: "Cloud Computing with AWS",
    organizer: "CloudTech Solutions",
    instructor: "Amit Kumar",
    date: "2024-03-10",
    time: "1:00 PM",
    location: "Online",
    city: "Bangalore",
    price: 3499,
    mode: "automated",
    rating: 4.8,
    participants: 167,
    category: "Technology",
    duration: "7 hours",
    level: "Intermediate",
    image: "/placeholder.svg?height=300&width=400",
    description: "Learn AWS cloud services and deployment strategies.",
    tags: ["aws", "cloud computing", "devops", "ec2", "s3", "lambda"],
    featured: true,
  },
  {
    id: 7,
    title: "Photography Masterclass",
    organizer: "Creative Lens",
    instructor: "Ravi Kapoor",
    date: "2024-03-12",
    time: "10:00 AM",
    location: "Anna Nagar, Chennai",
    city: "Chennai",
    price: 2499,
    mode: "automated",
    rating: 4.7,
    participants: 92,
    category: "Creative",
    duration: "6 hours",
    level: "Intermediate",
    image: "/placeholder.svg?height=300&width=400",
    description: "Master photography techniques from composition to post-processing.",
    tags: ["photography", "camera", "composition", "lighting", "editing", "portrait"],
    featured: false,
  },
  {
    id: 8,
    title: "Data Analytics with Python",
    organizer: "Analytics Pro",
    instructor: "Neha Gupta",
    date: "2024-03-15",
    time: "2:00 PM",
    location: "Online",
    city: "Pune",
    price: 3999,
    mode: "automated",
    rating: 4.6,
    participants: 134,
    category: "Technology",
    duration: "7 hours",
    level: "Intermediate",
    image: "/placeholder.svg?height=300&width=400",
    description: "Learn data analysis and visualization using Python and pandas.",
    tags: ["python", "data analytics", "pandas", "matplotlib", "statistics", "visualization"],
    featured: false,
  },
]

const categories = ["All Categories", "Technology", "Marketing", "Design", "Finance", "Creative", "Business"]
const cities = ["All Cities", "Mumbai", "Bangalore", "Delhi", "Chennai", "Pune", "Hyderabad"]
const levels = ["All Levels", "Beginner", "Intermediate", "Advanced"]
const instructors = ["All Instructors", ...Array.from(new Set(workshops.map((w) => w.instructor)))]

export default function WorkshopsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [selectedCity, setSelectedCity] = useState("All Cities")
  const [selectedLevel, setSelectedLevel] = useState("All Levels")
  const [selectedInstructor, setSelectedInstructor] = useState("All Instructors")
  const [priceFilter, setPriceFilter] = useState("All")
  const [sortBy, setSortBy] = useState("relevance")
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  // Advanced search and filtering logic
  const filteredWorkshops = useMemo(() => {
    let filtered = workshops

    // Search filter - searches in title, instructor, organizer, description, and tags
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (workshop) =>
          workshop.title.toLowerCase().includes(searchLower) ||
          workshop.instructor.toLowerCase().includes(searchLower) ||
          workshop.organizer.toLowerCase().includes(searchLower) ||
          workshop.description.toLowerCase().includes(searchLower) ||
          workshop.category.toLowerCase().includes(searchLower) ||
          workshop.tags.some((tag) => tag.toLowerCase().includes(searchLower)),
      )
    }

    // Category filter
    if (selectedCategory !== "All Categories") {
      filtered = filtered.filter((workshop) => workshop.category === selectedCategory)
    }

    // City filter
    if (selectedCity !== "All Cities") {
      filtered = filtered.filter((workshop) => workshop.city === selectedCity)
    }

    // Level filter
    if (selectedLevel !== "All Levels") {
      filtered = filtered.filter((workshop) => workshop.level === selectedLevel)
    }

    // Instructor filter
    if (selectedInstructor !== "All Instructors") {
      filtered = filtered.filter((workshop) => workshop.instructor === selectedInstructor)
    }

    // Price filter
    if (priceFilter === "Free") {
      filtered = filtered.filter((workshop) => workshop.price === 0)
    } else if (priceFilter === "Paid") {
      filtered = filtered.filter((workshop) => workshop.price > 0)
    }

    // Sorting
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        filtered.sort((a, b) => b.price - a.price)
        break
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case "date":
        filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        break
      case "popularity":
        filtered.sort((a, b) => b.participants - a.participants)
        break
      default: // relevance
        // Featured workshops first, then by rating
        filtered.sort((a, b) => {
          if (a.featured && !b.featured) return -1
          if (!a.featured && b.featured) return 1
          return b.rating - a.rating
        })
    }

    return filtered
  }, [searchTerm, selectedCategory, selectedCity, selectedLevel, selectedInstructor, priceFilter, sortBy])

  // Update active filters
  useEffect(() => {
    const filters = []
    if (selectedCategory !== "All Categories") filters.push(selectedCategory)
    if (selectedCity !== "All Cities") filters.push(selectedCity)
    if (selectedLevel !== "All Levels") filters.push(selectedLevel)
    if (selectedInstructor !== "All Instructors") filters.push(selectedInstructor)
    if (priceFilter !== "All") filters.push(priceFilter)
    setActiveFilters(filters)
  }, [selectedCategory, selectedCity, selectedLevel, selectedInstructor, priceFilter])

  const clearAllFilters = () => {
    setSearchTerm("")
    setSelectedCategory("All Categories")
    setSelectedCity("All Cities")
    setSelectedLevel("All Levels")
    setSelectedInstructor("All Instructors")
    setPriceFilter("All")
    setSortBy("relevance")
  }

  const removeFilter = (filterToRemove: string) => {
    if (categories.includes(filterToRemove)) setSelectedCategory("All Categories")
    if (cities.includes(filterToRemove)) setSelectedCity("All Cities")
    if (levels.includes(filterToRemove)) setSelectedLevel("All Levels")
    if (instructors.includes(filterToRemove)) setSelectedInstructor("All Instructors")
    if (filterToRemove === "Free" || filterToRemove === "Paid") setPriceFilter("All")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`text-center transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Explore Workshops</h1>
            <p className="text-xl opacity-90 max-w-3xl mx-auto mb-8">
              Discover amazing workshops from top companies across India
            </p>

            {/* Enhanced Search Bar */}
            <div className="max-w-4xl mx-auto bg-white rounded-2xl p-2 shadow-2xl">
              <div className="flex flex-col md:flex-row gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="Search by title, instructor, category, or skills..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-14 border-0 text-lg focus-visible:ring-0"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="h-14 px-4 rounded-lg border-0 bg-gray-50 text-gray-700 min-w-[160px]"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  <Button
                    size="lg"
                    className="h-14 px-8 bg-blue-600 hover:bg-blue-700"
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  >
                    <SlidersHorizontal className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <section className="py-6 bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger>
                  <SelectValue placeholder="City" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  {levels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedInstructor} onValueChange={setSelectedInstructor}>
                <SelectTrigger>
                  <SelectValue placeholder="Instructor" />
                </SelectTrigger>
                <SelectContent>
                  {instructors.map((instructor) => (
                    <SelectItem key={instructor} value={instructor}>
                      {instructor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={priceFilter} onValueChange={setPriceFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Price" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Prices</SelectItem>
                  <SelectItem value="Free">Free</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="popularity">Popularity</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={clearAllFilters} className="w-full">
                Clear All
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <section className="py-4 bg-gray-100 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-gray-600">Active filters:</span>
              {activeFilters.map((filter) => (
                <Badge
                  key={filter}
                  variant="secondary"
                  className="flex items-center gap-1 cursor-pointer hover:bg-gray-300"
                  onClick={() => removeFilter(filter)}
                >
                  {filter}
                  <X className="h-3 w-3" />
                </Badge>
              ))}
              <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-xs">
                Clear all
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Search Results */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                {filteredWorkshops.length} Workshop{filteredWorkshops.length !== 1 ? "s" : ""} Found
              </h2>
              {searchTerm && (
                <p className="text-gray-600 mt-1">
                  Results for "<span className="font-medium">{searchTerm}</span>"
                </p>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Filter className="h-4 w-4" />
                <span>Sort by: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1).replace("-", " ")}</span>
              </div>
            </div>
          </div>

          {/* Search Suggestions */}
          {searchTerm && filteredWorkshops.length === 0 && (
            <div className="mb-8 p-6 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Search Suggestions:</h3>
              <div className="flex flex-wrap gap-2">
                {["React", "Python", "Design", "Marketing", "AWS", "Photography"].map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchTerm(suggestion)}
                    className="text-blue-700 border-blue-300 hover:bg-blue-100"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {filteredWorkshops.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No workshops found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search criteria or browse all workshops</p>
              <Button onClick={clearAllFilters}>Clear All Filters</Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWorkshops.map((workshop, index) => (
                <Card
                  key={workshop.id}
                  className={`group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden ${
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                  }`}
                  style={{ transitionDelay: `${index * 50}ms` }}
                >
                  <div className="relative">
                    <img
                      src={workshop.image || "/placeholder.svg"}
                      alt={workshop.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {workshop.featured && (
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
                          <Sparkles className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <Badge
                        variant={workshop.price === 0 ? "secondary" : "default"}
                        className="bg-white/90 text-gray-900"
                      >
                        {workshop.price === 0 ? "Free" : `₹${workshop.price}`}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-5">
                    <div className="mb-3">
                      <Badge variant="outline" className="text-xs mb-2">
                        {workshop.category}
                      </Badge>
                      <h3 className="font-semibold text-lg text-gray-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {workshop.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                        <Building2 className="h-3 w-3" />
                        <span>{workshop.organizer}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="h-3 w-3" />
                        <span>{workshop.instructor}</span>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{workshop.description}</p>

                    <div className="space-y-2 mb-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(workshop.date).toLocaleDateString()} • {workshop.time}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{workshop.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>
                          {workshop.duration} • {workshop.level}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{workshop.rating}</span>
                        <span className="text-sm text-gray-500">({workshop.participants})</span>
                      </div>
                      <Badge variant="outline" className="capitalize text-xs">
                        {workshop.mode}
                      </Badge>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {workshop.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {workshop.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{workshop.tags.length - 3}
                        </Badge>
                      )}
                    </div>

                    <Button asChild className="w-full group">
                      <Link href={`/workshops/${workshop.id}`}>
                        View Details
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Load More Button (for future pagination) */}
          {filteredWorkshops.length > 0 && filteredWorkshops.length >= 6 && (
            <div className="text-center mt-12">
              <Button variant="outline" size="lg">
                Load More Workshops
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
