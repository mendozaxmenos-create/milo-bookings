/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable('services', (table) => {
    table.string('id').primary();
    table.string('business_id').notNullable().references('id').inTable('businesses').onDelete('CASCADE');
    table.string('name').notNullable();
    table.text('description');
    table.integer('duration_minutes').notNullable();
    table.decimal('price', 10, 2).notNullable();
    table.integer('display_order').defaultTo(0);
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTable('services');
}

