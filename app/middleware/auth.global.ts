export default defineNuxtRouteMiddleware(async (to) => {
  const user = useSupabaseUser()
  const { profile, fetchProfile, profileFetched } = useAuth()

  const publicRoutes = ['/login']
  const isPublicRoute = publicRoutes.includes(to.path)

  // Not authenticated
  if (!user?.value) {
    if (isPublicRoute) return
    return navigateTo('/login')
  }

  // Authenticated but on login page → dashboard
  if (isPublicRoute) {
    return navigateTo('/dashboard')
  }

  // Authenticated, fetch profile if needed
  if (!profile.value && !profileFetched.value) {
    await fetchProfile()
  }
})
