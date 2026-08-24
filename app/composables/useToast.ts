export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
}

const toasts = ref<Toast[]>([])

export function useToast() {
  function addToast(type: Toast['type'], title: string, message?: string) {
    const id = Date.now().toString()
    toasts.value.push({ id, type, title, message })
    setTimeout(() => removeToast(id), 4000)
  }

  function removeToast(id: string) {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  return { toasts, addToast, removeToast }
}
