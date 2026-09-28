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
</script>

<template>
  <div
    class="bg-white rounded-2xl border border-sand-200/60 overflow-hidden hover:shadow-elevated transition-all duration-200 flex flex-col cursor-pointer group"
    @click="emit('edit', proveedor)"
  >
    <div class="px-5 pt-5 pb-4 flex items-start justify-between gap-3">
      <div class="flex gap-3 min-w-0">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" :class="proveedor.activo ? 'bg-brand-950 text-white' : 'bg-sand-100 text-sand-400'">
          <Icon name="lucide:truck" class="w-[18px] h-[18px]" />
        </div>
        <div class="min-w-0">
          <h3 class="text-[14px] font-semibold text-brand-950 leading-tight truncate">{{ proveedor.nombre }}</h3>
          <p v-if="proveedor.contacto" class="text-[11px] text-sand-400 truncate mt-0.5">{{ proveedor.contacto }}</p>
          <p v-else class="text-[11px] text-sand-300 mt-0.5">Sin contacto</p>
        </div>
      </div>
      <StatusBadge :label="proveedor.activo ? 'Activo' : 'Inactivo'" :variant="proveedor.activo ? 'success' : 'neutral'" />
    </div>

    <div class="px-5 pb-4 flex items-center gap-4 text-[12px] text-sand-400">
      <span v-if="proveedor.telefono" class="flex items-center gap-1">
        <Icon name="lucide:phone" class="w-3 h-3" /> {{ proveedor.telefono }}
      </span>
      <span v-if="proveedor.email" class="flex items-center gap-1 truncate">
        <Icon name="lucide:mail" class="w-3 h-3" /> <span class="truncate">{{ proveedor.email }}</span>
      </span>
    </div>

    <div class="mt-auto flex items-center gap-1 px-3 py-2.5 border-t border-sand-100 bg-sand-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      <button class="flex-1 inline-flex items-center justify-center gap-1.5 h-8 rounded-lg text-[12px] font-medium text-brand-950 hover:bg-white border border-transparent hover:border-sand-200 transition-colors" @click.stop="emit('edit', proveedor)">
        <Icon name="lucide:pencil" class="w-3.5 h-3.5" /> Editar
      </button>
      <button class="w-8 h-8 flex items-center justify-center rounded-lg text-sand-400 hover:text-amber-600 hover:bg-white border border-transparent hover:border-sand-200 transition-colors" :title="proveedor.activo ? 'Desactivar' : 'Activar'" @click.stop="emit('toggle', proveedor)">
        <Icon :name="proveedor.activo ? 'lucide:eye-off' : 'lucide:eye'" class="w-4 h-4" />
      </button>
      <button class="w-8 h-8 flex items-center justify-center rounded-lg text-sand-400 hover:text-danger hover:bg-white border border-transparent hover:border-sand-200 transition-colors" title="Eliminar" @click.stop="emit('delete', proveedor)">
        <Icon name="lucide:trash-2" class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>
