import { createClient } from '@/lib/supabase/server'
import CalendarPage from '@/components/CalendarPage'
import type { ClanEvent, Profile } from '@/lib/types'

export const revalidate = 60 // ISR: revalidate every 60s

export default async function Home() {
  const supabase = await createClient()

  // ── Fetch session & profile ───────────────────────────────
  const { data: { user } } = await supabase.auth.getUser()

  let profile: Profile | null = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    profile = data
  }

  // ── Fetch events (public) ─────────────────────────────────
  const { data: events } = await supabase
    .from('events_with_author')
    .select('*')
    .order('start_time', { ascending: true })

  return (
    <CalendarPage
      events={(events ?? []) as ClanEvent[]}
      profile={profile}
    />
  )
}
