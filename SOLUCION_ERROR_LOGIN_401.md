# 🔐 Solución: Error 401 "Invalid Credentials" en Login

## ❌ Problema

El frontend muestra "Invalid credentials" (401) al intentar hacer login.

```
[API] Response error: 401
Failed to load resource: the server responded with a status of 401
```

## 🔍 Diagnóstico

Este error puede tener varias causas:

### 1. ❌ Los Seeds NO se Ejecutaron (Más Común)

Si es tu primer deployment o la base de datos está vacía, los usuarios demo no existen.

**Solución**: Ejecutar los seeds en producción.

### 2. ❌ Credenciales Incorrectas

El formato del teléfono o business_id puede estar mal.

**Solución**: Verificar el formato exacto de las credenciales.

### 3. ❌ Rate Limiting

Si intentaste muchas veces, el rate limiting puede estar bloqueando.

**Solución**: Esperar 15 minutos y volver a intentar.

---

## ✅ Solución Paso a Paso

### Paso 1: Verificar que los Seeds se Ejecutaron

#### En Render:

1. Ve a **Render Dashboard**: https://dashboard.render.com
2. Selecciona tu servicio: `milo-bookings`
3. Haz clic en **"Shell"** o **"Terminal"** (en el menú lateral o arriba)
4. Una vez en la terminal, ejecuta:

```bash
cd backend
npm run db:seed
```

Deberías ver:
```
Ran seed: 001_demo_data.js
Ran seed: 003_system_users.js
```

5. Verifica que los usuarios se crearon:
```bash
npm run verify:data
```

O manualmente:
```bash
cd backend
node -e "
const knex = require('knex');
const config = require('./knexfile.js');
const db = knex(config.production || config.development);

db('businesses').select('*').then(rows => {
  console.log('Businesses:', rows);
  return db('business_users').select('*');
}).then(rows => {
  console.log('Business Users:', rows);
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
"
```

#### En Railway:

1. Ve a **Railway Dashboard**: https://railway.app
2. Selecciona tu proyecto
3. Haz clic en el servicio backend
4. Ve a la pestaña **"Deployments"** → Haz clic en el último deployment → **"View Logs"**
5. Busca los logs de inicio - deberías ver:
   ```
   [SeedCheck] ✅ Ya hay datos en la base de datos
   ```
   
   Si ves:
   ```
   [SeedCheck] ⚠️  No hay datos, ejecutando seeds...
   ```
   
   Entonces los seeds se ejecutaron automáticamente.

6. Si no ves los seeds ejecutándose, haz **Manual Deploy** o ejecuta manualmente:
   - Usa Railway CLI o conecta una terminal SSH

---

### Paso 2: Verificar Credenciales Correctas

#### Para Business User (Negocio):

**Credenciales Demo:**
- **Business ID**: `demo-business-001`
  - ⚠️ **Importante**: Sin espacios, sin guiones extra, exactamente como está
- **Teléfono**: `+5491123456789`
  - ⚠️ **Importante**: 
    - Debe empezar con `+`
    - Formato internacional: `+54` (país) + `91123456789` (número)
    - Sin espacios
    - Sin paréntesis
- **Contraseña**: `demo123`
  - ⚠️ **Importante**: Todo en minúsculas, sin espacios

#### Para Super Admin:

**Credenciales:**
- **Email**: `admin@milobookings.com`
  - ⚠️ **Importante**: No uses el toggle de Super Admin si no estás usando email
- **Contraseña**: `admin123`

---

### Paso 3: Verificar Formato en el Frontend

1. Abre la consola del navegador (F12)
2. En el formulario de login, verifica que estás ingresando:
   - **Business ID**: Exactamente `demo-business-001` (copiar y pegar si es necesario)
   - **Teléfono**: Exactamente `+5491123456789` (verificar el `+` al inicio)
   - **Contraseña**: Exactamente `demo123`

3. Si ves errores de validación en la consola, significa que el formato está mal

---

### Paso 4: Verificar Backend Funciona

1. Abre en el navegador: `https://milo-bookings.onrender.com/health`
2. Deberías ver:
   ```json
   {
     "status": "ok",
     "database": "connected",
     "timestamp": "..."
   }
   ```

3. Si no responde o da error, el backend está caído o hay un problema de conexión

---

### Paso 5: Verificar Logs del Backend

#### En Render:

1. Ve a **Render Dashboard** → Tu servicio → **"Logs"**
2. Busca líneas que digan:
   ```
   [Auth] Login attempt
   [Auth] Looking for business user
   [Auth] Business user not found
   ```
   
   O:
   ```
   [Auth] Invalid password for business user
   ```

3. Estos logs te dirán exactamente qué está fallando:
   - Si dice "Business user not found": El usuario no existe (seeds no ejecutados)
   - Si dice "Invalid password": La contraseña está mal
   - Si dice "Missing business_id or phone": El formato está mal

---

### Paso 6: Probar Login Directo con API

Para diagnosticar mejor, prueba hacer login directamente con curl o Postman:

#### Opción 1: curl (en terminal)

```bash
curl -X POST https://milo-bookings.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "business_id": "demo-business-001",
    "phone": "+5491123456789",
    "password": "demo123"
  }'
```

**Si funciona**, deberías ver:
```json
{
  "token": "...",
  "user": { ... }
}
```

**Si no funciona**, verás:
```json
{
  "error": "Invalid credentials"
}
```

#### Opción 2: Postman

1. Crea una nueva request POST
2. URL: `https://milo-bookings.onrender.com/api/auth/login`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):
```json
{
  "business_id": "demo-business-001",
  "phone": "+5491123456789",
  "password": "demo123"
}
```

5. Haz clic en "Send"
6. Verifica la respuesta

---

## 🔧 Soluciones Específicas

### Solución 1: Ejecutar Seeds Manualmente

Si los seeds no se ejecutaron automáticamente:

#### En Render Shell:

```bash
cd backend
npm run db:seed
```

#### Si el comando no funciona:

```bash
cd backend
NODE_ENV=production npm run db:seed
```

#### O ejecutar directamente:

```bash
cd backend
node -e "
const knex = require('knex');
const config = require('./knexfile.js');
const db = knex(config.production);

(async () => {
  try {
    const seed1 = await import('./database/seeds/001_demo_data.js');
    await seed1.seed(db);
    console.log('✅ Seed 001 ejecutado');
    
    const seed3 = await import('./database/seeds/003_system_users.js');
    await seed3.seed(db);
    console.log('✅ Seed 003 ejecutado');
    
    await db.destroy();
    console.log('✅ Seeds completados');
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
})();
"
```

---

### Solución 2: Verificar Usuario Existe

Ejecuta en Render Shell:

```bash
cd backend
node -e "
const knex = require('knex');
const config = require('./knexfile.js');
const db = knex(config.production);

db('business_users')
  .where({ business_id: 'demo-business-001', phone: '+5491123456789' })
  .first()
  .then(user => {
    if (user) {
      console.log('✅ Usuario encontrado:', user.id);
    } else {
      console.log('❌ Usuario NO encontrado - Ejecuta los seeds');
    }
    return db.destroy();
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
"
```

---

### Solución 3: Crear Usuario Manualmente (Temporal)

Si necesitas acceso inmediato mientras arreglas los seeds:

```bash
cd backend
node -e "
const knex = require('knex');
const bcrypt = require('bcrypt');
const config = require('./knexfile.js');
const db = knex(config.production);

(async () => {
  try {
    const passwordHash = await bcrypt.hash('demo123', 10);
    
    await db('business_users').insert({
      id: 'demo-user-001',
      business_id: 'demo-business-001',
      phone: '+5491123456789',
      password_hash: passwordHash,
      role: 'owner',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }).onConflict('id').merge();
    
    console.log('✅ Usuario creado/actualizado');
    await db.destroy();
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
})();
"
```

---

## ✅ Checklist de Verificación

- [ ] Los seeds se ejecutaron (ver logs de inicio del servidor)
- [ ] El backend responde en `/health`
- [ ] Las credenciales están exactamente como están documentadas:
  - Business ID: `demo-business-001`
  - Teléfono: `+5491123456789` (con `+` al inicio)
  - Contraseña: `demo123`
- [ ] El teléfono tiene formato internacional correcto
- [ ] No hay espacios extras en las credenciales
- [ ] Probé el login directamente con curl/Postman
- [ ] Verifiqué los logs del backend para ver el error específico
- [ ] Esperé 15 minutos si hubo muchos intentos fallidos (rate limiting)

---

## 🐛 Errores Comunes

### Error: "Business user not found"

**Causa**: Los seeds no se ejecutaron o el usuario no existe.

**Solución**: Ejecutar `npm run db:seed` en producción.

---

### Error: "Invalid password"

**Causa**: La contraseña está mal escrita.

**Solución**: 
- Verifica que sea exactamente `demo123` (todo minúsculas)
- No hay espacios
- Copiar y pegar la contraseña si es necesario

---

### Error: "Missing business_id or phone"

**Causa**: El formato del request está mal.

**Solución**: 
- Verifica que el frontend esté enviando `business_id` y `phone`
- Verifica que el teléfono tenga formato `+5491123456789`
- Verifica que no haya validación en el frontend bloqueando el formato

---

### Error: "Demasiados intentos de login"

**Causa**: Rate limiting activado (5 intentos en 15 minutos).

**Solución**: 
- Esperar 15 minutos
- O cambiar IP (usar otra conexión)

---

## 📞 Si Nada Funciona

1. **Verifica los logs completos del backend** - Busca errores de base de datos
2. **Verifica la conexión a la base de datos** - Ejecuta `/health/detailed`
3. **Verifica que la tabla `business_users` existe** - Ejecuta migraciones si es necesario
4. **Contacta soporte** con:
   - Los logs del backend
   - La respuesta de `/health`
   - Qué credenciales intentaste usar

---

**Después de ejecutar los seeds correctamente, el login debería funcionar.** ✅

