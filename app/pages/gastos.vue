<script setup lang="ts">
definePageMeta({ layout: 'default' })

const showDrawer = ref(false)
const { fetchGastos } = useGastos()

onMounted(() => {
  fetchGastos()
})

function handleSaved() {
  fetchGastos()
}
</script>

<template>
  <div>
    <GastosSummary />
    <GastosList @create="showDrawer = true" />

    <GastosDrawer
      :open="showDrawer"
      @close="showDrawer = false"
      @saved="handleSaved"
    />
  </div>
</template>
