<script setup lang="ts">
const { stockEstado, insumosStock, movimientosRecientes } = useReportes()

const filterTipo = ref('')

const tipoOptions = [
  { value: '', label: 'Todos' },
  { value: 'compra', label: 'Compras' },
  { value: 'produccion', label: 'Producción' },
  { value: 'ajuste', label: 'Ajustes' },
]

const movimientosFiltrados = computed(() => {
  if (!filterTipo.value) return movimientosRecientes.value
  return movimientosRecientes.value.filter(m => m.tipo === filterTipo.value)
})

function formatCurrency(n: number) {
  return n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
}

function formatNumber(n: number) {
  return n.toLocaleString('es-AR', { maximumFractionDigits: 2 })
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })
}

function formatDateTime(d: string) {
  return new Date(d).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

const tipoLabel: Record<string, string> = {
  compra: 'Compra',
  produccion: 'Producción',
  venta: 'Venta',
  ajuste: 'Ajuste',
  merma: 'Merma',
  devolucion: 'Devolución',
}

const tipoVariant: Record<string, string> = {
  compra: 'success',
  produccion: 'info',
  venta: 'info',
  ajuste: 'warning',
  merma: 'danger',
  devolucion: 'warning',
}

const estadoLabel: Record<string, string> = {
  ok: 'OK',
  bajo: 'Bajo mínimo',
  agotado: 'Agotado',
}

const estadoVariant: Record<string, string> = {
  ok: 'success',
  bajo: 'warning',
  agotado: 'danger',
}

const valorTotalStock = computed(() =>
  insumosStock.value.reduce((sum, i) => sum + i.valor_total, 0)
)
</script>

<template>
  <div class="space-y-6">
    <!-- Cards resumen -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div class="bg-white rounded-2xl border border-sand-200/60 p-5">
        <p class="text-[11px] text-sand-300 uppercase tracking-wider font-medium">Valor total stock</p>
        <p class="text-[20px] font-bold text-brand-950 mt-1">{{ formatCurrency(valorTotalStock) }}</p>
      </div>
      <div class="bg-white rounded-2xl border border-sand-200/60 p-5">
        <p class="text-[11px] text-sand-300 uppercase tracking-wider font-medium">Stock OK</p>
        <p class="text-[20px] font-bold text-success mt-1">{{ stockEstado.ok }}</p>
      </div>
      <div class="bg-white rounded-2xl border border-sand-200/60 p-5">
        <p class="text-[11px] text-sand-300 uppercase tracking-wider font-medium">Bajo mínimo</p>
        <p class="text-[20px] font-bold text-warning mt-1">{{ stockEstado.bajo }}</p>
      </div>
      <div class="bg-white rounded-2xl border border-sand-200/60 p-5">
        <p class="text-[11px] text-sand-300 uppercase tracking-wider font-medium">Agotados</p>
        <p class="text-[20px] font-bold text-danger mt-1">{{ stockEstado.agotado }}</p>
      </div>
    </div>

    <!-- Tabla stock actual -->
    <div class="bg-white rounded-2xl border border-sand-200/60 overflow-hidden">
      <div class="px-5 py-4 border-b border-sand-100">
        <h3 class="text-[14px] font-semibold text-brand-950">Stock actual</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-[13px]">
          <thead>
            <tr class="border-b border-sand-100">
              <th class="text-left px-5 py-3 text-[11px] text-sand-400 uppercase tracking-wider font-medium">Insumo</th>
              <th class="text-left px-5 py-3 text-[11px] text-sand-400 uppercase tracking-wider font-medium">Categoría</th>
              <th class="text-right px-5 py-3 text-[11px] text-sand-400 uppercase tracking-wider font-medium">Stock</th>
              <th class="text-right px-5 py-3 text-[11px] text-sand-400 uppercase tracking-wider font-medium">Mínimo</th>
              <th class="text-right px-5 py-3 text-[11px] text-sand-400 uppercase tracking-wider font-medium">Valor</th>
              <th class="text-center px-5 py-3 text-[11px] text-sand-400 uppercase tracking-wider font-medium">Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="i in insumosStock" :key="i.id" class="border-b border-sand-50 hover:bg-sand-50/50 transition-colors">
              <td class="px-5 py-3 font-medium text-brand-950">{{ i.nombre }}</td>
              <td class="px-5 py-3 text-sand-400">{{ i.categoria }}</td>
              <td class="px-5 py-3 text-right text-brand-950">{{ formatNumber(Number(i.stock_actual)) }} {{ i.unidad_medida }}</td>
              <td class="px-5 py-3 text-right text-sand-400">{{ formatNumber(Number(i.stock_minimo)) }}</td>
              <td class="px-5 py-3 text-right font-medium text-brand-950">{{ formatCurrency(i.valor_total) }}</td>
              <td class="px-5 py-3 text-center">
                <StatusBadge
                  :label="estadoLabel[i.estado] || i.estado"
                  :variant="(estadoVariant[i.estado] || 'default') as any"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Historial de movimientos -->
    <div class="bg-white rounded-2xl border border-sand-200/60 overflow-hidden">
      <div class="px-5 py-4 border-b border-sand-100 flex items-center justify-between">
        <h3 class="text-[14px] font-semibold text-brand-950">Historial de movimientos</h3>
        <AppSelect v-model="filterTipo" :options="tipoOptions" class="w-36" />
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-[13px]">
          <thead>
            <tr class="border-b border-sand-100">
              <th class="text-left px-5 py-3 text-[11px] text-sand-400 uppercase tracking-wider font-medium">Fecha</th>
              <th class="text-left px-5 py-3 text-[11px] text-sand-400 uppercase tracking-wider font-medium">Tipo</th>
              <th class="text-left px-5 py-3 text-[11px] text-sand-400 uppercase tracking-wider font-medium">Insumo</th>
              <th class="text-right px-5 py-3 text-[11px] text-sand-400 uppercase tracking-wider font-medium">Cantidad</th>
              <th class="text-left px-5 py-3 text-[11px] text-sand-400 uppercase tracking-wider font-medium">Motivo</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="m in movimientosFiltrados" :key="m.id" class="border-b border-sand-50 hover:bg-sand-50/50 transition-colors">
              <td class="px-5 py-3 text-sand-400">{{ formatDateTime(m.created_at) }}</td>
              <td class="px-5 py-3">
                <StatusBadge
                  :label="tipoLabel[m.tipo] || m.tipo"
                  :variant="(tipoVariant[m.tipo] || 'default') as any"
                />
              </td>
              <td class="px-5 py-3 font-medium text-brand-950">
                {{ insumosStock.find(i => i.id === m.insumo_id)?.nombre || m.insumo_id }}
              </td>
              <td class="px-5 py-3 text-right text-brand-950">
                {{ m.tipo === 'compra' || m.tipo === 'ajuste' ? '+' : '-' }}{{ formatNumber(Number(m.cantidad)) }}
              </td>
              <td class="px-5 py-3 text-sand-400 truncate max-w-[200px]">{{ m.motivo }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
