/**
 * Test script for Dream of Claudification conversation flow
 */

async function testConversation() {
  const baseUrl = 'http://localhost:3003';

  console.log('🧪 Testing Dream of Claudification Conversation Flow\n');

  try {
    // Step 1: Claudify a message
    console.log('1️⃣ Testing /claudify endpoint...');
    const claudifyResponse = await fetch(`${baseUrl}/claudify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: 'Check if the main server is running properly'
      })
    });

    if (!claudifyResponse.ok) {
      throw new Error(`Claudify failed: ${claudifyResponse.statusText}`);
    }

    const claudifyData = await claudifyResponse.json();
    console.log('✅ Claudify successful!');
    console.log('   Format preview:', claudifyData.formats.execBrief.substring(0, 100) + '...\n');

    // Step 2: Send to Claude
    console.log('2️⃣ Testing /send-to-claude endpoint...');
    const sendResponse = await fetch(`${baseUrl}/send-to-claude`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: claudifyData.formats.execBrief
      })
    });

    if (!sendResponse.ok) {
      const errorData = await sendResponse.json();
      throw new Error(`Send to Claude failed: ${errorData.error || sendResponse.statusText}`);
    }

    const sendData = await sendResponse.json();
    console.log('✅ Claude responded!');
    console.log('   Response preview:', sendData.response.substring(0, 150) + '...\n');

    // Step 3: Get conversation history
    console.log('3️⃣ Testing /conversation endpoint...');
    const historyResponse = await fetch(`${baseUrl}/conversation`);
    const historyData = await historyResponse.json();
    console.log('✅ Conversation history retrieved!');
    console.log(`   Messages in history: ${historyData.history.length}\n`);

    // Step 4: Clear conversation
    console.log('4️⃣ Testing /clear-conversation endpoint...');
    const clearResponse = await fetch(`${baseUrl}/clear-conversation`, {
      method: 'POST'
    });
    await clearResponse.json();
    console.log('✅ Conversation cleared!\n');

    console.log('🎉 All tests passed! The Dream interface is ready for you to use.\n');
    console.log('📋 Summary:');
    console.log('   ✅ Message formatting (Gemini/Vertex AI) - Working');
    console.log('   ✅ Claude conversation - Working');
    console.log('   ✅ Conversation history - Working');
    console.log('   ✅ Clear conversation - Working');
    console.log('\n🌐 Open http://localhost:3003 in your browser to use it!');

  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testConversation();
