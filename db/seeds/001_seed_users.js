const bcrypt = require("bcrypt");

exports.seed = async function (knex) {
  await knex("users").del();

  const hashManager = await bcrypt.hash("manager123", 10);
  const hashUser = await bcrypt.hash("user123", 10);

  await knex("users").insert([
    {
      username: "manager1",
      password_hash: hashManager,
      role: "manager"
    },
    {
      username: "user1",
      password_hash: hashUser,
      role: "user"
    }
  ]);
};
