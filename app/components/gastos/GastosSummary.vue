<script setup lang="ts">
const { resumen } = useGastos()

function formatCurrency(n: number) {
  return n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
}

const categoriaLabels: Record<string, string> = {
  publicidad: 'Publicidad',
  servicios: 'Servicios',
  delivery: 'Delivery',
  equipamiento: 'Equipamiento',
  mantenimiento: 'Mantenimiento',
  logistica: 'Logística',
  impuestos: 'Impuestos',
  otros: 'Otros',
}

const categoriaIcons: Record<string, string> = {
  publicidad: 'lucide:megaphone',
  servicios: 'lucide:wifi',
  delivery: 'lucide:truck',
  equipamiento: 'lucide:wrench',
  mantenimiento: 'lucide:hammer',
  logistica: 'lucide:package',
  impuestos: 'lucide:file-text',
  otros: 'lucide:more-horizontal',
}
</script>

<template>
  <div class="space-y-5 mb-8">
    <!-- Total general -->
    <div class="bg-danger-soft rounded-2xl p-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-[11px] font-semibold tracking-[0.15em] uppercase text-danger/70">Total gastos</p>
          <p class="text-[28px] font-bold text-danger mt-1">{{ formatCurrency(resumen.total) }}</p>
        </div>
        <div class="w-12 h-12 rounded-xl bg-danger/10 flex items-center justify-center">
          <Icon name="lucide:receipt" class="w-6 h-6 text-danger" />
        </div>
      </div>
    </div>

    <!-- Por categoría -->
    <div v-if="resumen.categorias.length > 0" class="bg-white rounded-2xl border border-sand-200/60 p-6">
      <h3 class="text-[13px] font-semibold text-brand-950 mb-5">Por categoría</h3>
      <div class="space-y-4">
        <div v-for="cat in resumen.categorias" :key="cat.nombre" class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-sand-100 flex items-center justify-center shrink-0">
            <Icon :name="categoriaIcons[cat.nombre] || 'lucide:tag'" class="w-4 h-4 text-brand-600" />
          </div>
          <span class="text-[13px] text-brand-950 flex-1 truncate">{{ categoriaLabels[cat.nombre] || cat.nombre }}</span>
          <div class="flex-1 max-w-[120px]">
            <div class="w-full bg-sand-100 rounded-full h-1.5">
              <div
                class="bg-danger h-1.5 rounded-full transition-all"
                :style="{ width: `${(cat.monto / (resumen.categorias[0]?.monto || 1)) * 100}%` }"
              />
            </div>
          </div>
          <span class="text-[13px] font-semibold text-brand-950 w-28 text-right">{{ formatCurrency(cat.monto) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
