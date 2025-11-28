# 🔗 Configurar Dominio de Shortlinks en Vercel

## 📋 Objetivo

Configurar un dominio personalizado (ej: `go.soymilo.com`) para los shortlinks, de manera que:
- Los shortlinks sean más profesionales
- Las rutas cortas funcionen (ej: `go.soymilo.com/monpatisserie`)
- Los rewrites funcionen correctamente

---

## 🎯 Paso 1: Configurar Dominio en Vercel

### 1.1 Agregar Dominio Personalizado

1. Ve a **Vercel Dashboard** → Tu proyecto `milo-bookings-admin-panel`
2. Ve a **Settings** → **Domains**
3. Haz clic en **"Add Domain"** o **"Agregar Dominio"**
4. Ingresa tu dominio: `go.soymilo.com` (o el que prefieras)
5. Haz clic en **"Add"**

### 1.2 Configurar DNS

Vercel te dará instrucciones para configurar DNS. Necesitarás agregar un registro CNAME:

**Registro CNAME:**
- **Name**: `go` (o el subdominio que prefieras)
- **Value**: `cname.vercel-dns.com` (o el que Vercel te indique)
- **TTL**: 3600 (o el que recomiende tu proveedor DNS)

**O si prefieres usar A record:**
- Vercel te dará direcciones IP específicas

### 1.3 Verificar Dominio

1. Espera a que Vercel verifique el dominio (puede tardar unos minutos)
2. Una vez verificado, verás ✅ junto al dominio

---

## 🔧 Paso 2: Configurar Variable de Entorno

### 2.1 En Vercel

1. Ve a **Settings** → **Environment Variables**
2. Agrega:
   - **Key**: `SHORTLINK_BASE_URL`
   - **Value**: `https://go.soymilo.com` (o tu dominio)
   - **Environments**: Production, Preview, Development (todas)
3. Haz clic en **"Save"**

### 2.2 Verificar en el Código

El código ya está preparado para usar esta variable:
- `frontend/admin-panel/api/shortlink.js` - Usa `process.env.SHORTLINK_BASE_URL`
- `frontend/admin-panel/api/shortlinks.js` - Usa `process.env.SHORTLINK_BASE_URL`

---

## 📝 Paso 3: Verificar Rewrites en vercel.json

El archivo `vercel.json` ya está configurado con los rewrites necesarios:

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    },
    {
      "source": "/:slug([a-z0-9-]+)",
      "destination": "/api/shortlink?slug=:slug"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**Esto permite:**
- `go.soymilo.com/monpatisserie` → `/api/shortlink?slug=monpatisserie`
- `go.soymilo.com/api/shortlinks` → `/api/shortlinks`
- Rutas del frontend funcionan normalmente

---

## ✅ Paso 4: Probar Shortlinks

### 4.1 Crear un Shortlink desde el Panel

1. Inicia sesión como Super Admin
2. Ve a **Shortlinks** en el menú lateral
3. Haz clic en **"+ Crear Shortlink"**
4. Completa:
   - **Nombre**: Ej: "Mon Patisserie"
   - **Slug**: Ej: `monpatisserie`
   - **Business ID**: (Opcional)
5. Haz clic en **"Crear Shortlink"**

### 4.2 Probar el Shortlink

1. Copia el shortlink generado (ej: `https://go.soymilo.com/monpatisserie`)
2. Ábrelo en tu navegador o desde un celular
3. Debería redirigir a WhatsApp con el mensaje `monpatisserie`
4. El bot debería recibir el mensaje y crear la sesión

---

## 🎯 Paso 5: Configurar WhatsApp Number en Variables

### 5.1 En Vercel (Serverless Functions)

Las serverless functions de Vercel necesitan acceso a la base de datos y al número de WhatsApp.

1. Ve a **Settings** → **Environment Variables**
2. Agrega:
   - **Key**: `WHATSAPP_NUMBER`
   - **Value**: Tu número de WhatsApp sin `+` (ej: `5491123456789`)
   - **Environments**: Production, Preview, Development
3. Agrega también:
   - **Key**: `DATABASE_URL`
   - **Value**: La misma URL que usas en Render (Internal Database URL)
   - **Environments**: Production, Preview, Development

**Nota**: Las serverless functions de Vercel necesitan acceso a la base de datos para verificar clientes.

---

## 🔍 Verificación Final

### Checklist

- [ ] Dominio `go.soymilo.com` agregado en Vercel
- [ ] DNS configurado correctamente
- [ ] Dominio verificado en Vercel (✅ verde)
- [ ] Variable `SHORTLINK_BASE_URL` configurada en Vercel
- [ ] Variable `WHATSAPP_NUMBER` configurada en Vercel
- [ ] Variable `DATABASE_URL` configurada en Vercel (para serverless functions)
- [ ] `vercel.json` tiene los rewrites correctos
- [ ] Redeploy realizado después de configurar variables
- [ ] Shortlink creado desde el panel
- [ ] Shortlink probado y funciona correctamente

---

## 🐛 Troubleshooting

### Problema: El shortlink no redirige

**Solución:**
- Verifica que el dominio esté verificado en Vercel
- Verifica que los rewrites estén en `vercel.json`
- Verifica que `SHORTLINK_BASE_URL` esté configurada
- Haz redeploy después de cambiar variables

### Problema: Error 404 al acceder al shortlink

**Solución:**
- Verifica que el rewrite esté configurado correctamente
- Verifica que el slug exista en la base de datos
- Revisa los logs de Vercel para ver errores

### Problema: El bot no recibe el mensaje

**Solución:**
- Verifica que `WHATSAPP_NUMBER` esté configurada correctamente
- Verifica que el webhook de Meta esté configurado
- Verifica que el número esté en la lista de destinatarios (modo desarrollo)

---

## 📝 Ejemplo de Uso

### Crear Shortlink

1. Super Admin → Shortlinks → "+ Crear Shortlink"
2. Nombre: "Mon Patisserie"
3. Slug: `monpatisserie`
4. Crear

### Resultado

- **Shortlink generado**: `https://go.soymilo.com/monpatisserie`
- **Redirige a**: `https://wa.me/5491123456789?text=monpatisserie`
- **Bot recibe**: Mensaje con texto `monpatisserie`
- **Bot identifica**: Cliente "Mon Patisserie"
- **Bot crea sesión**: Para ese usuario y comercio

---

## 🎉 ¡Listo!

Una vez configurado, los shortlinks estarán completamente funcionales y se podrán gestionar desde el panel de administración.

**Próximos pasos:**
- Crear shortlinks para tus comercios
- Compartir los shortlinks (QR codes, links, etc.)
- Probar el flujo completo

---

**¿Necesitas ayuda?** Revisa los logs de Vercel si hay problemas con los shortlinks.

