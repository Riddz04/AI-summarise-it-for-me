import emailjs from '@emailjs/browser';

interface EmailParams {
  recipients: string[];
  subject: string;
  message: string;
  summary: string;
  senderName?: string;
}

export const sendEmail = async (params: EmailParams): Promise<boolean> => {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  if (!serviceId || !templateId || !publicKey) {
    throw new Error('EmailJS configuration missing. Please add your EmailJS credentials to the .env file.');
  }

  try {
    // Initialize EmailJS with public key
    emailjs.init(publicKey);

    // Send email to each recipient
    const emailPromises = params.recipients.map(async (recipient) => {
      const templateParams = {
        to_email: recipient,
        subject: params.subject,
        message: params.message,
        summary_content: params.summary,
        sender_name: params.senderName || 'Meeting Summarizer',
        reply_to: 'noreply@meetingsummarizer.com'
      };

      return emailjs.send(serviceId, templateId, templateParams);
    });

    // Wait for all emails to be sent
    await Promise.all(emailPromises);
    return true;

  } catch (error) {
    console.error('EmailJS Error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Invalid service ID')) {
        throw new Error('Invalid EmailJS service ID. Please check your configuration.');
      } else if (error.message.includes('Invalid template ID')) {
        throw new Error('Invalid EmailJS template ID. Please check your configuration.');
      } else if (error.message.includes('Invalid public key')) {
        throw new Error('Invalid EmailJS public key. Please check your configuration.');
      } else if (error.message.includes('rate limit')) {
        throw new Error('Email rate limit exceeded. Please try again later.');
      }
    }
    
    throw new Error('Failed to send email. Please try again.');
  }
};

// Alternative implementation using a custom backend service
export const sendEmailViaBackend = async (params: EmailParams): Promise<boolean> => {
  const backendUrl = import.meta.env.VITE_EMAIL_SERVICE_URL || 'http://localhost:3001/api/send-email';
  
  try {
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_EMAIL_SERVICE_API_KEY || ''}`
      },
      body: JSON.stringify({
        recipients: params.recipients,
        subject: params.subject,
        message: params.message,
        summary: params.summary,
        senderName: params.senderName
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    return result.success === true;

  } catch (error) {
    console.error('Backend Email Service Error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Email service unavailable. Please try again later.');
      } else if (error.message.includes('401')) {
        throw new Error('Email service authentication failed. Please check API key.');
      } else if (error.message.includes('429')) {
        throw new Error('Email rate limit exceeded. Please try again later.');
      }
    }
    
    throw new Error('Failed to send email via backend service.');
  }
};