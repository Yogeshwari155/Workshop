import { PaymentVerificationTest } from "@/components/payment-verification-test"
import { Navbar } from "@/components/navbar"

export default function TestPaymentsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="py-8">
        <PaymentVerificationTest />
      </div>
    </div>
  )
}
