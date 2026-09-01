import type { Profile } from '~/types'

export function useAuth() {
  const client = useSupabaseClient()
  const user = useSupabaseUser()
  const session = useSupabaseSession()

  const profile = useState<Profile | null>('auth-profile', () => null)
  const isLoading = ref(false)
  const profileFetched = ref(false)

  const isAuthenticated = computed(() => !!user.value)

  async function initSession() {
    if (import.meta.server) return

    const { data } = await client.auth.getSession()
    if (data.session) {
      session.value = data.session
      user.value = data.session.user
    }

    client.auth.onAuthStateChange((_event, newSession) => {
      session.value = newSession
      user.value = newSession?.user ?? null
    })
  }

  async function fetchProfile() {
    if (!user.value) {
      profile.value = null
      profileFetched.value = false
      return
    }

    try {
      const { data, error } = await client
        .from('profiles')
        .select('*')
        .eq('id', user.value.id)
        .single()

      if (error) {
        console.error('Error fetching profile:', error.message)
        profile.value = null
        return
      }

      profile.value = data
      profileFetched.value = true
    } catch (e) {
      console.error('Error fetching profile:', e)
      profile.value = null
    }
  }

  async function login(email: string, password: string) {
    isLoading.value = true
    try {
      const { data, error } = await client.auth.signInWithPassword({ email, password })
      if (error) throw error

      if (data.session) {
        session.value = data.session
        user.value = data.session.user
      }
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
    try {
      await client.auth.signOut()
    } finally {
      session.value = null
      user.value = null
      profile.value = null
      profileFetched.value = false
      if (import.meta.client) {
        window.location.href = '/login'
      }
    }
  }

  async function ensureProfile() {
    if (profile.value && profileFetched.value) return profile.value
    if (!user.value) return null
    await fetchProfile()
    return profile.value
  }

  return {
    user,
    profile,
    session,
    isAuthenticated,
    isLoading,
    profileFetched,
    initSession,
    login,
    logout,
    fetchProfile,
    ensureProfile,
  }
}
