# 🚀 Git Push Automático - Milo Bookings

Este proyecto está configurado para hacer push automático a git después de cada commit.

---

## 📋 Opciones Disponibles

### 1. Hook de Git (Automático) ✅

**El hook de git se ejecuta automáticamente después de cada `git commit`**

- ✅ **Automático**: No necesitas hacer nada extra
- ✅ **Funciona con**: `git commit -m "mensaje"`
- ⚠️ **Nota**: Solo hace push, no hace `git add` automáticamente

**Ubicación:** `.git/hooks/post-commit`

---

### 2. Scripts Manuales

Si prefieres controlar cuándo hacer push, puedes usar estos scripts:

#### Windows (PowerShell)
```powershell
.\auto-push.ps1 "mensaje del commit"
```

#### Windows (CMD/Batch)
```cmd
auto-push.bat "mensaje del commit"
```

#### Node.js (Multiplataforma)
```bash
npm run git:push "mensaje del commit"
# O
node scripts/auto-push.js "mensaje del commit"
```

**Estos scripts hacen:**
1. `git add .` - Agrega todos los cambios
2. `git commit -m "mensaje"` - Hace commit
3. `git push origin <rama-actual>` - Hace push automático

---

## 🎯 Uso Recomendado

### Opción A: Hook Automático (Recomendado)

1. Haz tus cambios normalmente
2. Ejecuta: `git add .`
3. Ejecuta: `git commit -m "tu mensaje"`
4. **El push se hace automáticamente** 🎉

### Opción B: Script Todo-en-Uno

1. Ejecuta: `.\auto-push.ps1 "tu mensaje"` (o `auto-push.bat`)
2. **Todo se hace automáticamente** (add, commit, push) 🎉

---

## ⚙️ Configuración

### Habilitar Hook Automático (Windows)

El hook ya está creado en `.git/hooks/post-commit`. Si no funciona automáticamente:

1. Asegúrate de tener Git Bash instalado
2. O usa los scripts manuales (`auto-push.ps1` o `auto-push.bat`)

### Deshabilitar Hook Automático

Si quieres deshabilitar el push automático:

```bash
# Renombrar el hook
mv .git/hooks/post-commit .git/hooks/post-commit.disabled
```

---

## 🔧 Troubleshooting

### El hook no funciona en Windows

**Solución:** Usa los scripts manuales:
- `.\auto-push.ps1 "mensaje"` (PowerShell)
- `auto-push.bat "mensaje"` (CMD)

### Error: "Permission denied"

**Solución (Linux/Mac):**
```bash
chmod +x .git/hooks/post-commit
chmod +x scripts/auto-push.js
```

### Error: "No se puede cargar el archivo"

**Solución (PowerShell):**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## 📝 Ejemplos

### Ejemplo 1: Cambio simple
```bash
git add .
git commit -m "fix: Corregir error en dashboard"
# Push automático ✅
```

### Ejemplo 2: Usando script
```powershell
.\auto-push.ps1 "feat: Agregar nueva funcionalidad"
# Todo automático ✅
```

### Ejemplo 3: Sin mensaje (te pregunta)
```bash
npm run git:push
# Te pregunta el mensaje
```

---

## ⚠️ Notas Importantes

1. **El hook solo hace push**, no hace `git add` automáticamente
2. **Los scripts hacen todo** (add, commit, push)
3. **Siempre verifica** que el push fue exitoso
4. **No uses en ramas protegidas** sin revisar primero

---

**Última actualización:** 28 de Noviembre 2025  
**Estado:** ✅ Sistema activo y funcionando

