/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // Add plan_type to businesses
  const hasPlanColumn = await knex.schema.hasColumn('businesses', 'plan_type');
  if (!hasPlanColumn) {
    await knex.schema.alterTable('businesses', (table) => {
      table.string('plan_type').notNullable().defaultTo('basic');
    });
  }

  // Add default product fields to business_settings (used for plan basic UI)
  const hasDefaultName = await knex.schema.hasColumn('business_settings', 'default_service_name');
  if (!hasDefaultName) {
    await knex.schema.alterTable('business_settings', (table) => {
      table.string('default_service_name');
      table.decimal('default_service_price', 10, 2).defaultTo(0);
      table.text('default_service_description');
    });
  }

  // Initialize defaults for existing settings
  await knex('business_settings').update({
    default_service_name: knex.raw("COALESCE(default_service_name, 'Servicio Básico')"),
    default_service_price: knex.raw('COALESCE(default_service_price, 0)'),
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  const hasPlanColumn = await knex.schema.hasColumn('businesses', 'plan_type');
  if (hasPlanColumn) {
    await knex.schema.alterTable('businesses', (table) => {
      table.dropColumn('plan_type');
    });
  }

  const hasDefaultName = await knex.schema.hasColumn('business_settings', 'default_service_name');
  if (hasDefaultName) {
    await knex.schema.alterTable('business_settings', (table) => {
      table.dropColumn('default_service_name');
      table.dropColumn('default_service_price');
      table.dropColumn('default_service_description');
    });
  }
}


