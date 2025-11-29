# 💳 Arquitectura de Pagos Centralizados - Milo Bookings

## 🎯 Objetivo

Implementar un sistema de pagos centralizado donde:
- **Una sola configuración** de MercadoPago (credenciales del super admin)
- **Sin configuración por comercio** - todos los pagos van a la cuenta centralizada
- **Transferencias automáticas** a cada comercio según su configuración
- **Sistema de comisiones** configurable para Milo Bookings

---

## 📋 Arquitectura Propuesta

### Opción 1: Marketplace con Split Payments (Recomendada)

**Cómo funciona:**
1. Todos los pagos se reciben en la cuenta centralizada de Milo Bookings
2. MercadoPago automáticamente divide el pago:
   - X% para el comercio
   - Y% para Milo Bookings (comisión)
3. Los fondos se transfieren automáticamente a cada parte

**Ventajas:**
- ✅ Transferencias automáticas e instantáneas
- ✅ Sin intervención manual
- ✅ Cumple con regulaciones de MercadoPago
- ✅ Cada comercio recibe directamente en su cuenta

**Desventajas:**
- ⚠️ Requiere que cada comercio tenga cuenta de MercadoPago (pero puede ser solo para recibir, no para configurar)

**Implementación:**
- Usar MercadoPago Marketplace API
- Configurar "sellers" (comercios) en la cuenta centralizada
- Cada pago se divide automáticamente

---

### Opción 2: Sistema de Disbursements Automáticos

**Cómo funciona:**
1. Todos los pagos se reciben en la cuenta centralizada
2. El sistema registra cuánto corresponde a cada comercio
3. Se programan transferencias automáticas (diarias/semanales) usando Disbursements API
4. Cada comercio configura su cuenta bancaria o cuenta de MercadoPago para recibir

**Ventajas:**
- ✅ Control total sobre cuándo y cómo transferir
- ✅ Puede incluir comisiones variables
- ✅ No requiere que cada comercio tenga cuenta de MercadoPago activa

**Desventajas:**
- ⚠️ Requiere implementar lógica de transferencias
- ⚠️ Puede haber delays en las transferencias

**Implementación:**
- Usar MercadoPago Disbursements API
- Job programado (cron) para procesar transferencias
- Tabla de `payouts` para rastrear transferencias

---

### Opción 3: Híbrida - Registro + Transferencias Manuales/Semi-automáticas

**Cómo funciona:**
1. Todos los pagos se reciben en la cuenta centralizada
2. El sistema registra automáticamente:
   - Monto total del pago
   - Monto que corresponde al comercio (después de comisión)
   - Estado de la transferencia
3. Panel de super admin para:
   - Ver todos los pagos pendientes de transferencia
   - Transferir manualmente o en lote
   - Configurar transferencias automáticas por comercio

**Ventajas:**
- ✅ Máxima flexibilidad
- ✅ Control total del super admin
- ✅ Puede funcionar sin que comercios tengan cuenta de MercadoPago
- ✅ Permite transferencias bancarias directas

**Desventajas:**
- ⚠️ Requiere más desarrollo
- ⚠️ Puede requerir intervención manual

---

## 🏗️ Implementación Recomendada: Opción 3 (Híbrida)

### Fase 1: Sistema de Registro de Pagos

#### 1.1 Nueva Tabla: `payment_payouts`

```sql
CREATE TABLE payment_payouts (
  id VARCHAR PRIMARY KEY,
  booking_id VARCHAR NOT NULL REFERENCES bookings(id),
  business_id VARCHAR NOT NULL REFERENCES businesses(id),
  payment_id VARCHAR NOT NULL, -- ID de MercadoPago
  total_amount DECIMAL(10,2) NOT NULL, -- Monto total recibido
  business_amount DECIMAL(10,2) NOT NULL, -- Monto que corresponde al comercio
  commission_amount DECIMAL(10,2) NOT NULL, -- Comisión de Milo Bookings
  commission_percentage DECIMAL(5,2) NOT NULL DEFAULT 5.00, -- % de comisión
  status VARCHAR NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
  payout_method VARCHAR, -- 'mercadopago', 'bank_transfer', 'manual'
  payout_reference VARCHAR, -- Referencia de la transferencia
  payout_date TIMESTAMP, -- Fecha de transferencia
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 1.2 Modificar `PaymentConfigService`

```javascript
// Siempre usar credenciales globales (no por comercio)
static async getCredentials(businessId) {
  const envAccessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  const envPublicKey = process.env.MERCADOPAGO_PUBLIC_KEY;

  if (envAccessToken && envPublicKey) {
    return {
      accessToken: envAccessToken,
      publicKey: envPublicKey,
      source: 'centralized', // Nueva fuente
    };
  }

  return null;
}
```

#### 1.3 Nuevo Servicio: `PayoutService`

```javascript
// backend/src/services/payoutService.js
export class PayoutService {
  // Calcular comisión y monto para el comercio
  static calculatePayout(totalAmount, commissionPercentage = 5.0) {
    const commission = (totalAmount * commissionPercentage) / 100;
    const businessAmount = totalAmount - commission;
    
    return {
      totalAmount,
      commissionAmount: commission,
      businessAmount,
      commissionPercentage,
    };
  }

  // Crear registro de payout cuando se recibe un pago
  static async createPayout(booking, payment) {
    const commissionPercentage = await this.getCommissionForBusiness(booking.business_id);
    const payout = this.calculatePayout(booking.amount, commissionPercentage);
    
    return PaymentPayout.create({
      booking_id: booking.id,
      business_id: booking.business_id,
      payment_id: payment.id,
      ...payout,
      status: 'pending',
    });
  }

  // Obtener comisión configurada para un negocio
  static async getCommissionForBusiness(businessId) {
    // Puede venir de business_settings o ser global
    const settings = await BusinessSettings.findByBusiness(businessId);
    return settings?.commission_percentage || process.env.DEFAULT_COMMISSION_PERCENTAGE || 5.0;
  }

  // Procesar transferencia a un comercio
  static async processPayout(payoutId) {
    const payout = await PaymentPayout.findById(payoutId);
    
    // Opción 1: Transferir a cuenta de MercadoPago del comercio
    if (payout.business_mercadopago_account) {
      return this.transferToMercadoPago(payout);
    }
    
    // Opción 2: Transferir a cuenta bancaria
    if (payout.business_bank_account) {
      return this.transferToBank(payout);
    }
    
    // Opción 3: Marcar para transferencia manual
    return this.markForManualTransfer(payout);
  }
}
```

#### 1.4 Modificar Webhook de Pagos

```javascript
// En backend/src/api/routes/payments.js
router.post('/mercadopago/webhook', async (req, res) => {
  // ... código existente para actualizar booking ...
  
  // Si el pago fue aprobado, crear registro de payout
  if (mpStatus === 'approved') {
    const commissionPercentage = await PayoutService.getCommissionForBusiness(businessId);
    const payout = PayoutService.calculatePayout(booking.amount, commissionPercentage);
    
    await PaymentPayout.create({
      booking_id: booking.id,
      business_id: businessId,
      payment_id: paymentId,
      ...payout,
      status: 'pending',
    });
    
    console.log('[Webhook] Payout created:', {
      bookingId: booking.id,
      businessAmount: payout.businessAmount,
      commissionAmount: payout.commissionAmount,
    });
  }
  
  // ... resto del código ...
});
```

### Fase 2: Panel de Administración de Payouts

#### 2.1 Nueva Ruta: `/api/admin/payouts`

```javascript
// GET /api/admin/payouts - Listar todos los payouts
// GET /api/admin/payouts/:businessId - Payouts de un negocio específico
// POST /api/admin/payouts/:payoutId/process - Procesar transferencia
// POST /api/admin/payouts/batch-process - Procesar múltiples transferencias
```

#### 2.2 Frontend: Panel de Payouts

- Lista de pagos pendientes de transferencia
- Filtros por negocio, fecha, estado
- Botón para procesar transferencias individuales o en lote
- Dashboard con estadísticas:
  - Total pendiente de transferir
  - Total transferido
  - Comisiones recaudadas

### Fase 3: Configuración de Comercios

#### 3.1 Agregar campos a `businesses` o `business_settings`

```sql
ALTER TABLE business_settings ADD COLUMN commission_percentage DECIMAL(5,2) DEFAULT 5.00;
ALTER TABLE business_settings ADD COLUMN payout_method VARCHAR DEFAULT 'manual';
ALTER TABLE business_settings ADD COLUMN mercadopago_account_id VARCHAR;
ALTER TABLE business_settings ADD COLUMN bank_account_details JSONB;
```

#### 3.2 Panel de Configuración

- Cada comercio puede configurar (opcional):
  - Método de pago preferido (MercadoPago, transferencia bancaria)
  - Cuenta de MercadoPago (si quiere recibir automáticamente)
  - Datos bancarios (si prefiere transferencia bancaria)

### Fase 4: Automatización (Opcional)

#### 4.1 Job Programado para Transferencias Automáticas

```javascript
// backend/src/jobs/payoutProcessor.js
export async function processPendingPayouts() {
  const pendingPayouts = await PaymentPayout.findPending();
  
  for (const payout of pendingPayouts) {
    const business = await Business.findById(payout.business_id);
    const settings = await BusinessSettings.findByBusiness(payout.business_id);
    
    // Solo procesar si el comercio tiene método automático configurado
    if (settings.payout_method === 'automatic') {
      try {
        await PayoutService.processPayout(payout.id);
      } catch (error) {
        console.error(`Error processing payout ${payout.id}:`, error);
      }
    }
  }
}

// Ejecutar diariamente a las 2 AM
cron.schedule('0 2 * * *', processPendingPayouts);
```

---

## 🔧 Configuración Requerida

### Variables de Entorno

```env
# Credenciales centralizadas de MercadoPago
MERCADOPAGO_ACCESS_TOKEN=tu_access_token_centralizado
MERCADOPAGO_PUBLIC_KEY=tu_public_key_centralizado

# Comisión por defecto (5%)
DEFAULT_COMMISSION_PERCENTAGE=5.0

# Habilitar transferencias automáticas
ENABLE_AUTOMATIC_PAYOUTS=false
```

### Configuración por Comercio (Opcional)

Cada comercio puede configurar en su panel:
- **Método de pago**: Manual, Automático (MercadoPago), Automático (Bancario)
- **Cuenta de MercadoPago**: Si quiere recibir automáticamente
- **Datos bancarios**: Si prefiere transferencia bancaria

---

## 📊 Flujo Completo

1. **Cliente hace reserva con pago**
   - Bot genera link de MercadoPago usando credenciales centralizadas
   - Cliente paga → Pago se recibe en cuenta centralizada

2. **Webhook recibe notificación**
   - Actualiza estado de booking
   - Crea registro de `payment_payout` con:
     - Monto total
     - Monto para comercio (después de comisión)
     - Comisión de Milo Bookings

3. **Super Admin ve payout pendiente**
   - En panel de administración
   - Puede procesar transferencia manual o automática

4. **Transferencia al comercio**
   - Si tiene cuenta de MercadoPago configurada → Transferencia automática
   - Si tiene datos bancarios → Transferencia bancaria
   - Si no tiene nada → Marcar para transferencia manual

---

## 🎯 Ventajas de esta Solución

1. ✅ **Una sola configuración**: Solo necesitas credenciales globales
2. ✅ **Sin configuración por comercio**: Funciona automáticamente
3. ✅ **Flexible**: Los comercios pueden optar por recibir automáticamente si quieren
4. ✅ **Control total**: Super admin decide cuándo y cómo transferir
5. ✅ **Comisiones configurables**: Puedes ajustar comisión por comercio o globalmente
6. ✅ **Rastreable**: Todos los pagos y transferencias quedan registrados

---

## 🚀 Próximos Pasos

1. Crear migración para tabla `payment_payouts`
2. Crear modelo `PaymentPayout`
3. Crear servicio `PayoutService`
4. Modificar webhook para crear payouts
5. Crear rutas API para administración de payouts
6. Crear panel frontend para gestión de payouts
7. Implementar job programado para transferencias automáticas (opcional)

---

**¿Quieres que implemente esta solución?**



