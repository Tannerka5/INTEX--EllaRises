exports.up = function (knex) {
  return knex.schema.createTable("participants", (table) => {
    table.increments("id").primary();
    table.string("first_name").notNullable();
    table.string("last_name").notNullable();
    table.string("email").notNullable();
    table.string("phone");
    table.integer("age");
    table.string("school");
    table.string("city");
    table.string("state");
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("participants");
};
