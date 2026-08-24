import { createClient } from '@supabase/supabase-js'
import { defineNuxtPlugin, useRuntimeConfig } from '#imports'

export default defineNuxtPlugin({
  name: 'supabase',
  enforce: 'pre',
  setup() {
    const config = useRuntimeConfig()
    const url = config.public.supabase.url as string
    const key = config.public.supabase.key as string

    const supabase = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
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
