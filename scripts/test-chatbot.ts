import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const API_URL = 'http://localhost:3000/api/a2ui-chat';
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

if (!GOOGLE_API_KEY) {
  console.error("GOOGLE_API_KEY not found in .env.local");
  process.exit(1);
}

async function testChatbot(message: string, sessionId: string = 'test-session', verifiedTicket?: string) {
  console.log(`\n[TEST] Message: "${message}"${verifiedTicket ? ` (Verified Ticket: ${verifiedTicket})` : ''}`);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        sessionId,
        verifiedTicket
      }),
    });

    const data = await response.json();

    if (data.success) {
      console.log("Response Status: SUCCESS");
      console.log("Text Response:", data.response.text);
      console.log("Widgets Count:", data.response.widgets.length);
      if (data.response.widgets.length > 0) {
        console.log("WIDGETS:");
        data.response.widgets.forEach((w: any, i: number) => {
          console.log(`  ${i + 1}. Widget: ${w.widget}`);
          // console.log(`     Props: ${JSON.stringify(w.props)}`);
        });
      }
    } else {
      console.log("Response Status: FAILED");
      console.log("Error:", data.error);
    }
  } catch (error) {
    console.error("Fetch Error:", error);
  }
}

async function runTests() {
  const TEST_TICKET = 'WRK-2025-0001';

  console.log("=== STARTING CHATBOT TESTS ===");

  // Scenario 1: Initial Greeting
  await testChatbot("Hello, I need some help with my permits.");

  // Scenario 2: Tracking request (unauthenticated)
  await testChatbot("How do I check my permit status?");

  // Scenario 3: Specific ticket inquiry (authenticated manually in test)
  await testChatbot("Show me the status of my work permit", "test-session", TEST_TICKET);

  // Scenario 4: Upload guidance
  await testChatbot("I need help uploading my medical certificate.");

  console.log("\n=== TESTS COMPLETED ===");
}

runTests();
