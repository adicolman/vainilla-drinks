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
        <div class="px-5 sm:px-8 lg:px-10 py-6 lg:py-8 pb-20 lg:pb-8">
          <slot />
        </div>
      </main>
    </div>

    <!-- Mobile bottom nav -->
    <MobileNav />
  </div>
</template>
