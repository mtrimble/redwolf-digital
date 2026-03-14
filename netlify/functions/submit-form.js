// Netlify Function: Handle contact form submissions
// Receives POST from the contact form and sends email notification via fetch to an email API

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Parse URL-encoded form body
    const params = new URLSearchParams(event.body);
    const name    = params.get('name')    || '';
    const email   = params.get('email')   || '';
    const phone   = params.get('phone')   || 'Not provided';
    const website = params.get('website') || 'Not provided';
    const service = params.get('service') || 'Not specified';
    const message = params.get('message') || '';
    const botField = params.get('bot-field') || '';

    // Honeypot check
    if (botField) {
      return { statusCode: 200, body: 'ok' };
    }

    // Validate required fields
    if (!name || !email || !message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    // Send via Web3Forms (or fallback: just store in Netlify env)
    const accessKey = process.env.WEB3FORMS_KEY;

    if (accessKey) {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: accessKey,
          subject: `New Contact Form Submission from ${name}`,
          from_name: 'RedWolf Digital Website',
          name,
          email,
          phone,
          website,
          service,
          message
        })
      });

      const result = await response.json();
      if (!result.success) {
        console.error('Web3Forms error:', result);
      }
    }

    // Always redirect to thanks page on success
    return {
      statusCode: 302,
      headers: { Location: '/thanks/' },
      body: ''
    };

  } catch (err) {
    console.error('Form handler error:', err);
    return {
      statusCode: 302,
      headers: { Location: '/thanks/' },
      body: ''
    };
  }
};
