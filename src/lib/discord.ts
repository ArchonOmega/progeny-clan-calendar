export type DiscordNotificationPayload = {
  eventTitle: string
  category: 'Education' | 'Combat' | 'Ceremony'
  action: 'created' | 'status_changed' | 'updated' | 'deleted'
  newStatus?: string
  authorUsername: string
  startTime: string // ISO string (UTC)
}

// Category → Discord embed color (hex decimal)
const CATEGORY_COLORS: Record<string, number> = {
  Education: 0x7b61ff, // violet
  Combat:    0xff3c3c, // blood red
  Ceremony:  0xc9a84c, // gold
}

const ACTION_LABELS: Record<string, string> = {
  created:        '🩸 New Event Created',
  status_changed: '🔄 Event Status Updated',
  updated:        '✏️ Event Updated',
  deleted:        '💀 Event Deleted',
}

/**
 * Sends a rich embed notification to the configured Discord webhook.
 * Safe to call from Server Actions or API routes.
 */
export async function sendDiscordNotification(
  payload: DiscordNotificationPayload
): Promise<void> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL

  if (!webhookUrl) {
    console.warn('[Discord] DISCORD_WEBHOOK_URL is not set — skipping notification.')
    return
  }

  const color = CATEGORY_COLORS[payload.category] ?? 0x888888
  const title = ACTION_LABELS[payload.action] ?? '📅 Calendar Update'

  const fields = [
    { name: 'Event',    value: payload.eventTitle,      inline: true },
    { name: 'Category', value: payload.category,        inline: true },
    { name: 'By',       value: payload.authorUsername,  inline: true },
  ]

  if (payload.action === 'status_changed' && payload.newStatus) {
    fields.push({ name: 'New Status', value: `**${payload.newStatus}**`, inline: false })
  }

  const body = {
    username: 'Clan Calendar',
    avatar_url: 'https://i.imgur.com/4M34hi2.png',
    embeds: [
      {
        title,
        color,
        fields,
        footer: { text: 'Progeny Vampire Clan • Second Life' },
        timestamp: new Date().toISOString(),
      },
    ],
  }

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      console.error(`[Discord] Webhook failed: ${res.status} ${res.statusText}`)
    }
  } catch (err) {
    console.error('[Discord] Failed to send notification:', err)
  }
}
