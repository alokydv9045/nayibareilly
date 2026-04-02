import nodemailer from 'nodemailer'

let transporter

export const getTransporter = () => {
  if (transporter) return transporter
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  })
  return transporter
}

export const sendMail = async ({ to, subject, html, text }) => {
  const t = getTransporter()
  const info = await t.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject,
    text,
    html
  })
  if (process.env.NODE_ENV !== 'production') {
    console.log('Sent mail:', info.messageId)
  }
  return info
}
