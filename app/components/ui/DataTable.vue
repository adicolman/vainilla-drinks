<script setup lang="ts">
interface Column {
  key: string
  label: string
  class?: string
}

defineProps<{
  columns: Column[]
  emptyTitle?: string
  emptyDescription?: string
}>()
</script>

<template>
  <div class="overflow-hidden">
    <table class="w-full">
      <thead>
        <tr class="border-b border-sand-200/60">
          <th
            v-for="col in columns"
            :key="col.key"
            :class="col.class"
            class="px-4 py-3 text-left text-[11px] font-semibold text-sand-400 uppercase tracking-wider"
          >
            {{ col.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <slot />
      </tbody>
    </table>
  </div>
</template>
