#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setup() {
  console.log('🚀 WhatsApp Chatbot Setup\n');
  console.log('This script will help you configure your WhatsApp chatbot.\n');

  // Check if .env file exists
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const overwrite = await question('⚠️  .env file already exists. Overwrite? (y/N): ');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('Setup cancelled.');
      rl.close();
      return;
    }
  }

  console.log('\n📝 Configuration Setup:\n');

  // Server Configuration
  const port = await question('Server port (default: 3000): ') || '3000';
  const nodeEnv = await question('Node environment (default: development): ') || 'development';

  // OpenAI Configuration
  console.log('\n🔑 OpenAI Configuration:');
  console.log('Get your API key from: https://platform.openai.com/api-keys');
  const openaiKey = await question('OpenAI API Key: ');
  const openaiModel = await question('OpenAI Model (default: gpt-3.5-turbo): ') || 'gpt-3.5-turbo';

  // WhatsApp Business API Configuration (optional)
  console.log('\n📱 WhatsApp Business API Configuration (optional):');
  console.log('Leave blank if you want to use WhatsApp Web mode only');
  const whatsappToken = await question('WhatsApp Access Token: ');
  const whatsappPhoneId = await question('WhatsApp Phone Number ID: ');
  const whatsappVerifyToken = await question('WhatsApp Verify Token: ');

  // Admin Configuration
  console.log('\n🔧 Admin Configuration:');
  const adminKey = await question('Admin API Key (for admin routes): ') || 'admin-secret-key';

  // Generate .env content
  const envContent = `# Server Configuration
PORT=${port}
NODE_ENV=${nodeEnv}

# OpenAI Configuration
OPENAI_API_KEY=${openaiKey}
OPENAI_MODEL=${openaiModel}

# WhatsApp Business API Configuration
WHATSAPP_ACCESS_TOKEN=${whatsappToken}
WHATSAPP_PHONE_NUMBER_ID=${whatsappPhoneId}
WHATSAPP_VERIFY_TOKEN=${whatsappVerifyToken}

# Admin API Key
ADMIN_API_KEY=${adminKey}
`;

  // Write .env file
  try {
    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ Configuration saved to .env file!');
  } catch (error) {
    console.error('\n❌ Error saving configuration:', error.message);
    rl.close();
    return;
  }

  // Installation instructions
  console.log('\n📦 Next Steps:');
  console.log('1. Install dependencies: npm install');
  console.log('2. Start the server: npm run dev');
  console.log('3. Scan the QR code with WhatsApp (if using Web mode)');
  console.log('4. Test the bot by sending a message');

  // Mode-specific instructions
  if (whatsappToken && whatsappPhoneId) {
    console.log('\n📱 WhatsApp Business API Mode:');
    console.log('- Configure your webhook URL in Meta Developer Console');
    console.log('- Webhook URL: https://your-domain.com/webhook');
    console.log('- Verify Token: ' + whatsappVerifyToken);
  } else {
    console.log('\n📱 WhatsApp Web Mode:');
    console.log('- The bot will show a QR code when started');
    console.log('- Scan it with your WhatsApp mobile app');
  }

  console.log('\n🔗 Useful URLs:');
  console.log(`- Health check: http://localhost:${port}/health`);
  console.log(`- Admin status: http://localhost:${port}/admin/status`);
  console.log(`- API info: http://localhost:${port}/`);

  console.log('\n🎉 Setup complete! Happy chatting!');

  rl.close();
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Setup failed:', error);
  process.exit(1);
});

// Run setup
setup();
