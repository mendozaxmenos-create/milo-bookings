# 📊 Métricas del Dashboard - Planes Premium

## 📋 Resumen Ejecutivo

Este documento detalla las métricas que se pueden incorporar al dashboard de usuario, organizadas por plan de suscripción. Las métricas están diseñadas para proporcionar valor real a los negocios y justificar la suscripción premium.

---

## 🎯 PLAN BÁSICO (Actual - Gratis o $0-29/mes)

### Métricas Actuales ✅
- Total de servicios
- Servicios activos
- Total de reservas
- Reservas pendientes
- Reservas confirmadas

### Métricas Adicionales Propuestas (Básicas)

#### 1. **Reservas del Día**
- **Qué muestra:** Número de reservas programadas para hoy
- **Valor:** Permite ver rápidamente la carga de trabajo del día
- **Implementación:** Fácil (filtro por fecha = hoy)
- **Prioridad:** Alta

#### 2. **Reservas de la Semana**
- **Qué muestra:** Número de reservas en los próximos 7 días
- **Valor:** Planificación semanal
- **Implementación:** Fácil
- **Prioridad:** Media

#### 3. **Reservas Completadas**
- **Qué muestra:** Total de reservas con estado "completed"
- **Valor:** Mide éxito operativo
- **Implementación:** Fácil
- **Prioridad:** Alta

#### 4. **Reservas Canceladas**
- **Qué muestra:** Total de reservas canceladas
- **Valor:** Identifica problemas (alta tasa de cancelación)
- **Implementación:** Fácil
- **Prioridad:** Media

---

## 🚀 PLAN INTERMEDIO ($49-79/mes)

### Métricas Financieras 💰

#### 1. **Ingresos Totales**
- **Qué muestra:** Suma de todos los pagos confirmados (status = 'paid')
- **Valor:** Métrica clave de negocio
- **Cálculo:** `SUM(amount) WHERE payment_status = 'paid'`
- **Visualización:** Card grande con icono de dinero
- **Prioridad:** Muy Alta

#### 2. **Ingresos del Mes Actual**
- **Qué muestra:** Ingresos generados en el mes en curso
- **Valor:** Seguimiento mensual de ingresos
- **Cálculo:** Filtro por fecha del mes actual
- **Visualización:** Card con comparación mes anterior
- **Prioridad:** Muy Alta

#### 3. **Ingresos del Día**
- **Qué muestra:** Ingresos de reservas confirmadas hoy
- **Valor:** Seguimiento diario
- **Cálculo:** Filtro por fecha = hoy
- **Visualización:** Card pequeño
- **Prioridad:** Alta

#### 4. **Ticket Promedio**
- **Qué muestra:** Ingreso promedio por reserva
- **Valor:** Entender valor de cada cliente
- **Cálculo:** `AVG(amount) WHERE payment_status = 'paid'`
- **Visualización:** Card con icono
- **Prioridad:** Media

#### 5. **Ingresos Pendientes**
- **Qué muestra:** Monto total de reservas con pago pendiente
- **Valor:** Identificar flujo de caja esperado
- **Cálculo:** `SUM(amount) WHERE payment_status = 'pending'`
- **Visualización:** Card con color de advertencia
- **Prioridad:** Media

### Métricas de Ocupación 📅

#### 6. **Tasa de Ocupación del Mes**
- **Qué muestra:** Porcentaje de horarios ocupados vs disponibles
- **Valor:** Mide eficiencia del negocio
- **Cálculo:** `(reservas confirmadas / slots disponibles) * 100`
- **Visualización:** Progress bar o gauge
- **Prioridad:** Alta

#### 7. **Horas Ocupadas del Mes**
- **Qué muestra:** Total de horas reservadas en el mes
- **Valor:** Planificación de recursos
- **Cálculo:** `SUM(duration_minutes) / 60 WHERE status = 'confirmed'`
- **Visualización:** Card con icono de reloj
- **Prioridad:** Media

### Métricas de Servicios 🛎️

#### 8. **Servicio Más Popular**
- **Qué muestra:** Servicio con más reservas confirmadas
- **Valor:** Identificar qué servicios venden más
- **Cálculo:** `GROUP BY service_id ORDER BY COUNT(*) DESC LIMIT 1`
- **Visualización:** Card con nombre del servicio y número
- **Prioridad:** Alta

#### 9. **Servicios por Ingresos**
- **Qué muestra:** Top 3 servicios que generan más ingresos
- **Valor:** Enfocar marketing en servicios rentables
- **Cálculo:** `GROUP BY service_id ORDER BY SUM(amount) DESC LIMIT 3`
- **Visualización:** Lista o gráfico de barras
- **Prioridad:** Alta

### Métricas de Clientes 👥

#### 10. **Total de Clientes Únicos**
- **Qué muestra:** Número de teléfonos únicos que han reservado
- **Valor:** Base de clientes
- **Cálculo:** `COUNT(DISTINCT customer_phone)`
- **Visualización:** Card
- **Prioridad:** Alta

#### 11. **Clientes Recurrentes**
- **Qué muestra:** Clientes con 2+ reservas
- **Valor:** Identificar fidelidad
- **Cálculo:** `GROUP BY customer_phone HAVING COUNT(*) >= 2`
- **Visualización:** Card con porcentaje
- **Prioridad:** Media

#### 12. **Tasa de Retención**
- **Qué muestra:** Porcentaje de clientes que vuelven
- **Valor:** Mide éxito en retención
- **Cálculo:** `(clientes recurrentes / total clientes) * 100`
- **Visualización:** Progress bar
- **Prioridad:** Media

### Métricas de Corto Plazo 📈

#### 13. **Reservas de los Últimos 7 Días**
- **Qué muestra:** Gráfico de línea con reservas diarias
- **Valor:** Ver tendencia semanal
- **Visualización:** Gráfico de línea
- **Prioridad:** Alta

#### 14. **Reservas de los Últimos 30 Días**
- **Qué muestra:** Gráfico de barras mensual
- **Valor:** Ver tendencia mensual
- **Visualización:** Gráfico de barras
- **Prioridad:** Media

---

## 💎 PLAN PREMIUM ($99-149/mes)

### Métricas Avanzadas de Análisis 📊

#### 1. **Comparativa Mes Actual vs Mes Anterior**
- **Qué muestra:** 
  - Ingresos: mes actual vs anterior
  - Reservas: mes actual vs anterior
  - Variación porcentual
- **Valor:** Ver crecimiento/declive
- **Visualización:** Cards lado a lado con flechas ↑↓
- **Prioridad:** Muy Alta

#### 2. **Tendencia de Ingresos (Últimos 6 Meses)**
- **Qué muestra:** Gráfico de línea con ingresos mensuales
- **Valor:** Ver evolución a largo plazo
- **Visualización:** Gráfico de línea interactivo
- **Prioridad:** Alta

#### 3. **Tendencia de Reservas (Últimos 6 Meses)**
- **Qué muestra:** Gráfico de barras con reservas mensuales
- **Valor:** Ver patrones estacionales
- **Visualización:** Gráfico de barras
- **Prioridad:** Alta

#### 4. **Análisis de Días de la Semana**
- **Qué muestra:** Reservas por día de la semana (lun-dom)
- **Valor:** Identificar días más ocupados
- **Visualización:** Gráfico de barras
- **Prioridad:** Media

#### 5. **Análisis de Horarios Pico**
- **Qué muestra:** Reservas por hora del día
- **Valor:** Optimizar horarios de trabajo
- **Visualización:** Gráfico de barras o heatmap
- **Prioridad:** Media

### Métricas de Performance Operativa ⚡

#### 6. **Tasa de No-Show**
- **Qué muestra:** Porcentaje de reservas confirmadas que no se completaron
- **Valor:** Medir efectividad de recordatorios
- **Cálculo:** `(reservas confirmadas - completadas) / confirmadas * 100`
- **Visualización:** Progress bar con color (verde <10%, amarillo 10-20%, rojo >20%)
- **Prioridad:** Alta

#### 7. **Tiempo Promedio de Confirmación**
- **Qué muestra:** Tiempo entre creación y confirmación de reserva
- **Valor:** Medir velocidad de respuesta
- **Cálculo:** `AVG(confirmed_at - created_at)`
- **Visualización:** Card con tiempo en horas
- **Prioridad:** Baja

#### 8. **Tasa de Conversión (Reservas / Accesos a Shortlink)**
- **Qué muestra:** Porcentaje de accesos a shortlink que resultan en reserva
- **Valor:** Medir efectividad de marketing
- **Cálculo:** `(reservas / accesos_shortlink) * 100`
- **Visualización:** Progress bar
- **Prioridad:** Alta (requiere analytics de shortlinks)

#### 9. **Tasa de Cancelación**
- **Qué muestra:** Porcentaje de reservas canceladas vs total
- **Valor:** Identificar problemas
- **Cálculo:** `(canceladas / total) * 100`
- **Visualización:** Card con comparación mes anterior
- **Prioridad:** Media

### Métricas de Shortlinks 🔗

#### 10. **Total de Accesos a Shortlinks**
- **Qué muestra:** Número total de veces que se accedió a los shortlinks
- **Valor:** Medir alcance de marketing
- **Cálculo:** `COUNT(*) FROM shortlink_analytics WHERE business_id = X`
- **Visualización:** Card
- **Prioridad:** Alta

#### 11. **Shortlink Más Usado**
- **Qué muestra:** Slug del shortlink con más accesos
- **Valor:** Identificar qué canal funciona mejor
- **Cálculo:** `GROUP BY slug ORDER BY COUNT(*) DESC LIMIT 1`
- **Visualización:** Card con URL
- **Prioridad:** Media

#### 12. **Accesos a Shortlinks (Últimos 30 Días)**
- **Qué muestra:** Gráfico de línea con accesos diarios
- **Valor:** Ver tendencia de marketing
- **Visualización:** Gráfico de línea
- **Prioridad:** Media

#### 13. **Conversión Shortlink → Reserva**
- **Qué muestra:** Porcentaje de accesos que resultan en reserva
- **Valor:** ROI de marketing
- **Cálculo:** `(reservas desde shortlink / accesos) * 100`
- **Visualización:** Progress bar
- **Prioridad:** Alta

### Métricas de Clientes Avanzadas 👥

#### 14. **Cliente VIP (Más Reservas)**
- **Qué muestra:** Cliente con más reservas y monto total gastado
- **Valor:** Identificar mejores clientes
- **Cálculo:** `GROUP BY customer_phone ORDER BY COUNT(*) DESC, SUM(amount) DESC`
- **Visualización:** Card con nombre y estadísticas
- **Prioridad:** Media

#### 15. **Valor de Vida del Cliente (LTV) Promedio**
- **Qué muestra:** Ingreso promedio por cliente a lo largo del tiempo
- **Valor:** Medir valor de retención
- **Cálculo:** `AVG(SUM(amount) GROUP BY customer_phone)`
- **Visualización:** Card
- **Prioridad:** Baja

#### 16. **Distribución de Clientes por Frecuencia**
- **Qué muestra:** 
  - Nuevos (1 reserva)
  - Recurrentes (2-5 reservas)
  - VIP (6+ reservas)
- **Valor:** Segmentación de clientes
- **Visualización:** Gráfico de dona o barras apiladas
- **Prioridad:** Media

### Métricas de Obras Sociales 🏥

#### 17. **Reservas con Obra Social**
- **Qué muestra:** Número y porcentaje de reservas con obra social
- **Valor:** Entender mix de clientes
- **Cálculo:** `COUNT(*) WHERE insurance_provider_id IS NOT NULL`
- **Visualización:** Card con porcentaje
- **Prioridad:** Media (solo si tienen obras sociales habilitadas)

#### 18. **Obra Social Más Usada**
- **Qué muestra:** Obra social con más reservas
- **Valor:** Negociaciones con aseguradoras
- **Cálculo:** `GROUP BY insurance_provider_id ORDER BY COUNT(*) DESC`
- **Visualización:** Card
- **Prioridad:** Baja

### Métricas de Recursos (Multigestión) 🏢

#### 19. **Ocupación por Recurso**
- **Qué muestra:** Porcentaje de uso de cada recurso (cancha 1, 2, etc.)
- **Valor:** Optimizar asignación de recursos
- **Cálculo:** Por cada recurso, `(reservas / slots disponibles) * 100`
- **Visualización:** Gráfico de barras horizontal
- **Prioridad:** Media (solo si tienen recursos múltiples)

#### 20. **Recurso Más Solicitado**
- **Qué muestra:** Recurso con más reservas
- **Valor:** Identificar preferencias
- **Cálculo:** `GROUP BY resource_id ORDER BY COUNT(*) DESC`
- **Visualización:** Card
- **Prioridad:** Baja

---

## 📊 Visualización Propuesta del Dashboard

### Layout Sugerido

```
┌─────────────────────────────────────────────────────────┐
│  DASHBOARD - [Nombre del Negocio]                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │ Ingresos │ │ Reservas  │ │ Clientes │ │ Ocupación│  │
│  │  $XX,XXX │ │    XX     │ │    XX    │ │    XX%   │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  📈 Tendencia de Ingresos (Últimos 6 Meses)      │  │
│  │  [Gráfico de línea]                              │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────┐ ┌────────────────────────────┐  │
│  │ Servicio Más     │ │ Top 3 Servicios por Ingresos│  │
│  │ Popular          │ │ [Gráfico de barras]         │  │
│  └──────────────────┘ └────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  📊 Reservas por Día de la Semana                │  │
│  │  [Gráfico de barras]                              │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────┐ ┌────────────────────────────┐  │
│  │ Accesos          │ │ Conversión Shortlink        │  │
│  │ Shortlinks       │ │ → Reserva                   │  │
│  └──────────────────┘ └────────────────────────────┘  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Priorización de Implementación

### Fase 1: Métricas Básicas (Plan Básico) - 1 semana
1. Reservas del Día
2. Reservas Completadas
3. Reservas Canceladas

### Fase 2: Métricas Financieras (Plan Intermedio) - 2 semanas
1. Ingresos Totales
2. Ingresos del Mes Actual
3. Ingresos del Día
4. Ticket Promedio
5. Servicio Más Popular
6. Total de Clientes Únicos

### Fase 3: Métricas Avanzadas (Plan Premium) - 3 semanas
1. Comparativa Mes Actual vs Anterior
2. Tendencia de Ingresos (6 meses)
3. Tasa de No-Show
4. Total de Accesos a Shortlinks
5. Conversión Shortlink → Reserva
6. Análisis de Días de la Semana

### Fase 4: Métricas Avanzadas Adicionales - 2 semanas
1. Análisis de Horarios Pico
2. Cliente VIP
3. Distribución de Clientes
4. Ocupación por Recurso (si aplica)

---

## 💡 Valor de Negocio por Métrica

### Métricas de Alto Valor (Justifican Premium)
- ✅ **Ingresos Totales/Mensuales** - Métrica clave de negocio
- ✅ **Comparativa Mes Actual vs Anterior** - Muestra crecimiento
- ✅ **Tendencia de Ingresos** - Análisis a largo plazo
- ✅ **Tasa de Conversión Shortlink → Reserva** - ROI de marketing
- ✅ **Tasa de No-Show** - Impacta directamente ingresos

### Métricas de Valor Medio
- ⚠️ **Servicio Más Popular** - Útil para marketing
- ⚠️ **Clientes Recurrentes** - Mide retención
- ⚠️ **Tasa de Ocupación** - Optimización operativa

### Métricas de Valor Bajo (Nice to Have)
- ℹ️ **Tiempo Promedio de Confirmación** - Menos crítico
- ℹ️ **Obra Social Más Usada** - Solo para nichos específicos

---

## 🔒 Restricciones por Plan

### Plan Básico
- ✅ Métricas básicas (servicios, reservas)
- ❌ Sin métricas financieras
- ❌ Sin gráficos
- ❌ Sin comparativas

### Plan Intermedio
- ✅ Todas las métricas básicas
- ✅ Métricas financieras (ingresos, ticket promedio)
- ✅ Gráficos simples (barras, líneas)
- ✅ Comparativas básicas (mes actual vs anterior)
- ❌ Sin métricas avanzadas de análisis
- ❌ Sin métricas de shortlinks avanzadas

### Plan Premium
- ✅ Todas las métricas
- ✅ Gráficos interactivos
- ✅ Comparativas avanzadas
- ✅ Métricas de shortlinks completas
- ✅ Análisis de tendencias a largo plazo
- ✅ Exportación de reportes

---

## 📝 Notas de Implementación

1. **Performance:** Las métricas deben calcularse eficientemente (usar índices, cache cuando sea posible)
2. **Caching:** Considerar cachear métricas que no cambian frecuentemente (ej: ingresos del mes anterior)
3. **Lazy Loading:** Cargar gráficos pesados solo cuando el usuario los vea
4. **Filtros de Fecha:** Permitir cambiar período de análisis (últimos 7 días, 30 días, 6 meses, etc.)
5. **Exportación:** En plan premium, permitir exportar métricas a PDF/Excel

---

## 🚀 Próximos Pasos

1. ✅ Definir métricas prioritarias
2. ⏳ Crear endpoints de API para métricas
3. ⏳ Implementar componentes de visualización
4. ⏳ Agregar restricciones por plan
5. ⏳ Testing y optimización

---

**Última actualización:** 28 de Noviembre 2025

