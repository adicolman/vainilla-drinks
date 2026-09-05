<script setup lang="ts">
definePageMeta({ layout: 'default' })

const showDrawer = ref(false)
const { fetchVentas } = useVentas()

onMounted(() => {
  fetchVentas()
})

function handleSaved() {
  fetchVentas()
}
</script>

<template>
  <div>
    <VentasList @create="showDrawer = true" />

    <VentasDrawer
      :open="showDrawer"
      @close="showDrawer = false"
      @saved="handleSaved"
    />
  </div>
</template>
