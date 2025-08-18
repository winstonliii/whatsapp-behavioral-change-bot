const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const llmService = require('./llmService');
const conversationManager = require('./conversationManager');

class WhatsAppBot {
  constructor() {
    this.client = null;
    this.isReady = false;
  }

  initialize() {
    console.log('🤖 Initializing WhatsApp Bot...');
    
    this.client = new Client({
      authStrategy: new LocalAuth(),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      }
    });

    this.setupEventHandlers();
    this.client.initialize();
  }

  setupEventHandlers() {
    // QR Code generation
    this.client.on('qr', (qr) => {
      console.log('📱 QR Code received, scan with WhatsApp:');
      qrcode.generate(qr, { small: true });
    });

    // Client ready
    this.client.on('ready', () => {
      console.log('✅ WhatsApp Bot is ready!');
      this.isReady = true;
    });

    // Message handling
    this.client.on('message', async (message) => {
      await this.handleMessage(message);
    });

    // Authentication failure
    this.client.on('auth_failure', (msg) => {
      console.error('❌ Authentication failed:', msg);
    });

    // Disconnected
    this.client.on('disconnected', (reason) => {
      console.log('🔌 WhatsApp Bot disconnected:', reason);
      this.isReady = false;
    });
  }

  async handleMessage(message) {
    try {
      // Ignore messages from self
      if (message.fromMe) return;

      console.log(`📨 Received message from ${message.from}: ${message.body}`);

      // Get conversation context
      const conversationId = message.from;
      const conversation = await conversationManager.getConversation(conversationId);
      
      // Add user message to conversation
      conversation.addMessage('user', message.body);

      // Generate AI response
      const aiResponse = await llmService.generateResponse(
        conversation.getMessages(),
        message.body
      );

      // Add AI response to conversation
      conversation.addMessage('assistant', aiResponse);

      // Send response back to WhatsApp
      await this.sendMessage(message.from, aiResponse);

      console.log(`🤖 Sent response to ${message.from}: ${aiResponse}`);

    } catch (error) {
      console.error('❌ Error handling message:', error);
      
      // Send error message to user
      const errorMessage = "I'm sorry, I encountered an error processing your message. Please try again.";
      await this.sendMessage(message.from, errorMessage);
    }
  }

  async sendMessage(to, message) {
    try {
      if (!this.isReady) {
        throw new Error('WhatsApp client not ready');
      }

      await this.client.sendMessage(to, message);
    } catch (error) {
      console.error('❌ Error sending message:', error);
      throw error;
    }
  }

  async sendTyping(to) {
    try {
      if (!this.isReady) return;
      
      await this.client.sendStateTyping(to);
    } catch (error) {
      console.error('❌ Error sending typing indicator:', error);
    }
  }

  async stopTyping(to) {
    try {
      if (!this.isReady) return;
      
      await this.client.clearState();
    } catch (error) {
      console.error('❌ Error stopping typing indicator:', error);
    }
  }

  getStatus() {
    return {
      isReady: this.isReady,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = new WhatsAppBot();
