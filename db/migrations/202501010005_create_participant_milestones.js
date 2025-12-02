exports.up = function (knex) {
  return knex.schema.createTable("participant_milestones", (table) => {
    table.increments("id").primary();
    table
      .integer("participant_id")
      .unsigned()
      .references("id")
      .inTable("participants")
      .onDelete("CASCADE");
    table
      .integer("milestone_id")
      .unsigned()
      .references("id")
      .inTable("milestones")
      .onDelete("CASCADE");
    table.integer("value").defaultTo(1);
    table.timestamp("achieved_at").defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("participant_milestones");
};
