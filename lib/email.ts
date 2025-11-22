import { Resend } from 'resend';

// 初始化 Resend 客户端（仅在配置了 API key 时）
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

/**
 * 检查邮件服务是否已配置
 */
export function isEmailConfigured(): boolean {
  return !!(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

/**
 * 发送验证邮件
 */
export async function sendVerificationEmail({
  to,
  username,
  verificationUrl,
}: {
  to: string;
  username: string;
  verificationUrl: string;
}) {
  if (!resend) {
    console.warn('Resend API key not configured. Email verification is disabled.');
    return { success: false, error: 'Email service not configured' };
  }

  const emailFrom = process.env.EMAIL_FROM || 'noreply@example.com';
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'mybento';

  try {
    await resend.emails.send({
      from: emailFrom,
      to,
      subject: `Verify your email for ${siteName}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify your email</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">${siteName}</h1>
            </div>
            
            <div style="background: #ffffff; padding: 40px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
              <h2 style="color: #333; margin-top: 0;">Hi ${username}! 👋</h2>
              
              <p style="font-size: 16px; color: #555;">
                Thanks for signing up! Please verify your email address to get started with ${siteName}.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" 
                   style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                  Verify Email Address
                </a>
              </div>
              
              <p style="font-size: 14px; color: #777; margin-top: 30px;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="font-size: 12px; color: #999; word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 4px;">
                ${verificationUrl}
              </p>
              
              <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
              
              <p style="font-size: 12px; color: #999; margin: 0;">
                If you didn't create an account, you can safely ignore this email.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
              <p>© ${new Date().getFullYear()} ${siteName}. All rights reserved.</p>
            </div>
          </body>
        </html>
      `,
      text: `
Hi ${username}!

Thanks for signing up for ${siteName}! Please verify your email address by clicking the link below:

${verificationUrl}

If you didn't create an account, you can safely ignore this email.

© ${new Date().getFullYear()} ${siteName}
      `.trim(),
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to send verification email:', error);
    return { success: false, error: 'Failed to send email' };
  }
}

/**
 * 发送密码重置邮件
 */
export async function sendPasswordResetEmail({
  to,
  username,
  resetUrl,
}: {
  to: string;
  username: string;
  resetUrl: string;
}) {
  if (!resend) {
    console.warn('Resend API key not configured. Password reset emails are disabled.');
    return { success: false, error: 'Email service not configured' };
  }

  const emailFrom = process.env.EMAIL_FROM || 'noreply@example.com';
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'mybento';

  try {
    await resend.emails.send({
      from: emailFrom,
      to,
      subject: `Reset your password for ${siteName}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset your password</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">${siteName}</h1>
            </div>
            
            <div style="background: #ffffff; padding: 40px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
              <h2 style="color: #333; margin-top: 0;">Hi ${username}! 🔐</h2>
              
              <p style="font-size: 16px; color: #555;">
                We received a request to reset your password. Click the button below to create a new password:
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" 
                   style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                  Reset Password
                </a>
              </div>
              
              <p style="font-size: 14px; color: #777; margin-top: 30px;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="font-size: 12px; color: #999; word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 4px;">
                ${resetUrl}
              </p>
              
              <p style="font-size: 14px; color: #e74c3c; margin-top: 20px;">
                ⚠️ This link will expire in 1 hour for security reasons.
              </p>
              
              <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
              
              <p style="font-size: 12px; color: #999; margin: 0;">
                If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
              <p>© ${new Date().getFullYear()} ${siteName}. All rights reserved.</p>
            </div>
          </body>
        </html>
      `,
      text: `
Hi ${username}!

We received a request to reset your password for ${siteName}. Click the link below to create a new password:

${resetUrl}

This link will expire in 1 hour for security reasons.

If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.

© ${new Date().getFullYear()} ${siteName}
      `.trim(),
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    return { success: false, error: 'Failed to send email' };
  }
}
