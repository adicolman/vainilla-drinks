<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const { login, isLoading } = useAuth()

const email = ref('')
const password = ref('')
const error = ref('')

async function handleLogin() {
  error.value = ''

  if (!email.value) {
    error.value = 'Ingresá tu email'
    return
  }
  if (!password.value) {
    error.value = 'Ingresá tu contraseña'
    return
  }

  try {
    await login(email.value, password.value)
    await navigateTo('/dashboard')
  } catch (e: any) {
    const msg = e?.message || ''
    if (msg.includes('Invalid login')) {
      error.value = 'Email o contraseña incorrectos'
    } else if (msg.includes('Email not confirmed')) {
      error.value = 'El email no fue confirmado'
    } else {
      error.value = msg || 'Error al iniciar sesión'
    }
  }
}
</script>

<template>
  <div class="w-full max-w-sm">
    <!-- Brand -->
    <div class="text-center mb-8">
      <div class="flex items-center justify-center">
        <span class="text-[22px] font-bold tracking-[0.16em] uppercase text-brand-950">
          Vainilla
        </span>
        <span class="text-[22px] font-light tracking-[0.16em] uppercase text-brand-600 ml-1.5">
          Drinks
        </span>
      </div>
    </div>

    <!-- Card -->
    <div class="bg-white rounded-2xl border border-sand-200/60 shadow-card p-8">
      <h1 class="text-lg font-semibold text-brand-950 mb-1">Iniciar sesión</h1>
      <p class="text-[13px] text-sand-400 mb-6">Accedé a tu panel de gestión</p>

      <form class="space-y-4" @submit.prevent="handleLogin">
        <AppInput
          v-model="email"
          label="Email"
          type="email"
          placeholder="tu@email.com"
          :disabled="isLoading"
        />

        <AppInput
          v-model="password"
          label="Contraseña"
          type="password"
          placeholder="••••••••"
          :disabled="isLoading"
        />

        <p v-if="error" class="text-sm text-danger font-medium">{{ error }}</p>

        <PrimaryButton
          :loading="isLoading"
          class="w-full"
        >
          Ingresar
        </PrimaryButton>
      </form>
    </div>
  </div>
</template>
