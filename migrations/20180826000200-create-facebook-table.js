'use strict';

async function up(knex) {
  await knex.schema.createTable('facebook', table => {
    table
      .string('id')
      .primary()
      .notNullable();
    table.text('access_token').notNullable();
    table.timestamp('expires_at').notNullable();
    table.timestamps(true, true);
  });
}

async function down(knex) {
  await knex.schema.dropTable('facebook');
}

module.exports = {up, down};
