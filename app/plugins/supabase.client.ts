import { createClient } from '@supabase/supabase-js'
import { defineNuxtPlugin, useRuntimeConfig } from '#imports'

export default defineNuxtPlugin({
  name: 'supabase',
  enforce: 'pre',
  async setup() {
    const config = useRuntimeConfig()
    const url = config.public.supabase.url as string
    const key = config.public.supabase.key as string

    const supabase = createClient(url, key, {
      auth: {
        flowType: 'pkce',
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })

    const userState = useState('supabase_user', () => null)
    const sessionState = useState('supabase_session', () => null)

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
