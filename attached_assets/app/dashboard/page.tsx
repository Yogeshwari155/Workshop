"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, MapPin, CheckCircle, AlertCircle, XCircle, Eye, Download } from "lucide-react"
import Link from "next/link"

// Mock user registrations data
const mockRegistrations = [
  {
    id: 1,
    workshopId: 1,
    workshopTitle: "Advanced React Development",
    organizer: "TechCorp Solutions",
    date: "2024-02-15",
    time: "10:00 AM",
    location: "Online",
    price: 2999,
    status: "confirmed",
    registeredAt: "2024-01-20",
    paymentScreenshot: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 2,
    workshopId: 2,
    workshopTitle: "Digital Marketing Masterclass",
    organizer: "Marketing Pro Inc",
    date: "2024-02-20",
    time: "2:00 PM",
    location: "Mumbai",
    price: 0,
    status: "pending",
    registeredAt: "2024-01-22",
    paymentScreenshot: null,
  },
  {
    id: 3,
    workshopId: 3,
    workshopTitle: "AI & Machine Learning Workshop",
    organizer: "DataScience Hub",
    date: "2024-02-25",
    time: "11:00 AM",
    location: "Bangalore",
    price: 4999,
    status: "payment_pending",
    registeredAt: "2024-01-25",
    paymentScreenshot: "/placeholder.svg?height=200&width=300",
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "confirmed":
      return "bg-green-100 text-green-800"
    case "pending":
      return "bg-yellow-100 text-yellow-800"
    case "payment_pending":
      return "bg-orange-100 text-orange-800"
    case "rejected":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "confirmed":
      return <CheckCircle className="h-4 w-4" />
    case "pending":
      return <Clock className="h-4 w-4" />
    case "payment_pending":
      return <AlertCircle className="h-4 w-4" />
    case "rejected":
      return <XCircle className="h-4 w-4" />
    default:
      return <Clock className="h-4 w-4" />
  }
}

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [registrations, setRegistrations] = useState(mockRegistrations)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const confirmedRegistrations = registrations.filter((r) => r.status === "confirmed")
  const pendingRegistrations = registrations.filter((r) => r.status === "pending" || r.status === "payment_pending")

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user.name}!</h1>
          <p className="text-gray-600">Manage your workshop registrations and track your learning journey.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Registrations</p>
                  <p className="text-3xl font-bold text-gray-900">{registrations.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Confirmed</p>
                  <p className="text-3xl font-bold text-green-600">{confirmedRegistrations.length}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-3xl font-bold text-orange-600">{pendingRegistrations.length}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Registrations */}
        <Card>
          <CardHeader>
            <CardTitle>My Workshop Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                {registrations.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No registrations yet</h3>
                    <p className="text-gray-600 mb-4">Start exploring workshops to begin your learning journey</p>
                    <Button asChild>
                      <Link href="/workshops">Browse Workshops</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {registrations.map((registration) => (
                      <Card key={registration.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900">{registration.workshopTitle}</h3>
                                <Badge className={getStatusColor(registration.status)}>
                                  <div className="flex items-center gap-1">
                                    {getStatusIcon(registration.status)}
                                    <span className="capitalize">{registration.status.replace("_", " ")}</span>
                                  </div>
                                </Badge>
                              </div>

                              <p className="text-gray-600 mb-3">{registration.organizer}</p>

                              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>
                                    {new Date(registration.date).toLocaleDateString()} at {registration.time}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  <span>{registration.location}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="font-medium">
                                    {registration.price === 0 ? "Free" : `₹${registration.price}`}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {registration.paymentScreenshot && (
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4 mr-1" />
                                  View Receipt
                                </Button>
                              )}
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/workshops/${registration.workshopId}`}>View Workshop</Link>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="confirmed" className="space-y-4">
                {confirmedRegistrations.map((registration) => (
                  <Card key={registration.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{registration.workshopTitle}</h3>
                          <p className="text-gray-600 mb-3">{registration.organizer}</p>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {new Date(registration.date).toLocaleDateString()} at {registration.time}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              <span>{registration.location}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm">
                            <Download className="h-4 w-4 mr-1" />
                            Download Certificate
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="pending" className="space-y-4">
                {pendingRegistrations.map((registration) => (
                  <Card key={registration.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{registration.workshopTitle}</h3>
                            <Badge className={getStatusColor(registration.status)}>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(registration.status)}
                                <span className="capitalize">{registration.status.replace("_", " ")}</span>
                              </div>
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-3">{registration.organizer}</p>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {new Date(registration.date).toLocaleDateString()} at {registration.time}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              <span>{registration.location}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {registration.status === "payment_pending" && (
                            <Button size="sm" asChild>
                              <Link href={`/workshops/${registration.workshopId}/payment`}>Complete Payment</Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="completed">
                <div className="text-center py-12">
                  <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No completed workshops yet</h3>
                  <p className="text-gray-600">Completed workshops will appear here</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
