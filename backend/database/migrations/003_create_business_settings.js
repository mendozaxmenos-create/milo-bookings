/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable('business_settings', (table) => {
    table.string('business_id').primary().references('id').inTable('businesses').onDelete('CASCADE');
    table.text('welcome_message');
    table.text('booking_confirmation_message');
    table.text('payment_instructions_message');
    table.text('reminder_message');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTable('business_settings');
}

