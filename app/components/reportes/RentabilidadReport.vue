<script setup lang="ts">
import type { RecetaConIngredientes } from '~/composables/useRecetas'

const client = useSupabaseClient()
const { addToast } = useToast()

const recetas = ref<RecetaConIngredientes[]>([])
const isLoading = ref(false)

async function fetchRecetas() {
  isLoading.value = true
  const { data, error } = await client
    .from('recetas')
    .select('*, receta_ingredientes(*, insumo:insumos(id, nombre, unidad_medida, costo_promedio))')
    .eq('activo', true)
    .order('nombre')

  isLoading.value = false
  if (error) {
    addToast('error', 'Error al cargar recetas', error.message)
    return
  }
  recetas.value = (data || []) as unknown as RecetaConIngredientes[]
}

onMounted(() => fetchRecetas())

function formatCurrency(n: number) {
  return n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
}

function formatPercent(n: number) {
  return `${n.toFixed(1)}%`
}

function calcularCostoLitro(receta: RecetaConIngredientes): number {
  if (!receta.receta_ingredientes?.length) return 0
  return receta.receta_ingredientes.reduce((sum, ing) => {
    const costo = Number(ing.insumo?.costo_promedio || 0)
    const cantidad = Number(ing.cantidad_para_1_litro || 0)
    return sum + (costo * cantidad)
  }, 0)
}

function calcularMargenReal(receta: RecetaConIngredientes): number {
  const costo = calcularCostoLitro(receta)
  const precio = Number(receta.precio_venta)
  if (costo <= 0 || precio <= 0) return 0
  return ((precio - costo) / precio) * 100
}

const recetasConMargen = computed(() =>
  recetas.value.map(r => ({
    ...r,
    costo_por_litro: calcularCostoLitro(r),
    margen_real: calcularMargenReal(r),
  })).sort((a, b) => b.margen_real - a.margen_real)
)

const margenPromedio = computed(() => {
  if (recetasConMargen.value.length === 0) return 0
  const sum = recetasConMargen.value.reduce((s, r) => s + r.margen_real, 0)
  return sum / recetasConMargen.value.length
})

const masRentable = computed(() => recetasConMargen.value[0] || null)
const menosRentable = computed(() => recetasConMargen.value[recetasConMargen.value.length - 1] || null)
</script>

<template>
  <div class="space-y-6">
    <!-- Loading -->
    <LoadingState v-if="isLoading" type="card" />

    <template v-else>
      <!-- Cards resumen -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="bg-white rounded-2xl border border-sand-200/60 p-5">
          <p class="text-[11px] text-sand-300 uppercase tracking-wider font-medium">Margen promedio</p>
          <p class="text-[22px] font-bold text-brand-950 mt-1">{{ formatPercent(margenPromedio) }}</p>
        </div>
        <div class="bg-white rounded-2xl border border-sand-200/60 p-5">
          <p class="text-[11px] text-sand-300 uppercase tracking-wider font-medium">Más rentable</p>
          <p class="text-[15px] font-semibold text-brand-950 mt-1 truncate">{{ masRentable?.nombre || '—' }}</p>
          <p v-if="masRentable" class="text-[12px] text-success font-medium">{{ formatPercent(masRentable.margen_real) }}</p>
        </div>
        <div class="bg-white rounded-2xl border border-sand-200/60 p-5">
          <p class="text-[11px] text-sand-300 uppercase tracking-wider font-medium">Menos rentable</p>
          <p class="text-[15px] font-semibold text-brand-950 mt-1 truncate">{{ menosRentable?.nombre || '—' }}</p>
          <p v-if="menosRentable" class="text-[12px] font-medium" :class="menosRentable.margen_real < 0 ? 'text-danger' : 'text-warning'">
            {{ formatPercent(menosRentable.margen_real) }}
          </p>
        </div>
      </div>

      <!-- Tabla de recetas -->
      <div class="bg-white rounded-2xl border border-sand-200/60 overflow-hidden">
        <div class="px-5 py-4 border-b border-sand-100">
          <h3 class="text-[14px] font-semibold text-brand-950">Rentabilidad por receta</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-[13px]">
            <thead>
              <tr class="border-b border-sand-100">
                <th class="text-left px-5 py-3 text-[11px] text-sand-400 uppercase tracking-wider font-medium">Receta</th>
                <th class="text-left px-5 py-3 text-[11px] text-sand-400 uppercase tracking-wider font-medium">Categoría</th>
                <th class="text-right px-5 py-3 text-[11px] text-sand-400 uppercase tracking-wider font-medium">Precio</th>
                <th class="text-right px-5 py-3 text-[11px] text-sand-400 uppercase tracking-wider font-medium">Costo/L</th>
                <th class="text-right px-5 py-3 text-[11px] text-sand-400 uppercase tracking-wider font-medium">Margen real</th>
                <th class="text-right px-5 py-3 text-[11px] text-sand-400 uppercase tracking-wider font-medium">Objetivo</th>
                <th class="text-center px-5 py-3 text-[11px] text-sand-400 uppercase tracking-wider font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in recetasConMargen" :key="r.id" class="border-b border-sand-50 hover:bg-sand-50/50 transition-colors">
                <td class="px-5 py-3 font-medium text-brand-950">{{ r.nombre }}</td>
                <td class="px-5 py-3 text-sand-400">{{ r.categoria }}</td>
                <td class="px-5 py-3 text-right text-brand-950">{{ formatCurrency(Number(r.precio_venta)) }}</td>
                <td class="px-5 py-3 text-right text-brand-950">{{ formatCurrency(r.costo_por_litro) }}</td>
                <td class="px-5 py-3 text-right font-medium" :class="r.margen_real >= Number(r.margen_objetivo) ? 'text-success' : r.margen_real >= 0 ? 'text-warning' : 'text-danger'">
                  {{ formatPercent(r.margen_real) }}
                </td>
                <td class="px-5 py-3 text-right text-sand-400">{{ formatPercent(Number(r.margen_objetivo)) }}</td>
                <td class="px-5 py-3 text-center">
                  <span v-if="r.margen_real >= Number(r.margen_objetivo)" class="inline-flex items-center gap-1 text-[11px] font-medium text-success bg-success-soft px-2 py-0.5 rounded-full">
                    <Icon name="lucide:check" class="w-3 h-3" /> OK
                  </span>
                  <span v-else-if="r.margen_real >= 0" class="inline-flex items-center gap-1 text-[11px] font-medium text-warning bg-warning-soft px-2 py-0.5 rounded-full">
                    <Icon name="lucide:alert-triangle" class="w-3 h-3" /> Bajo
                  </span>
                  <span v-else class="inline-flex items-center gap-1 text-[11px] font-medium text-danger bg-danger-soft px-2 py-0.5 rounded-full">
                    <Icon name="lucide:x" class="w-3 h-3" /> Pérdida
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>
