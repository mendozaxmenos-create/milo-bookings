# ✅ Resumen: Shortlinks y Businesses

## 🎯 Problema Identificado

Cuando se crea un shortlink sin `businessId`, se crea un `client` en la tabla `clients` pero **NO** se crea un `business` en la tabla `businesses`. Por lo tanto, el shortlink no aparece en el panel de negocios.

## ✅ Solución Implementada

### 1. Creación Automática de Business

**Archivo:** `backend/src/api/routes/shortlinks.js`

- Cuando un super admin crea un shortlink **sin** `businessId`, ahora se crea automáticamente un `business` asociado
- El business se crea con:
  - `name`: Nombre del shortlink
  - `plan_type`: `'basic'` (plan básico por defecto)
  - `is_active`: `true`
  - Otros campos opcionales en `null` (se pueden actualizar después)

### 2. Endpoint de Migración

**Archivo:** `backend/src/api/routes/admin.js`

- Nuevo endpoint: `POST /api/admin/migrate-shortlinks-to-businesses`
- Migra todos los shortlinks existentes sin `business_id` a businesses
- Solo accesible para super admin
- Crea un business para cada shortlink y lo vincula

### 3. Script de Migración

**Archivo:** `backend/scripts/migrate-shortlinks-to-businesses.js`

- Script standalone para ejecutar la migración desde la línea de comandos
- Comando: `npm run migrate:shortlinks-to-businesses`

## 📋 Próximos Pasos

### 1. Migrar Shortlink Existente de "Mon Patisserie"

**Opción A: Usar el endpoint (Recomendado)**
1. Abre el panel de superadmin
2. Ejecuta el endpoint: `POST /api/admin/migrate-shortlinks-to-businesses`
3. Esto creará un business para "Mon Patisserie" y lo vinculará

**Opción B: Usar el script**
```bash
cd backend
npm run migrate:shortlinks-to-businesses
```

### 2. Gestión de Servicios según Plan de Suscripción

**Pendiente de implementar:**

En el panel de negocios (`AdminBusinesses.tsx`), agregar:

1. **Sección de Plan y Servicios:**
   - Mostrar el plan actual del negocio (`basic`, `intermediate`, `premium`)
   - Lista de servicios disponibles según el plan
   - Botón para cambiar de plan (solo super admin)

2. **Límites según Plan:**
   - **Basic:** 1 servicio activo, hasta 50 reservas/mes
   - **Intermediate:** Servicios ilimitados, hasta 500 reservas/mes
   - **Premium:** Servicios ilimitados, reservas ilimitadas

3. **Validación al Crear Servicios:**
   - Verificar límites del plan antes de permitir crear servicios
   - Mostrar mensaje si se excede el límite

## 🔄 Flujo Actualizado

### Crear Shortlink (Super Admin)

1. Usuario crea shortlink desde panel de Shortlinks
2. Si no proporciona `businessId`:
   - ✅ Se crea automáticamente un `business`
   - ✅ El shortlink se vincula al business creado
   - ✅ El business aparece en el panel de negocios

### Panel de Negocios

- Ahora muestra todos los businesses, incluyendo los creados desde shortlinks
- Desde el panel se puede:
  - Ver detalles del negocio
  - Configurar servicios (pendiente: validar según plan)
  - Cambiar plan de suscripción (pendiente: implementar)
  - Gestionar configuración del bot

## 📝 Notas

- Los shortlinks creados **antes** de este cambio necesitan migración
- El endpoint de migración puede ejecutarse múltiples veces (es idempotente)
- Los businesses creados automáticamente tienen plan `basic` por defecto
- Se puede actualizar el plan desde el panel de negocios (pendiente: implementar UI)

---

**Estado:** ✅ Implementado - Pendiente migración y gestión de servicios según plan



