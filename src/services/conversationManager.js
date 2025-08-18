const { v4: uuidv4 } = require('uuid');

class ConversationManager {
  constructor() {
    this.conversations = new Map();
    this.maxHistoryLength = 20; // Maximum messages to keep per conversation
  }

  getConversation(conversationId) {
    if (!this.conversations.has(conversationId)) {
      this.conversations.set(conversationId, new Conversation(conversationId));
    }
    return this.conversations.get(conversationId);
  }

  addMessage(conversationId, role, content) {
    const conversation = this.getConversation(conversationId);
    conversation.addMessage(role, content);
    return conversation;
  }

  getConversationHistory(conversationId) {
    const conversation = this.getConversation(conversationId);
    return conversation.getMessages();
  }

  clearConversation(conversationId) {
    if (this.conversations.has(conversationId)) {
      this.conversations.delete(conversationId);
      return true;
    }
    return false;
  }

  getAllConversations() {
    const conversations = {};
    for (const [id, conversation] of this.conversations) {
      conversations[id] = {
        id: conversation.id,
        messageCount: conversation.messages.length,
        lastActivity: conversation.lastActivity,
        createdAt: conversation.createdAt
      };
    }
    return conversations;
  }

  // Clean up old conversations (older than 24 hours)
  cleanupOldConversations() {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    for (const [id, conversation] of this.conversations) {
      if (conversation.lastActivity < oneDayAgo) {
        this.conversations.delete(id);
        console.log(`🧹 Cleaned up old conversation: ${id}`);
      }
    }
  }

  // Get conversation statistics
  getStats() {
    const totalConversations = this.conversations.size;
    let totalMessages = 0;
    
    for (const conversation of this.conversations.values()) {
      totalMessages += conversation.messages.length;
    }

    return {
      totalConversations,
      totalMessages,
      averageMessagesPerConversation: totalConversations > 0 ? 
        Math.round(totalMessages / totalConversations) : 0
    };
  }
}

class Conversation {
  constructor(id) {
    this.id = id;
    this.messages = [];
    this.createdAt = new Date();
    this.lastActivity = new Date();
  }

  addMessage(role, content) {
    const message = {
      id: uuidv4(),
      role: role, // 'user' or 'assistant'
      content: content,
      timestamp: new Date()
    };

    this.messages.push(message);
    this.lastActivity = new Date();

    // Keep only the last maxHistoryLength messages
    if (this.messages.length > 20) {
      this.messages = this.messages.slice(-20);
    }

    return message;
  }

  getMessages() {
    return this.messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
  }

  getFullMessages() {
    return this.messages;
  }

  getLastMessage() {
    return this.messages.length > 0 ? this.messages[this.messages.length - 1] : null;
  }

  getMessageCount() {
    return this.messages.length;
  }

  clear() {
    this.messages = [];
    this.lastActivity = new Date();
  }

  // Get conversation summary
  getSummary() {
    const userMessages = this.messages.filter(msg => msg.role === 'user').length;
    const assistantMessages = this.messages.filter(msg => msg.role === 'assistant').length;
    
    return {
      id: this.id,
      totalMessages: this.messages.length,
      userMessages,
      assistantMessages,
      createdAt: this.createdAt,
      lastActivity: this.lastActivity,
      duration: this.lastActivity.getTime() - this.createdAt.getTime()
    };
  }
}

// Create a singleton instance
const conversationManager = new ConversationManager();

// Set up periodic cleanup
setInterval(() => {
  conversationManager.cleanupOldConversations();
}, 60 * 60 * 1000); // Run every hour

module.exports = conversationManager;
