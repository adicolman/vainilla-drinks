<script setup lang="ts">
definePageMeta({ layout: 'default' })

const showDrawer = ref(false)
const { fetchMovimientos } = useCaja()

onMounted(() => {
  fetchMovimientos()
})

function handleSaved() {
  fetchMovimientos()
}
</script>

<template>
  <div>
    <CajaSummary />
    <CajaList @create="showDrawer = true" />

    <CajaDrawer
      :open="showDrawer"
      @close="showDrawer = false"
      @saved="handleSaved"
    />
  </div>
</template>
