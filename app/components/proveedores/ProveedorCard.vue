<script setup lang="ts">
import type { ProveedorRow } from '~/composables/useProveedores'

const props = defineProps<{
  proveedor: ProveedorRow
}>()

const emit = defineEmits<{
  edit: [proveedor: ProveedorRow]
  toggle: [proveedor: ProveedorRow]
  delete: [proveedor: ProveedorRow]
}>()

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>

<template>
  <div class="bg-white rounded-2xl border border-sand-200/60 p-5 hover:shadow-card transition-all duration-200">
    <div class="flex items-start justify-between mb-3">
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <h3 class="text-[15px] font-semibold text-brand-950 truncate">
            {{ proveedor.nombre }}
          </h3>
          <span
            v-if="!proveedor.activo"
            class="text-[10px] font-medium text-sand-400 bg-sand-100 px-1.5 py-0.5 rounded"
          >
            Inactivo
          </span>
        </div>
        <p v-if="proveedor.contacto" class="text-[12px] text-sand-400 mt-0.5">
          Contacto: {{ proveedor.contacto }}
        </p>
      </div>
      <div class="flex items-center gap-1">
        <button
          class="w-8 h-8 flex items-center justify-center rounded-lg text-sand-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
          title="Editar"
          @click="emit('edit', proveedor)"
        >
          <Icon name="lucide:pencil" class="w-4 h-4" />
        </button>
        <button
          class="w-8 h-8 flex items-center justify-center rounded-lg text-sand-400 hover:text-warning hover:bg-warning-soft transition-colors"
          :title="proveedor.activo ? 'Desactivar' : 'Activar'"
          @click="emit('toggle', proveedor)"
        >
          <Icon :name="proveedor.activo ? 'lucide:eye-off' : 'lucide:eye'" class="w-4 h-4" />
        </button>
        <button
          class="w-8 h-8 flex items-center justify-center rounded-lg text-sand-400 hover:text-danger hover:bg-danger-soft transition-colors"
          title="Eliminar"
          @click="emit('delete', proveedor)"
        >
          <Icon name="lucide:trash-2" class="w-4 h-4" />
        </button>
      </div>
    </div>

    <div class="space-y-1.5">
      <div v-if="proveedor.telefono" class="flex items-center gap-2 text-[12px] text-sand-400">
        <Icon name="lucide:phone" class="w-3.5 h-3.5 shrink-0" />
        <span>{{ proveedor.telefono }}</span>
      </div>
      <div v-if="proveedor.email" class="flex items-center gap-2 text-[12px] text-sand-400">
        <Icon name="lucide:mail" class="w-3.5 h-3.5 shrink-0" />
        <span class="truncate">{{ proveedor.email }}</span>
      </div>
      <div v-if="proveedor.direccion" class="flex items-center gap-2 text-[12px] text-sand-400">
        <Icon name="lucide:map-pin" class="w-3.5 h-3.5 shrink-0" />
        <span class="truncate">{{ proveedor.direccion }}</span>
      </div>
    </div>

    <p v-if="proveedor.notas" class="text-[12px] text-sand-400 mt-3 line-clamp-2">
      {{ proveedor.notas }}
    </p>
  </div>
</template>
