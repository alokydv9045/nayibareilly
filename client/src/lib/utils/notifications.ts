/**
 * Notification Service
 * 
 * Handles sending notifications via Email, SMS, and Push notifications
 */

// Email configuration (using a generic mail service)
const _EMAIL_CONFIG = {
  from: process.env.EMAIL_FROM || 'noreply@nagarsetu.gov.in',
  apiKey: process.env.EMAIL_API_KEY || '',
  apiUrl: process.env.EMAIL_API_URL || '',
}

// SMS configuration (Twilio or similar)
const _SMS_CONFIG = {
  accountSid: process.env.SMS_ACCOUNT_SID || '',
  authToken: process.env.SMS_AUTH_TOKEN || '',
  fromNumber: process.env.SMS_FROM_NUMBER || '',
  apiUrl: process.env.SMS_API_URL || '',
}

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export interface SMSOptions {
  to: string
  message: string
}

export interface PushNotificationOptions {
  userId: string
  title: string
  body: string
  data?: Record<string, string>
}

/**
 * Send email notification
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    console.log('📧 Sending email to:', options.to)
    console.log('Subject:', options.subject)

    // TODO: Implement actual email sending
    // Example using SendGrid, AWS SES, or similar:
    /*
    const response = await fetch(EMAIL_CONFIG.apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${EMAIL_CONFIG.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: EMAIL_CONFIG.from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || options.subject,
      }),
    })

    if (!response.ok) {
      throw new Error(`Email API error: ${response.statusText}`)
    }
    */

    // Mock success for development
    console.log('✅ Email sent successfully (mock)')
    return true
  } catch (error) {
    console.error('❌ Error sending email:', error)
    return false
  }
}

/**
 * Send SMS notification
 */
export async function sendSMS(options: SMSOptions): Promise<boolean> {
  try {
    console.log('📱 Sending SMS to:', options.to)
    console.log('Message:', options.message)

    // TODO: Implement actual SMS sending
    // Example using Twilio:
    /*
    const response = await fetch(
      `${SMS_CONFIG.apiUrl}/Accounts/${SMS_CONFIG.accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(
            `${SMS_CONFIG.accountSid}:${SMS_CONFIG.authToken}`
          ).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: options.to,
          From: SMS_CONFIG.fromNumber,
          Body: options.message,
        }),
      }
    )

    if (!response.ok) {
      throw new Error(`SMS API error: ${response.statusText}`)
    }
    */

    // Mock success for development
    console.log('✅ SMS sent successfully (mock)')
    return true
  } catch (error) {
    console.error('❌ Error sending SMS:', error)
    return false
  }
}

/**
 * Send push notification
 */
export async function sendPushNotification(
  options: PushNotificationOptions
): Promise<boolean> {
  try {
    console.log('🔔 Sending push notification to user:', options.userId)
    console.log('Title:', options.title)
    console.log('Body:', options.body)

    // TODO: Implement actual push notification
    // Example using Firebase Cloud Messaging:
    /*
    const response = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Authorization': `key=${process.env.FCM_SERVER_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: userDeviceToken,
        notification: {
          title: options.title,
          body: options.body,
        },
        data: options.data,
      }),
    })

    if (!response.ok) {
      throw new Error(`Push notification error: ${response.statusText}`)
    }
    */

    // Mock success for development
    console.log('✅ Push notification sent successfully (mock)')
    return true
  } catch (error) {
    console.error('❌ Error sending push notification:', error)
    return false
  }
}

/**
 * Email templates
 */
export const EmailTemplates = {
  /**
   * Issue submitted confirmation
   */
  issueSubmitted: (issueId: string, issueTitle: string) => ({
    subject: 'Issue Submitted Successfully',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
          <h2 style="color: #2563eb;">Issue Submitted Successfully</h2>
          <p>Thank you for reporting the issue. Your issue has been submitted and is now being reviewed by our team.</p>
          <div style="background-color: #eff6ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Issue ID:</strong> ${issueId}</p>
            <p><strong>Issue Title:</strong> ${issueTitle}</p>
          </div>
          <p>You will receive updates as your issue progresses through our system.</p>
          <p style="margin-top: 30px; color: #666;">Best regards,<br>Nagar Setu Team</p>
        </div>
      </div>
    `,
  }),

  /**
   * Work completed notification
   */
  workCompleted: (issueId: string, issueTitle: string, verificationLink: string) => ({
    subject: 'Your Issue Has Been Resolved',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
          <h2 style="color: #16a34a;">Your Issue Has Been Resolved!</h2>
          <p>Great news! The work on your reported issue has been completed by our staff.</p>
          <div style="background-color: #f0fdf4; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Issue ID:</strong> ${issueId}</p>
            <p><strong>Issue Title:</strong> ${issueTitle}</p>
          </div>
          <p>Please take a moment to verify the completed work and provide your feedback.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" style="background-color: #16a34a; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Completed Work
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">This link will expire in 7 days. Please verify as soon as possible.</p>
          <p style="margin-top: 30px; color: #666;">Best regards,<br>Nagar Setu Team</p>
        </div>
      </div>
    `,
  }),

  /**
   * Verification reminder
   */
  verificationReminder: (issueId: string, issueTitle: string, verificationLink: string, daysLeft: number) => ({
    subject: 'Reminder: Please Verify Completed Work',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
          <h2 style="color: #f59e0b;">Verification Reminder</h2>
          <p>You have ${daysLeft} day${daysLeft === 1 ? '' : 's'} left to verify the completed work on your issue.</p>
          <div style="background-color: #fffbeb; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Issue ID:</strong> ${issueId}</p>
            <p><strong>Issue Title:</strong> ${issueTitle}</p>
          </div>
          <p>Your feedback helps us improve our services. Please verify the work at your earliest convenience.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" style="background-color: #f59e0b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Now
            </a>
          </div>
          <p style="margin-top: 30px; color: #666;">Best regards,<br>Nagar Setu Team</p>
        </div>
      </div>
    `,
  }),

  /**
   * Issue assigned to staff
   */
  issueAssigned: (staffName: string, issueId: string, issueTitle: string, priority: string) => ({
    subject: `New Issue Assigned - ${priority} Priority`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
          <h2 style="color: #2563eb;">New Issue Assigned</h2>
          <p>Hello ${staffName},</p>
          <p>A new issue has been assigned to you for resolution.</p>
          <div style="background-color: #eff6ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Issue ID:</strong> ${issueId}</p>
            <p><strong>Issue Title:</strong> ${issueTitle}</p>
            <p><strong>Priority:</strong> <span style="color: ${priority === 'CRITICAL' ? '#dc2626' : priority === 'HIGH' ? '#f59e0b' : '#16a34a'};">${priority}</span></p>
          </div>
          <p>Please review the issue details and take appropriate action.</p>
          <p style="margin-top: 30px; color: #666;">Best regards,<br>Nagar Setu Team</p>
        </div>
      </div>
    `,
  }),
}

/**
 * SMS templates (shorter versions)
 */
export const SMSTemplates = {
  issueSubmitted: (issueId: string) =>
    `Issue #${issueId} submitted successfully. Track status at nagarsetu.gov.in`,

  workCompleted: (issueId: string, verificationLink: string) =>
    `Issue #${issueId} resolved! Verify work: ${verificationLink}`,

  verificationReminder: (issueId: string, daysLeft: number) =>
    `Reminder: Verify Issue #${issueId} work. ${daysLeft} day${daysLeft === 1 ? '' : 's'} left.`,

  issueAssigned: (issueId: string, priority: string) =>
    `New ${priority} issue #${issueId} assigned. Login to view details.`,
}

/**
 * Helper function to send all notifications for work completion
 */
export async function notifyWorkCompleted(
  citizenEmail: string,
  citizenPhone: string,
  issueId: string,
  issueTitle: string,
  verificationLink: string
): Promise<void> {
  const emailTemplate = EmailTemplates.workCompleted(issueId, issueTitle, verificationLink)
  const smsMessage = SMSTemplates.workCompleted(issueId, verificationLink)

  await Promise.all([
    sendEmail({
      to: citizenEmail,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    }),
    sendSMS({
      to: citizenPhone,
      message: smsMessage,
    }),
  ])
}

/**
 * Helper function to send verification reminder
 */
export async function notifyVerificationReminder(
  citizenEmail: string,
  citizenPhone: string,
  issueId: string,
  issueTitle: string,
  verificationLink: string,
  daysLeft: number
): Promise<void> {
  const emailTemplate = EmailTemplates.verificationReminder(
    issueId,
    issueTitle,
    verificationLink,
    daysLeft
  )
  const smsMessage = SMSTemplates.verificationReminder(issueId, daysLeft)

  await Promise.all([
    sendEmail({
      to: citizenEmail,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    }),
    sendSMS({
      to: citizenPhone,
      message: smsMessage,
    }),
  ])
}

/**
 * Helper function to notify staff of assignment
 */
export async function notifyIssueAssigned(
  staffEmail: string,
  staffPhone: string,
  staffName: string,
  issueId: string,
  issueTitle: string,
  priority: string
): Promise<void> {
  const emailTemplate = EmailTemplates.issueAssigned(staffName, issueId, issueTitle, priority)
  const smsMessage = SMSTemplates.issueAssigned(issueId, priority)

  await Promise.all([
    sendEmail({
      to: staffEmail,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    }),
    sendSMS({
      to: staffPhone,
      message: smsMessage,
    }),
  ])
}
