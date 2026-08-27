<script setup lang="ts">
const { totalGastado, comprasPorProveedor, comprasPorMes, gastoPorCategoriaInsumo, compras } = useReportes()

function formatCurrency(n: number) {
  return n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
}

function formatNumber(n: number) {
  return n.toLocaleString('es-AR')
}

const totalCompras = computed(() =>
  compras.value.filter(c => c.estado !== 'cancelado').length
)

const promedioPorCompra = computed(() =>
  totalCompras.value > 0 ? totalGastado.value / totalCompras.value : 0
)

function formatMes(mes: string) {
  const [year, month] = mes.split('-')
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  return `${meses[Number(month) - 1]} ${year}`
}

const maxCompraMes = computed(() =>
  Math.max(...comprasPorMes.value.map(c => c.total), 1)
)
</script>

<template>
  <div class="space-y-6">
    <!-- Cards resumen -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="bg-white rounded-2xl border border-sand-200/60 p-5">
        <p class="text-[11px] text-sand-300 uppercase tracking-wider font-medium">Total gastado</p>
        <p class="text-[22px] font-bold text-brand-950 mt-1">{{ formatCurrency(totalGastado) }}</p>
      </div>
      <div class="bg-white rounded-2xl border border-sand-200/60 p-5">
        <p class="text-[11px] text-sand-300 uppercase tracking-wider font-medium">Compras realizadas</p>
        <p class="text-[22px] font-bold text-brand-950 mt-1">{{ totalCompras }}</p>
      </div>
      <div class="bg-white rounded-2xl border border-sand-200/60 p-5">
        <p class="text-[11px] text-sand-300 uppercase tracking-wider font-medium">Promedio por compra</p>
        <p class="text-[22px] font-bold text-brand-950 mt-1">{{ formatCurrency(promedioPorCompra) }}</p>
      </div>
    </div>

    <!-- Compras por mes -->
    <div class="bg-white rounded-2xl border border-sand-200/60 p-5">
      <h3 class="text-[14px] font-semibold text-brand-950 mb-4">Compras por mes</h3>
      <div v-if="comprasPorMes.length === 0" class="text-center py-8">
        <p class="text-[13px] text-sand-400">Sin datos de compras</p>
      </div>
      <div v-else class="space-y-3">
        <div v-for="item in comprasPorMes" :key="item.mes" class="flex items-center gap-3">
          <span class="text-[12px] text-sand-400 w-16 shrink-0">{{ formatMes(item.mes) }}</span>
          <div class="flex-1">
            <div class="w-full bg-sand-100 rounded-full h-4">
              <div
                class="bg-brand-600 h-4 rounded-full transition-all flex items-center justify-end pr-2"
                :style="{ width: `${Math.max((item.total / maxCompraMes) * 100, 8)}%` }"
              >
                <span class="text-[10px] font-medium text-white">{{ formatCurrency(item.total) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Por proveedor -->
      <div class="bg-white rounded-2xl border border-sand-200/60 p-5">
        <h3 class="text-[14px] font-semibold text-brand-950 mb-4">Gasto por proveedor</h3>
        <div v-if="comprasPorProveedor.length === 0" class="text-center py-8">
          <p class="text-[13px] text-sand-400">Sin datos</p>
        </div>
        <div v-else class="space-y-3">
          <div v-for="p in comprasPorProveedor" :key="p.proveedor" class="flex items-center justify-between py-2 border-b border-sand-50 last:border-0">
            <div>
              <p class="text-[13px] font-medium text-brand-950">{{ p.proveedor }}</p>
              <p class="text-[11px] text-sand-400">{{ p.count }} compra{{ p.count !== 1 ? 's' : '' }}</p>
            </div>
            <span class="text-[13px] font-semibold text-brand-950">{{ formatCurrency(p.total) }}</span>
          </div>
        </div>
      </div>

      <!-- Por categoría de insumo -->
      <div class="bg-white rounded-2xl border border-sand-200/60 p-5">
        <h3 class="text-[14px] font-semibold text-brand-950 mb-4">Gasto por categoría de insumo</h3>
        <div v-if="gastoPorCategoriaInsumo.length === 0" class="text-center py-8">
          <p class="text-[13px] text-sand-400">Sin datos</p>
        </div>
        <div v-else class="space-y-3">
          <div v-for="cat in gastoPorCategoriaInsumo" :key="cat.categoria" class="flex items-center gap-3">
            <span class="text-[13px] text-brand-950 w-24 truncate">{{ cat.categoria }}</span>
            <div class="flex-1">
              <div class="w-full bg-sand-100 rounded-full h-2">
                <div
                  class="bg-brand-600 h-2 rounded-full transition-all"
                  :style="{ width: `${(cat.total / (gastoPorCategoriaInsumo[0]?.total || 1)) * 100}%` }"
                />
              </div>
            </div>
            <span class="text-[13px] font-medium text-brand-950 w-24 text-right">{{ formatCurrency(cat.total) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
