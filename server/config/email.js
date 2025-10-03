const nodemailer = require('nodemailer');

// Create a console-based transporter for development
// This logs emails to the console instead of sending real emails
const transporter = {
  sendMail: function(mailOptions) {
    return new Promise((resolve, reject) => {
      console.log('\n📧 ===== EMAIL NOTIFICATION =====');
      console.log('To:', mailOptions.to);
      console.log('Subject:', mailOptions.subject);
      
      // Extract links from HTML for easy testing
      const linkMatch = mailOptions.html.match(/href="([^"]*)"/);
      if (linkMatch) {
        console.log('🔗 Direct Link:', linkMatch[1]);
      }
      
      // Extract token from HTML
      const tokenMatch = mailOptions.html.match(/<strong>[\s\S]*?Token[^<]*<\/strong>[\s\S]*?([a-f0-9]{64})/i);
      if (tokenMatch) {
        console.log('🔑 Verification Token:', tokenMatch[1]);
      }
      
      console.log('--- Email Content Preview ---');
      // Extract text content from HTML for preview
      const textContent = mailOptions.html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
      console.log(textContent.substring(0, 200) + '...');
      console.log('==============================\n');
      
      resolve({
        messageId: 'dev-' + Date.now(),
        envelope: { from: mailOptions.from, to: [mailOptions.to] },
        accepted: [mailOptions.to],
        rejected: [],
        pending: [],
        response: '250 Email logged to console (development mode)'
      });
    });
  },
  
  // Add verify method to prevent connection errors
  verify: function(callback) {
    console.log('✅ Email system ready (development mode - emails logged to console)');
    if (callback) callback(null, true);
    return Promise.resolve(true);
  }
};

console.log('✅ Development email transporter initialized');
console.log('💡 All emails will be logged to the console with verification links');

module.exports = transporter;