'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { sendDiscordNotification } from '@/lib/discord'
import type { EventCategory, EventStatus } from '@/lib/types'

// ── CREATE EVENT ─────────────────────────────────────────────
export async function createEvent(formData: {
  title: string
  description: string
  start_time: string   // ISO UTC
  category: EventCategory
  status: EventStatus
}) {
  const supabase = await createClient()

  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) return { error: 'Not authenticated' }

  // Get profile for username
  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single()

  const { data: event, error } = await supabase
    .from('events')
    .insert({ ...formData, created_by: user.id })
    .select()
    .single()

  if (error) return { error: error.message }

  // Discord notification
  await sendDiscordNotification({
    eventTitle:     event.title,
    category:       event.category,
    action:         'created',
    authorUsername: profile?.username ?? 'Unknown',
    startTime:      event.start_time,
  })

  revalidatePath('/')
  return { data: event }
}

// ── UPDATE STATUS ────────────────────────────────────────────
export async function updateEventStatus(eventId: string, newStatus: EventStatus) {
  const supabase = await createClient()

  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) return { error: 'Not authenticated' }

  // Fetch event + profile before updating for notification
  const { data: existing } = await supabase
    .from('events_with_author')
    .select('*')
    .eq('id', eventId)
    .single()

  const { data: event, error } = await supabase
    .from('events')
    .update({ status: newStatus })
    .eq('id', eventId)
    .select()
    .single()

  if (error) return { error: error.message }

  if (existing) {
    await sendDiscordNotification({
      eventTitle:     existing.title,
      category:       existing.category,
      action:         'status_changed',
      newStatus,
      authorUsername: existing.author_username ?? 'Unknown',
      startTime:      existing.start_time,
    })
  }

  revalidatePath('/')
  return { data: event }
}

// ── UPDATE EVENT ─────────────────────────────────────────────
export async function updateEvent(
  eventId: string,
  formData: {
    title?: string
    description?: string
    start_time?: string
    category?: EventCategory
    status?: EventStatus
  }
) {
  const supabase = await createClient()

  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) return { error: 'Not authenticated' }

  const { data: event, error } = await supabase
    .from('events')
    .update(formData)
    .eq('id', eventId)
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/')
  return { data: event }
}

// ── DELETE EVENT ─────────────────────────────────────────────
export async function deleteEvent(eventId: string) {
  const supabase = await createClient()

  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', eventId)

  if (error) return { error: error.message }

  revalidatePath('/')
  return { success: true }
}

// ── FETCH ALL EVENTS ─────────────────────────────────────────
export async function getEvents() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('events_with_author')
    .select('*')
    .order('start_time', { ascending: true })

  if (error) return { error: error.message }
  return { data }
}

// ── AUTH ACTIONS ─────────────────────────────────────────────
export async function signInWithEmail(email: string, password: string) {
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: error.message }
  revalidatePath('/')
  return { success: true }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/')
}
