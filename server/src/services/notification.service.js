// server/src/services/notification.service.js
// Notification Service - Firebase Cloud Messaging, Email & SMS

// Firebase Admin (optional) - guard so app runs without firebase-admin
let admin = null
let getMessaging = null
try {
  // Defer requires to runtime and handle absence gracefully
  admin = require('firebase-admin')
  getMessaging = require('firebase-admin/messaging').getMessaging
} catch (e) {
  admin = null
  getMessaging = null
}
const nodemailer = require('nodemailer')

// Email configuration using Nodemailer (backup for Firebase)
const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
})

// SMS configuration (optional - can use Twilio)
const twilioEnabled = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
let twilioClient = null

if (twilioEnabled) {
  const twilio = require('twilio')
  twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  )
}

class NotificationService {
  constructor() {
    this.messaging = (admin && getMessaging && admin.apps && admin.apps.length) ? getMessaging() : null
    if (!this.messaging) {
      console.warn('⚠️  Firebase Messaging not initialized')
    }
  }

  /**
   * Send push notification via Firebase Cloud Messaging
   * @param {string|string[]} fcmTokens - FCM token(s) of recipient device(s)
   * @param {string} title - Notification title
   * @param {string} body - Notification body
   * @param {Object} data - Additional data payload
   * @returns {Promise<boolean>}
   */
  async sendPushNotification(fcmTokens, title, body, data = {}) {
    try {
      if (!this.messaging) {
        console.warn('Firebase Messaging not initialized, skipping push notification')
        return false
      }

      const tokens = Array.isArray(fcmTokens) ? fcmTokens : [fcmTokens]
      
      const message = {
        notification: {
          title,
          body
        },
        data: {
          ...data,
          clickAction: 'FLUTTER_NOTIFICATION_CLICK'
        },
        tokens
      }

      const response = await this.messaging.sendMulticast(message)
      
      console.log(`Push notification sent: ${response.successCount}/${tokens.length} successful`)
      
      // Remove invalid tokens
      if (response.failureCount > 0) {
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            console.warn(`Failed to send to token ${tokens[idx]}: ${resp.error}`)
          }
        })
      }

      return response.successCount > 0
    } catch (error) {
      console.error('Error sending push notification:', error)
      return false
    }
  }
  /**
   * Send email notification
   * @param {string} to - Recipient email
   * @param {string} subject - Email subject
   * @param {string} html - HTML content
   * @param {string} text - Plain text content (optional)
   * @returns {Promise<boolean>}
   */
  async sendEmail(to, subject, html, text = '') {
    try {
      if (!process.env.SMTP_USER) {
        console.warn('SMTP not configured, skipping email to:', to)
        return false
      }

      const mailOptions = {
        from: `"${process.env.APP_NAME || 'Civic Issues'}" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, '') // Strip HTML for text version
      }

      const info = await emailTransporter.sendMail(mailOptions)
      console.log('Email sent:', info.messageId)
      return true
    } catch (error) {
      console.error('Error sending email:', error)
      return false
    }
  }

  /**
   * Send SMS notification
   * @param {string} phoneNumber - Recipient phone number (with country code)
   * @param {string} message - SMS message
   * @returns {Promise<boolean>}
   */
  async sendSMS(phoneNumber, message) {
    try {
      if (!twilioClient) {
        console.warn('SMS not configured, skipping SMS to:', phoneNumber)
        return false
      }

      const sms = await twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber
      })

      console.log('SMS sent:', sms.sid)
      return true
    } catch (error) {
      console.error('Error sending SMS:', error)
      return false
    }
  }

  /**
   * Send issue reported notification to citizen
   */
  async sendIssueReportedNotification(citizenEmail, citizenPhone, issueDetails, fcmToken = null) {
    const { id, title, category } = issueDetails

    // Push notification via Firebase
    if (fcmToken) {
      await this.sendPushNotification(
        fcmToken,
        'Issue Reported Successfully',
        `Your ${category} issue has been submitted for review.`,
        { issueId: id, type: 'issue_reported' }
      )
    }

    // Email
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Issue Reported Successfully</h2>
        <p>Your civic issue has been reported successfully and is now under review by our moderators.</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Issue Details</h3>
          <p><strong>Issue ID:</strong> #${id}</p>
          <p><strong>Title:</strong> ${title}</p>
          <p><strong>Category:</strong> ${category}</p>
        </div>
        
        <p>You will receive updates via email, SMS, and push notifications as your issue progresses.</p>
        
        <p style="color: #6b7280; font-size: 14px;">
          Track your issue: <a href="${process.env.CLIENT_URL}/track/${id}">Click here</a>
        </p>
      </div>
    `

    await this.sendEmail(citizenEmail, `Issue Reported - #${id}`, emailHtml)

    // SMS
    if (citizenPhone) {
      const sms = `Your issue #${id} (${title}) has been reported successfully. Track: ${process.env.CLIENT_URL}/track/${id}`
      await this.sendSMS(citizenPhone, sms)
    }
  }

  /**
   * Send issue assigned notification to staff
   */
  async sendIssueAssignedNotification(staffEmail, staffPhone, issueDetails, fcmToken = null) {
    const { id, title, location, priority } = issueDetails

    // Push notification via Firebase
    if (fcmToken) {
      await this.sendPushNotification(
        fcmToken,
        'New Issue Assigned',
        `${priority} priority: ${title}`,
        { issueId: id, type: 'issue_assigned', priority }
      )
    }

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">New Issue Assigned to You</h2>
        <p>A new civic issue has been assigned to you for resolution.</p>
        
        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
          <h3 style="margin-top: 0;">Issue Details</h3>
          <p><strong>Issue ID:</strong> #${id}</p>
          <p><strong>Title:</strong> ${title}</p>
          <p><strong>Location:</strong> ${location}</p>
          <p><strong>Priority:</strong> <span style="color: ${priority === 'CRITICAL' ? '#dc2626' : '#f59e0b'};">${priority}</span></p>
        </div>
        
        <p>Please review the issue and take necessary action as soon as possible.</p>
        
        <a href="${process.env.CLIENT_URL}/staff/issues/${id}" style="display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px;">
          View Issue Details
        </a>
      </div>
    `

    await this.sendEmail(staffEmail, `New Issue Assigned - #${id}`, emailHtml)

    if (staffPhone) {
      const sms = `New issue #${id} assigned: ${title}. Priority: ${priority}. View: ${process.env.CLIENT_URL}/staff/issues/${id}`
      await this.sendSMS(staffPhone, sms)
    }
  }

  /**
   * Send work completed notification to citizen
   */
  async sendWorkCompletedNotification(citizenEmail, citizenPhone, issueDetails, fcmToken = null) {
    const { id, title, staffName } = issueDetails

    // Push notification via Firebase
    if (fcmToken) {
      await this.sendPushNotification(
        fcmToken,
        'Your Issue Has Been Resolved! 🎉',
        `Please verify the work completed by ${staffName}`,
        { issueId: id, type: 'work_completed', action: 'verify' }
      )
    }

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Your Issue Has Been Resolved! 🎉</h2>
        <p>Great news! The work on your reported issue has been completed.</p>
        
        <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Issue Details</h3>
          <p><strong>Issue ID:</strong> #${id}</p>
          <p><strong>Title:</strong> ${title}</p>
          <p><strong>Resolved By:</strong> ${staffName}</p>
        </div>
        
        <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <h3 style="margin-top: 0; color: #92400e;">⭐ Please Verify the Work</h3>
          <p>Help us improve our services by verifying the completed work and providing your valuable feedback.</p>
          
          <a href="${process.env.CLIENT_URL}/citizen/verify" style="display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px;">
            Verify & Rate the Work
          </a>
        </div>
        
        <p style="color: #6b7280; font-size: 14px;">
          View photos and details: <a href="${process.env.CLIENT_URL}/track/${id}">Click here</a>
        </p>
      </div>
    `

    await this.sendEmail(citizenEmail, `Issue Resolved - Please Verify #${id}`, emailHtml)

    if (citizenPhone) {
      const sms = `Your issue #${id} has been resolved! Please verify and rate the work: ${process.env.CLIENT_URL}/citizen/verify`
      await this.sendSMS(citizenPhone, sms)
    }
  }

  /**
   * Send verification received notification to staff
   */
  async sendVerificationReceivedNotification(staffEmail, staffPhone, issueDetails) {
    const { id, title, rating, feedback } = issueDetails

    const ratingStars = '⭐'.repeat(rating)

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">Citizen Verification Received</h2>
        <p>The citizen has verified the work you completed and provided feedback.</p>
        
        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Issue Details</h3>
          <p><strong>Issue ID:</strong> #${id}</p>
          <p><strong>Title:</strong> ${title}</p>
          <p><strong>Rating:</strong> ${ratingStars} (${rating}/5)</p>
        </div>
        
        ${feedback ? `
        <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Citizen Feedback</h3>
          <p style="font-style: italic;">"${feedback}"</p>
        </div>
        ` : ''}
        
        <p>Keep up the great work! Your efforts are making a real difference in our community.</p>
      </div>
    `

    await this.sendEmail(staffEmail, `Verification Received - #${id} (${rating}★)`, emailHtml)

    if (staffPhone) {
      const sms = `Issue #${id} verified by citizen. Rating: ${rating}/5 stars. ${feedback ? `Feedback: ${feedback}` : ''}`
      await this.sendSMS(staffPhone, sms)
    }
  }

  /**
   * Send issue reopened notification
   */
  async sendIssueReopenedNotification(staffEmail, departmentAdminEmail, issueDetails) {
    const { id, title, reason } = issueDetails

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Issue Has Been Reopened</h2>
        <p>The citizen was not satisfied with the work and has reopened the issue.</p>
        
        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <h3 style="margin-top: 0;">Issue Details</h3>
          <p><strong>Issue ID:</strong> #${id}</p>
          <p><strong>Title:</strong> ${title}</p>
          ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
        </div>
        
        <p>Please review the issue and take necessary corrective action.</p>
        
        <a href="${process.env.CLIENT_URL}/staff/issues/${id}" style="display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px;">
          View Issue Details
        </a>
      </div>
    `

    await this.sendEmail(staffEmail, `Issue Reopened - #${id}`, emailHtml)
    await this.sendEmail(departmentAdminEmail, `Issue Reopened - #${id}`, emailHtml)
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email, resetToken) {
    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Password Reset Request</h2>
        <p>You have requested to reset your password. Click the button below to set a new password.</p>
        
        <a href="${resetLink}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          Reset Password
        </a>
        
        <p style="color: #6b7280; font-size: 14px;">
          This link will expire in 1 hour. If you didn't request this, please ignore this email.
        </p>
        
        <p style="color: #6b7280; font-size: 12px;">
          Or copy this link: ${resetLink}
        </p>
      </div>
    `

    return await this.sendEmail(email, 'Password Reset Request', emailHtml)
  }

  /**
   * Send welcome email to new user
   */
  async sendWelcomeEmail(email, name, role) {
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">Welcome to ${process.env.APP_NAME || 'Civic Issues Platform'}! 🎉</h2>
        <p>Hello ${name},</p>
        <p>Your account has been successfully created with the role of <strong>${role}</strong>.</p>
        
        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Getting Started</h3>
          <p>Log in to your dashboard to start making a difference in your community!</p>
          
          <a href="${process.env.CLIENT_URL}/login" style="display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px;">
            Go to Dashboard
          </a>
        </div>
        
        <p>If you have any questions, feel free to contact our support team.</p>
        
        <p style="color: #6b7280; font-size: 14px;">
          Best regards,<br>
          The ${process.env.APP_NAME || 'Civic Issues'} Team
        </p>
      </div>
    `

    return await this.sendEmail(email, 'Welcome to Our Platform', emailHtml)
  }

  /**
   * Send bulk notifications (for announcements, etc.)
   */
  async sendBulkEmail(recipients, subject, html) {
    try {
      const promises = recipients.map(email => this.sendEmail(email, subject, html))
      await Promise.allSettled(promises)
      return true
    } catch (error) {
      console.error('Error sending bulk emails:', error)
      return false
    }
  }

  /**
   * Test Firebase Cloud Messaging configuration
   */
  async testFCMConfiguration() {
    try {
      if (!this.messaging) {
        throw new Error('Firebase Messaging not initialized')
      }

      console.log('🔔 Push notifications ready')
      return true
    } catch (error) {
      console.error('❌ Firebase Cloud Messaging error:', error.message)
      return false
    }
  }

  /**
   * Send notification to multiple channels (push, email, SMS)
   * @param {Object} recipient - Recipient info {email, phone, fcmToken}
   * @param {Object} notification - Notification content {title, body, emailHtml, smsText, data}
   */
  async sendMultiChannelNotification(recipient, notification) {
    const promises = []

    // Push notification
    if (recipient.fcmToken && notification.title && notification.body) {
      promises.push(
        this.sendPushNotification(
          recipient.fcmToken,
          notification.title,
          notification.body,
          notification.data || {}
        )
      )
    }

    // Email
    if (recipient.email && notification.emailHtml) {
      promises.push(
        this.sendEmail(
          recipient.email,
          notification.title,
          notification.emailHtml
        )
      )
    }

    // SMS
    if (recipient.phone && notification.smsText) {
      promises.push(
        this.sendSMS(recipient.phone, notification.smsText)
      )
    }

    await Promise.allSettled(promises)
  }
}

module.exports = new NotificationService()
