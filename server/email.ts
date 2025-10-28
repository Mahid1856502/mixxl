import { MailService } from "@sendgrid/mail";

const mailService = new MailService();

// Initialize SendGrid if API key is available
if (process.env.SENDGRID_API_KEY) {
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
}

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn(
      "SendGrid API key not configured - email verification disabled"
    );
    return false;
  }

  try {
    await mailService.send({
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text ?? "",
      html: params.html,
    });
    return true;
  } catch (error) {
    console.error("SendGrid email error:", error);
    return false;
  }
}

export function generateVerificationEmail(
  verificationUrl: string,
  fullName: string
) {
  const subject = "Verify your Mixxl account";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Mixxl Account</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Mixxl!</h1>
      </div>
      
      <div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
        <h2 style="color: #333; margin-top: 0;">Hi ${fullName}!</h2>
        
        <p>Thanks for signing up for Mixxl, the independent music platform that puts artists first.</p>
        
        <p>To get started, please verify your email address by clicking the button below:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                    color: white; 
                    padding: 12px 30px; 
                    text-decoration: none; 
                    border-radius: 25px; 
                    font-weight: bold; 
                    display: inline-block;">
            Verify Email Address
          </a>
        </div>
        
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="font-size: 14px; color: #666;">
          This link will expire in 24 hours. If you didn't create a Mixxl account, you can safely ignore this email.
        </p>
        
        <p style="font-size: 14px; color: #666;">
          Best regards,<br>
          The Mixxl Team
        </p>
      </div>
    </body>
    </html>
  `;

  const text = `
    Welcome to Mixxl!
    
    Hi ${fullName}!
    
    Thanks for signing up for Mixxl, the independent music platform that puts artists first.
    
    To get started, please verify your email address by visiting this link:
    ${verificationUrl}
    
    This link will expire in 24 hours. If you didn't create a Mixxl account, you can safely ignore this email.
    
    Best regards,
    The Mixxl Team
  `;

  return {
    subject,
    html,
    text,
  };
}

// lib/emails/contact.ts
export function generateContactEmail(
  type: "support" | "user",
  data: {
    name: string;
    email: string;
    subject: string;
    category: string;
    message: string;
  }
) {
  const { name, email, subject, category, message } = data;

  if (type === "support") {
    return {
      subject: `New Contact Form Submission: ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Category:</strong> ${category}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <h3>Message:</h3>
        <div>${message.replace(/\n/g, "<br>")}</div>
      `,
      text: `New contact form submission from ${name} (${email})
Category: ${category}
Subject: ${subject}

Message:
${message}`,
    };
  }

  return {
    subject: "✅ Thank you for contacting Mixxl",
    html: `
      <p>Hi ${name},</p>
      <p>Thanks for contacting Mixxl! We’ve received your message and will get back to you within 24 hours.</p>
      <h3>Your Message Summary:</h3>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Category:</strong> ${category}</p>
      <p>If urgent, email us directly at hello@mixxl.fm</p>
      <p>— The Mixxl Team</p>
    `,
    text: `Hi ${name},

Thanks for contacting Mixxl! We’ll get back to you within 24 hours.

Your Message Summary:
Subject: ${subject}
Category: ${category}

If urgent, email us at hello@mixxl.fm

— The Mixxl Team`,
  };
}
