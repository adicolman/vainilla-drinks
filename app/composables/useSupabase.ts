import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '~/types/database.types'

export function useSupabaseClient<T = Database>() {
  const nuxtApp = useNuxtApp()
  return nuxtApp.$supabase.client as unknown as SupabaseClient<T>
}

export function useSupabaseUser() {
  return useState<import('@supabase/supabase-js').User | null>('supabase_user', () => null)
}

export function useSupabaseSession() {
  return useState<import('@supabase/supabase-js').Session | null>('supabase_session', () => null)
}
