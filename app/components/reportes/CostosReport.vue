<script setup lang="ts">
const { valorTotalInventario, costoPorCategoria, topInsumosPorCosto, insumos } = useReportes()

function formatCurrency(n: number) {
  return n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
}

function formatNumber(n: number) {
  return n.toLocaleString('es-AR', { maximumFractionDigits: 2 })
}

const totalInsumos = computed(() => insumos.value.length)
</script>

<template>
  <div class="space-y-6">
    <!-- Cards resumen -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="bg-white rounded-2xl border border-sand-200/60 p-5">
        <p class="text-[11px] text-sand-300 uppercase tracking-wider font-medium">Valor total inventario</p>
        <p class="text-[22px] font-bold text-brand-950 mt-1">{{ formatCurrency(valorTotalInventario) }}</p>
      </div>
      <div class="bg-white rounded-2xl border border-sand-200/60 p-5">
        <p class="text-[11px] text-sand-300 uppercase tracking-wider font-medium">Insumos activos</p>
        <p class="text-[22px] font-bold text-brand-950 mt-1">{{ totalInsumos }}</p>
      </div>
      <div class="bg-white rounded-2xl border border-sand-200/60 p-5">
        <p class="text-[11px] text-sand-300 uppercase tracking-wider font-medium">Categorías</p>
        <p class="text-[22px] font-bold text-brand-950 mt-1">{{ costoPorCategoria.length }}</p>
      </div>
    </div>

    <!-- Top insumos más caros por unidad base -->
    <div v-if="topInsumosPorCosto.length > 0" class="bg-white rounded-2xl border border-sand-200/60 p-5">
      <h3 class="text-[14px] font-semibold text-brand-950 mb-4">Costo por unidad base — Top 5</h3>
      <div class="space-y-3">
        <div v-for="(item, idx) in topInsumosPorCosto" :key="item.id" class="flex items-center gap-3">
          <span class="text-[12px] text-sand-400 w-4 text-right">{{ idx + 1 }}</span>
          <div class="flex-1">
            <div class="flex items-center justify-between mb-1">
              <span class="text-[13px] font-medium text-brand-950">{{ item.nombre }}</span>
              <span class="text-[13px] font-semibold text-brand-950">${{ formatNumber(item.costo_por_unidad) }}/{{ item.unidad_medida }}</span>
            </div>
            <div class="w-full bg-sand-100 rounded-full h-1.5">
              <div
                class="bg-brand-600 h-1.5 rounded-full transition-all"
                :style="{ width: `${(item.costo_por_unidad / (topInsumosPorCosto[0]?.costo_por_unidad || 1)) * 100}%` }"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Valor por categoría -->
    <div class="bg-white rounded-2xl border border-sand-200/60 p-5">
      <h3 class="text-[14px] font-semibold text-brand-950 mb-4">Valor del inventario por categoría</h3>
      <div v-if="costoPorCategoria.length === 0" class="text-center py-8">
        <p class="text-[13px] text-sand-400">Sin datos de inventario</p>
      </div>
      <div v-else class="space-y-3">
        <div v-for="cat in costoPorCategoria" :key="cat.nombre" class="flex items-center gap-3">
          <span class="text-[13px] text-brand-950 w-28 truncate">{{ cat.nombre }}</span>
          <div class="flex-1">
            <div class="w-full bg-sand-100 rounded-full h-2">
              <div
                class="bg-brand-600 h-2 rounded-full transition-all"
                :style="{ width: `${(cat.valor / (costoPorCategoria[0]?.valor || 1)) * 100}%` }"
              />
            </div>
          </div>
          <span class="text-[13px] font-medium text-brand-950 w-28 text-right">{{ formatCurrency(cat.valor) }}</span>
        </div>
      </div>
    </div>

    <!-- Tabla de todos los insumos -->
    <div class="bg-white rounded-2xl border border-sand-200/60 overflow-hidden">
      <div class="px-5 py-4 border-b border-sand-100">
        <h3 class="text-[14px] font-semibold text-brand-950">Detalle de insumos</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-[13px]">
          <thead>
            <tr class="border-b border-sand-100">
              <th class="text-left px-5 py-3 text-[11px] text-sand-400 uppercase tracking-wider font-medium">Insumo</th>
              <th class="text-left px-5 py-3 text-[11px] text-sand-400 uppercase tracking-wider font-medium">Categoría</th>
              <th class="text-right px-5 py-3 text-[11px] text-sand-400 uppercase tracking-wider font-medium">Costo/ud</th>
              <th class="text-right px-5 py-3 text-[11px] text-sand-400 uppercase tracking-wider font-medium">Costo prom</th>
              <th class="text-right px-5 py-3 text-[11px] text-sand-400 uppercase tracking-wider font-medium">Stock</th>
              <th class="text-right px-5 py-3 text-[11px] text-sand-400 uppercase tracking-wider font-medium">Valor</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="i in insumos" :key="i.id" class="border-b border-sand-50 hover:bg-sand-50/50 transition-colors">
              <td class="px-5 py-3 font-medium text-brand-950">{{ i.nombre }}</td>
              <td class="px-5 py-3 text-sand-400">{{ i.categoria }}</td>
              <td class="px-5 py-3 text-right text-brand-950">{{ formatCurrency(Number(i.costo_unitario)) }}</td>
              <td class="px-5 py-3 text-right text-brand-950">{{ formatCurrency(Number(i.costo_promedio)) }}</td>
              <td class="px-5 py-3 text-right text-brand-950">{{ formatNumber(Number(i.stock_actual)) }} {{ i.unidad_medida }}</td>
              <td class="px-5 py-3 text-right font-medium text-brand-950">{{ formatCurrency(Number(i.costo_promedio) * Number(i.stock_actual)) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
