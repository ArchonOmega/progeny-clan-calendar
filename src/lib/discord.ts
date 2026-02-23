export type DiscordNotificationPayload = {
  eventTitle:     string
  category:       'Education' | 'Combat' | 'Ceremony'
  action:         'created' | 'status_changed' | 'updated' | 'deleted'
  newStatus?:     string
  currentStatus?: string
  authorUsername: string
  startTime:      string // ISO UTC string
}

const CATEGORY_COLORS: Record<string, number> = {
  Education: 0x7b61ff,
  Combat:    0xff3c3c,
  Ceremony:  0xc9a84c,
}

const ACTION_LABELS: Record<string, string> = {
  created:        '🩸 New Event Created',
  status_changed: '🔄 Event Status Updated',
  updated:        '✏️ Event Updated',
  deleted:        '💀 Event Deleted',
}

// Format a UTC ISO string to SLT (America/Los_Angeles)
function toSLT(isoUtc: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Los_Angeles',
      weekday:  'short',
      month:    'short',
      day:      'numeric',
      year:     'numeric',
      hour:     'numeric',
      minute:   '2-digit',
      hour12:   true,
    }).format(new Date(isoUtc)) + ' SLT'
  } catch {
    return isoUtc
  }
}

export async function sendDiscordNotification(
  payload: DiscordNotificationPayload
): Promise<void> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL

  if (!webhookUrl) {
    console.warn('[Discord] DISCORD_WEBHOOK_URL is not set — skipping.')
    return
  }

  const color = CATEGORY_COLORS[payload.category] ?? 0x888888
  const title = ACTION_LABELS[payload.action] ?? '📅 Calendar Update'

  const fields: { name: string; value: string; inline: boolean }[] = [
    { name: 'Event',    value: payload.eventTitle,             inline: false },
    { name: 'Category', value: payload.category,               inline: true  },
    { name: 'Created By', value: payload.authorUsername,       inline: true  },
    { name: '🕐 Time (SLT)', value: toSLT(payload.startTime), inline: false },
  ]

  if (payload.action === 'status_changed' && payload.newStatus) {
    const prev = payload.currentStatus ? `~~${payload.currentStatus}~~ → ` : ''
    fields.push({
      name:   'Status',
      value:  `${prev}**${payload.newStatus}**`,
      inline: false,
    })
  } else if (payload.currentStatus) {
    fields.push({
      name:   'Status',
      value:  payload.currentStatus,
      inline: true,
    })
  }

  const body = {
    username:   'Clan Calendar',
    avatar_url: 'https://i.imgur.com/4M34hi2.png',
    embeds: [{
      title,
      color,
      fields,
      footer:    { text: 'Progeny Vampire Clan • Second Life' },
      timestamp: new Date().toISOString(),
    }],
  }

  try {
    const res = await fetch(webhookUrl, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    })
    if (!res.ok) {
      console.error(`[Discord] Webhook failed: ${res.status} ${res.statusText}`)
    }
  } catch (err) {
    console.error('[Discord] Failed to send notification:', err)
  }
}
