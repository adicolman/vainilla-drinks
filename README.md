# Vainilla Drinks

App de gestión interna para una marca de cócteles/bebidas: inventario de insumos, recetas con cálculo de costos y márgenes, registro de compras, producción de lotes y reportes de rentabilidad.

No es una app de venta al público — es una herramienta de back-office (multi-usuario, mono-organización).

---

## Stack

- **[Nuxt 4](https://nuxt.com/)** (Vue 3) — frontend
- **[Supabase](https://supabase.com/)** — base de datos PostgreSQL, autenticación y seguridad a nivel de fila (RLS)
- **[Tailwind CSS v4](https://tailwindcss.com/)** — estilos
- **[Chart.js](https://www.chartjs.org/)** (vía `vue-chartjs`) — gráficos
- **[Lucide](https://lucide.dev/)** (vía `@nuxt/icon`) — íconos

---

## Requisitos

- Node.js 18+
- Una cuenta de [Supabase](https://supabase.com/) con un proyecto creado

---

## Setup inicial

### 1. Instalar dependencias

```bash
npm install
```

### 2. Variables de entorno

Copiá `.env.example` a `.env` y completá con los datos de tu proyecto Supabase (Project Settings → API):

```bash
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu-clave-publica-anon
```

### 3. Base de datos

Todas las migraciones SQL viven en `supabase/migrations/`, numeradas cronológicamente con timestamp (`YYYYMMDDHHMMSS_nombre.sql`).

**Opción A — Con Supabase CLI (recomendado):**

```bash
# Vincular el proyecto local con tu proyecto Supabase remoto (una sola vez)
npm run db:link

# Aplicar todas las migraciones pendientes
npm run db:push
```

**Opción B — Manual:** copiar y pegar cada archivo de `supabase/migrations/` en el SQL Editor del Dashboard de Supabase, en orden.

### 4. Levantar el proyecto

```bash
npm run dev
```

Abrí `http://localhost:3000`. El primer usuario que se registre queda automáticamente como `admin` de la organización "Vainilla Drinks".

---

## Scripts disponibles

| Script | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run preview` | Preview del build de producción |
| `npm run db:link` | Vincula el CLI de Supabase a tu proyecto remoto |
| `npm run db:push` | Aplica migraciones pendientes al proyecto remoto |
| `npm run db:pull` | Trae el schema remoto y lo compara con las migraciones locales |
| `npm run db:diff` | Muestra diferencias entre el schema local y el remoto |
| `npm run db:migration:new <nombre>` | Crea un archivo de migración nuevo con timestamp correcto |
| `npm run db:migration:list` | Lista qué migraciones están aplicadas remotamente vs localmente |
| `npm run db:rollback -- <archivo>` | Ejecuta un archivo SQL de reversa contra el proyecto remoto (ver [Rollback](#rollback-de-migraciones)) |

---

## Estructura del proyecto

```
app/
├── pages/              → cada archivo = 1 ruta (ej: inventario.vue → /inventario)
├── components/
│   ├── inventario/       componentes de insumos
│   ├── recetas/
│   ├── compras/
│   ├── produccion/
│   ├── reportes/
│   ├── dashboard/
│   ├── layout/           header, sidebar
│   └── ui/               botones, inputs, modales base
├── composables/         lógica de negocio + conexión a Supabase (useInsumos, useRecetas, etc.)
├── plugins/             inicializan la conexión a Supabase
├── middleware/          auth.global.ts protege todas las rutas salvo /login
├── layouts/             default.vue (con sidebar), auth.vue (login)
└── types/               tipos TypeScript de las tablas de la base de datos

supabase/
├── migrations/          historial de cambios a la base de datos (orden = fuente de verdad)
└── migrations_down/     reversa de cada migración (ver Rollback)
```

---

## Módulos

| Módulo | Estado |
|---|---|
| Inventario (insumos) | ✅ Completo |
| Recetas | ✅ Completo |
| Producción | ✅ Completo |
| Compras | ✅ Completo |
| Reportes | ✅ Completo |
| Configuración (categorías) | ✅ Completo |
| Dashboard | ✅ Completo (datos reales) |
| Ventas | ⛔ Placeholder — tabla en base de datos ya existe |
| Gastos | ⛔ Placeholder — tabla en base de datos ya existe |
| Caja | ⛔ Placeholder — tabla en base de datos ya existe |
| Proveedores | ⛔ Placeholder — tabla en base de datos ya existe |

---

## Arquitectura de datos (decisiones clave)

- **Multi-tenant**: todas las tablas de negocio tienen `organization_id`. Hoy existe una sola organización semilla ("Vainilla Drinks"), pero el modelo soporta más de una a futuro.
- **Roles**: `admin` / `operator`. Actualmente **todos los usuarios que se registran quedan como `admin`** (ver `supabase/migrations/20260822000004_auth_trigger.sql`). No hay operadores con permisos limitados implementados todavía.
- **Stock**: la tabla `movimientos_stock` es la fuente de verdad (append-only: solo se puede insertar, nunca editar ni borrar). El campo `stock_actual` en `insumos` es una caché que se sincroniza automáticamente vía trigger.
- **Costos**: se usa costo promedio ponderado (`costo_promedio`), actualizado en cada compra vía la función `actualizar_costo_promedio()`.
- **Seguridad**: Row Level Security (RLS) en todas las tablas. Cada usuario solo puede ver/editar datos de su propia organización. Las políticas están en `supabase/migrations/20260822000002_rls_policies.sql`.

---

## Migraciones: cómo agregar un cambio a la base de datos

1. Crear el archivo con el CLI (asigna el timestamp automáticamente):
   ```bash
   npm run db:migration:new nombre_del_cambio
   ```
2. Escribir el SQL en el archivo generado dentro de `supabase/migrations/`.
3. Escribir también su reversa en `supabase/migrations_down/` con el mismo nombre de archivo (ver sección siguiente).
4. Aplicar con `npm run db:push`.

## Rollback de migraciones

Cada migración en `supabase/migrations/` tiene su contraparte en `supabase/migrations_down/` con el mismo nombre, que deshace ese cambio específico.

Para revertir la última migración aplicada:

```bash
npm run db:rollback -- supabase/migrations_down/<nombre_del_archivo>.sql
```

⚠️ Algunas reversas son **destructivas** (borran tablas/datos) o pueden fallar si ya existen datos dependientes — cada archivo de reversa tiene un comentario explicando el riesgo. Revisar antes de ejecutar.

---

## Autenticación

El login usa Supabase Auth directamente (no el módulo `@nuxtjs/supabase`, que fue reemplazado por plugins propios en `app/plugins/supabase.client.ts` y `supabase.server.ts` para mayor control sobre el manejo de sesión).

Al registrarse un usuario nuevo, un trigger (`handle_new_user()`) crea automáticamente su perfil vinculado a la organización "Vainilla Drinks" con rol `admin`.
