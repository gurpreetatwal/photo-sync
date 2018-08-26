'use strict';

async function up(knex) {
  await knex.schema.createTable('user', table => {
    table
      .uuid('id')
      .primary()
      .defaultTo(knex.raw('uuid_generate_v4()'));

    table.string('microsoft_id').notNullable();
    table.foreign('microsoft_id').references('microsoft.id');

    table.string('facebook_id').notNullable();
    table.foreign('facebook_id').references('facebook.id');

    table.timestamps(true, true);
  });
}

async function down(knex) {
  await knex.schema.dropTable('user');
}

module.exports = {up, down};
