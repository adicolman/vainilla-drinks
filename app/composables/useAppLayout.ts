export function useAppLayout() {
  const sidebarOpen = ref(true)
  const mobileMenuOpen = ref(false)
  const isMobile = ref(false)

  function checkMobile() {
    if (import.meta.client) {
      isMobile.value = window.innerWidth < 1024
      if (isMobile.value) {
        sidebarOpen.value = false
      } else {
        mobileMenuOpen.value = false
      }
    }
  }

  function toggleSidebar() {
    if (isMobile.value) {
      mobileMenuOpen.value = !mobileMenuOpen.value
    } else {
      sidebarOpen.value = !sidebarOpen.value
    }
  }

  function closeMobileMenu() {
    mobileMenuOpen.value = false
  }

  onMounted(() => {
    checkMobile()
    window.addEventListener('resize', checkMobile)
  })

  onUnmounted(() => {
    if (import.meta.client) {
      window.removeEventListener('resize', checkMobile)
    }
  })

  return {
    sidebarOpen,
    mobileMenuOpen,
    isMobile,
    toggleSidebar,
    closeMobileMenu,
  }
}
