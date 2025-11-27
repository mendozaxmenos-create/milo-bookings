# 🚀 Guía Completa: Configurar el Proyecto en una Nueva Computadora

Esta guía te ayudará a configurar todo el entorno de desarrollo en una nueva computadora para trabajar en el proyecto Milo Bookings.

---

## 📋 Tabla de Contenidos

1. [Herramientas Necesarias](#herramientas-necesarias)
2. [Configuración de GitHub](#configuración-de-github)
3. [Configuración de Render](#configuración-de-render)
4. [Configuración de Vercel](#configuración-de-vercel)
5. [Configuración de Cursor](#configuración-de-cursor)
6. [Configuración del Proyecto Local](#configuración-del-proyecto-local)
7. [Variables de Entorno](#variables-de-entorno)
8. [Verificación](#verificación)

---

## 1. 🔧 Herramientas Necesarias

### Instalaciones Básicas

#### Node.js y npm
- **Descarga**: https://nodejs.org/
- **Versión recomendada**: Node.js 18.x o superior
- **Verificación**:
  ```bash
  node --version
  npm --version
  ```

#### Git
- **Descarga**: https://git-scm.com/downloads
- **Verificación**:
  ```bash
  git --version
  ```

#### PostgreSQL Client (opcional, para desarrollo local)
- **Descarga**: https://www.postgresql.org/download/

---

## 2. 🔐 Configuración de GitHub

### 2.1 Instalar Git y configurar credenciales

```bash
# Configurar tu nombre y email (usa los mismos que en GitHub)
git config --global user.name "Tu Nombre"
git config --global user.email "tu-email@ejemplo.com"
```

### 2.2 Generar SSH Key (si no tienes una)

```bash
# Generar nueva SSH key
ssh-keygen -t ed25519 -C "tu-email@ejemplo.com"

# Seguir las instrucciones (presionar Enter para usar ubicación por defecto)
# Opcional: agregar una contraseña

# Copiar la clave pública
cat ~/.ssh/id_ed25519.pub
# (En Windows: type C:\Users\TuUsuario\.ssh\id_ed25519.pub)
```

### 2.3 Agregar SSH Key a GitHub

1. Ve a https://github.com/settings/keys
2. Clic en "New SSH key"
3. Título: "Nueva PC - [nombre de la computadora]"
4. Key: Pega el contenido de `id_ed25519.pub`
5. Clic en "Add SSH key"

### 2.4 Clonar el repositorio

```bash
# Clonar el repositorio
git clone git@github.com:mendozaxmenos-create/milo-bookings.git

# O si prefieres HTTPS:
# git clone https://github.com/mendozaxmenos-create/milo-bookings.git

cd milo-bookings
```

### 2.5 Configurar rama remota

```bash
# Verificar ramas
git branch -a

# Cambiar a la rama de trabajo
git checkout feat/logs-and-improvements

# O crear nueva rama si es necesario
git checkout -b feat/nueva-rama
```

---

## 3. ☁️ Configuración de Render

### 3.1 Acceder a Render

- **URL**: https://dashboard.render.com/
- **Email/Usuario**: [TU_EMAIL_RENDER]
- **Contraseña**: [TU_PASSWORD_RENDER]

### 3.2 Información del Servicio

- **Servicio**: milo-bookings
- **URL**: https://milo-bookings.onrender.com
- **Tipo**: Web Service
- **Branch**: `feat/logs-and-improvements` (o la rama que estés usando)

### 3.3 Variables de Entorno en Render

Las variables de entorno están configuradas en:
1. Ve a: https://dashboard.render.com/web/milo-bookings
2. Settings → Environment Variables

**Variables importantes:**
- `DATABASE_URL`: PostgreSQL connection string
- `NODE_ENV`: `production`
- `PORT`: `10000`
- `JWT_SECRET`: [SECRET_KEY]
- `ALLOWED_ORIGINS`: URLs permitidas para CORS

### 3.4 Verificar Despliegues

- **Logs**: https://dashboard.render.com/web/milo-bookings/logs
- **Events**: https://dashboard.render.com/web/milo-bookings/events

---

## 4. 🚀 Configuración de Vercel

### 4.1 Instalar Vercel CLI

```bash
npm install -g vercel
```

### 4.2 Iniciar sesión en Vercel

```bash
vercel login
```

- Te pedirá autenticación vía navegador
- Usa tu cuenta de Vercel (GitHub OAuth)

### 4.3 Información del Proyecto

- **URL del Dashboard**: https://vercel.com/dashboard
- **Proyecto**: milo-bookings-admin-panel
- **Framework**: Vite + React
- **Root Directory**: `frontend/admin-panel`

### 4.4 Variables de Entorno en Vercel

1. Ve a: https://vercel.com/[TU_USUARIO]/milo-bookings-admin-panel/settings/environment-variables
2. Agrega/verifica las siguientes variables:

**Production:**
- `VITE_API_URL`: `https://milo-bookings.onrender.com`

### 4.5 Conectar con GitHub (si es necesario)

1. Ve a: https://vercel.com/[TU_USUARIO]/milo-bookings-admin-panel/settings/git
2. Verifica que esté conectado con: `mendozaxmenos-create/milo-bookings`
3. Branch: `feat/logs-and-improvements` (o la rama activa)

### 4.6 Desplegar desde local (opcional)

```bash
# En la raíz del proyecto
cd frontend/admin-panel
vercel --prod
```

---

## 5. 💻 Configuración de Cursor

### 5.1 Instalar Cursor

- **Descarga**: https://cursor.sh/
- **Instalación**: Sigue el instalador

### 5.2 Configuración Inicial

1. Abrir Cursor
2. File → Open Folder → Seleccionar carpeta `milo-bookings`
3. Instalar extensiones recomendadas:
   - ESLint
   - Prettier
   - TypeScript (viene incluido)

### 5.3 Configuración del Proyecto

El proyecto ya tiene configuraciones en:
- `.vscode/settings.json` (si existe)
- `package.json` con scripts

### 5.4 Workspace Settings

Si usas workspace, crea `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

---

## 6. 📁 Configuración del Proyecto Local

### 6.1 Instalar Dependencias

```bash
# En la raíz del proyecto
npm install

# O con workspaces (si el proyecto usa workspaces)
npm install --workspaces
```

### 6.2 Configurar Base de Datos Local (Opcional)

Si quieres trabajar con base de datos local:

```bash
# Crear base de datos PostgreSQL local
createdb milo_bookings_dev

# Ejecutar migraciones
cd backend
npm run db:migrate

# Ejecutar seeds (opcional, solo para datos de prueba)
npm run db:seed
```

### 6.3 Scripts Disponibles

**Backend:**
```bash
cd backend
npm run dev          # Desarrollo
npm run start        # Producción
npm run db:migrate   # Ejecutar migraciones
npm run db:seed      # Ejecutar seeds
```

**Frontend:**
```bash
cd frontend/admin-panel
npm run dev          # Desarrollo
npm run build        # Build para producción
npm run preview      # Preview del build
```

---

## 7. 🔑 Variables de Entorno

### 7.1 Crear Archivos .env

**Backend** (`backend/.env`):

```env
# Base de datos
DATABASE_URL=postgresql://usuario:password@localhost:5432/milo_bookings_dev

# Servidor
NODE_ENV=development
PORT=3000

# JWT
JWT_SECRET=tu-secret-key-aqui-cambiar-en-produccion

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# MercadoPago (opcional, para desarrollo)
MERCADOPAGO_ACCESS_TOKEN=tu-access-token
MERCADOPAGO_PUBLIC_KEY=tu-public-key

# WhatsApp Bot (para desarrollo local)
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
# En Windows: PUPPETEER_EXECUTABLE_PATH=C:\Program Files\Google\Chrome\Application\chrome.exe

# QR Webhook (opcional)
QR_WEBHOOK_URL=
```

**Frontend** (`frontend/admin-panel/.env`):

```env
VITE_API_URL=http://localhost:3000
```

**Frontend Production** (`frontend/admin-panel/.env.production`):

```env
VITE_API_URL=https://milo-bookings.onrender.com
```

### 7.2 Variables Críticas para Producción

**IMPORTANTE**: No compartas estas credenciales públicamente. Guárdalas en un gestor de contraseñas seguro.

#### Render (Backend)
- **Database URL**: `postgresql://milo_user:***@dpg-d4eeljmr433s738lqq4g-a/milo_bookings`
- **JWT_SECRET**: [PEDIR_AL_ADMIN]
- **ALLOWED_ORIGINS**: [URLs_DEL_FRONTEND_EN_VERCEL]

#### Vercel (Frontend)
- **VITE_API_URL**: `https://milo-bookings.onrender.com`

#### GitHub
- **Repositorio**: `mendozaxmenos-create/milo-bookings`
- **Branch principal**: `main` o `feat/logs-and-improvements`

---

## 8. ✅ Verificación

### 8.1 Verificar Instalaciones

```bash
# Node.js
node --version  # Debe ser 18.x o superior

# npm
npm --version

# Git
git --version

# Vercel CLI
vercel --version
```

### 8.2 Verificar Conexión con GitHub

```bash
# Clonar un repositorio de prueba
git clone git@github.com:mendozaxmenos-create/milo-bookings.git

# Si funciona, la conexión SSH está bien configurada
```

### 8.3 Verificar Proyecto Local

```bash
# Instalar dependencias
npm install

# Ejecutar tests (si existen)
npm test

# Verificar que los scripts funcionan
npm run build
```

### 8.4 Verificar Acceso a Render

1. Ve a: https://dashboard.render.com/
2. Verifica que puedas ver el servicio `milo-bookings`
3. Revisa los logs en tiempo real

### 8.5 Verificar Acceso a Vercel

1. Ve a: https://vercel.com/dashboard
2. Verifica que puedas ver el proyecto `milo-bookings-admin-panel`
3. Ejecuta `vercel login` en terminal

---

## 9. 🔄 Flujo de Trabajo Diario

### 9.1 Trabajar en una Nueva Feature

```bash
# 1. Actualizar tu rama local
git pull origin feat/logs-and-improvements

# 2. Crear nueva rama para feature
git checkout -b feat/nueva-feature

# 3. Hacer cambios en el código

# 4. Commit
git add .
git commit -m "feat: Descripción de la feature"

# 5. Push
git push origin feat/nueva-feature
```

### 9.2 Desplegar Cambios

**Render (Backend) - Automático:**
- Los cambios se despliegan automáticamente cuando haces push a la rama configurada
- Verifica en: https://dashboard.render.com/web/milo-bookings/events

**Vercel (Frontend) - Automático:**
- Los cambios se despliegan automáticamente cuando haces push
- Verifica en: https://vercel.com/dashboard

**Despliegue Manual (si es necesario):**

```bash
# Render - hacer push a la rama
git push origin feat/logs-and-improvements

# Vercel - desde el frontend
cd frontend/admin-panel
vercel --prod
```

### 9.3 Verificar Despliegues

**Backend:**
1. Logs: https://dashboard.render.com/web/milo-bookings/logs
2. Health check: https://milo-bookings.onrender.com/health

**Frontend:**
1. Dashboard: https://vercel.com/dashboard
2. URL de producción: [URL_DEL_FRONTEND_EN_VERCEL]

---

## 10. 🆘 Solución de Problemas Comunes

### 10.1 Problemas con Git/SSH

```bash
# Verificar SSH
ssh -T git@github.com

# Si falla, regenerar SSH key (ver sección 2.2)
```

### 10.2 Problemas con Dependencias

```bash
# Limpiar cache de npm
npm cache clean --force

# Eliminar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install
```

### 10.3 Problemas con Base de Datos

```bash
# Verificar conexión (si tienes PostgreSQL local)
psql -U postgres -l

# Verificar variables de entorno
echo $DATABASE_URL
```

### 10.4 Problemas con Render

1. Verificar logs en: https://dashboard.render.com/web/milo-bookings/logs
2. Verificar variables de entorno
3. Verificar que el branch sea correcto

### 10.5 Problemas con Vercel

```bash
# Re-login
vercel logout
vercel login

# Verificar configuración
vercel inspect
```

---

## 11. 📝 Notas Importantes

### 11.1 Seguridad

- ⚠️ **NUNCA** subas archivos `.env` al repositorio
- ⚠️ **NUNCA** compartas tokens/keys públicamente
- ✅ Usa un gestor de contraseñas (1Password, LastPass, etc.)
- ✅ Usa variables de entorno para secretos

### 11.2 Ramas

- `main`: Código en producción (estable)
- `feat/logs-and-improvements`: Rama actual de desarrollo
- `feat/*`: Features nuevas

### 11.3 URLs Importantes

- **GitHub Repo**: https://github.com/mendozaxmenos-create/milo-bookings
- **Render Dashboard**: https://dashboard.render.com/
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Backend API**: https://milo-bookings.onrender.com
- **Frontend (si tienes URL)**: [URL_DEL_FRONTEND]

### 11.4 Comandos Útiles

```bash
# Ver estado de Git
git status

# Ver ramas
git branch -a

# Ver commits recientes
git log --oneline -10

# Verificar qué archivos cambiarías
git diff

# Ver logs de Render en terminal (si tienes CLI)
# (Render no tiene CLI oficial, usa el dashboard)
```

---

## 12. 📞 Contacto y Soporte

Si tienes problemas:
1. Revisa los logs en Render/Vercel
2. Verifica las variables de entorno
3. Verifica la conexión con GitHub
4. Consulta la documentación oficial:
   - GitHub: https://docs.github.com/
   - Render: https://render.com/docs
   - Vercel: https://vercel.com/docs
   - Cursor: https://cursor.sh/docs

---

**Última actualización**: $(date)
**Versión**: 1.0.0

