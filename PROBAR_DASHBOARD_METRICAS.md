# 🧪 Probar Dashboard de Métricas

## ✅ Verificación Previa

Antes de probar, asegúrate de que:

1. ✅ El backend esté corriendo
2. ✅ La base de datos tenga al menos un negocio con reservas
3. ✅ Tener un token de autenticación válido

---

## 🧪 Opción 1: Probar desde el Frontend (Recomendado)

### Pasos:

1. **Iniciar el frontend:**
   ```bash
   cd frontend/admin-panel
   npm run dev
   ```

2. **Iniciar sesión** en el panel de administración

3. **Ir al Dashboard** - Deberías ver:
   - Métricas básicas (servicios, reservas)
   - Si el plan es `intermediate` o `premium`, verás métricas financieras
   - Si el plan es `premium`, verás métricas avanzadas

4. **Verificar en la consola del navegador:**
   - Abre DevTools (F12)
   - Ve a la pestaña "Network"
   - Busca la petición a `/api/dashboard/stats`
   - Verifica que la respuesta tenga la estructura correcta

---

## 🧪 Opción 2: Probar con cURL

### 1. Obtener Token de Autenticación

```bash
# Login como business user
curl -X POST https://milo-bookings.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "business_id": "tu-business-id",
    "phone": "+5491123456789",
    "password": "tu-password"
  }'
```

Guarda el `token` de la respuesta.

### 2. Probar Endpoint de Dashboard

```bash
curl -X GET https://milo-bookings.onrender.com/api/dashboard/stats \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -H "Content-Type: application/json"
```

### Respuesta Esperada:

**Plan Básico:**
```json
{
  "data": {
    "bookings": {
      "total": 10,
      "today": 2,
      "thisMonth": 8,
      "pending": 1,
      "pending_payment": 2,
      "confirmed": 5,
      "cancelled": 1,
      "completed": 1
    },
    "services": {
      "total": 3,
      "active": 2
    }
  }
}
```

**Plan Intermedio/Premium:**
```json
{
  "data": {
    "bookings": { ... },
    "services": { ... },
    "financial": {
      "totalRevenue": 50000,
      "monthRevenue": 15000,
      "todayRevenue": 5000,
      "lastMonthRevenue": 12000,
      "monthVariation": 25.0,
      "pendingRevenue": 3000,
      "avgTicket": 5000,
      "paidBookingsCount": 10
    }
  }
}
```

**Plan Premium:**
```json
{
  "data": {
    "bookings": { ... },
    "services": { ... },
    "financial": { ... },
    "advanced": {
      "mostPopularService": {
        "id": "service-123",
        "name": "Corte de Pelo",
        "bookingsCount": 15
      },
      "topServicesByRevenue": [
        {
          "id": "service-123",
          "name": "Corte de Pelo",
          "revenue": 75000
        }
      ],
      "uniqueCustomers": 25,
      "recurringCustomers": 8,
      "retentionRate": 32.0,
      "noShowRate": 10.5
    }
  }
}
```

---

## 🧪 Opción 3: Probar Localmente

### 1. Iniciar Backend

```bash
cd backend
npm start
```

### 2. Probar con cURL Local

```bash
curl -X GET http://localhost:3000/api/dashboard/stats \
  -H "Authorization: Bearer TU_TOKEN" \
  -H "Content-Type: application/json"
```

---

## 🔍 Verificar Plan del Negocio

Para cambiar el plan de un negocio y probar diferentes métricas:

### Opción A: Desde la Base de Datos

```sql
-- Ver plan actual
SELECT id, name, plan_type FROM businesses;

-- Cambiar a plan intermedio
UPDATE businesses SET plan_type = 'intermediate' WHERE id = 'tu-business-id';

-- Cambiar a plan premium
UPDATE businesses SET plan_type = 'premium' WHERE id = 'tu-business-id';

-- Volver a básico
UPDATE businesses SET plan_type = 'basic' WHERE id = 'tu-business-id';
```

### Opción B: Desde el Panel de Super Admin

1. Iniciar sesión como super admin
2. Ir a "Negocios"
3. Editar el negocio y cambiar el `plan_type`

---

## 🐛 Troubleshooting

### Error: "Business ID required"
- **Causa:** El usuario no tiene `business_id` asignado
- **Solución:** Verificar que el token tenga `business_id` en el payload

### Error: "Internal server error"
- **Causa:** Error en la base de datos o en el cálculo de métricas
- **Solución:** 
  1. Verificar logs del backend
  2. Verificar que existan reservas y servicios en la base de datos
  3. Verificar que las columnas `plan_type`, `payment_status`, etc. existan

### No se muestran métricas financieras
- **Causa:** El negocio tiene plan `basic`
- **Solución:** Cambiar el `plan_type` a `intermediate` o `premium`

### Métricas muestran 0
- **Causa:** No hay datos en la base de datos
- **Solución:** 
  1. Crear algunas reservas de prueba
  2. Asegurarse de que tengan `payment_status = 'paid'` para métricas financieras
  3. Verificar que los servicios estén activos

---

## ✅ Checklist de Prueba

- [ ] Endpoint responde correctamente
- [ ] Métricas básicas se muestran (todos los planes)
- [ ] Métricas financieras se muestran (plan intermedio/premium)
- [ ] Métricas avanzadas se muestran (solo plan premium)
- [ ] Los valores numéricos son correctos
- [ ] El formato de moneda es correcto (ARS)
- [ ] Las variaciones porcentuales se calculan bien
- [ ] El frontend muestra las métricas correctamente

---

## 📝 Notas

- El endpoint detecta automáticamente el plan del negocio
- Las métricas se calculan en tiempo real (no hay cache)
- Los valores de moneda están en ARS (pesos argentinos)
- Las variaciones se calculan comparando con el mes anterior

