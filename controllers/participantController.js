const db = require("../db/knex");

async function listParticipants(req, res) {
  const participants = await db("participants").select().orderBy("last_name");
  res.render("participants/index", { title: "Participants", participants });
}

function getNewParticipant(req, res) {
  res.render("participants/new", { title: "Add Participant" });
}

async function createParticipant(req, res) {
  const { first_name, last_name, email, phone, age, school, city, state } = req.body;
  await db("participants").insert({
    first_name,
    last_name,
    email,
    phone,
    age: age || null,
    school,
    city,
    state
  });
  req.flash("success", "Participant added.");
  res.redirect("/participants");
}

async function getEditParticipant(req, res) {
  const participant = await db("participants").where({ id: req.params.id }).first();
  if (!participant) {
    req.flash("error", "Participant not found.");
    return res.redirect("/participants");
  }
  res.render("participants/edit", { title: "Edit Participant", participant });
}

async function updateParticipant(req, res) {
  const { first_name, last_name, email, phone, age, school, city, state } = req.body;
  await db("participants")
    .where({ id: req.params.id })
    .update({
      first_name,
      last_name,
      email,
      phone,
      age: age || null,
      school,
      city,
      state
    });
  req.flash("success", "Participant updated.");
  res.redirect("/participants");
}

async function deleteParticipant(req, res) {
  await db("participants").where({ id: req.params.id }).del();
  req.flash("success", "Participant deleted.");
  res.redirect("/participants");
}

module.exports = {
  listParticipants,
  getNewParticipant,
  createParticipant,
  getEditParticipant,
  updateParticipant,
  deleteParticipant
};
