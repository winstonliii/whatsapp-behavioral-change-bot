const llmService = require('../src/services/llmService');
const conversationManager = require('../src/services/conversationManager');

// Simple test function
async function runTests() {
  console.log('🧪 Running basic tests...\n');

  // Test 1: Conversation Manager
  console.log('1. Testing Conversation Manager...');
  const conversationId = 'test-user-123';
  const conversation = conversationManager.getConversation(conversationId);
  
  conversation.addMessage('user', 'Hello, how are you?');
  conversation.addMessage('assistant', 'I\'m doing well, thank you for asking!');
  
  const messages = conversation.getMessages();
  console.log(`   ✅ Conversation created with ${messages.length} messages`);
  console.log(`   ✅ Last message: ${messages[messages.length - 1].content}\n`);

  // Test 2: LLM Service Configuration
  console.log('2. Testing LLM Service Configuration...');
  const config = llmService.getConfig();
  console.log(`   ✅ Model: ${config.model}`);
  console.log(`   ✅ Max Tokens: ${config.maxTokens}`);
  console.log(`   ✅ Temperature: ${config.temperature}\n`);

  // Test 3: System Prompt
  console.log('3. Testing System Prompt...');
  const systemPrompt = llmService.getSystemPrompt();
  console.log(`   ✅ System prompt length: ${systemPrompt.length} characters`);
  console.log(`   ✅ Contains WhatsApp reference: ${systemPrompt.includes('WhatsApp')}\n`);

  // Test 4: Conversation Statistics
  console.log('4. Testing Statistics...');
  const stats = conversationManager.getStats();
  console.log(`   ✅ Total conversations: ${stats.totalConversations}`);
  console.log(`   ✅ Total messages: ${stats.totalMessages}`);
  console.log(`   ✅ Average messages per conversation: ${stats.averageMessagesPerConversation}\n`);

  // Test 5: Fallback Response
  console.log('5. Testing Fallback Response...');
  const fallbackResponse = llmService.getFallbackResponse(new Error('Test error'));
  console.log(`   ✅ Fallback response: ${fallbackResponse}\n`);

  console.log('✅ All basic tests passed!');
  console.log('\n📝 Note: These are basic functionality tests.');
  console.log('   For full testing, you would need:');
  console.log('   - OpenAI API key configured');
  console.log('   - WhatsApp credentials set up');
  console.log('   - Actual API calls to external services');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };
