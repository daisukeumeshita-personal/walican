import { Resend } from 'resend'

export async function sendInvitationEmail(
  to: string,
  groupName: string,
  inviterName: string,
  inviteUrl: string
) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY is not set — skipping invitation email to:', to)
    return
  }

  const resend = new Resend(process.env.RESEND_API_KEY)

  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'Hanbun <onboarding@resend.dev>',
    to,
    subject: `${inviterName} さんから「${groupName}」への招待`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="font-size: 24px; font-weight: 700; color: #111; margin-bottom: 8px;">Hanbun</h1>
        <p style="color: #666; font-size: 14px; margin-bottom: 32px;">ふたりの精算アプリ</p>

        <div style="background: #f8f8f8; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
          <p style="color: #333; font-size: 16px; margin: 0 0 8px;">
            <strong>${inviterName}</strong> さんがあなたを
          </p>
          <p style="color: #111; font-size: 20px; font-weight: 600; margin: 0;">
            「${groupName}」
          </p>
          <p style="color: #333; font-size: 16px; margin: 8px 0 0;">
            に招待しています。
          </p>
        </div>

        <a href="${inviteUrl}" style="display: inline-block; background: #111; color: #fff; text-decoration: none; padding: 12px 32px; border-radius: 999px; font-size: 14px; font-weight: 500;">
          招待を確認する
        </a>

        <p style="color: #999; font-size: 12px; margin-top: 32px; line-height: 1.6;">
          このメールに心当たりがない場合は無視してください。
        </p>
      </div>
    `,
  })

  if (error) {
    console.error('Failed to send invitation email:', error)
    throw error
  }
}
