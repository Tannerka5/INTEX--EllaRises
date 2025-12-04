const db = require("../db");

// GET /milestones — list all milestones
async function listMilestones(req, res) {
  const result = await db.query(`
    SELECT m.milestoneid, m.milestonetitle, m.milestonedate,
           p.participantfirstname || ' ' || p.participantlastname AS participantname
    FROM milestone m
    JOIN participant p ON p.participantid = m.participantid
    ORDER BY m.milestonedate DESC, m.milestoneid DESC
  `);

  res.render("milestones/index", {
    title: "Milestones",
    milestones: result.rows
  });
}

// GET /milestones/new
function getNewMilestone(req, res) {
  res.render("milestones/new", { title: "Add Milestone" });
}

// POST /milestones — create
async function createMilestone(req, res) {
  const { participantid, milestonetitle, milestonedate } = req.body;

  await db.query(
    `INSERT INTO milestone (participantid, milestonetitle, milestonedate)
     VALUES ($1, $2, $3)`,
    [participantid, milestonetitle, milestonedate]
  );

  req.flash("success", "Milestone created.");
  res.redirect("/milestones");
}

// GET /milestones/:id/edit
async function getEditMilestone(req, res) {
  const result = await db.query(
    `SELECT * FROM milestone WHERE milestoneid = $1`,
    [req.params.id]
  );

  if (result.rows.length === 0) {
    req.flash("error", "Milestone not found.");
    return res.redirect("/milestones");
  }

  res.render("milestones/edit", {
    title: "Edit Milestone",
    milestone: result.rows[0]
  });
}

// PUT /milestones/:id — update
async function updateMilestone(req, res) {
  const { milestonetitle, milestonedate } = req.body;

  await db.query(
    `UPDATE milestone
     SET milestonetitle = $1,
         milestonedate = $2
     WHERE milestoneid = $3`,
    [milestonetitle, milestonedate, req.params.id]
  );

  req.flash("success", "Milestone updated.");
  res.redirect("/milestones");
}

// DELETE /milestones/:id
async function deleteMilestone(req, res) {
  await db.query(
    `DELETE FROM milestone WHERE milestoneid = $1`,
    [req.params.id]
  );

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
