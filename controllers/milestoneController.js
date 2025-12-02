const db = require("../db/knex");

async function listMilestones(req, res) {
  const milestones = await db("milestones").select().orderBy("id");
  res.render("milestones/index", { title: "Milestones", milestones });
}

function getNewMilestone(req, res) {
  res.render("milestones/new", { title: "Add Milestone" });
}

async function createMilestone(req, res) {
  const { name, description, max_value } = req.body;
  await db("milestones").insert({
    name,
    description,
    max_value: max_value || 1
  });
  req.flash("success", "Milestone created.");
  res.redirect("/milestones");
}

async function getEditMilestone(req, res) {
  const milestone = await db("milestones").where({ id: req.params.id }).first();
  if (!milestone) {
    req.flash("error", "Milestone not found.");
    return res.redirect("/milestones");
  }
  res.render("milestones/edit", { title: "Edit Milestone", milestone });
}

async function updateMilestone(req, res) {
  const { name, description, max_value } = req.body;
  await db("milestones")
    .where({ id: req.params.id })
    .update({
      name,
      description,
      max_value: max_value || 1
    });
  req.flash("success", "Milestone updated.");
  res.redirect("/milestones");
}

async function deleteMilestone(req, res) {
  await db("milestones").where({ id: req.params.id }).del();
  req.flash("success", "Milestone deleted.");
  res.redirect("/milestones");
}

module.exports = {
  listMilestones,
  getNewMilestone,
  createMilestone,
  getEditMilestone,
  updateMilestone,
  deleteMilestone
};
