/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable('business_users', (table) => {
    table.string('id').primary();
    table.string('business_id').notNullable().references('id').inTable('businesses').onDelete('CASCADE');
    table.string('phone').notNullable();
    table.string('password_hash').notNullable();
    table.string('role').notNullable().defaultTo('staff'); // owner, admin, staff
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    table.unique(['business_id', 'phone']);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTable('business_users');
}

