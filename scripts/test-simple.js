// Simple test to verify agent functionality
const testMessage = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    messages: [
      { role: 'user', content: 'Calculate 15 + 25 and tell me the result' }
    ],
    threadId: 'test-thread-' + Date.now(),
    resourceId: 'test-user-' + Date.now()
  })
};

console.log('🧪 Testing agent with calculation request...');

fetch('http://localhost:3000/api/chat', testMessage)
  .then(response => {
    console.log('✅ Response received:', response.status);
    return response.text();
  })
  .then(data => {
    console.log('📄 Response data:');
    console.log(data);
  })
  .catch(error => {
    console.error('❌ Test failed:', error);
  }); 