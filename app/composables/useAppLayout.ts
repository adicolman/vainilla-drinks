export function useAppLayout() {
  const sidebarOpen = useState('sidebar-open', () => true)
  const mobileMenuOpen = useState('mobile-menu-open', () => false)
  const isMobile = useState('is-mobile', () => false)

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
