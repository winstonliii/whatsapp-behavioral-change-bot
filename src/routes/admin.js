const express = require('express');
const router = express.Router();
const conversationManager = require('../services/conversationManager');
const llmService = require('../services/llmService');
const whatsappBot = require('../services/whatsappBot');

// Middleware to check if admin routes are enabled
const requireAdmin = (req, res, next) => {
  // In production, you should implement proper authentication
  // For now, we'll use a simple API key check
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// Get bot status
router.get('/status', requireAdmin, (req, res) => {
  try {
    const botStatus = whatsappBot.getStatus();
    const llmConfig = llmService.getConfig();
    const stats = conversationManager.getStats();

    res.json({
      bot: botStatus,
      llm: llmConfig,
      statistics: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error getting status:', error);
    res.status(500).json({ error: 'Failed to get status' });
  }
});

// Get all conversations
router.get('/conversations', requireAdmin, (req, res) => {
  try {
    const conversations = conversationManager.getAllConversations();
    res.json({
      conversations,
      count: Object.keys(conversations).length
    });
  } catch (error) {
    console.error('❌ Error getting conversations:', error);
    res.status(500).json({ error: 'Failed to get conversations' });
  }
});

// Get specific conversation
router.get('/conversations/:id', requireAdmin, (req, res) => {
  try {
    const conversationId = req.params.id;
    const conversation = conversationManager.getConversation(conversationId);
    
    res.json({
      conversation: conversation.getSummary(),
      messages: conversation.getFullMessages()
    });
  } catch (error) {
    console.error('❌ Error getting conversation:', error);
    res.status(500).json({ error: 'Failed to get conversation' });
  }
});

// Clear specific conversation
router.delete('/conversations/:id', requireAdmin, (req, res) => {
  try {
    const conversationId = req.params.id;
    const success = conversationManager.clearConversation(conversationId);
    
    if (success) {
      res.json({ message: 'Conversation cleared successfully' });
    } else {
      res.status(404).json({ error: 'Conversation not found' });
    }
  } catch (error) {
    console.error('❌ Error clearing conversation:', error);
    res.status(500).json({ error: 'Failed to clear conversation' });
  }
});

// Update LLM configuration
router.put('/config/llm', requireAdmin, (req, res) => {
  try {
    const { model, maxTokens, temperature } = req.body;
    
    const config = {};
    if (model) config.model = model;
    if (maxTokens) config.maxTokens = maxTokens;
    if (temperature) config.temperature = temperature;

    llmService.updateConfig(config);
    
    res.json({
      message: 'LLM configuration updated successfully',
      config: llmService.getConfig()
    });
  } catch (error) {
    console.error('❌ Error updating LLM config:', error);
    res.status(500).json({ error: 'Failed to update LLM configuration' });
  }
});

// Get LLM configuration
router.get('/config/llm', requireAdmin, (req, res) => {
  try {
    res.json(llmService.getConfig());
  } catch (error) {
    console.error('❌ Error getting LLM config:', error);
    res.status(500).json({ error: 'Failed to get LLM configuration' });
  }
});

// Send test message
router.post('/test-message', requireAdmin, async (req, res) => {
  try {
    const { to, message } = req.body;
    
    if (!to || !message) {
      return res.status(400).json({ error: 'Missing required fields: to, message' });
    }

    await whatsappBot.sendMessage(to, message);
    
    res.json({ message: 'Test message sent successfully' });
  } catch (error) {
    console.error('❌ Error sending test message:', error);
    res.status(500).json({ error: 'Failed to send test message' });
  }
});

// Get system statistics
router.get('/stats', requireAdmin, (req, res) => {
  try {
    const stats = conversationManager.getStats();
    const botStatus = whatsappBot.getStatus();
    
    res.json({
      conversations: stats,
      bot: botStatus,
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        nodeVersion: process.version,
        platform: process.platform
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error getting statistics:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

// Health check for admin routes
router.get('/health', requireAdmin, (req, res) => {
  res.json({
    status: 'OK',
    admin: 'Admin API is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
