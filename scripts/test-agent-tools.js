require('dotenv/config');

console.log('🧪 Testing Agent Tools...\n');

async function testAgent() {
  try {
    // Import the mastra instance
    const { mastra } = await import('../src/mastra/index.js');
    
    // Get the agent
    const agent = mastra.getAgent('assistantAgent');
    
    if (!agent) {
      console.error('❌ Agent not found!');
      return;
    }
    
    console.log('✅ Agent found:', agent.name);
    console.log('🔧 Available tools:', Object.keys(agent.tools || {}));
    
    // Test 1: Simple calculation
    console.log('\n📊 Test 1: Calculator Tool');
    const calcResult = await agent.generate('Calculate 25 * 4 + 10');
    console.log('Result:', calcResult.text);
    
    // Test 2: Phone validation  
    console.log('\n📞 Test 2: Phone Validation Tool');
    const phoneResult = await agent.generate('Validate this phone number: 97252376767');
    console.log('Result:', phoneResult.text);
    
    // Test 3: Web search (if Tavily is configured)
    if (process.env.TAVILY_API_KEY) {
      console.log('\n🌐 Test 3: Web Search Tool');
      const searchResult = await agent.generate('Search for latest news about AI');
      console.log('Result:', searchResult.text.slice(0, 200) + '...');
    }
    
    // Test 4: WhatsApp tool preparation (don't actually send)
    console.log('\n📱 Test 4: WhatsApp Tool Check');
    const whatsappResult = await agent.generate('What WhatsApp tools do you have available?');
    console.log('Result:', whatsappResult.text);
    
  } catch (error) {
    console.error('❌ Error testing agent:', error);
  }
}

testAgent().then(() => {
  console.log('\n✅ Agent tool tests completed!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
}); 