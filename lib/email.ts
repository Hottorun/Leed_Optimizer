import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "Aclea <noreply@aclea.de>"

export interface EmailParams {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailParams) {
  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    })
    return { success: true, data }
  } catch (error) {
    console.error("Error sending email:", error)
    return { success: false, error }
  }
}

export async function sendWelcomeEmail(email: string, name: string) {
  const subject = "Welcome to Aclea - Your AI-Powered Lead Management"
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-flex; align-items: center; gap: 8px;">
          <div style="width: 40px; height: 40px; background: #059669; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
            </svg>
          </div>
          <span style="font-size: 24px; font-weight: 600; color: #1f2937;">Aclea</span>
        </div>
      </div>
      <h2 style="color: #1f2937; margin-bottom: 16px;">Welcome to Aclea, ${name}!</h2>
      <p style="color: #4b5563; line-height: 1.6;">Thank you for signing up for Aclea. We're excited to help you manage your leads with AI-powered automation.</p>
      <p style="color: #4b5563; line-height: 1.6;">With Aclea, you can:</p>
      <ul style="color: #4b5563; line-height: 1.8; margin: 16px 0;">
        <li>Automatically qualify leads using AI</li>
        <li>Get instant notifications on new leads</li>
        <li>Streamline your follow-up process</li>
        <li>Track your lead performance with analytics</li>
      </ul>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard" style="display: inline-block; background: #059669; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 500;">Get Started</a>
      </div>
      <p style="color: #9ca3af; font-size: 14px; text-align: center; margin-top: 32px;">
        If you have any questions, reply to this email or visit our help center.
      </p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
      <p style="color: #9ca3af; font-size: 12px; text-align: center;">
        © ${new Date().getFullYear()} Aclea GmbH. All rights reserved.<br>
        Berlin, Deutschland
      </p>
    </div>
  `
  return sendEmail({ to: email, subject, html })
}

export async function sendPasswordResetEmail(email: string, resetToken: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`
  const subject = "Reset Your Aclea Password"
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-flex; align-items: center; gap: 8px;">
          <div style="width: 40px; height: 40px; background: #059669; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
            </svg>
          </div>
          <span style="font-size: 24px; font-weight: 600; color: #1f2937;">Aclea</span>
        </div>
      </div>
      <h2 style="color: #1f2937; margin-bottom: 16px;">Reset Your Password</h2>
      <p style="color: #4b5563; line-height: 1.6;">We received a request to reset your password. Click the button below to create a new password:</p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${resetUrl}" style="display: inline-block; background: #059669; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 500;">Reset Password</a>
      </div>
      <p style="color: #9ca3af; font-size: 14px;">This link will expire in 1 hour.</p>
      <p style="color: #9ca3af; font-size: 14px; margin-top: 24px;">If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
      <p style="color: #9ca3af; font-size: 12px; text-align: center;">
        © ${new Date().getFullYear()} Aclea GmbH. All rights reserved.<br>
        Berlin, Deutschland
      </p>
    </div>
  `
  return sendEmail({ to: email, subject, html })
}

export async function sendNewLeadNotification(email: string, leadName: string, leadEmail: string) {
  const subject = "New Lead - Action Required"
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #059669;">New Lead Received</h2>
      <p>You have a new lead that needs attention:</p>
      <ul>
        <li><strong>Name:</strong> ${leadName}</li>
        <li><strong>Email:</strong> ${leadEmail}</li>
      </ul>
      <p>Log in to your Aclea dashboard to follow up.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/leads" style="display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">View Lead</a>
    </div>
  `
  return sendEmail({ to: email, subject, html })
}

export async function sendLeadApprovedNotification(email: string, leadName: string) {
  const subject = "Lead Approved"
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #059669;">Lead Approved</h2>
      <p>The following lead has been approved:</p>
      <ul>
        <li><strong>Name:</strong> ${leadName}</li>
      </ul>
      <p>Log in to your Aclea dashboard to view details.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/leads" style="display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">View Lead</a>
    </div>
  `
  return sendEmail({ to: email, subject, html })
}

export async function sendLeadDeclinedNotification(email: string, leadName: string) {
  const subject = "Lead Declined"
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #64748b;">Lead Declined</h2>
      <p>The following lead has been declined:</p>
      <ul>
        <li><strong>Name:</strong> ${leadName}</li>
      </ul>
    </div>
  `
  return sendEmail({ to: email, subject, html })
}

export async function sendManualReviewNotification(email: string, leadName: string) {
  const subject = "Manual Review Required"
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #d97706;">Manual Review Required</h2>
      <p>The following lead needs manual review:</p>
      <ul>
        <li><strong>Name:</strong> ${leadName}</li>
      </ul>
      <p>Log in to your Aclea dashboard to review this lead.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/leads" style="display: inline-block; background: #d97706; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">Review Lead</a>
    </div>
  `
  return sendEmail({ to: email, subject, html })
}

export async function sendDailySummary(email: string, stats: { totalLeads: number; newLeads: number; approved: number; declined: number }) {
  const subject = "Daily Lead Summary"
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #059669;">Daily Lead Summary</h2>
      <p>Here's your lead activity for today:</p>
      <ul>
        <li><strong>Total Leads:</strong> ${stats.totalLeads}</li>
        <li><strong>New Leads:</strong> ${stats.newLeads}</li>
        <li><strong>Approved:</strong> ${stats.approved}</li>
        <li><strong>Declined:</strong> ${stats.declined}</li>
      </ul>
      <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/leads" style="display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">View Dashboard</a>
    </div>
  `
  return sendEmail({ to: email, subject, html })
}

export async function sendWeeklyReport(email: string, stats: { totalLeads: number; newLeads: number; approved: number; declined: number; conversionRate: number }) {
  const subject = "Weekly Lead Report"
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #059669;">Weekly Lead Report</h2>
      <p>Here's your lead activity for this week:</p>
      <ul>
        <li><strong>Total Leads:</strong> ${stats.totalLeads}</li>
        <li><strong>New Leads:</strong> ${stats.newLeads}</li>
        <li><strong>Approved:</strong> ${stats.approved}</li>
        <li><strong>Declined:</strong> ${stats.declined}</li>
        <li><strong>Conversion Rate:</strong> ${stats.conversionRate}%</li>
      </ul>
      <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/analytics" style="display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">View Analytics</a>
    </div>
  `
  return sendEmail({ to: email, subject, html })
}

export async function sendPasswordChangedNotification(email: string, name: string) {
  const subject = "Your Aclea Password Was Updated"
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-flex; align-items: center; gap: 8px;">
          <div style="width: 40px; height: 40px; background: #059669; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <span style="font-size: 24px; font-weight: 600; color: #1f2937;">Aclea</span>
        </div>
      </div>
      <h2 style="color: #1f2937; margin-bottom: 16px;">Password Updated</h2>
      <p style="color: #4b5563; line-height: 1.6;">Hi ${name},</p>
      <p style="color: #4b5563; line-height: 1.6;">Your password for your Aclea account was recently changed.</p>
      <p style="color: #4b5563; line-height: 1.6;">If this was you, no further action is needed.</p>
      <p style="color: #4b5563; line-height: 1.6;">If you didn't change your password, please contact us immediately to secure your account.</p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/contact" style="display: inline-block; background: #dc2626; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 500;">Contact Support</a>
      </div>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
      <p style="color: #9ca3af; font-size: 12px; text-align: center;">
        © ${new Date().getFullYear()} Aclea GmbH. All rights reserved.<br>
        Berlin, Deutschland
      </p>
    </div>
  `
  return sendEmail({ to: email, subject, html })
}
