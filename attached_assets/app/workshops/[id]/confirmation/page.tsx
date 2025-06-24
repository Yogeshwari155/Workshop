"use client"

import { useEffect } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Mail, Clock, ArrowRight, Home, Calendar } from "lucide-react"
import Link from "next/link"

// Mock workshop data for confirmation page
const workshopData = {
  1: { title: "Advanced React Development", organizer: "TechCorp Solutions" },
  2: { title: "Digital Marketing Masterclass", organizer: "Marketing Pro Inc" },
  3: { title: "AI & Machine Learning Workshop", organizer: "DataScience Hub" },
  4: { title: "UX/UI Design Fundamentals", organizer: "Design Studio" },
  5: { title: "Financial Planning Workshop", organizer: "FinanceGuru Ltd" },
  6: { title: "Cloud Computing with AWS", organizer: "CloudTech Solutions" },
}

export default function ConfirmationPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()

  const workshopId = Number.parseInt(params.id as string)
  const type = searchParams.get("type") // 'paid', 'free', or 'manual'
  const workshop = workshopData[workshopId as keyof typeof workshopData]

  useEffect(() => {
    if (!user) {
      router.push("/auth")
    }
  }, [user, router])

  if (!user) {
    return null
  }

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

  const getConfirmationContent = () => {
    switch (type) {
      case "paid":
        return {
          title: "Payment Submitted Successfully!",
          description: "Your payment proof has been uploaded and is being verified.",
          icon: <CheckCircle className="h-16 w-16 text-green-500" />,
          message:
            "We will verify your payment within 24-48 hours and send you a confirmation email with workshop details.",
          emailNote: "Check your email for payment receipt and further instructions.",
        }
      case "free":
        return {
          title: "Registration Successful!",
          description: "You have been successfully registered for this free workshop.",
          icon: <CheckCircle className="h-16 w-16 text-green-500" />,
          message:
            "Your registration is confirmed! You will receive an email with workshop details and joining instructions.",
          emailNote: "Check your email for workshop details and calendar invite.",
        }
      case "manual":
        return {
          title: "Registration Request Submitted!",
          description: "Your registration request has been sent for manual approval.",
          icon: <Clock className="h-16 w-16 text-orange-500" />,
          message:
            "The workshop organizer will review your request and notify you via email about the approval status.",
          emailNote: "We will notify you through email once your registration is approved.",
        }
      default:
        return {
          title: "Registration Completed!",
          description: "Your workshop registration has been processed.",
          icon: <CheckCircle className="h-16 w-16 text-green-500" />,
          message: "You will receive further details via email.",
          emailNote: "Check your email for more information.",
        }
    }
  }

  const content = getConfirmationContent()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card className="text-center shadow-xl">
          <CardHeader className="pb-4">
            <div className="flex justify-center mb-4">{content.icon}</div>
            <CardTitle className="text-2xl md:text-3xl font-bold text-gray-900">{content.title}</CardTitle>
            <p className="text-gray-600 mt-2">{content.description}</p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Workshop Details */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                <span className="font-medium text-blue-900">Workshop Details</span>
              </div>
              <p className="font-semibold text-blue-900">{workshop.title}</p>
              <p className="text-blue-800 text-sm">{workshop.organizer}</p>
            </div>

            <div className="bg-green-50 p-6 rounded-lg">
              <div className="flex items-center justify-center mb-3">
                <Mail className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-green-900 font-medium mb-2">Check Your Email</p>
              <p className="text-green-800 text-sm">{content.emailNote}</p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-700">{content.message}</p>
            </div>

            <div className="space-y-3">
              <Button asChild className="w-full" size="lg">
                <Link href="/dashboard">
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Go to Dashboard
                </Link>
              </Button>

              <Button variant="outline" asChild className="w-full">
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Back to Home
                </Link>
              </Button>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-gray-500">
                Need help? Contact our support team at{" "}
                <a href="mailto:support@workshophub.com" className="text-blue-600 hover:underline">
                  support@workshophub.com
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
