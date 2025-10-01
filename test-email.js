const { sendTestEmail, testEmailConnection } = require('./src/lib/email-service.ts');

async function testEmail() {
  try {
    console.log('Testing email configuration...');
    
    // Test connection
    const isConnected = await testEmailConnection();
    console.log('Connection test result:', isConnected);
    
    if (isConnected) {
      console.log('Sending test email...');
      await sendTestEmail('enigray05@gmail.com');
      console.log('Test email sent successfully!');
    } else {
      console.log('Email configuration is invalid');
    }
  } catch (error) {
    console.error('Email test failed:', error);
  }
}

testEmail();