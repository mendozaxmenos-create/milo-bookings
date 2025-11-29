/**
 * Migration: Crear sistema de features y planes dinámicos
 * 
 * Permite configurar planes de suscripción con features seleccionables
 * Los planes pueden tener múltiples features y las features pueden estar en múltiples planes
 */

export async function up(knex) {
  // Tabla de features (características disponibles)
  await knex.schema.createTable('features', (table) => {
    table.string('id').primary();
    table.string('name').notNullable(); // Nombre de la feature (ej: "Métricas Financieras")
    table.string('key').notNullable().unique(); // Clave única (ej: "financial_metrics")
    table.text('description').nullable(); // Descripción de la feature
    table.string('category').nullable(); // Categoría (ej: "analytics", "crm", "notifications")
    table.integer('display_order').defaultTo(0); // Orden de visualización
    table.boolean('is_active').defaultTo(true); // Si la feature está activa
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    table.index('key');
    table.index('category');
    table.index('is_active');
  });

  // Tabla de planes de suscripción
  await knex.schema.createTable('subscription_plans', (table) => {
    table.string('id').primary();
    table.string('name').notNullable(); // Nombre del plan (ej: "Básico", "Intermedio", "Premium")
    table.string('key').notNullable().unique(); // Clave única (ej: "basic", "intermediate", "premium")
    table.text('description').nullable(); // Descripción del plan
    table.decimal('price', 10, 2).defaultTo(0); // Precio mensual
    table.string('currency').defaultTo('ARS'); // Moneda
    table.integer('display_order').defaultTo(0); // Orden de visualización
    table.boolean('is_active').defaultTo(true); // Si el plan está activo
    table.boolean('is_default').defaultTo(false); // Si es el plan por defecto
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    table.index('key');
    table.index('is_active');
    table.index('is_default');
  });

  // Tabla de relación muchos-a-muchos: planes <-> features
  await knex.schema.createTable('plan_features', (table) => {
    table.string('id').primary();
    table.string('plan_id').notNullable().references('id').inTable('subscription_plans').onDelete('CASCADE');
    table.string('feature_id').notNullable().references('id').inTable('features').onDelete('CASCADE');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    // Un plan no puede tener la misma feature dos veces
    table.unique(['plan_id', 'feature_id']);
    table.index('plan_id');
    table.index('feature_id');
  });

  // Actualizar tabla businesses para usar plan_id en lugar de plan_type
  const hasPlanId = await knex.schema.hasColumn('businesses', 'plan_id');
  if (!hasPlanId) {
    await knex.schema.alterTable('businesses', (table) => {
      table.string('plan_id').nullable().references('id').inTable('subscription_plans').onDelete('SET NULL');
      table.index('plan_id');
    });
  }

  // Insertar features predefinidas
  const features = [
    {
      id: 'feature-basic-dashboard',
      name: 'Dashboard Básico',
      key: 'basic_dashboard',
      description: 'Estadísticas básicas de servicios y reservas',
      category: 'analytics',
      display_order: 1,
      is_active: true,
    },
    {
      id: 'feature-financial-metrics',
      name: 'Métricas Financieras',
      key: 'financial_metrics',
      description: 'Ingresos, ticket promedio, variación mensual',
      category: 'analytics',
      display_order: 2,
      is_active: true,
    },
    {
      id: 'feature-advanced-analytics',
      name: 'Analytics Avanzados',
      key: 'advanced_analytics',
      description: 'Servicio más popular, clientes únicos, tasa de retención, no-show',
      category: 'analytics',
      display_order: 3,
      is_active: true,
    },
    {
      id: 'feature-crm-basic',
      name: 'CRM Básico',
      key: 'crm_basic',
      description: 'Historial de reservas por cliente, lista de clientes',
      category: 'crm',
      display_order: 4,
      is_active: true,
    },
    {
      id: 'feature-crm-advanced',
      name: 'CRM Avanzado',
      key: 'crm_advanced',
      description: 'Segmentación, notas, tags, campañas de marketing',
      category: 'crm',
      display_order: 5,
      is_active: true,
    },
    {
      id: 'feature-reminders',
      name: 'Recordatorios Automáticos',
      key: 'reminders',
      description: 'Recordatorios automáticos 24h y 1h antes de la cita',
      category: 'notifications',
      display_order: 6,
      is_active: true,
    },
    {
      id: 'feature-push-notifications',
      name: 'Notificaciones Push',
      key: 'push_notifications',
      description: 'Notificaciones push en navegador para nuevas reservas',
      category: 'notifications',
      display_order: 7,
      is_active: true,
    },
    {
      id: 'feature-email-notifications',
      name: 'Notificaciones por Email',
      key: 'email_notifications',
      description: 'Envío de notificaciones por correo electrónico',
      category: 'notifications',
      display_order: 8,
      is_active: true,
    },
    {
      id: 'feature-multiple-locations',
      name: 'Múltiples Ubicaciones',
      key: 'multiple_locations',
      description: 'Gestionar múltiples sucursales desde un solo panel',
      category: 'management',
      display_order: 9,
      is_active: true,
    },
    {
      id: 'feature-multi-resources',
      name: 'Multigestión (Recursos Múltiples)',
      key: 'multi_resources',
      description: 'Servicios con múltiples recursos simultáneos (canchas, salas, etc.)',
      category: 'management',
      display_order: 10,
      is_active: true,
    },
    {
      id: 'feature-insurance',
      name: 'Obras Sociales y Coseguros',
      key: 'insurance',
      description: 'Soporte para obras sociales y configuración de coseguros',
      category: 'management',
      display_order: 11,
      is_active: true,
    },
    {
      id: 'feature-shortlinks',
      name: 'Shortlinks',
      key: 'shortlinks',
      description: 'Generación de links cortos y códigos QR para compartir',
      category: 'marketing',
      display_order: 12,
      is_active: true,
    },
    {
      id: 'feature-shortlink-analytics',
      name: 'Analytics de Shortlinks',
      key: 'shortlink_analytics',
      description: 'Estadísticas de uso de shortlinks, conversión, etc.',
      category: 'analytics',
      display_order: 13,
      is_active: true,
    },
    {
      id: 'feature-export-reports',
      name: 'Exportar Reportes',
      key: 'export_reports',
      description: 'Exportar reportes a PDF, Excel, CSV',
      category: 'analytics',
      display_order: 14,
      is_active: true,
    },
    {
      id: 'feature-api-access',
      name: 'Acceso API',
      key: 'api_access',
      description: 'API REST completa para integraciones personalizadas',
      category: 'integrations',
      display_order: 15,
      is_active: true,
    },
    {
      id: 'feature-webhooks',
      name: 'Webhooks',
      key: 'webhooks',
      description: 'Webhooks personalizables para eventos del sistema',
      category: 'integrations',
      display_order: 16,
      is_active: true,
    },
  ];

  await knex('features').insert(features);

  // Insertar planes predefinidos
  const plans = [
    {
      id: 'plan-basic',
      name: 'Básico',
      key: 'basic',
      description: 'Plan básico con funcionalidades esenciales',
      price: 0,
      currency: 'ARS',
      display_order: 1,
      is_active: true,
      is_default: true,
    },
    {
      id: 'plan-intermediate',
      name: 'Intermedio',
      key: 'intermediate',
      description: 'Plan intermedio con métricas financieras y CRM básico',
      price: 4900,
      currency: 'ARS',
      display_order: 2,
      is_active: true,
      is_default: false,
    },
    {
      id: 'plan-premium',
      name: 'Premium',
      key: 'premium',
      description: 'Plan premium con todas las funcionalidades',
      price: 9900,
      currency: 'ARS',
      display_order: 3,
      is_active: true,
      is_default: false,
    },
  ];

  await knex('subscription_plans').insert(plans);

  // Asignar features a planes
  const planFeatures = [
    // Plan Básico
    { id: 'pf-basic-1', plan_id: 'plan-basic', feature_id: 'feature-basic-dashboard' },
    { id: 'pf-basic-2', plan_id: 'plan-basic', feature_id: 'feature-reminders' },
    { id: 'pf-basic-3', plan_id: 'plan-basic', feature_id: 'feature-multi-resources' },
    { id: 'pf-basic-4', plan_id: 'plan-basic', feature_id: 'feature-insurance' },
    { id: 'pf-basic-5', plan_id: 'plan-basic', feature_id: 'feature-shortlinks' },
    
    // Plan Intermedio (incluye todas las del básico +)
    { id: 'pf-intermediate-1', plan_id: 'plan-intermediate', feature_id: 'feature-basic-dashboard' },
    { id: 'pf-intermediate-2', plan_id: 'plan-intermediate', feature_id: 'feature-financial-metrics' },
    { id: 'pf-intermediate-3', plan_id: 'plan-intermediate', feature_id: 'feature-crm-basic' },
    { id: 'pf-intermediate-4', plan_id: 'plan-intermediate', feature_id: 'feature-reminders' },
    { id: 'pf-intermediate-5', plan_id: 'plan-intermediate', feature_id: 'feature-multi-resources' },
    { id: 'pf-intermediate-6', plan_id: 'plan-intermediate', feature_id: 'feature-insurance' },
    { id: 'pf-intermediate-7', plan_id: 'plan-intermediate', feature_id: 'feature-shortlinks' },
    { id: 'pf-intermediate-8', plan_id: 'plan-intermediate', feature_id: 'feature-shortlink-analytics' },
    
    // Plan Premium (todas las features)
    { id: 'pf-premium-1', plan_id: 'plan-premium', feature_id: 'feature-basic-dashboard' },
    { id: 'pf-premium-2', plan_id: 'plan-premium', feature_id: 'feature-financial-metrics' },
    { id: 'pf-premium-3', plan_id: 'plan-premium', feature_id: 'feature-advanced-analytics' },
    { id: 'pf-premium-4', plan_id: 'plan-premium', feature_id: 'feature-crm-basic' },
    { id: 'pf-premium-5', plan_id: 'plan-premium', feature_id: 'feature-crm-advanced' },
    { id: 'pf-premium-6', plan_id: 'plan-premium', feature_id: 'feature-reminders' },
    { id: 'pf-premium-7', plan_id: 'plan-premium', feature_id: 'feature-push-notifications' },
    { id: 'pf-premium-8', plan_id: 'plan-premium', feature_id: 'feature-email-notifications' },
    { id: 'pf-premium-9', plan_id: 'plan-premium', feature_id: 'feature-multiple-locations' },
    { id: 'pf-premium-10', plan_id: 'plan-premium', feature_id: 'feature-multi-resources' },
    { id: 'pf-premium-11', plan_id: 'plan-premium', feature_id: 'feature-insurance' },
    { id: 'pf-premium-12', plan_id: 'plan-premium', feature_id: 'feature-shortlinks' },
    { id: 'pf-premium-13', plan_id: 'plan-premium', feature_id: 'feature-shortlink-analytics' },
    { id: 'pf-premium-14', plan_id: 'plan-premium', feature_id: 'feature-export-reports' },
    { id: 'pf-premium-15', plan_id: 'plan-premium', feature_id: 'feature-api-access' },
    { id: 'pf-premium-16', plan_id: 'plan-premium', feature_id: 'feature-webhooks' },
  ];

  await knex('plan_features').insert(planFeatures);
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('plan_features');
  await knex.schema.dropTableIfExists('subscription_plans');
  await knex.schema.dropTableIfExists('features');
  
  // Remover plan_id de businesses si existe
  const hasPlanId = await knex.schema.hasColumn('businesses', 'plan_id');
  if (hasPlanId) {
    await knex.schema.alterTable('businesses', (table) => {
      table.dropColumn('plan_id');
    });
  }
}

