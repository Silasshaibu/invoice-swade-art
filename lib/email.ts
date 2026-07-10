import { getAppUrl } from './url'

export interface EmailPayload {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailPayload): Promise<boolean> {
  const apiKey = process.env.RESEND_API
  if (!apiKey) {
    console.error('RESEND_API environment variable is not set. Cannot send email.')
    return false
  }

  // Resend free tier/onboarding account restricts recipient to account owner email
  // But we always try to send to 'to'
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        from: 'Invoice Platform <onboarding@resend.dev>',
        to,
        subject,
        html
      })
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('Resend API error response:', errText)
      return false
    }

    const data = await response.json()
    console.log('Email sent successfully via Resend. ID:', data.id)
    return true
  } catch (error) {
    console.error('Failed to send email via Resend:', error)
    return false
  }
}

// HTML wrap helper to provide a clean, modern, premium design system
function emailTemplateWrapper(content: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice Notification</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: #f9fafb;
            color: #111827;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
          }
          .header {
            background-color: #030213;
            padding: 32px 24px;
            text-align: center;
          }
          .header .logo {
            font-size: 24px;
            font-weight: 800;
            color: #ffffff;
            letter-spacing: -0.025em;
          }
          .content {
            padding: 32px 24px;
          }
          .footer {
            background-color: #f9fafb;
            padding: 24px;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
          }
          .btn {
            display: inline-block;
            background-color: #030213;
            color: #ffffff !important;
            padding: 12px 24px;
            font-size: 14px;
            font-weight: 600;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
            text-align: center;
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          }
          .btn:hover {
            background-color: #1e1b4b;
          }
          .card {
            background-color: #f3f4f6;
            border-radius: 6px;
            padding: 20px;
            margin: 20px 0;
          }
          .card-title {
            font-size: 12px;
            color: #6b7280;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 8px;
          }
          .card-value {
            font-size: 18px;
            font-weight: 700;
            color: #111827;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          th {
            text-align: left;
            font-size: 12px;
            text-transform: uppercase;
            color: #6b7280;
            padding-bottom: 8px;
            border-bottom: 1px solid #e5e7eb;
          }
          td {
            padding: 12px 0;
            border-bottom: 1px solid #f3f4f6;
            font-size: 14px;
          }
          .text-right {
            text-align: right;
          }
          .divider {
            height: 1px;
            background-color: #e5e7eb;
            margin: 24px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">INVOICE</div>
          </div>
          <div class="content">
            ${content}
          </div>
          <div class="footer">
            &copy; 2026 swade-art. All rights reserved.<br>
            Professional Invoicing Platform
          </div>
        </div>
      </body>
    </html>
  `
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<boolean> {
  const resetLink = `${getAppUrl()}/reset-password?token=${token}`
  const html = emailTemplateWrapper(`
    <h2 style="font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 16px;">Password Reset Request</h2>
    <p>We received a request to reset the password for your account. Click the button below to choose a new password. This link will expire in 1 hour.</p>
    
    <div style="text-align: center;">
      <a href="${resetLink}" class="btn">Reset Password</a>
    </div>
    
    <p style="font-size: 13px; color: #6b7280; margin-top: 24px;">If you did not request a password reset, you can safely ignore this email.</p>
    
    <div class="divider"></div>
    
    <p style="font-size: 12px; color: #9ca3af; word-break: break-all;">
      If the button above doesn't work, copy and paste this URL into your browser:<br>
      <a href="${resetLink}" style="color: #4f46e5; text-decoration: underline;">${resetLink}</a>
    </p>
  `)

  return sendEmail({
    to: email,
    subject: 'Reset your password',
    html
  })
}

export async function sendAccessRequestEmail(requesterName: string, requesterEmail: string, token: string): Promise<boolean> {
  const reviewLink = `${getAppUrl()}/admin/access-requests/review?token=${token}`
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'silasshaibu30bg@gmail.com'
  const html = emailTemplateWrapper(`
    <h2 style="font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 16px;">New Access Request</h2>
    <p>Someone has requested access to the Invoice Platform:</p>

    <div class="card">
      <div class="card-title">Name</div>
      <div class="card-value">${requesterName}</div>
    </div>
    <div class="card">
      <div class="card-title">Email</div>
      <div class="card-value">${requesterEmail}</div>
    </div>

    <div style="text-align: center;">
      <a href="${reviewLink}" class="btn">Grant Access</a>
    </div>

    <p style="font-size: 13px; color: #6b7280; margin-top: 24px;">You can review and approve or reject this request. This link will expire in 7 days.</p>

    <div class="divider"></div>

    <p style="font-size: 12px; color: #9ca3af; word-break: break-all;">
      If the button above doesn't work, copy and paste this URL into your browser:<br>
      <a href="${reviewLink}" style="color: #4f46e5; text-decoration: underline;">${reviewLink}</a>
    </p>
  `)

  return sendEmail({
    to: superAdminEmail,
    subject: 'New access request — Invoice Platform',
    html
  })
}

export async function sendInvoiceSentEmail(invoice: any, client: any, user: any): Promise<boolean> {
  const invoiceLink = `${getAppUrl()}/api/invoices/${invoice.id}/pdf`
  const currencySymbol = invoice.currency === 'USD' ? '$' : invoice.currency + ' '
  const formattedTotal = `${currencySymbol}${Number(invoice.total).toFixed(2)}`

  const html = emailTemplateWrapper(`
    <h2 style="font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 16px;">New Invoice Received</h2>
    <p>Hi ${client.name},</p>
    <p>You have received a new invoice from <strong>${user.company_name || user.name || 'our organization'}</strong>.</p>
    
    <div class="card">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
        <div>
          <div class="card-title">Invoice Number</div>
          <div style="font-weight: 600;">${invoice.invoice_number}</div>
        </div>
        <div>
          <div class="card-title">Due Date</div>
          <div style="font-weight: 600;">${invoice.due_date || 'On Receipt'}</div>
        </div>
      </div>
      <div class="divider" style="margin: 12px 0;"></div>
      <div>
        <div class="card-title">Amount Due</div>
        <div class="card-value">${formattedTotal}</div>
      </div>
    </div>
    
    <div style="text-align: center; margin-top: 24px;">
      <a href="${invoiceLink}" class="btn" target="_blank">View / Print Invoice</a>
    </div>

    <p style="font-size: 14px; color: #4b5563; margin-top: 24px;">If you have any questions, please contact us at <a href="mailto:${user.company_email || user.email}" style="color: #4f46e5;">${user.company_email || user.email}</a>.</p>
  `)

  return sendEmail({
    to: client.email || '',
    subject: `New Invoice ${invoice.invoice_number} from ${user.company_name || user.name || 'Billing'}`,
    html
  })
}

export async function sendPaymentReceivedEmail(payment: any, invoice: any, client: any, user: any): Promise<boolean> {
  const currencySymbol = invoice.currency === 'USD' ? '$' : invoice.currency + ' '
  const formattedAmount = `${currencySymbol}${Number(payment.amount).toFixed(2)}`

  const html = emailTemplateWrapper(`
    <h2 style="font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 16px;">Payment Confirmation</h2>
    <p>Hi ${client.name},</p>
    <p>Thank you for your payment. We have successfully processed your payment for invoice <strong>${invoice.invoice_number}</strong>.</p>
    
    <div class="card">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
        <div>
          <div class="card-title">Payment Date</div>
          <div style="font-weight: 600;">${payment.payment_date}</div>
        </div>
        <div>
          <div class="card-title">Payment Method</div>
          <div style="font-weight: 600; text-transform: capitalize;">${(payment.method || '').replace('_', ' ')}</div>
        </div>
      </div>
      ${payment.reference ? `
        <div style="margin-top: 12px;">
          <div class="card-title">Reference</div>
          <div style="font-weight: 600;">${payment.reference}</div>
        </div>
      ` : ''}
      <div class="divider" style="margin: 12px 0;"></div>
      <div>
        <div class="card-title">Amount Paid</div>
        <div class="card-value" style="color: #22c55e;">${formattedAmount}</div>
      </div>
    </div>
    
    <p style="font-size: 14px; color: #4b5563; margin-top: 24px;">This email serves as your receipt. If you have any questions or concerns, please contact us at <a href="mailto:${user.company_email || user.email}" style="color: #4f46e5;">${user.company_email || user.email}</a>.</p>
  `)

  return sendEmail({
    to: client.email || '',
    subject: `Payment Confirmation for Invoice ${invoice.invoice_number}`,
    html
  })
}
