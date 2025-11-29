import { useAuthStore } from '../store/authStore';

export function MercadoPagoInstructivo() {
  const { isAuthenticated } = useAuthStore();
  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>📖 Instructivo: Configurar MercadoPago</h1>
        <p style={{ color: '#666' }}>
          Guía paso a paso para configurar tu cuenta de MercadoPago en Milo Bookings
        </p>
      </div>

      <div style={{ backgroundColor: '#fff3cd', border: '1px solid #ffc107', borderRadius: '8px', padding: '1rem', marginBottom: '2rem' }}>
        <strong>⚠️ Importante:</strong> Si NO configurás tus credenciales, los pagos se recibirán en la cuenta centralizada de Milo Bookings.
        Si SÍ configurás tus credenciales, los pagos irán directamente a tu cuenta de MercadoPago.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <section style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
          <h2 style={{ marginTop: 0, color: '#007bff' }}>Paso 1: Crear cuenta en MercadoPago (si no tenés)</h2>
          <ol style={{ lineHeight: '1.8' }}>
            <li>Ve a <a href="https://www.mercadopago.com.ar" target="_blank" rel="noopener noreferrer">mercadopago.com.ar</a></li>
            <li>Haz clic en <strong>"Crear cuenta"</strong></li>
            <li>Completa tus datos personales o de tu negocio</li>
            <li>Verifica tu email y teléfono</li>
            <li>Completa la verificación de identidad (si es necesario)</li>
          </ol>
          <p style={{ color: '#666', fontStyle: 'italic', marginTop: '1rem' }}>
            <strong>Nota:</strong> Si ya tenés cuenta, podés saltar este paso.
          </p>
        </section>

        <section style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
          <h2 style={{ marginTop: 0, color: '#007bff' }}>Paso 2: Acceder a tus credenciales</h2>
          <ol style={{ lineHeight: '1.8' }}>
            <li>Iniciá sesión en tu cuenta de MercadoPago</li>
            <li>En el menú superior, hacé clic en <strong>"Tu negocio"</strong> o <strong>"Desarrolladores"</strong></li>
            <li>Buscá la sección <strong>"Tus integraciones"</strong> o <strong>"Credenciales"</strong></li>
            <li>Seleccioná <strong>"Credenciales de Producción"</strong> (o "Credenciales de Prueba" si estás en desarrollo)</li>
          </ol>
          <div style={{ backgroundColor: '#e7f3ff', padding: '1rem', borderRadius: '6px', marginTop: '1rem' }}>
            <strong>💡 Tip:</strong> Si no encontrás esta sección, buscá "API" o "Integraciones" en el menú.
          </div>
        </section>

        <section style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
          <h2 style={{ marginTop: 0, color: '#007bff' }}>Paso 3: Obtener tus credenciales</h2>
          <p>En la página de credenciales verás dos valores importantes:</p>
          
          <div style={{ marginTop: '1.5rem' }}>
            <h3 style={{ color: '#28a745' }}>3.1 Public Key (Clave Pública)</h3>
            <ul style={{ lineHeight: '1.8' }}>
              <li>Es un código que empieza con <code>APP_USR-</code> o <code>TEST-</code></li>
              <li>Es <strong>público</strong> y seguro compartirlo</li>
              <li>Lo necesitás para generar los links de pago</li>
            </ul>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <h3 style={{ color: '#dc3545' }}>3.2 Access Token (Token de Acceso)</h3>
            <ul style={{ lineHeight: '1.8' }}>
              <li>Es un código largo que empieza con <code>APP_USR-</code> o <code>TEST-</code></li>
              <li>Es <strong>privado</strong> y no debés compartirlo con nadie</li>
              <li>Lo necesitás para procesar los pagos</li>
            </ul>
          </div>

          <div style={{ backgroundColor: '#fff3cd', border: '1px solid #ffc107', borderRadius: '6px', padding: '1rem', marginTop: '1rem' }}>
            <strong>⚠️ Importante:</strong>
            <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.5rem' }}>
              <li>Usá <strong>Credenciales de Producción</strong> cuando tu negocio esté funcionando</li>
              <li>Usá <strong>Credenciales de Prueba</strong> solo para probar el sistema</li>
            </ul>
          </div>
        </section>

        <section style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
          <h2 style={{ marginTop: 0, color: '#007bff' }}>Paso 4: Configurar en Milo Bookings</h2>
          <ol style={{ lineHeight: '1.8' }}>
            <li>Iniciá sesión en tu panel de Milo Bookings</li>
            <li>Ve a la sección <strong>"Configuración"</strong> (⚙️ en el menú lateral)</li>
            <li>Desplázate hasta la sección <strong>"Pagos con MercadoPago"</strong></li>
            <li>Copiá tu <strong>Public Key</strong> desde MercadoPago y pegala en el campo correspondiente</li>
            <li>Copiá tu <strong>Access Token</strong> desde MercadoPago y pegala en el campo correspondiente</li>
            <li>(Opcional) Si tenés <strong>Refresh Token</strong> y <strong>User ID</strong>, también podés agregarlos</li>
            <li>Hacé clic en <strong>"Guardar credenciales"</strong></li>
          </ol>
        </section>

        <section style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
          <h2 style={{ marginTop: 0, color: '#007bff' }}>Paso 5: Verificar que funciona</h2>
          <ol style={{ lineHeight: '1.8' }}>
            <li>Después de guardar, el estado debería cambiar a: <strong style={{ color: '#28a745' }}>✅ "Usando tu cuenta de MercadoPago"</strong></li>
            <li>Creá una reserva de prueba con pago</li>
            <li>Verificá que el link de pago se genera correctamente</li>
            <li>(Opcional) Hacé un pago de prueba para confirmar que llega a tu cuenta</li>
          </ol>
        </section>

        <section style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
          <h2 style={{ marginTop: 0, color: '#007bff' }}>❓ Preguntas Frecuentes</h2>
          
          <div style={{ marginTop: '1.5rem' }}>
            <h3>¿Qué pasa si no configuro mis credenciales?</h3>
            <p style={{ color: '#666' }}>
              Los pagos se recibirán en la cuenta centralizada de Milo Bookings. Podrás ver los pagos en el panel, pero no llegarán directamente a tu cuenta de MercadoPago.
            </p>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <h3>¿Puedo cambiar mis credenciales después?</h3>
            <p style={{ color: '#666' }}>
              Sí, podés actualizar tus credenciales en cualquier momento desde la sección de Configuración.
            </p>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <h3>¿Qué diferencia hay entre credenciales de prueba y producción?</h3>
            <ul style={{ color: '#666', lineHeight: '1.8' }}>
              <li><strong>Prueba (TEST):</strong> Para probar el sistema sin hacer pagos reales</li>
              <li><strong>Producción (APP_USR):</strong> Para recibir pagos reales de tus clientes</li>
            </ul>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <h3>¿Es seguro compartir mi Access Token?</h3>
            <p style={{ color: '#666' }}>
              El Access Token es <strong>privado</strong> y solo debés ingresarlo en el panel de Milo Bookings. No lo compartas con nadie más.
            </p>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <h3>¿Qué hago si tengo problemas?</h3>
            <ol style={{ color: '#666', lineHeight: '1.8' }}>
              <li>Verificá que copiaste correctamente las credenciales (sin espacios extra)</li>
              <li>Asegurate de estar usando las credenciales correctas (producción vs prueba)</li>
              <li>Contactá a soporte de Milo Bookings si el problema persiste</li>
            </ol>
          </div>
        </section>

        <div style={{ 
          backgroundColor: '#d4edda', 
          border: '1px solid #28a745', 
          borderRadius: '8px', 
          padding: '1.5rem',
          textAlign: 'center'
        }}>
          <h2 style={{ marginTop: 0, color: '#155724' }}>🎉 ¡Listo!</h2>
          <p style={{ color: '#155724', margin: 0 }}>
            Una vez configurado, todos los pagos de tus clientes se recibirán directamente en tu cuenta de MercadoPago. 
            No necesitás hacer nada más.
          </p>
          <a 
            href={isAuthenticated ? "/settings" : "/login"}
            style={{
              display: 'inline-block',
              marginTop: '1rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#28a745',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: 600
            }}
          >
            Ir a Configuración →
          </a>
        </div>
      </div>
    </div>
  );
}



