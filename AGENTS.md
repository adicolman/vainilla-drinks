# AGENTS.md

Vainilla Drinks — app de back-office (Nuxt 4 + Vue 3 + Supabase) para una marca de bebidas. Una sola app Nuxt, sin monorepo.

**Leé `README.md` primero** — documenta el setup, el flujo completo de migraciones, el estado de los módulos y la arquitectura de datos. Este archivo solo agrega lo que el README no cubre.

## Comandos

**No hay script de test, lint ni typecheck** — no busques uno. La verificación es `npm run build`. Los scripts en `package.json` son solo de Nuxt (`dev`/`build`/`generate`/`preview`) y del CLI de Supabase (`db:*`).

Estos scripts llaman al CLI `supabase`, que debe estar vinculado al proyecto remoto (`npm run db:link`, project-ref `pwcvlxsvcaikzjvfzvza`):

- `db:push` — aplica las migraciones pendientes al proyecto remoto
- `db:migration:new <nombre>` — crea una migración con timestamp
- `db:rollback -- supabase/migrations_down/<archivo>.sql` — ejecuta una migración de reversa (destructiva; revisar antes de ejecutar)

## Cambios de esquema DB (fáciles de romper)

- Cada migración en `supabase/migrations/` **debe tener un archivo de reversa con el mismo nombre** en `supabase/migrations_down/`.
- `app/types/database.types.ts` **se mantiene a mano** (no se regenera con el push). Tras cambiar el esquema, actualizalo a mano o ejecutá `supabase gen types typescript`.
- Los datos de negocio son multi-tenant vía `organization_id`; hay RLS en todas las tablas. No escribas migraciones que salteen RLS salvo que sea intencional (el trigger de auth usa SECURITY DEFINER).

## Particularidades de arquitectura

- **No hay módulo `@nuxtjs/supabase`.** La auth/sesión es custom: los plugins `app/plugins/supabase.client.ts` y `supabase.server.ts` exponen el cliente + estado de usuario/sesión, y `app/composables/useSupabase.ts` provee `useSupabaseClient` / `useSupabaseUser` / `useSupabaseSession`. Reusá estos; no agregues el módulo. La auth usa flujo PKCE.
- `tsconfig.json` referencia los `.nuxt/tsconfig.*.json` generados. Los tipos solo resuelven una vez que existe `.nuxt/` (ejecutá `npm run dev`, o `postinstall` corre `nuxt prepare`).
- `runtimeConfig.public.supabase` se carga desde `SUPABASE_URL` / `SUPABASE_KEY` en `.env` (gitignored). Los cambios en `.env` requieren reiniciar el servidor de dev. No commitees `.env`.
- Los usuarios nuevos se vuelven automáticamente `admin` de la org `vainilla-drinks` (trigger `handle_new_user()`) — esa org debe existir antes de los registros.
- `movimientos_stock` es append-only (solo inserts; updates deshabilitados por RLS), y `costo_promedio` en `insumos` se deriva en la DB — no los edites a mano directamente.
- Las páginas `ventas`, `gastos`, `caja`, `proveedores` son placeholders; sus tablas en la DB ya existen.
- Los textos de UI y las migraciones están en español.
