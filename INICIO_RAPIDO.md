# ⚡ Inicio Rápido - Migración Bot Multi-Negocio

## 🎯 **Resumen en 3 Pasos**

1. **Obtener credenciales de Meta** → [Ver Paso 1](#paso-1-obtener-credenciales-de-meta)
2. **Configurar en Vercel** → [Ver Paso 2](#paso-2-configurar-variables-en-vercel)
3. **Desactivar bots en Render** → [Ver Paso 7](#paso-7-desactivar-bots-en-render)

## 📚 **Guía Completa**

Para la guía detallada paso a paso, ve a: **[GUIA_COMPLETA_PASO_A_PASO.md](./GUIA_COMPLETA_PASO_A_PASO.md)**

## 🚀 **Comandos Rápidos**

### Ejecutar Migraciones
```bash
cd backend
npm run db:migrate
```

### Migrar Businesses a Clients
```bash
cd backend
npm run migrate:businesses-to-clients
```

### Verificar Variables en Vercel
1. Vercel Dashboard → Settings → Environment Variables
2. Deberías tener:
   - `WHATSAPP_VERIFY_TOKEN`
   - `WHATSAPP_PHONE_NUMBER_ID`
   - `WHATSAPP_ACCESS_TOKEN`
   - `WHATSAPP_NUMBER`
   - `DATABASE_URL`

### Desactivar Bots en Render
1. Render Dashboard → Environment
2. Agregar: `USE_META_WHATSAPP_API=true`
3. Reiniciar servicio

## ✅ **Checklist Rápido**

- [ ] Credenciales de Meta obtenidas
- [ ] Variables configuradas en Vercel
- [ ] Webhook configurado en Meta
- [ ] Migraciones ejecutadas
- [ ] Businesses migrados a clients
- [ ] Shortlink probado
- [ ] Bot responde mensajes
- [ ] Bots desactivados en Render
- [ ] Memoria bajó en Render

## 🆘 **Problemas Comunes**

### Webhook no se verifica
→ Verifica que `WHATSAPP_VERIFY_TOKEN` coincida exactamente

### Bot no responde
→ Verifica que `WHATSAPP_ACCESS_TOKEN` no esté expirado

### Shortlinks no funcionan
→ Verifica que el cliente exista en la BD con el slug correcto

---

**¿Necesitas ayuda?** Sigue la [Guía Completa](./GUIA_COMPLETA_PASO_A_PASO.md) paso a paso.

