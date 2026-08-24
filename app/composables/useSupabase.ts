export function useSupabaseClient() {
  const nuxtApp = useNuxtApp()
  return nuxtApp.$supabase.client
}

export function useSupabaseUser() {
  return useState<import('@supabase/supabase-js').User | null>('supabase_user', () => null)
}

export function useSupabaseSession() {
  return useState<import('@supabase/supabase-js').Session | null>('supabase_session', () => null)
}
