// Node.js script to test payment verification scenarios

const API_BASE_URL = "http://localhost:3000"

const testScenarios = [
  {
    name: "Valid Payment Verification",
    data: {
      transactionId: "TXN123456789",
      amount: 2999,
      workshopId: 1,
      registrationId: 1,
    },
    expectedStatus: 200,
    expectedResult: "success",
  },
  {
    name: "Invalid Transaction ID",
    data: {
      transactionId: "TXN999999999",
      amount: 2999,
      workshopId: 1,
      registrationId: 1,
    },
    expectedStatus: 404,
    expectedResult: "not_found",
  },
  {
    name: "Amount Mismatch",
    data: {
      transactionId: "TXN123456789",
      amount: 1999,
      workshopId: 1,
      registrationId: 1,
    },
    expectedStatus: 400,
    expectedResult: "amount_mismatch",
  },
  {
    name: "Pending Payment",
    data: {
      transactionId: "TXN555666777",
      amount: 1999,
      workshopId: 1,
      registrationId: 1,
    },
    expectedStatus: 202,
    expectedResult: "pending",
  },
]

async function runTest(scenario) {
  console.log(`\n🧪 Testing: ${scenario.name}`)
  console.log("📤 Request:", JSON.stringify(scenario.data, null, 2))

  try {
    const response = await fetch(`${API_BASE_URL}/api/payments/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(scenario.data),
    })

    const result = await response.json()

    console.log(`📥 Response Status: ${response.status}`)
    console.log("📥 Response Body:", JSON.stringify(result, null, 2))

    // Verify expectations
    const statusMatch = response.status === scenario.expectedStatus
    const resultMatch = result.status === scenario.expectedResult

    if (statusMatch && resultMatch) {
      console.log("✅ Test PASSED")
    } else {
      console.log("❌ Test FAILED")
      if (!statusMatch) {
        console.log(`   Expected status: ${scenario.expectedStatus}, Got: ${response.status}`)
      }
      if (!resultMatch) {
        console.log(`   Expected result: ${scenario.expectedResult}, Got: ${result.status}`)
      }
    }
  } catch (error) {
    console.log("❌ Test FAILED with error:", error.message)
  }
}

async function runAllTests() {
  console.log("🚀 Starting Payment Verification Tests")
  console.log("=" * 50)

  for (const scenario of testScenarios) {
    await runTest(scenario)
    await new Promise((resolve) => setTimeout(resolve, 1000)) // Wait 1 second between tests
  }

  console.log("\n🏁 All tests completed!")
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests().catch(console.error)
}

module.exports = { runAllTests, runTest, testScenarios }
