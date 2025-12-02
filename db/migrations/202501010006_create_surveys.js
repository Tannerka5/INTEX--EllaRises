exports.up = function (knex) {
  return knex.schema.createTable("surveys", (table) => {
    table.increments("id").primary();
    table
      .integer("participant_id")
      .unsigned()
      .references("id")
      .inTable("participants")
      .onDelete("CASCADE");
    table
      .integer("event_id")
      .unsigned()
      .references("id")
      .inTable("events")
      .onDelete("CASCADE");
    table.integer("satisfaction").notNullable();
    table.integer("usefulness").notNullable();
    table.integer("recommendation_score").notNullable();
    table.text("comments");
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("surveys");
};
