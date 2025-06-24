"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Navbar } from "@/components/navbar"
import { Search, MapPin, Calendar, Users, Star, ArrowRight, Sparkles, TrendingUp } from "lucide-react"
import { useRouter } from "next/navigation"

const featuredWorkshops = [
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
    image: "/placeholder.svg?height=300&width=400",
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
    image: "/placeholder.svg?height=300&width=400",
    featured: true,
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
    image: "/placeholder.svg?height=300&width=400",
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
    image: "/placeholder.svg?height=300&width=400",
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
    image: "/placeholder.svg?height=300&width=400",
    featured: false,
  },
  {
    id: 6,
    title: "Photography Masterclass",
    organizer: "Creative Lens",
    instructor: "Ravi Kapoor",
    date: "2024-03-10",
    time: "1:00 PM",
    location: "Anna Nagar, Chennai",
    city: "Chennai",
    price: 3499,
    mode: "automated",
    rating: 4.8,
    participants: 167,
    category: "Creative",
    image: "/placeholder.svg?height=300&width=400",
    featured: true,
  },
]

const cities = ["All Cities", "Mumbai", "Bangalore", "Delhi", "Chennai", "Pune", "Hyderabad"]
const categories = ["All Categories", "Technology", "Marketing", "Design", "Finance", "Creative", "Business"]

// Trending topics
const trendingTopics = [
  { name: "AI & Machine Learning", count: 15 },
  { name: "React Development", count: 12 },
  { name: "Digital Marketing", count: 8 },
  { name: "Cloud Computing", count: 6 },
]

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCity, setSelectedCity] = useState("All Cities")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [isVisible, setIsVisible] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (searchTerm) params.set("search", searchTerm)
    if (selectedCity !== "All Cities") params.set("city", selectedCity)
    if (selectedCategory !== "All Categories") params.set("category", selectedCategory)

    router.push(`/workshops?${params.toString()}`)
  }

  const handleQuickSearch = (term: string) => {
    router.push(`/workshops?search=${encodeURIComponent(term)}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div
            className={`text-center transition-all duration-1000 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Discover Amazing
              <span className="block">Workshops Near You</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-3xl mx-auto">
              Join thousands of professionals learning from industry experts across India
            </p>

            {/* Enhanced Search Bar */}
            <div className="max-w-4xl mx-auto bg-white rounded-2xl p-2 shadow-2xl">
              <div className="flex flex-col md:flex-row gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="Search workshops, skills, instructors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    className="pl-12 h-14 border-0 text-lg focus-visible:ring-0"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="h-14 px-4 rounded-lg border-0 bg-gray-50 text-gray-700 min-w-[140px]"
                  >
                    {cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
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
                  <Button size="lg" className="h-14 px-8 bg-blue-600 hover:bg-blue-700" onClick={handleSearch}>
                    <Search className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-12 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-gray-600">Active Workshops</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">10K+</div>
              <div className="text-gray-600">Happy Learners</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-pink-600 mb-2">150+</div>
              <div className="text-gray-600">Partner Companies</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">25+</div>
              <div className="text-gray-600">Cities Covered</div>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Topics */}
      <section className="py-12 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
              <TrendingUp className="h-6 w-6 text-orange-500" />
              Trending Topics
            </h2>
            <p className="text-gray-600">Most searched skills this week</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {trendingTopics.map((topic, index) => (
              <Card
                key={topic.name}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleQuickSearch(topic.name)}
              >
                <CardContent className="p-4 text-center">
                  <h3 className="font-semibold text-gray-900 mb-1">{topic.name}</h3>
                  <p className="text-sm text-gray-600">{topic.count} workshops</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Workshops */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Workshops</h2>
              <p className="text-gray-600">Handpicked workshops from top companies</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/workshops">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredWorkshops.slice(0, 6).map((workshop, index) => (
              <Card
                key={workshop.id}
                className={`group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
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
                    <p className="text-sm text-gray-600">{workshop.organizer}</p>
                  </div>

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
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{workshop.rating}</span>
                      <span className="text-sm text-gray-500">({workshop.participants})</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>{workshop.participants} joined</span>
                    </div>
                  </div>

                  <Button asChild className="w-full">
                    <Link href={`/workshops/${workshop.id}`}>View Details</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Browse by City */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Browse by City</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Find workshops happening in your city or explore opportunities in other locations
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {cities.slice(1).map((city) => (
              <Card
                key={city}
                className="group hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1"
                onClick={() => router.push(`/workshops?city=${encodeURIComponent(city)}`)}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{city}</h3>
                  <p className="text-sm text-gray-500 mt-1">{Math.floor(Math.random() * 50) + 10} workshops</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Learning?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of professionals who have advanced their careers through our workshops
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild className="text-lg px-8 py-3">
              <Link href="/workshops">Explore Workshops</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="text-lg px-8 py-3 text-white border-white hover:bg-white hover:text-blue-600"
            >
              <Link href="/auth">Create Account</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">WorkshopHub</h3>
              <p className="text-gray-400 mb-4">
                Professional workshop booking platform connecting learners with industry experts.
              </p>
              <div className="flex space-x-4">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-sm">f</span>
                </div>
                <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center">
                  <span className="text-sm">t</span>
                </div>
                <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center">
                  <span className="text-sm">in</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/workshops" className="hover:text-white transition-colors">
                    Workshops
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-white transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="hover:text-white transition-colors">
                    Help Center
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Categories</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/workshops?category=Technology" className="hover:text-white transition-colors">
                    Technology
                  </Link>
                </li>
                <li>
                  <Link href="/workshops?category=Marketing" className="hover:text-white transition-colors">
                    Marketing
                  </Link>
                </li>
                <li>
                  <Link href="/workshops?category=Design" className="hover:text-white transition-colors">
                    Design
                  </Link>
                </li>
                <li>
                  <Link href="/workshops?category=Finance" className="hover:text-white transition-colors">
                    Business
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/privacy" className="hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/refund" className="hover:text-white transition-colors">
                    Refund Policy
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="hover:text-white transition-colors">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 WorkshopHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
