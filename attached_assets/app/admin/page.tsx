"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Users,
  Calendar,
  DollarSign,
  Eye,
  Check,
  X,
  Search,
  Download,
  Bell,
  Plus,
  Edit,
  Trash2,
  Clock,
  MapPin,
  Building2,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
} from "lucide-react"

// Enhanced mock data for comprehensive admin dashboard
const mockStats = {
  totalUsers: 1247,
  totalWorkshops: 89,
  totalRevenue: 245000,
  pendingApprovals: 12,
  activeWorkshops: 45,
  completedWorkshops: 44,
  totalRegistrations: 2156,
  confirmedRegistrations: 1890,
  pendingRegistrations: 156,
  rejectedRegistrations: 110,
}

const mockWorkshops = [
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
    category: "Technology",
    level: "Advanced",
    maxSeats: 50,
    registeredSeats: 38,
    availableSeats: 12,
    status: "active",
    registrations: {
      total: 38,
      confirmed: 32,
      pending: 4,
      rejected: 2,
    },
    createdAt: "2024-01-01",
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
    category: "Marketing",
    level: "Intermediate",
    maxSeats: 100,
    registeredSeats: 89,
    availableSeats: 11,
    status: "active",
    registrations: {
      total: 89,
      confirmed: 65,
      pending: 18,
      rejected: 6,
    },
    createdAt: "2024-01-02",
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
    category: "Technology",
    level: "Advanced",
    maxSeats: 30,
    registeredSeats: 22,
    availableSeats: 8,
    status: "active",
    registrations: {
      total: 22,
      confirmed: 18,
      pending: 3,
      rejected: 1,
    },
    createdAt: "2024-01-03",
  },
]

const mockPendingApprovals = [
  {
    id: 1,
    registrationId: 101,
    userName: "John Doe",
    userEmail: "john@example.com",
    userPhone: "+91 98765 43210",
    workshopId: 2,
    workshopTitle: "Digital Marketing Masterclass",
    workshopPrice: 0,
    registrationType: "manual",
    submittedAt: "2024-01-20T10:30:00Z",
    paymentStatus: "not_required",
    paymentScreenshot: null,
    transactionId: null,
    upiId: null,
    notes: "Interested in learning digital marketing for my startup",
    status: "pending_approval",
  },
  {
    id: 2,
    registrationId: 102,
    userName: "Sarah Johnson",
    userEmail: "sarah@example.com",
    userPhone: "+91 87654 32109",
    workshopId: 1,
    workshopTitle: "Advanced React Development",
    workshopPrice: 2999,
    registrationType: "automated",
    submittedAt: "2024-01-22T14:15:00Z",
    paymentStatus: "pending_verification",
    paymentScreenshot: "/placeholder.svg?height=400&width=300",
    transactionId: "TXN123456789",
    upiId: "sarah@paytm",
    notes: "",
    status: "payment_pending",
  },
  {
    id: 3,
    registrationId: 103,
    userName: "Mike Wilson",
    userEmail: "mike@example.com",
    userPhone: "+91 76543 21098",
    workshopId: 3,
    workshopTitle: "AI & Machine Learning Workshop",
    workshopPrice: 4999,
    registrationType: "automated",
    submittedAt: "2024-01-25T09:45:00Z",
    paymentStatus: "pending_verification",
    paymentScreenshot: "/placeholder.svg?height=400&width=300",
    transactionId: "TXN987654321",
    upiId: "mike@gpay",
    notes: "Looking forward to learning AI concepts",
    status: "payment_pending",
  },
]

const mockAllRegistrations = [
  ...mockPendingApprovals,
  {
    id: 4,
    registrationId: 104,
    userName: "Alice Brown",
    userEmail: "alice@example.com",
    userPhone: "+91 65432 10987",
    workshopId: 1,
    workshopTitle: "Advanced React Development",
    workshopPrice: 2999,
    registrationType: "automated",
    submittedAt: "2024-01-18T16:20:00Z",
    paymentStatus: "completed",
    paymentScreenshot: "/placeholder.svg?height=400&width=300",
    transactionId: "TXN555666777",
    upiId: "alice@phonepe",
    notes: "",
    status: "confirmed",
  },
]

export default function AdminPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedWorkshop, setSelectedWorkshop] = useState("all")
  const [selectedApproval, setSelectedApproval] = useState<any>(null)
  const [approvalNotes, setApprovalNotes] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [showWorkshopDialog, setShowWorkshopDialog] = useState(false)
  const [editingWorkshop, setEditingWorkshop] = useState<any>(null)

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.push("/")
    }
  }, [user, isLoading, router])

  const handleApproveRegistration = async (registrationId: number, action: "approve" | "reject") => {
    setIsProcessing(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      console.log(`${action === "approve" ? "Approved" : "Rejected"} registration:`, registrationId)
      console.log("Admin notes:", approvalNotes)

      // Reset form
      setSelectedApproval(null)
      setApprovalNotes("")

      // In real app, refresh data
    } catch (error) {
      console.error("Error processing approval:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "pending_approval":
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
      case "pending_approval":
        return <Clock className="h-4 w-4" />
      case "payment_pending":
        return <AlertCircle className="h-4 w-4" />
      case "rejected":
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
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

  if (!user || user.role !== "admin") {
    return null
  }

  const filteredApprovals = mockPendingApprovals.filter((approval) => {
    const matchesSearch =
      approval.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      approval.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      approval.workshopTitle.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = selectedStatus === "all" || approval.status === selectedStatus
    const matchesWorkshop = selectedWorkshop === "all" || approval.workshopId.toString() === selectedWorkshop

    return matchesSearch && matchesStatus && matchesWorkshop
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Comprehensive workshop and registration management</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Workshops</p>
                  <p className="text-3xl font-bold text-gray-900">{mockStats.totalWorkshops}</p>
                  <p className="text-xs text-gray-500">{mockStats.activeWorkshops} active</p>
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
                  <p className="text-sm font-medium text-gray-600">Total Registrations</p>
                  <p className="text-3xl font-bold text-gray-900">{mockStats.totalRegistrations}</p>
                  <p className="text-xs text-gray-500">{mockStats.confirmedRegistrations} confirmed</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                  <p className="text-3xl font-bold text-orange-600">{mockStats.pendingApprovals}</p>
                  <p className="text-xs text-gray-500">Requires attention</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Bell className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-3xl font-bold text-gray-900">₹{mockStats.totalRevenue.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">This month</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="approvals" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="approvals">Pending Approvals ({mockStats.pendingApprovals})</TabsTrigger>
            <TabsTrigger value="workshops">Workshop Management</TabsTrigger>
            <TabsTrigger value="registrations">All Registrations</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
          </TabsList>

          {/* Pending Approvals Tab */}
          <TabsContent value="approvals">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Pending Approvals & Payment Verifications</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search by name, email, or workshop..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending_approval">Pending Approval</SelectItem>
                      <SelectItem value="payment_pending">Payment Pending</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedWorkshop} onValueChange={setSelectedWorkshop}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Filter by workshop" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Workshops</SelectItem>
                      {mockWorkshops.map((workshop) => (
                        <SelectItem key={workshop.id} value={workshop.id.toString()}>
                          {workshop.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Approvals List */}
                <div className="space-y-4">
                  {filteredApprovals.length === 0 ? (
                    <div className="text-center py-12">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No pending approvals</h3>
                      <p className="text-gray-600">All registrations are up to date</p>
                    </div>
                  ) : (
                    filteredApprovals.map((approval) => (
                      <Card key={approval.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-lg">{approval.userName}</h3>
                                <Badge className={getStatusColor(approval.status)}>
                                  <div className="flex items-center gap-1">
                                    {getStatusIcon(approval.status)}
                                    <span>{approval.status.replace("_", " ")}</span>
                                  </div>
                                </Badge>
                              </div>

                              <div className="grid md:grid-cols-2 gap-4 mb-3">
                                <div>
                                  <p className="text-gray-600 mb-1">{approval.userEmail}</p>
                                  <p className="text-gray-600 mb-1">{approval.userPhone}</p>
                                  <p className="font-medium text-blue-600">{approval.workshopTitle}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">
                                    Registration Type: {approval.registrationType}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    Amount: {approval.workshopPrice === 0 ? "Free" : `₹${approval.workshopPrice}`}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    Submitted: {new Date(approval.submittedAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>

                              {approval.notes && (
                                <div className="bg-gray-50 p-3 rounded-lg mb-3">
                                  <p className="text-sm text-gray-700">
                                    <strong>User Notes:</strong> {approval.notes}
                                  </p>
                                </div>
                              )}

                              {approval.transactionId && (
                                <div className="bg-blue-50 p-3 rounded-lg">
                                  <p className="text-sm text-blue-800">
                                    <strong>Transaction ID:</strong> {approval.transactionId}
                                    {approval.upiId && (
                                      <span className="ml-4">
                                        <strong>UPI ID:</strong> {approval.upiId}
                                      </span>
                                    )}
                                  </p>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              {approval.paymentScreenshot && (
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                      <Eye className="h-4 w-4 mr-1" />
                                      View Payment
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                      <DialogTitle>Payment Screenshot</DialogTitle>
                                      <DialogDescription>Transaction ID: {approval.transactionId}</DialogDescription>
                                    </DialogHeader>
                                    <div className="mt-4">
                                      <img
                                        src={approval.paymentScreenshot || "/placeholder.svg"}
                                        alt="Payment Screenshot"
                                        className="w-full h-auto rounded-lg"
                                      />
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              )}

                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm" onClick={() => setSelectedApproval(approval)}>
                                    <FileText className="h-4 w-4 mr-1" />
                                    Review
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>Review Registration</DialogTitle>
                                    <DialogDescription>
                                      Review and approve/reject this registration request
                                    </DialogDescription>
                                  </DialogHeader>

                                  {selectedApproval && (
                                    <div className="space-y-6">
                                      {/* Registration Details */}
                                      <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="font-medium mb-3">Registration Details</h4>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                          <div>
                                            <p>
                                              <strong>Name:</strong> {selectedApproval.userName}
                                            </p>
                                            <p>
                                              <strong>Email:</strong> {selectedApproval.userEmail}
                                            </p>
                                            <p>
                                              <strong>Phone:</strong> {selectedApproval.userPhone}
                                            </p>
                                          </div>
                                          <div>
                                            <p>
                                              <strong>Workshop:</strong> {selectedApproval.workshopTitle}
                                            </p>
                                            <p>
                                              <strong>Amount:</strong>{" "}
                                              {selectedApproval.workshopPrice === 0
                                                ? "Free"
                                                : `₹${selectedApproval.workshopPrice}`}
                                            </p>
                                            <p>
                                              <strong>Type:</strong> {selectedApproval.registrationType}
                                            </p>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Admin Notes */}
                                      <div className="space-y-2">
                                        <Label htmlFor="approvalNotes">Admin Notes</Label>
                                        <Textarea
                                          id="approvalNotes"
                                          placeholder="Add notes about this approval decision..."
                                          value={approvalNotes}
                                          onChange={(e) => setApprovalNotes(e.target.value)}
                                          rows={3}
                                        />
                                      </div>

                                      {/* Action Buttons */}
                                      <div className="flex gap-3">
                                        <Button
                                          onClick={() =>
                                            handleApproveRegistration(selectedApproval.registrationId, "approve")
                                          }
                                          disabled={isProcessing}
                                          className="flex-1 bg-green-600 hover:bg-green-700"
                                        >
                                          <Check className="h-4 w-4 mr-2" />
                                          {isProcessing ? "Processing..." : "Approve"}
                                        </Button>
                                        <Button
                                          onClick={() =>
                                            handleApproveRegistration(selectedApproval.registrationId, "reject")
                                          }
                                          disabled={isProcessing}
                                          variant="destructive"
                                          className="flex-1"
                                        >
                                          <X className="h-4 w-4 mr-2" />
                                          {isProcessing ? "Processing..." : "Reject"}
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Workshop Management Tab */}
          <TabsContent value="workshops">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Workshop Management</CardTitle>
                  <Button onClick={() => setShowWorkshopDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Workshop
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockWorkshops.map((workshop) => (
                    <Card key={workshop.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg">{workshop.title}</h3>
                              <Badge variant="outline" className="capitalize">
                                {workshop.mode}
                              </Badge>
                              <Badge variant={workshop.status === "active" ? "default" : "secondary"}>
                                {workshop.status}
                              </Badge>
                            </div>

                            <div className="grid md:grid-cols-3 gap-4 mb-3">
                              <div>
                                <p className="text-gray-600 mb-1">
                                  <Building2 className="h-4 w-4 inline mr-1" />
                                  {workshop.organizer}
                                </p>
                                <p className="text-gray-600 mb-1">
                                  <User className="h-4 w-4 inline mr-1" />
                                  {workshop.instructor}
                                </p>
                                <p className="text-gray-600">
                                  <Calendar className="h-4 w-4 inline mr-1" />
                                  {new Date(workshop.date).toLocaleDateString()} at {workshop.time}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-600 mb-1">
                                  <MapPin className="h-4 w-4 inline mr-1" />
                                  {workshop.location}
                                </p>
                                <p className="text-gray-600 mb-1">
                                  Price: {workshop.price === 0 ? "Free" : `₹${workshop.price}`}
                                </p>
                                <p className="text-gray-600">
                                  Category: {workshop.category} • {workshop.level}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-600 mb-1">
                                  Capacity: {workshop.registeredSeats}/{workshop.maxSeats}
                                </p>
                                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full"
                                    style={{ width: `${(workshop.registeredSeats / workshop.maxSeats) * 100}%` }}
                                  ></div>
                                </div>
                                <div className="flex gap-2 text-xs">
                                  <span className="text-green-600">✓ {workshop.registrations.confirmed}</span>
                                  <span className="text-yellow-600">⏳ {workshop.registrations.pending}</span>
                                  <span className="text-red-600">✗ {workshop.registrations.rejected}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setEditingWorkshop(workshop)}>
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Workshop</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{workshop.title}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* All Registrations Tab */}
          <TabsContent value="registrations">
            <Card>
              <CardHeader>
                <CardTitle>All Registrations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Registration Management</h3>
                  <p className="text-gray-600">Comprehensive registration tracking and management</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Management Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">User Management</h3>
                  <p className="text-gray-600">User management features coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
