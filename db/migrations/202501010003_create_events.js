exports.up = function (knex) {
  return knex.schema.createTable("events", (table) => {
    table.increments("id").primary();
    table.string("name").notNullable();
    table.text("description");
    table.string("event_type").notNullable();
    table.date("event_date").notNullable();
    table.string("location");
    table.integer("capacity");
    table.string("image_url");
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("events");
};
