# WhatsApp Chatbot powered by LLM

A powerful WhatsApp chatbot that integrates with Large Language Models (LLMs) to provide intelligent conversational responses. This chatbot supports both WhatsApp Web API and WhatsApp Business API integration.

## Features

- 🤖 **LLM Integration**: Powered by OpenAI GPT models (easily extensible to other LLMs)
- 💬 **Conversation Management**: Maintains conversation context and history
- 📱 **Dual WhatsApp Integration**: 
  - WhatsApp Web (using whatsapp-web.js)
  - WhatsApp Business API (official Meta API)
- 🔧 **Admin Dashboard**: Monitor conversations, update configurations, and view statistics
- 🛡️ **Security**: Built-in security middleware and API key authentication
- 📊 **Analytics**: Track conversation statistics and bot performance
- 🔄 **Auto-cleanup**: Automatic cleanup of old conversations

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- OpenAI API key
- WhatsApp Business API credentials (optional, for Business API mode)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd whatsapp-chatbot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=development

   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_api_key_here
   OPENAI_MODEL=gpt-3.5-turbo

   # WhatsApp Business API Configuration (optional)
   WHATSAPP_ACCESS_TOKEN=your_whatsapp_access_token_here
   WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
   WHATSAPP_VERIFY_TOKEN=your_verify_token_here

   # Admin API Key (for admin routes)
   ADMIN_API_KEY=your_admin_api_key_here
   ```

4. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## Usage

### WhatsApp Web Mode (Default)

1. Start the server
2. Scan the QR code that appears in the terminal with your WhatsApp mobile app
3. The bot will automatically respond to incoming messages

### WhatsApp Business API Mode

1. Set up your WhatsApp Business API credentials in `.env`
2. Configure your webhook URL in the Meta Developer Console
3. The bot will receive messages via webhook

## API Endpoints

### Public Endpoints

- `GET /` - API information
- `GET /health` - Health check
- `GET /webhook` - WhatsApp webhook verification
- `POST /webhook` - WhatsApp webhook messages

### Admin Endpoints (require API key)

- `GET /admin/status` - Bot status and configuration
- `GET /admin/conversations` - List all conversations
- `GET /admin/conversations/:id` - Get specific conversation
- `DELETE /admin/conversations/:id` - Clear conversation
- `GET /admin/config/llm` - Get LLM configuration
- `PUT /admin/config/llm` - Update LLM configuration
- `POST /admin/test-message` - Send test message
- `GET /admin/stats` - System statistics

## Configuration

### LLM Configuration

You can update the LLM configuration via the admin API:

```bash
curl -X PUT http://localhost:3000/admin/config/llm \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_admin_api_key" \
  -d '{
    "model": "gpt-4",
    "maxTokens": 1500,
    "temperature": 0.8
  }'
```

### System Prompt

The system prompt can be customized in `src/services/llmService.js`. The default prompt is optimized for WhatsApp conversations.

## Architecture

```
src/
├── index.js              # Main server file
├── services/
│   ├── whatsappBot.js    # WhatsApp integration
│   ├── llmService.js     # LLM integration
│   └── conversationManager.js # Conversation management
└── routes/
    ├── webhook.js        # WhatsApp webhook routes
    └── admin.js          # Admin API routes
```

## Security Considerations

- Use HTTPS in production
- Implement proper authentication for admin routes
- Keep API keys secure
- Regularly update dependencies
- Monitor for suspicious activity

## Troubleshooting

### Common Issues

1. **QR Code not appearing**: Check if Puppeteer is properly installed
2. **Messages not being received**: Verify webhook configuration
3. **LLM errors**: Check OpenAI API key and quota
4. **Memory issues**: Adjust conversation history limits

### Logs

The application provides detailed logging:
- Message reception and sending
- LLM API calls
- Error handling
- System statistics

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the logs
3. Create an issue on GitHub

## Roadmap

- [ ] Support for multiple LLM providers
- [ ] Database integration for persistent storage
- [ ] Message templates and quick replies
- [ ] Media message support
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Rate limiting and throttling
- [ ] Webhook signature verification
