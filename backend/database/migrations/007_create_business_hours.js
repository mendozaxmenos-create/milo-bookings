/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable('business_hours', (table) => {
    table.string('id').primary();
    table.string('business_id').notNullable().references('id').inTable('businesses').onDelete('CASCADE');
    table.integer('day_of_week').notNullable(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
    table.time('open_time').notNullable();
    table.time('close_time').notNullable();
    table.boolean('is_open').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    table.unique(['business_id', 'day_of_week']);
    table.index(['business_id']);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTable('business_hours');
}

