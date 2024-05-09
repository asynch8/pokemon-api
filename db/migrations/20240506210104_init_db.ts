import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('pokemon', function (table) {
    table.increments('id');
    table.string('name', 255).notNullable();
    table.string('num', 3).notNullable().unique();
    table.string('img', 255).notNullable();
    table.json('type').notNullable();
    table.string('height', 255).notNullable();
    table.float('weight').notNullable();
    table.string('candy', 255).notNullable();
    table.integer('candy_count').nullable();
    table.float('egg').nullable();
    table.float('spawn_chance').notNullable();
    table.float('avg_spawns').notNullable();
    table.string('spawn_time', 255).notNullable();
    table.json('multipliers').nullable();
    table.json('weaknesses').notNullable();
    table.json('prev_evolution').nullable();
    table.json('next_evolution').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('pokemon');
}
