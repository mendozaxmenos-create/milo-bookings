# 🌐 Configurar Dominio de Shortlinks - Paso a Paso

## 📋 Objetivo

Configurar el dominio `go.soymilo.com` para que los shortlinks funcionen correctamente.

---

## ✅ Paso 1: Configurar Dominio en Vercel

### 1.1 Agregar Dominio en Vercel

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto (probablemente `milo-bookings-admin-panel` o similar)
3. Ve a **Settings** → **Domains**
4. Haz clic en **"Add Domain"**
5. Ingresa: `go.soymilo.com`
6. Haz clic en **"Add"**

### 1.2 Configurar DNS

Vercel te mostrará las instrucciones. Tienes dos opciones:

#### Opción A: Usar Vercel DNS (Recomendado - Más fácil)

1. Vercel te dará nameservers (ej: `ns1.vercel-dns.com`, `ns2.vercel-dns.com`)
2. Ve a tu proveedor de dominio (donde compraste `soymilo.com`)
3. Cambia los nameservers a los que Vercel te proporcionó
4. Espera 24-48 horas para que se propague

#### Opción B: Usar DNS de tu Proveedor Actual

1. Vercel te dará un registro **CNAME** o **A Record**
2. Ve a tu proveedor de dominio → **DNS Management**
3. Agrega el registro:
   - **Tipo**: CNAME (o A según lo que Vercel indique)
   - **Nombre**: `go` (o `go.soymilo.com` según tu proveedor)
   - **Valor**: El que Vercel te da (ej: `cname.vercel-dns.com`)
4. Espera 5-60 minutos para que se propague

### 1.3 Verificar

1. Vercel verificará automáticamente cuando el DNS esté configurado
2. Verás un check ✅ verde cuando esté listo
3. El dominio `go.soymilo.com` ahora apunta a tu proyecto en Vercel

---

## ✅ Paso 2: Agregar Variable en Render

### 2.1 Agregar Variable de Entorno

1. Ve a [Render Dashboard](https://dashboard.render.com)
2. Selecciona tu servicio web (probablemente `milo-bookings`)
3. Ve a **Environment** → **Environment Variables**
4. Haz clic en **"Add Environment Variable"**
5. Agrega:
   - **Key**: `SHORTLINK_BASE_URL`
   - **Value**: `https://go.soymilo.com`
6. Haz clic en **"Save Changes"**

### 2.2 Forzar Redeploy

1. En Render, ve a **Manual Deploy** → **Deploy latest commit**
2. O simplemente espera el próximo auto-deploy
3. Esto aplicará la nueva variable de entorno

---

## ✅ Paso 3: Probar Flujo Completo

### 3.1 Crear un Shortlink de Prueba

1. Inicia sesión en el panel de administración
2. Ve a **Shortlinks**
3. Crea un nuevo shortlink:
   - **Nombre**: `Prueba`
   - **Slug**: `prueba-test`
4. Haz clic en **"Crear"**

### 3.2 Verificar URL Generada

Después de crear, deberías ver una URL como:
```
https://go.soymilo.com/prueba-test
```

### 3.3 Generar QR

1. Haz clic en **"Ver QR"** del shortlink creado
2. Deberías ver un código QR
3. Escanea el QR con tu teléfono

### 3.4 Probar Redirección

1. Abre el QR escaneado o visita directamente: `https://go.soymilo.com/prueba-test`
2. Deberías ser redirigido a WhatsApp con el mensaje inicial
3. Verifica que el mensaje contenga el slug del shortlink

---

## ✅ Paso 4: Verificar en el Backend

### 4.1 Verificar Variable de Entorno

Puedes verificar que la variable está configurada correctamente:

1. En Render, ve a **Logs**
2. Busca logs que muestren la URL generada
3. Deberías ver URLs con `https://go.soymilo.com/` en lugar del fallback

### 4.2 Probar Endpoint de API

```bash
# Obtener token de autenticación primero
curl -X GET https://milo-bookings.onrender.com/api/shortlinks \
  -H "Authorization: Bearer TU_TOKEN"
```

Deberías ver las URLs con el dominio correcto.

---

## 🐛 Troubleshooting

### Problema: El dominio no se verifica en Vercel

**Solución:**
- Verifica que los nameservers o registros DNS estén configurados correctamente
- Espera más tiempo (puede tardar hasta 48 horas)
- Verifica en [whatsmydns.net](https://www.whatsmydns.net) que el DNS se haya propagado

### Problema: Los shortlinks siguen usando el fallback

**Solución:**
- Verifica que agregaste `SHORTLINK_BASE_URL` en Render
- Asegúrate de hacer un redeploy en Render después de agregar la variable
- Verifica los logs de Render para confirmar que la variable está disponible

### Problema: Error 404 al acceder a shortlink

**Solución:**
- Verifica que el dominio `go.soymilo.com` esté correctamente configurado en Vercel
- Verifica que el rewrite en `vercel.json` esté funcionando
- Revisa los logs de Vercel para ver errores

### Problema: Redirección a WhatsApp no funciona

**Solución:**
- Verifica que `WHATSAPP_NUMBER` esté configurado en Vercel
- Verifica que el formato del número sea correcto (sin +, solo números)
- Revisa los logs de la función serverless en Vercel

---

## 📝 Checklist Final

- [ ] Dominio `go.soymilo.com` agregado en Vercel
- [ ] DNS configurado y verificado (check verde en Vercel)
- [ ] Variable `SHORTLINK_BASE_URL=https://go.soymilo.com` agregada en Render
- [ ] Redeploy realizado en Render
- [ ] Shortlink de prueba creado
- [ ] QR generado correctamente
- [ ] Redirección a WhatsApp funciona
- [ ] URLs en el panel muestran `https://go.soymilo.com/`

---

## 🎯 Próximos Pasos

Una vez completado todo:

1. ✅ Documentar proceso para usuarios finales
2. ✅ Agregar instrucciones en el panel de administración
3. ✅ Crear guía de uso para comercios

---

**Nota**: Si no tienes el dominio `soymilo.com`, puedes usar el dominio `.vercel.app` de tu proyecto como alternativa temporal. Solo actualiza `SHORTLINK_BASE_URL` en Render con ese dominio.

