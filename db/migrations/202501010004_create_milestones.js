exports.up = function (knex) {
  return knex.schema.createTable("milestones", (table) => {
    table.increments("id").primary();
    table.string("name").notNullable();
    table.text("description");
    table.integer("max_value").defaultTo(1);
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("milestones");
};
