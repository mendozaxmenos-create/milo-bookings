import db from '../index.js';
import { v4 as uuidv4 } from 'uuid';

export class SubscriptionPlan {
  static async create(data) {
    const id = data.id || uuidv4();
    const now = new Date().toISOString();

    const plan = {
      id,
      name: data.name,
      key: data.key.toLowerCase().replace(/\s+/g, '_'),
      description: data.description || null,
      price: data.price || 0,
      currency: data.currency || 'ARS',
      display_order: data.display_order || 0,
      is_active: data.is_active !== undefined ? data.is_active : true,
      is_default: data.is_default || false,
      created_at: now,
      updated_at: now,
    };

    await db('subscription_plans').insert(plan);
    return this.findById(id);
  }

  static async findById(id) {
    return db('subscription_plans').where({ id }).first();
  }

  static async findByKey(key) {
    return db('subscription_plans').where({ key }).first();
  }

  static async getAll(options = {}) {
    let query = db('subscription_plans');

    if (options.activeOnly) {
      query = query.where({ is_active: true });
    }

    return query.orderBy('display_order', 'asc').orderBy('name', 'asc');
  }

  static async getDefault() {
    return db('subscription_plans').where({ is_default: true, is_active: true }).first();
  }

  /**
   * Obtiene un plan con todas sus features
   */
  static async findByIdWithFeatures(id) {
    const plan = await this.findById(id);
    if (!plan) return null;

    const features = await db('plan_features')
      .join('features', 'plan_features.feature_id', 'features.id')
      .where({ 'plan_features.plan_id': id })
      .select('features.*')
      .orderBy('features.category', 'asc')
      .orderBy('features.display_order', 'asc');

    return {
      ...plan,
      features,
    };
  }

  /**
   * Obtiene todos los planes con sus features
   */
  static async getAllWithFeatures(options = {}) {
    const plans = await this.getAll(options);
    
    const plansWithFeatures = await Promise.all(
      plans.map(async (plan) => {
        const features = await db('plan_features')
          .join('features', 'plan_features.feature_id', 'features.id')
          .where({ 'plan_features.plan_id': plan.id })
          .select('features.*')
          .orderBy('features.category', 'asc')
          .orderBy('features.display_order', 'asc');

        return {
          ...plan,
          features,
        };
      })
    );

    return plansWithFeatures;
  }

  /**
   * Agrega una feature a un plan
   */
  static async addFeature(planId, featureId) {
    const id = uuidv4();
    await db('plan_features').insert({
      id,
      plan_id: planId,
      feature_id: featureId,
    });
    return this.findByIdWithFeatures(planId);
  }

  /**
   * Remueve una feature de un plan
   */
  static async removeFeature(planId, featureId) {
    await db('plan_features')
      .where({ plan_id: planId, feature_id: featureId })
      .delete();
    return this.findByIdWithFeatures(planId);
  }

  /**
   * Actualiza las features de un plan (reemplaza todas)
   */
  static async updateFeatures(planId, featureIds) {
    // Eliminar todas las features actuales
    await db('plan_features').where({ plan_id: planId }).delete();

    // Agregar las nuevas features
    if (featureIds && featureIds.length > 0) {
      const planFeatures = featureIds.map(featureId => ({
        id: uuidv4(),
        plan_id: planId,
        feature_id: featureId,
      }));
      await db('plan_features').insert(planFeatures);
    }

    return this.findByIdWithFeatures(planId);
  }

  static async update(id, data) {
    const updateData = {
      updated_at: new Date().toISOString(),
    };

    if (data.name) updateData.name = data.name;
    if (data.key) updateData.key = data.key.toLowerCase().replace(/\s+/g, '_');
    if (data.description !== undefined) updateData.description = data.description;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.currency !== undefined) updateData.currency = data.currency;
    if (data.display_order !== undefined) updateData.display_order = data.display_order;
    if (data.is_active !== undefined) updateData.is_active = data.is_active;
    if (data.is_default !== undefined) {
      updateData.is_default = data.is_default;
      // Si se marca como default, desmarcar los demás
      if (data.is_default) {
        await db('subscription_plans').whereNot({ id }).update({ is_default: false });
      }
    }

    await db('subscription_plans').where({ id }).update(updateData);
    return this.findById(id);
  }

  static async delete(id) {
    // No permitir eliminar si hay negocios usando este plan
    const businessesCount = await db('businesses')
      .where({ plan_id: id })
      .count('* as count')
      .first();

    if (parseInt(businessesCount?.count || 0) > 0) {
      throw new Error('Cannot delete plan: there are businesses using this plan');
    }

    // Eliminar relaciones con features
    await db('plan_features').where({ plan_id: id }).delete();

    // Eliminar el plan
    return db('subscription_plans').where({ id }).delete();
  }
}

