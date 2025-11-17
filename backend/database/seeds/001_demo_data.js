/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
export async function seed(knex) {
  // Deletes ALL existing entries
  await knex('bookings').del();
  await knex('availability_slots').del();
  await knex('services').del();
  await knex('business_settings').del();
  await knex('business_users').del();
  await knex('businesses').del();

  // Insert demo business
  const [business] = await knex('businesses').insert({
    id: 'demo-business-001',
    name: 'Salón de Belleza Demo',
    phone: '+5491123456789',
    email: 'demo@salon.com',
    whatsapp_number: '+5491123456789',
    owner_phone: '+5491123456789',
    is_active: true,
  }).returning('*');

  // Insert demo user
  const bcrypt = await import('bcrypt');
  const passwordHash = await bcrypt.default.hash('demo123', 10);
  
  await knex('business_users').insert({
    id: 'demo-user-001',
    business_id: business.id,
    phone: '+5491123456789',
    password_hash: passwordHash,
    role: 'owner',
  });

  // Insert business settings
  await knex('business_settings').insert({
    business_id: business.id,
    welcome_message: '¡Hola! Bienvenido a Salón de Belleza Demo. ¿En qué puedo ayudarte?',
    booking_confirmation_message: 'Tu reserva ha sido confirmada. Te esperamos!',
    payment_instructions_message: 'Por favor completa el pago para confirmar tu reserva.',
    reminder_message: 'Recordatorio: Tienes una reserva mañana.',
  });

  // Insert demo services
  await knex('services').insert([
    {
      id: 'service-001',
      business_id: business.id,
      name: 'Corte de Cabello',
      description: 'Corte de cabello profesional para damas y caballeros',
      duration_minutes: 30,
      price: 2500.00,
      display_order: 1,
      is_active: true,
    },
    {
      id: 'service-002',
      business_id: business.id,
      name: 'Peinado',
      description: 'Peinado para ocasiones especiales',
      duration_minutes: 60,
      price: 3500.00,
      display_order: 2,
      is_active: true,
    },
    {
      id: 'service-003',
      business_id: business.id,
      name: 'Tintura',
      description: 'Tintura completa con productos de calidad',
      duration_minutes: 90,
      price: 5000.00,
      display_order: 3,
      is_active: true,
    },
  ]);
}

