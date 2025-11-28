/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable('bookings', (table) => {
    table.string('id').primary();
    table.string('business_id').notNullable().references('id').inTable('businesses').onDelete('CASCADE');
    table.string('service_id').notNullable().references('id').inTable('services').onDelete('CASCADE');
    table.string('customer_phone').notNullable();
    table.string('customer_name');
    table.date('booking_date').notNullable();
    table.time('booking_time').notNullable();
    table.string('status').notNullable().defaultTo('pending'); // pending, confirmed, cancelled, completed
    table.string('payment_status').defaultTo('pending'); // pending, paid, refunded
    table.string('payment_id'); // ID de MercadoPago
    table.decimal('amount', 10, 2).notNullable();
    table.text('notes');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    table.index(['business_id', 'booking_date']);
    table.index(['customer_phone']);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTable('bookings');
}

