/**
 * End-to-End QRIS Payment Simulation
 * Tests the complete flow: create QRIS → simulate payment → webhook → verify status
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || "https://fabulous-bison-818.convex.cloud";
const API_BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://idmap-pesisir.vercel.app";

interface QrisCreateResponse {
  success: boolean;
  paymentId: string;
  qrisUrl?: string;
  qrisString?: string;
  amount: number;
  expiresAt?: string;
  isSandbox: boolean;
}

interface PaymentStatusResponse {
  success: boolean;
  status: "pending" | "paid" | "expired" | "failed";
  payment?: {
    _id: string;
    paymentId: string;
    amount: number;
    status: string;
    createdAt: number;
    paidAt?: number;
  };
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getFirstProject() {
  console.log(`\n[0/4] Fetching test project from Convex...`);

  const client = new ConvexHttpClient(CONVEX_URL);
  const projects = await client.query(api.projects.list, {});

  if (projects.length === 0) {
    throw new Error("No projects found. Run: npx tsx scripts/seed-test-project.ts");
  }

  const project = projects[0];
  console.log(`✓ Using project: ${project.title} (${project._id})`);

  return project._id;
}

async function createQrisPayment(amount: number, userId: string, projectId: string) {
  console.log(`\n[1/4] Creating QRIS payment for Rp ${amount.toLocaleString("id-ID")}...`);

  const response = await fetch(`${API_BASE}/api/payment/create-qris`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount, userId, projectId }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create QRIS: ${response.statusText} - ${errorText}`);
  }

  const data: QrisCreateResponse = await response.json();
  console.log(`✓ QRIS created: ${data.paymentId}`);
  console.log(`  Sandbox mode: ${data.isSandbox}`);
  if (data.qrisUrl) {
    console.log(`  QRIS URL: ${data.qrisUrl}`);
  }

  return data;
}

async function simulatePayment(paymentId: string) {
  console.log(`\n[2/4] Simulating payment for ${paymentId}...`);

  const response = await fetch(`${API_BASE}/api/payment/simulate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paymentId }),
  });

  if (!response.ok) {
    throw new Error(`Failed to simulate payment: ${response.statusText}`);
  }

  const data = await response.json();
  console.log(`✓ Payment simulated successfully`);
  console.log(`  Webhook triggered: ${data.webhookTriggered}`);

  return data;
}

async function checkPaymentStatus(paymentId: string) {
  console.log(`\n[3/4] Checking payment status...`);

  const response = await fetch(`${API_BASE}/api/payment/status?paymentId=${paymentId}`);

  if (!response.ok) {
    throw new Error(`Failed to check status: ${response.statusText}`);
  }

  const data: PaymentStatusResponse = await response.json();
  console.log(`✓ Status: ${data.status}`);

  if (data.payment) {
    console.log(`  Payment ID: ${data.payment.paymentId}`);
    console.log(`  Amount: Rp ${data.payment.amount.toLocaleString("id-ID")}`);
    console.log(`  Created: ${new Date(data.payment.createdAt).toLocaleString("id-ID")}`);
    if (data.payment.paidAt) {
      console.log(`  Paid: ${new Date(data.payment.paidAt).toLocaleString("id-ID")}`);
    }
  }

  return data;
}

async function verifyConvexRecord(paymentId: string) {
  console.log(`\n[4/4] Verifying Convex database record...`);

  const client = new ConvexHttpClient(CONVEX_URL);

  // Query payment from Convex
  const payment = await client.query(api.payments.getByPaymentId, { paymentId });

  if (!payment) {
    console.log(`✗ Payment not found in Convex database`);
    return null;
  }

  console.log(`✓ Payment found in Convex`);
  console.log(`  Status: ${payment.status}`);
  console.log(`  Amount: Rp ${payment.amount.toLocaleString("id-ID")}`);
  console.log(`  User ID: ${payment.userId}`);

  return payment;
}

async function runE2ETest() {
  console.log("=".repeat(60));
  console.log("QRIS Payment End-to-End Test");
  console.log("=".repeat(60));

  try {
    // Test parameters
    const testAmount = 50000; // Rp 50.000
    const testUserId = "test_user_" + Date.now();

    console.log(`\nTest Configuration:`);
    console.log(`  API Base: ${API_BASE}`);
    console.log(`  Convex URL: ${CONVEX_URL}`);
    console.log(`  Amount: Rp ${testAmount.toLocaleString("id-ID")}`);
    console.log(`  User ID: ${testUserId}`);

    // Step 0: Get a real project ID
    const testProjectId = await getFirstProject();

    // Step 1: Create QRIS
    const qrisData = await createQrisPayment(testAmount, testUserId, testProjectId);

    // Wait a bit for the record to be created
    await sleep(1000);

    // Step 2: Simulate payment
    await simulatePayment(qrisData.paymentId);

    // Wait for webhook processing
    await sleep(2000);

    // Step 3: Check status via API
    const statusData = await checkPaymentStatus(qrisData.paymentId);

    // Step 4: Verify in Convex
    const convexPayment = await verifyConvexRecord(qrisData.paymentId);

    // Final verification
    console.log("\n" + "=".repeat(60));
    console.log("Test Results");
    console.log("=".repeat(60));

    const allChecks = [
      { name: "QRIS Created", pass: !!qrisData.paymentId },
      { name: "Payment Simulated", pass: true },
      { name: "Status API Works", pass: statusData.success },
      { name: "Status is Paid", pass: statusData.status === "paid" },
      { name: "Convex Record Exists", pass: !!convexPayment },
      { name: "Convex Status is Paid", pass: convexPayment?.status === "paid" },
    ];

    allChecks.forEach((check) => {
      console.log(`${check.pass ? "✓" : "✗"} ${check.name}`);
    });

    const allPassed = allChecks.every((c) => c.pass);

    console.log("\n" + "=".repeat(60));
    if (allPassed) {
      console.log("✓ ALL TESTS PASSED");
    } else {
      console.log("✗ SOME TESTS FAILED");
    }
    console.log("=".repeat(60));

    process.exit(allPassed ? 0 : 1);

  } catch (error) {
    console.error("\n✗ Test failed with error:");
    console.error(error);
    process.exit(1);
  }
}

// Run the test
runE2ETest();
