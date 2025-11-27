# 📋 Features del Panel de Clientes - Milo Bookings

Este documento lista todas las funcionalidades disponibles en el panel de administración de clientes, organizadas por categorías para facilitar la definición de planes de suscripción.

---

## 🏠 1. DASHBOARD

### Features Básicas
- **Vista general de estadísticas**
  - Total de servicios configurados
  - Total de servicios activos
  - Total de reservas
  - Reservas pendientes
  - Reservas confirmadas

- **Reservas recientes**
  - Lista de las últimas 5 reservas
  - Información básica: servicio, cliente, fecha, hora, estado
  - Enlace rápido a la vista completa de reservas

- **Acciones rápidas**
  - Botón para crear nuevo servicio
  - Botón para ver todas las reservas

**Disponibilidad:** ✅ Todos los planes

---

## 🛎️ 2. GESTIÓN DE SERVICIOS

### Features Básicas
- **Listar servicios**
  - Tabla con todos los servicios del negocio
  - Información: nombre, descripción, duración, precio, estado
  - Ordenamiento por orden de visualización

- **Crear servicio**
  - Nombre del servicio (requerido)
  - Descripción (opcional)
  - Duración en minutos (requerido)
  - Precio en ARS (requerido)
  - Orden de visualización (opcional)

- **Editar servicio**
  - Modificar todos los campos del servicio
  - Actualización en tiempo real

- **Activar/Desactivar servicio**
  - Toggle para activar o desactivar servicios
  - Los servicios inactivos no aparecen en el bot

- **Eliminar servicio**
  - Eliminación permanente con confirmación
  - Validación de reservas asociadas

**Disponibilidad:** ✅ Todos los planes

**Límites sugeridos para planes:**
- **Plan Básico:** Hasta 5 servicios activos
- **Plan Plus:** Servicios ilimitados

---

## 📅 3. GESTIÓN DE RESERVAS

### Features Básicas
- **Listar reservas**
  - Tabla completa con todas las reservas
  - Información: cliente, servicio, fecha, hora, monto, estado, estado de pago
  - Filtros por estado y fecha

- **Filtros avanzados**
  - Filtro por estado (pendiente, pago pendiente, confirmada, cancelada, completada)
  - Filtro por fecha específica
  - Combinación de filtros

- **Cambiar estado de reserva**
  - Dropdown para cambiar estado
  - Estados disponibles: pendiente, pago pendiente, confirmada, cancelada, completada
  - Actualización inmediata

- **Ver detalles de reserva**
  - Información completa del cliente
  - Detalles del servicio
  - Información de pago (si aplica)
  - Obra social y coseguro (si aplica - Plan Plus)

- **Eliminar reserva**
  - Eliminación permanente con confirmación
  - Historial de reservas eliminadas (futuro)

**Disponibilidad:** ✅ Todos los planes

**Features adicionales sugeridas para planes superiores:**
- **Plan Plus:** Exportación de reservas a CSV/Excel
- **Plan Premium:** Reportes y analytics de reservas
- **Plan Premium:** Notificaciones automáticas de reservas

---

## ⏰ 4. GESTIÓN DE HORARIOS Y DISPONIBILIDAD

### Features Básicas
- **Horarios de trabajo**
  - Configuración de horarios por día de la semana
  - Apertura y cierre por día
  - Activar/desactivar días completos
  - Guardado automático de cambios
  - 7 días de la semana configurables

- **Bloques de disponibilidad**
  - Bloquear horarios específicos (feriados, días cerrados, etc.)
  - Configuración de fecha, hora inicio y hora fin
  - Lista de horarios bloqueados
  - Eliminación de bloques

**Disponibilidad:** ✅ Todos los planes

**Límites sugeridos para planes:**
- **Plan Básico:** Hasta 10 bloques de disponibilidad simultáneos
- **Plan Plus:** Bloques ilimitados
- **Plan Premium:** Calendario visual interactivo (futuro)

---

## 🤖 5. CONFIGURACIÓN DEL BOT DE WHATSAPP

### Features Básicas
- **Mensajes personalizables**
  - Mensaje de bienvenida
  - Mensaje de confirmación de reserva
  - Instrucciones de pago
  - Mensaje de recordatorio (para futuras implementaciones)
  - Vista previa de mensajes en tiempo real

- **Estado del bot**
  - Visualización del estado de conexión del bot
  - Indicador de conexión/desconexión
  - (Solo visible para super admin en AdminBusinesses)

**Disponibilidad:** ✅ Todos los planes

**Features adicionales sugeridas:**
- **Plan Plus:** Plantillas de mensajes avanzadas con variables dinámicas
- **Plan Premium:** Respuestas automáticas personalizadas
- **Plan Premium:** Integración con múltiples números de WhatsApp (futuro)

---

## 💳 6. INTEGRACIÓN DE PAGOS (MERCADOPAGO)

### Features Básicas
- **Configuración de credenciales**
  - Public Key (requerido)
  - Access Token (requerido)
  - Refresh Token (opcional)
  - User ID (opcional)
  - Indicador de fuente (negocio o global)

- **Estado de pagos**
  - Visualización de estado de configuración
  - Indicador de pagos habilitados/deshabilitados
  - Información de credenciales activas

- **Gestión de pagos en reservas**
  - Estado de pago por reserva (pendiente, pagado, reembolsado)
  - Link de pago generado automáticamente
  - Webhook para actualización automática de estado

**Disponibilidad:** ✅ Todos los planes

**Features adicionales sugeridas:**
- **Plan Plus:** Reportes de pagos y transacciones
- **Plan Premium:** Múltiples métodos de pago (transferencia, efectivo, etc.)
- **Plan Premium:** Facturación automática

---

## 🏥 7. SISTEMA DE COSEGURO (PLAN PLUS)

### Features Premium
- **Habilitar/Deshabilitar sistema de coseguro**
  - Toggle para activar funcionalidad de coseguro
  - Específico para consultorios médicos

- **Gestión de obras sociales**
  - Crear obra social
  - Editar obra social
  - Eliminar obra social
  - Activar/Desactivar obra social
  - Tabla completa de obras sociales configuradas

- **Configuración de coseguros**
  - Nombre de la obra social
  - Monto de coseguro en ARS
  - Orden de visualización

- **Integración con bot**
  - El bot pregunta por obra social durante la reserva
  - Cálculo automático de monto total (servicio + coseguro)
  - Resumen con obra social y coseguro antes de confirmar

**Disponibilidad:** ⭐ **Solo Plan Plus y superiores**

**Límites sugeridos:**
- **Plan Plus:** Hasta 20 obras sociales
- **Plan Premium:** Obras sociales ilimitadas

---

## 👥 8. FUNCIONALIDADES DE SUPER ADMIN

### Features Administrativas
- **Gestión de negocios** (solo super admin)
  - Listar todos los negocios del sistema
  - Crear nuevos negocios
  - Editar información de negocios
  - Activar/Desactivar negocios
  - Eliminar negocios

- **Gestión de bots de WhatsApp** (solo super admin)
  - Ver estado de conexión de cada bot
  - Ver y escanear QR code para conectar bot
  - Reconectar bot (generar nuevo QR)
  - Ver información del bot (WID, pushname, platform)

- **Configuración del sistema** (solo super admin)
  - Precio de suscripción global
  - Configuración de planes
  - Configuración de límites por plan

**Disponibilidad:** 🔒 **Solo Super Administradores del sistema**

---

## 📊 9. FEATURES ADICIONALES (FUTURAS)

### Features Sugeridas para Planes Superiores

#### Plan Plus
- ✅ Sistema de coseguro (ya implementado)
- 📧 Notificaciones por email
- 📱 Notificaciones push
- 📈 Reportes básicos de reservas
- 🔄 Sincronización con calendario externo (Google Calendar, Outlook)

#### Plan Premium
- 📊 Analytics avanzados y dashboards personalizados
- 📅 Calendario visual interactivo
- 👥 Múltiples usuarios/empleados con roles
- 🔔 Recordatorios automáticos a clientes
- 💬 Chat integrado con clientes
- 📤 Exportación de datos (CSV, Excel, PDF)
- 🎨 Personalización de marca (logos, colores)
- 🔗 Integración con múltiples plataformas
- 📱 App móvil nativa
- 🌐 Múltiples idiomas
- 📝 Notas y comentarios en reservas
- 🏷️ Etiquetas y categorías de servicios
- ⏱️ Tiempos de preparación entre servicios
- 📸 Galería de imágenes para servicios

---

## 🎯 RESUMEN POR PLAN SUGERIDO

### Plan Básico
- ✅ Dashboard con estadísticas básicas
- ✅ Gestión de servicios (hasta 5 activos)
- ✅ Gestión de reservas completa
- ✅ Horarios de trabajo y disponibilidad (hasta 10 bloques)
- ✅ Configuración de mensajes del bot
- ✅ Integración de pagos MercadoPago
- ❌ Sistema de coseguro
- ❌ Reportes avanzados
- ❌ Exportación de datos

### Plan Plus
- ✅ Todo lo del Plan Básico
- ✅ Servicios ilimitados
- ✅ Bloques de disponibilidad ilimitados
- ✅ **Sistema de coseguro (hasta 20 obras sociales)**
- ✅ Reportes básicos
- ✅ Exportación a CSV/Excel
- ✅ Notificaciones por email
- ❌ Analytics avanzados
- ❌ Múltiples usuarios

### Plan Premium
- ✅ Todo lo del Plan Plus
- ✅ Obras sociales ilimitadas
- ✅ Analytics avanzados
- ✅ Múltiples usuarios/empleados
- ✅ Calendario visual interactivo
- ✅ Personalización de marca
- ✅ App móvil
- ✅ Integraciones avanzadas
- ✅ Recordatorios automáticos

---

## 📝 NOTAS IMPORTANTES

1. **Features marcadas con ✅** están implementadas actualmente
2. **Features marcadas con 📧, 📱, etc.** son sugerencias para futuras implementaciones
3. **Features marcadas con ⭐** son exclusivas de Plan Plus o superiores
4. **Features marcadas con 🔒** son solo para super administradores del sistema
5. Los límites sugeridos son orientativos y pueden ajustarse según necesidades de negocio

---

**Última actualización:** Diciembre 2024
**Versión del sistema:** 1.0.0

