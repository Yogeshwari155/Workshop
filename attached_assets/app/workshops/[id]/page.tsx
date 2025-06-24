"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, Star, Building2, Clock, Users, ArrowLeft, CheckCircle, AlertCircle, UserX } from "lucide-react"
import Link from "next/link"

// Mock workshop data (in real app, fetch from API)
const workshopData = {
  1: {
    id: 1,
    title: "Advanced React Development",
    organizer: "TechCorp Solutions",
    date: "2024-02-15",
    time: "10:00 AM",
    location: "Online",
    price: 2999,
    mode: "automated",
    rating: 4.8,
    participants: 156,
    category: "Technology",
    duration: "6 hours",
    level: "Advanced",
    image: "/placeholder.svg?height=400&width=600",
    description:
      "Master advanced React concepts including hooks, context, and performance optimization. This comprehensive workshop covers state management, testing, and deployment strategies.",
    instructor: "Sarah Johnson",
    instructorBio: "Senior React Developer at TechCorp with 8+ years of experience",
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
    maxSeats: 50,
    availableSeats: 12,
  },
  2: {
    id: 2,
    title: "Digital Marketing Masterclass",
    organizer: "Marketing Pro Inc",
    date: "2024-02-20",
    time: "2:00 PM",
    location: "Bandra, Mumbai",
    price: 0,
    mode: "manual",
    rating: 4.9,
    participants: 89,
    category: "Marketing",
    duration: "4 hours",
    level: "Intermediate",
    image: "/placeholder.svg?height=400&width=600",
    description:
      "Learn cutting-edge digital marketing strategies from industry experts. This workshop covers social media marketing, SEO, content marketing, and paid advertising campaigns.",
    instructor: "Rahul Sharma",
    instructorBio: "Digital Marketing Director at Marketing Pro Inc with 10+ years of experience",
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
    maxSeats: 100,
    availableSeats: 25,
  },
  3: {
    id: 3,
    title: "AI & Machine Learning Workshop",
    organizer: "DataScience Hub",
    date: "2024-02-25",
    time: "11:00 AM",
    location: "Koramangala, Bangalore",
    price: 4999,
    mode: "automated",
    rating: 4.7,
    participants: 234,
    category: "Technology",
    duration: "8 hours",
    level: "Advanced",
    image: "/placeholder.svg?height=400&width=600",
    description:
      "Dive deep into AI and ML algorithms with hands-on projects. Learn neural networks, deep learning, and practical implementation using Python and TensorFlow.",
    instructor: "Dr. Priya Patel",
    instructorBio: "AI Research Scientist at DataScience Hub with PhD in Machine Learning",
    prerequisites: ["Python programming", "Statistics knowledge", "Linear algebra basics"],
    whatYouLearn: [
      "Machine Learning fundamentals",
      "Neural networks and deep learning",
      "TensorFlow and Keras implementation",
      "Computer vision basics",
      "Natural language processing",
    ],
    agenda: [
      { time: "11:00 - 12:30", topic: "ML Fundamentals and Python Setup" },
      { time: "13:30 - 15:00", topic: "Neural Networks and Deep Learning" },
      { time: "15:15 - 16:45", topic: "TensorFlow Hands-on Projects" },
      { time: "17:00 - 19:00", topic: "Computer Vision and NLP Demo" },
    ],
    maxSeats: 30,
    availableSeats: 8,
  },
  4: {
    id: 4,
    title: "UX/UI Design Fundamentals",
    organizer: "Design Studio",
    date: "2024-03-01",
    time: "9:00 AM",
    location: "Online",
    price: 1999,
    mode: "automated",
    rating: 4.6,
    participants: 78,
    category: "Design",
    duration: "5 hours",
    level: "Beginner",
    image: "/placeholder.svg?height=400&width=600",
    description:
      "Learn the fundamentals of user experience and interface design. This workshop covers design thinking, wireframing, prototyping, and modern design tools.",
    instructor: "Anjali Mehta",
    instructorBio: "Senior UX Designer at Design Studio with 7+ years in product design",
    prerequisites: ["Basic computer skills", "Creative mindset", "No design experience required"],
    whatYouLearn: [
      "Design thinking methodology",
      "User research and personas",
      "Wireframing and prototyping",
      "Figma and design tools",
      "Usability testing principles",
    ],
    agenda: [
      { time: "09:00 - 10:30", topic: "Design Thinking and User Research" },
      { time: "10:45 - 12:15", topic: "Wireframing and Information Architecture" },
      { time: "13:15 - 14:45", topic: "Prototyping with Figma" },
      { time: "15:00 - 14:00", topic: "Usability Testing and Feedback" },
    ],
    maxSeats: 60,
    availableSeats: 18,
  },
  5: {
    id: 5,
    title: "Financial Planning Workshop",
    organizer: "FinanceGuru Ltd",
    date: "2024-03-05",
    time: "3:00 PM",
    location: "Connaught Place, Delhi",
    price: 0,
    mode: "manual",
    rating: 4.5,
    participants: 45,
    category: "Finance",
    duration: "3 hours",
    level: "Beginner",
    image: "/placeholder.svg?height=400&width=600",
    description:
      "Master personal financial planning and investment strategies. Learn about budgeting, saving, investing, and building wealth for your future.",
    instructor: "Vikram Singh",
    instructorBio: "Certified Financial Planner with 12+ years in wealth management",
    prerequisites: ["Basic math skills", "Interest in personal finance", "No prior finance knowledge required"],
    whatYouLearn: [
      "Personal budgeting strategies",
      "Investment fundamentals",
      "Mutual funds and SIPs",
      "Tax planning basics",
      "Retirement planning",
    ],
    agenda: [
      { time: "15:00 - 16:00", topic: "Budgeting and Expense Management" },
      { time: "16:15 - 17:15", topic: "Investment Options and Strategies" },
      { time: "17:30 - 18:00", topic: "Tax Planning and Q&A" },
    ],
    maxSeats: 80,
    availableSeats: 35,
  },
  6: {
    id: 6,
    title: "Cloud Computing with AWS",
    organizer: "CloudTech Solutions",
    date: "2024-03-10",
    time: "1:00 PM",
    location: "Online",
    price: 3499,
    mode: "automated",
    rating: 4.8,
    participants: 167,
    category: "Technology",
    duration: "7 hours",
    level: "Intermediate",
    image: "/placeholder.svg?height=400&width=600",
    description:
      "Learn AWS cloud services and deployment strategies. This comprehensive workshop covers EC2, S3, Lambda, and modern cloud architecture patterns.",
    instructor: "Amit Kumar",
    instructorBio: "AWS Solutions Architect with 9+ years in cloud computing",
    prerequisites: ["Basic programming knowledge", "Understanding of web applications", "Linux command line basics"],
    whatYouLearn: [
      "AWS core services (EC2, S3, RDS)",
      "Serverless computing with Lambda",
      "Cloud security best practices",
      "Auto-scaling and load balancing",
      "DevOps and CI/CD on AWS",
    ],
    agenda: [
      { time: "13:00 - 14:30", topic: "AWS Fundamentals and Account Setup" },
      { time: "14:45 - 16:15", topic: "EC2, S3, and Core Services" },
      { time: "16:30 - 18:00", topic: "Serverless and Lambda Functions" },
      { time: "18:15 - 20:00", topic: "Security, Scaling, and Best Practices" },
    ],
    maxSeats: 40,
    availableSeats: 15,
  },
}

export default function WorkshopDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [isRegistering, setIsRegistering] = useState(false)
  const [showAuthDialog, setShowAuthDialog] = useState(false)

  const workshopId = Number.parseInt(params.id as string)
  const workshop = workshopData[workshopId as keyof typeof workshopData]

  if (!workshop) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Workshop Not Found</h1>
            <Button asChild>
              <Link href="/workshops">Back to Workshops</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const handleRegister = async () => {
    if (!user) {
      setShowAuthDialog(true)
      return
    }

    setIsRegistering(true)

    try {
      if (workshop.mode === "automated") {
        if (workshop.price > 0) {
          // For paid automated workshops, redirect to payment page
          router.push(`/workshops/${workshop.id}/payment`)
        } else {
          // Free automated registration
          toast({
            title: "Registration Successful!",
            description: "Check your email for confirmation details.",
          })
          // Redirect to confirmation page
          router.push(`/workshops/${workshop.id}/confirmation?type=free`)
        }
      } else {
        // Manual registration - no payment required
        toast({
          title: "Registration Request Sent",
          description: "We will notify you through email once approved.",
        })
        // Redirect to confirmation page
        router.push(`/workshops/${workshop.id}/confirmation?type=manual`)
      }
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsRegistering(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/workshops" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Workshops
            </Link>
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Image */}
            <div className="relative overflow-hidden rounded-2xl">
              <img
                src={workshop.image || "/placeholder.svg"}
                alt={workshop.title}
                className="w-full h-64 md:h-80 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="bg-white/90 text-gray-900">
                    {workshop.category}
                  </Badge>
                  <Badge variant={workshop.price === 0 ? "secondary" : "default"} className="bg-white/90 text-gray-900">
                    {workshop.price === 0 ? "Free" : `₹${workshop.price}`}
                  </Badge>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{workshop.title}</h1>
                <div className="flex items-center gap-2 text-white/90">
                  <Building2 className="h-4 w-4" />
                  <span>{workshop.organizer}</span>
                </div>
              </div>
            </div>

            {/* Workshop Info */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{workshop.rating}</span>
                    <span className="text-gray-500">({workshop.participants} reviews)</span>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {workshop.mode} Registration
                  </Badge>
                  <Badge variant="outline">{workshop.level}</Badge>
                </div>

                <p className="text-lg text-gray-700 leading-relaxed">{workshop.description}</p>
              </CardContent>
            </Card>

            {/* Workshop Details */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">{new Date(workshop.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium">{workshop.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">{workshop.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium">{workshop.location}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Availability
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Seats:</span>
                    <span className="font-medium">{workshop.maxSeats}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Available:</span>
                    <span className="font-medium text-green-600">{workshop.availableSeats}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${((workshop.maxSeats - workshop.availableSeats) / workshop.maxSeats) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-500">{workshop.maxSeats - workshop.availableSeats} seats booked</p>
                </CardContent>
              </Card>
            </div>

            {/* What You'll Learn */}
            <Card>
              <CardHeader>
                <CardTitle>What You'll Learn</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {workshop.whatYouLearn.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Prerequisites */}
            <Card>
              <CardHeader>
                <CardTitle>Prerequisites</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {workshop.prerequisites.map((item, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Agenda */}
            <Card>
              <CardHeader>
                <CardTitle>Workshop Agenda</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {workshop.agenda.map((item, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Clock className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div>
                        <div className="font-medium text-blue-600">{item.time}</div>
                        <div className="text-gray-900">{item.topic}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Registration Card */}
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="text-2xl">{workshop.price === 0 ? "Free" : `₹${workshop.price}`}</CardTitle>
                <p className="text-gray-600">
                  {workshop.mode === "automated" ? "Instant Registration" : "Manual Approval Required"}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {workshop.availableSeats > 0 ? (
                  <>
                    <Button onClick={handleRegister} className="w-full" size="lg" disabled={isRegistering}>
                      {isRegistering
                        ? "Processing..."
                        : workshop.mode === "automated"
                          ? "Register Now"
                          : "Request Registration"}
                    </Button>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      {workshop.mode === "automated" ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Instant confirmation</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-4 w-4 text-orange-500" />
                          <span>Approval required</span>
                        </>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-red-600 font-medium">Workshop Full</p>
                    <p className="text-sm text-gray-600">No seats available</p>
                  </div>
                )}

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Registration Type:</span>
                    <span className="capitalize">{workshop.mode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Level:</span>
                    <span>{workshop.level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span>{workshop.duration}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Instructor Info */}
            <Card>
              <CardHeader>
                <CardTitle>Instructor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {workshop.instructor
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold">{workshop.instructor}</div>
                    <div className="text-sm text-gray-600">{workshop.organizer}</div>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{workshop.instructorBio}</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Authentication Required Dialog */}
        <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserX className="h-5 w-5 text-orange-500" />
                Account Required
              </DialogTitle>
              <DialogDescription>You need to have an account to register for workshops.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please sign in to your account or create a new account to register for this workshop.
                </AlertDescription>
              </Alert>
              <div className="flex gap-2">
                <Button asChild className="flex-1">
                  <Link href="/auth">Sign In</Link>
                </Button>
                <Button variant="outline" asChild className="flex-1">
                  <Link href="/auth?mode=signup">Create Account</Link>
                </Button>
              </div>
              <Button variant="ghost" onClick={() => setShowAuthDialog(false)} className="w-full">
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
