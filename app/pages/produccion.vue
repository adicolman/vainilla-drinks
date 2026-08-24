<script setup lang="ts">
definePageMeta({ layout: 'default' })

const showDrawer = ref(false)
const { fetchProduccion } = useProduccion()

function handleSaved() {
  fetchProduccion()
}
</script>

<template>
  <div>
    <ProduccionList @create="showDrawer = true" />

    <ProduccionDrawer
      :open="showDrawer"
      @close="showDrawer = false"
      @saved="handleSaved"
    />
  </div>
</template>
