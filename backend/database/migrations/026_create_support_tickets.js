/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable('support_tickets', (table) => {
    table.string('id').primary();
    table.string('phone_number').notNullable(); // Número de teléfono del cliente
    table.string('customer_name').nullable(); // Nombre del cliente (si está disponible)
    table.text('subject').nullable(); // Asunto del ticket
    table.text('initial_message').notNullable(); // Mensaje inicial que creó el ticket
    table.string('status').notNullable().defaultTo('open'); // open, in_progress, resolved, closed
    table.string('priority').notNullable().defaultTo('medium'); // low, medium, high, urgent
    table.string('assigned_to').nullable().references('id').inTable('users').onDelete('SET NULL'); // Usuario asignado
    table.string('category').nullable(); // Categoría del ticket (ej: "info", "technical", "billing")
    table.text('tags').nullable(); // Tags separados por comas
    table.timestamp('first_response_at').nullable(); // Fecha de primera respuesta
    table.timestamp('resolved_at').nullable(); // Fecha de resolución
    table.timestamp('closed_at').nullable(); // Fecha de cierre
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    table.index('status');
    table.index('priority');
    table.index('assigned_to');
    table.index('phone_number');
    table.index('created_at');
  });

  // Tabla para mensajes dentro de un ticket
  await knex.schema.createTable('ticket_messages', (table) => {
    table.string('id').primary();
    table.string('ticket_id').notNullable().references('id').inTable('support_tickets').onDelete('CASCADE');
    table.text('message').notNullable();
    table.string('sender_type').notNullable(); // 'customer' o 'agent'
    table.string('sender_id').nullable(); // ID del usuario si es agente, o phone_number si es cliente
    table.string('sender_name').nullable(); // Nombre del remitente
    table.boolean('is_internal_note').defaultTo(false); // Si es una nota interna (no visible para el cliente)
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    table.index('ticket_id');
    table.index('created_at');
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists('ticket_messages');
  await knex.schema.dropTableIfExists('support_tickets');
}

