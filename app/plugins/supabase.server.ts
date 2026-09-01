import { createClient } from '@supabase/supabase-js'
import { defineNuxtPlugin, useRuntimeConfig } from '#imports'
import type { Database } from '~/types/database.types'

export default defineNuxtPlugin({
  name: 'supabase',
  enforce: 'pre',
  setup() {
    const config = useRuntimeConfig()
    const url = config.public.supabase.url as string
    const key = config.public.supabase.key as string

    const supabase = createClient<Database>(url, key, {
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
