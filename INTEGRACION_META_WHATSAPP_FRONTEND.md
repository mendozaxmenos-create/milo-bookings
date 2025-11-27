# 📱 Integración de Meta WhatsApp API en el Frontend

## 📋 Situación Actual

### Backend ✅
- **Webhook configurado**: `/api/whatsapp/webhook` (recibe mensajes de Meta)
- **Servicio MetaWhatsAppService**: Envía mensajes usando Meta API
- **Variables de entorno configuradas**: `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_VERIFY_TOKEN`
- **Funcionalidad**: El bot procesa mensajes automáticamente cuando llegan al webhook

### Frontend ⏳
- **Estado**: No tiene integración directa con Meta API
- **Referencias actuales**: Solo para whatsapp-web.js (QR code, reconexión)
- **Necesita**: Endpoints y funciones para enviar mensajes manualmente

---

## 🎯 Plan de Integración

### Paso 1: Crear Endpoints en el Backend

Necesitamos agregar endpoints en `/api/whatsapp/` para que el frontend pueda:

1. **Enviar mensajes manualmente**
   - `POST /api/whatsapp/send` - Enviar mensaje de texto
   - `POST /api/whatsapp/send-template` - Enviar mensaje con plantilla

2. **Verificar estado de configuración**
   - `GET /api/whatsapp/status` - Verificar si Meta API está configurada
   - `GET /api/whatsapp/phone-info` - Obtener información del número de WhatsApp

3. **Gestión (opcional)**
   - `GET /api/whatsapp/config` - Ver configuración actual (sin mostrar tokens)
   - `PUT /api/whatsapp/config` - Actualizar configuración (si se permite desde frontend)

---

## 🔧 Implementación

### Backend: Nuevos Endpoints

**Archivo**: `backend/src/api/routes/whatsapp.js`

Agregar después de las rutas existentes:

```javascript
// Middleware de autenticación (ya existe en otras rutas)
router.use(authenticateToken);

/**
 * GET /api/whatsapp/status
 * Verificar estado de configuración de Meta WhatsApp API
 */
router.get('/status', async (req, res) => {
  try {
    const isConfigured = MetaWhatsAppService.isConfigured();
    res.json({
      data: {
        configured: isConfigured,
        hasPhoneNumberId: !!process.env.WHATSAPP_PHONE_NUMBER_ID,
        hasAccessToken: !!process.env.WHATSAPP_ACCESS_TOKEN,
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/whatsapp/phone-info
 * Obtener información del número de WhatsApp configurado
 */
router.get('/phone-info', async (req, res) => {
  try {
    const info = await MetaWhatsAppService.getPhoneNumberInfo();
    res.json({ data: info });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/whatsapp/send
 * Enviar mensaje de texto manualmente
 * Body: { to: string, text: string }
 */
router.post('/send', async (req, res) => {
  try {
    const { to, text } = req.body;
    
    if (!to || !text) {
      return res.status(400).json({ error: 'to and text are required' });
    }
    
    const result = await MetaWhatsAppService.sendMessage(to, text);
    res.json({ data: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/whatsapp/send-template
 * Enviar mensaje con plantilla
 * Body: { to: string, templateName: string, languageCode?: string, parameters?: array }
 */
router.post('/send-template', async (req, res) => {
  try {
    const { to, templateName, languageCode = 'es', parameters = [] } = req.body;
    
    if (!to || !templateName) {
      return res.status(400).json({ error: 'to and templateName are required' });
    }
    
    const result = await MetaWhatsAppService.sendTemplateMessage(
      to,
      templateName,
      languageCode,
      parameters
    );
    res.json({ data: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Frontend: Nuevas Funciones en API

**Archivo**: `frontend/admin-panel/src/services/api.ts`

Agregar al final del archivo:

```typescript
// WhatsApp Meta API
export interface WhatsAppStatusResponse {
  data: {
    configured: boolean;
    hasPhoneNumberId: boolean;
    hasAccessToken: boolean;
  };
}

export interface WhatsAppPhoneInfoResponse {
  data: {
    verified_name?: string;
    display_phone_number?: string;
    quality_rating?: string;
    // ... otros campos de Meta API
  };
}

export interface SendWhatsAppMessageRequest {
  to: string; // Número sin + (ej: 5491123456789)
  text: string;
}

export interface SendWhatsAppTemplateRequest {
  to: string;
  templateName: string;
  languageCode?: string;
  parameters?: Array<string | { type: string; text: string }>;
}

export interface WhatsAppMessageResponse {
  data: {
    messaging_product: string;
    contacts: Array<{ input: string; wa_id: string }>;
    messages: Array<{ id: string }>;
  };
}

export const getWhatsAppStatus = async (): Promise<WhatsAppStatusResponse> => {
  const response = await api.get<WhatsAppStatusResponse>('/whatsapp/status');
  return response.data;
};

export const getWhatsAppPhoneInfo = async (): Promise<WhatsAppPhoneInfoResponse> => {
  const response = await api.get<WhatsAppPhoneInfoResponse>('/whatsapp/phone-info');
  return response.data;
};

export const sendWhatsAppMessage = async (
  data: SendWhatsAppMessageRequest
): Promise<WhatsAppMessageResponse> => {
  const response = await api.post<WhatsAppMessageResponse>('/whatsapp/send', data);
  return response.data;
};

export const sendWhatsAppTemplate = async (
  data: SendWhatsAppTemplateRequest
): Promise<WhatsAppMessageResponse> => {
  const response = await api.post<WhatsAppMessageResponse>('/whatsapp/send-template', data);
  return response.data;
};
```

### Frontend: UI en Settings

**Archivo**: `frontend/admin-panel/src/pages/Settings.tsx`

Agregar una nueva sección para Meta WhatsApp API:

```typescript
// En el componente Settings, agregar:

const [whatsappStatus, setWhatsappStatus] = useState<{
  configured: boolean;
  phoneInfo: any;
} | null>(null);

// Función para cargar estado
const loadWhatsAppStatus = async () => {
  try {
    const status = await getWhatsAppStatus();
    setWhatsappStatus({ configured: status.data.configured, phoneInfo: null });
    
    if (status.data.configured) {
      try {
        const phoneInfo = await getWhatsAppPhoneInfo();
        setWhatsappStatus(prev => ({ ...prev, phoneInfo: phoneInfo.data }));
      } catch (error) {
        console.error('Error obteniendo info del teléfono:', error);
      }
    }
  } catch (error) {
    console.error('Error obteniendo estado de WhatsApp:', error);
  }
};

// Llamar en useEffect
useEffect(() => {
  loadWhatsAppStatus();
}, []);

// Agregar sección en el JSX:
<section>
  <h2>Meta WhatsApp Business API</h2>
  {whatsappStatus?.configured ? (
    <div>
      <p>✅ Meta WhatsApp API está configurada</p>
      {whatsappStatus.phoneInfo && (
        <div>
          <p>Número: {whatsappStatus.phoneInfo.display_phone_number}</p>
          <p>Estado: {whatsappStatus.phoneInfo.quality_rating || 'N/A'}</p>
        </div>
      )}
    </div>
  ) : (
    <div>
      <p>⚠️ Meta WhatsApp API no está configurada</p>
      <p>Configura las variables de entorno en Render para activar la API.</p>
    </div>
  )}
</section>
```

### Frontend: Componente para Enviar Mensajes (Opcional)

Crear un componente para enviar mensajes de prueba:

**Archivo**: `frontend/admin-panel/src/components/SendWhatsAppMessage.tsx`

```typescript
import { useState } from 'react';
import { sendWhatsAppMessage } from '../services/api';

export const SendWhatsAppMessage = () => {
  const [to, setTo] = useState('');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleSend = async () => {
    if (!to || !text) return;
    
    setLoading(true);
    setResult(null);
    
    try {
      // Normalizar número (eliminar + y espacios)
      const normalizedTo = to.replace(/[+\s]/g, '');
      const response = await sendWhatsAppMessage({ to: normalizedTo, text });
      setResult(`✅ Mensaje enviado. ID: ${response.data.messages[0].id}`);
      setText(''); // Limpiar mensaje
    } catch (error: any) {
      setResult(`❌ Error: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3>Enviar Mensaje de Prueba</h3>
      <div>
        <label>Número (sin +):</label>
        <input
          type="text"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="5491123456789"
        />
      </div>
      <div>
        <label>Mensaje:</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
        />
      </div>
      <button onClick={handleSend} disabled={loading || !to || !text}>
        {loading ? 'Enviando...' : 'Enviar Mensaje'}
      </button>
      {result && <p>{result}</p>}
    </div>
  );
};
```

---

## 📝 Pasos de Implementación

1. **Agregar endpoints en backend** (`backend/src/api/routes/whatsapp.js`)
2. **Agregar funciones en frontend API** (`frontend/admin-panel/src/services/api.ts`)
3. **Agregar UI en Settings** (mostrar estado de configuración)
4. **Opcional: Componente para enviar mensajes** (para pruebas)
5. **Probar integración** (enviar mensaje de prueba desde frontend)

---

## ✅ Checklist

- [ ] Endpoints agregados en backend
- [ ] Funciones agregadas en frontend API
- [ ] UI en Settings para mostrar estado
- [ ] Componente opcional para enviar mensajes
- [ ] Probar envío de mensaje desde frontend
- [ ] Verificar que funciona con las credenciales actuales

---

**¿Quieres que implemente estos cambios ahora?** Puedo crear los archivos y hacer las modificaciones necesarias.

