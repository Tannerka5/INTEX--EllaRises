exports.up = function (knex) {
  return knex.schema.createTable("donations", (table) => {
    table.increments("id").primary();
    table.string("donor_name").notNullable();
    table.string("donor_email");
    table.decimal("amount", 10, 2);
    table.text("notes");
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("donations");
};
