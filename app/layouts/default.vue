<script setup lang="ts">
const { sidebarOpen, isMobile } = useAppLayout()
</script>

<template>
  <div class="flex h-screen bg-sand-50 overflow-hidden">
    <!-- Sidebar -->
    <AppSidebar />

    <!-- Main area -->
    <div
      :class="[
        isMobile ? 'ml-0' : sidebarOpen ? 'ml-[272px]' : 'ml-0',
      ]"
      class="flex-1 flex flex-col min-h-0 transition-all duration-300"
    >
      <!-- Header -->
      <AppHeader />

      <!-- Content -->
      <main class="flex-1 overflow-y-auto">
        <div class="px-4 sm:px-6 lg:px-8 py-5 lg:py-7 pb-20 lg:pb-7">
          <slot />
        </div>
      </main>
    </div>

    <!-- Mobile bottom nav -->
    <MobileNav />
  </div>
</template>
