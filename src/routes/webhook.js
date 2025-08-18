const express = require('express');
const router = express.Router();
const axios = require('axios');
const conversationManager = require('../services/conversationManager');
const llmService = require('../services/llmService');

// WhatsApp Business API configuration
const WHATSAPP_API_URL = 'https://graph.facebook.com/v18.0';
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

// Webhook verification endpoint
router.get('/', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('✅ Webhook verified successfully');
      res.status(200).send(challenge);
    } else {
      console.log('❌ Webhook verification failed');
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(400);
  }
});

// Webhook message endpoint
router.post('/', async (req, res) => {
  try {
    const body = req.body;

    if (body.object === 'whatsapp_business_account') {
      if (body.entry && body.entry.length > 0) {
        for (const entry of body.entry) {
          if (entry.changes && entry.changes.length > 0) {
            for (const change of entry.changes) {
              if (change.value && change.value.messages && change.value.messages.length > 0) {
                for (const message of change.value.messages) {
                  await handleIncomingMessage(message);
                }
              }
            }
          }
        }
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.sendStatus(500);
  }
});

async function handleIncomingMessage(message) {
  try {
    const from = message.from;
    const messageText = message.text?.body || '';
    const messageType = message.type;

    console.log(`📨 Received ${messageType} message from ${from}: ${messageText}`);

    // Only handle text messages for now
    if (messageType !== 'text' || !messageText.trim()) {
      return;
    }

    // Get conversation context
    const conversation = conversationManager.getConversation(from);
    conversation.addMessage('user', messageText);

    // Generate AI response
    const aiResponse = await llmService.generateResponse(
      conversation.getMessages(),
      messageText
    );

    // Add AI response to conversation
    conversation.addMessage('assistant', aiResponse);

    // Send response back to WhatsApp
    await sendWhatsAppMessage(from, aiResponse);

    console.log(`🤖 Sent response to ${from}: ${aiResponse}`);

  } catch (error) {
    console.error('❌ Error handling incoming message:', error);
    
    // Send error message to user
    const errorMessage = "I'm sorry, I encountered an error processing your message. Please try again.";
    await sendWhatsAppMessage(message.from, errorMessage);
  }
}

async function sendWhatsAppMessage(to, message) {
  try {
    if (!ACCESS_TOKEN || !PHONE_NUMBER_ID) {
      throw new Error('WhatsApp API credentials not configured');
    }

    const response = await axios.post(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: {
          body: message
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ WhatsApp message sent successfully:', response.data);
    return response.data;

  } catch (error) {
    console.error('❌ Error sending WhatsApp message:', error.response?.data || error.message);
    throw error;
  }
}

// Send typing indicator
async function sendTypingIndicator(to, isTyping = true) {
  try {
    if (!ACCESS_TOKEN || !PHONE_NUMBER_ID) {
      return;
    }

    await axios.post(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to,
        type: 'reaction',
        reaction: {
          messaging_product: 'whatsapp',
          recipient_id: to,
          type: isTyping ? 'typing' : 'read'
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('❌ Error sending typing indicator:', error);
  }
}

// Health check for webhook
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    webhook: 'WhatsApp Business API Webhook',
    timestamp: new Date().toISOString(),
    config: {
      hasAccessToken: !!ACCESS_TOKEN,
      hasPhoneNumberId: !!PHONE_NUMBER_ID,
      hasVerifyToken: !!VERIFY_TOKEN
    }
  });
});

module.exports = router;
