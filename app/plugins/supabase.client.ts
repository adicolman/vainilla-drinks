import { createClient } from '@supabase/supabase-js'
import type { Session, User } from '@supabase/supabase-js'
import { defineNuxtPlugin, useRuntimeConfig } from '#imports'
import type { Database } from '~/types/database.types'

export default defineNuxtPlugin({
  name: 'supabase',
  enforce: 'pre',
  async setup() {
    const config = useRuntimeConfig()
    const url = config.public.supabase.url as string
    const key = config.public.supabase.key as string

    const supabase = createClient<Database>(url, key, {
      auth: {
        flowType: 'pkce',
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })

    const userState = useState<User | null>('supabase_user', () => null)
    const sessionState = useState<Session | null>('supabase_session', () => null)

    const { data } = await supabase.auth.getSession()
    if (data.session) {
      sessionState.value = data.session
      userState.value = data.session.user
    }

    supabase.auth.onAuthStateChange((_event, newSession) => {
      sessionState.value = newSession
      userState.value = newSession?.user ?? null
    })

    return {
      provide: {
        supabase: {
          client: supabase,
        },
      },
    }
  },
})
