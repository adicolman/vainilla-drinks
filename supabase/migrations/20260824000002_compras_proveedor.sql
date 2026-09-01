-- =============================================================================
-- VAINILLA DRINKS — Compras: agregar proveedor_nombre
-- Migration: 007_comprasProveedor
-- Date: 2026-08-24
-- =============================================================================
-- Makes proveedor_id optional and adds a free-text proveedor_nombre field.
-- The user manually types the supplier name (supermarket/distributor).
-- =============================================================================

-- Make proveedor_id nullable (was NOT NULL)
ALTER TABLE compras ALTER COLUMN proveedor_id DROP NOT NULL;

-- Add free-text supplier name
ALTER TABLE compras ADD COLUMN proveedor_nombre text NOT NULL DEFAULT '';
