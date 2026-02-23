export type Role = 'Sovereign' | 'Priest' | 'Trainer' | 'Member' | 'Queens Hand' | 'Liaison'
export type EventCategory = 'Education' | 'Combat' | 'Ceremony'
export type EventStatus = 'To-Do' | 'Scheduled' | 'Delayed' | 'Completed'

export interface Profile {
  id: string
  username: string
  role: Role
  is_admin: boolean
  created_at: string
}

export interface ClanEvent {
  id: string
  created_by: string
  title: string
  description: string | null
  location: string | null
  start_time: string   // ISO UTC string
  category: EventCategory
  status: EventStatus
  created_at: string
  updated_at: string
  author_username?: string
  author_role?: Role
}

export const EVENT_CATEGORIES: EventCategory[] = ['Education', 'Combat', 'Ceremony']
export const EVENT_STATUSES: EventStatus[]     = ['To-Do', 'Scheduled', 'Delayed', 'Completed']
export const ROLES: Role[]                     = ['Sovereign', 'Priest', 'Trainer', 'Member', 'Queens Hand', 'Liaison']

export const CATEGORY_STYLES: Record<EventCategory, { badge: string; glow: string }> = {
  Education: { badge: 'bg-violet-900/60 text-violet-300 border-violet-700', glow: 'shadow-violet-900' },
  Combat:    { badge: 'bg-red-900/60 text-red-300 border-red-700',          glow: 'shadow-red-900'    },
  Ceremony:  { badge: 'bg-amber-900/60 text-amber-300 border-amber-700',    glow: 'shadow-amber-900'  },
}

export const STATUS_STYLES: Record<EventStatus, string> = {
  'To-Do':     'text-slate-400  border-slate-600',
  'Scheduled': 'text-cyan-400   border-cyan-700',
  'Delayed':   'text-orange-400 border-orange-700',
  'Completed': 'text-emerald-400 border-emerald-700',
}

export const SLT_TIMEZONE = 'America/Los_Angeles'
