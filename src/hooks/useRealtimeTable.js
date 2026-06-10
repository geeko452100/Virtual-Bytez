import { useEffect } from 'react'
import { getSupabase } from '../lib/supabase'

/**
 * Subscribe to Postgres changes on a Supabase table.
 */
export function useRealtimeTable({ table, filter, enabled = true, onChange }) {
  useEffect(() => {
    if (!enabled || !onChange) return

    const supabase = getSupabase()
    if (!supabase) return

    const channelName = `${table}-${filter ?? 'all'}-${Math.random().toString(36).slice(2)}`

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          ...(filter ? { filter } : {}),
        },
        onChange,
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [table, filter, enabled, onChange])
}
