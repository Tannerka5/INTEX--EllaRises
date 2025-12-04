const db = require("../db");

// GET /participants — list all participants
async function listParticipants(req, res) {
  const result = await db.query(`
    SELECT participantid,
           participantfirstname,
           participantlastname,
           participantemail,
           participantphone,
           participantcity,
           participantstate,
           participantschooloremployer,
           participantfieldofinterest
    FROM participant
    ORDER BY participantlastname ASC, participantfirstname ASC
  `);

  res.render("participants/index", {
    title: "Participants",
    participants: result.rows
  });
}

// GET /participants/new — render form
function getNewParticipant(req, res) {
  res.render("participants/new", { title: "Add Participant" });
}

// POST /participants — create participant
async function createParticipant(req, res) {
  const {
    participantfirstname,
    participantlastname,
    participantemail,
    participantphone,
    participantcity,
    participantstate,
    participantzip,
    participantschooloremployer,
    participantfieldofinterest,
    participantdob
  } = req.body;

  await db.query(
    `INSERT INTO participant
      (participantfirstname, participantlastname, participantemail, participantphone,
       participantcity, participantstate, participantzip,
       participantschooloremployer, participantfieldofinterest, participantdob)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
    [
      participantfirstname,
      participantlastname,
      participantemail,
      participantphone,
      participantcity,
      participantstate,
      participantzip || null,
      participantschooloremployer || null,
      participantfieldofinterest || null,
      participantdob || null
    ]
  );

  req.flash("success", "Participant created.");
  res.redirect("/participants");
}

// GET /participants/:id/edit
async function getEditParticipant(req, res) {
  const result = await db.query(
    `SELECT * FROM participant WHERE participantid = $1`,
    [req.params.id]
  );

  if (result.rows.length === 0) {
    req.flash("error", "Participant not found.");
    return res.redirect("/participants");
  }

  res.render("participants/edit", {
    title: "Edit Participant",
    participant: result.rows[0]
  });
}

// PUT /participants/:id — update
async function updateParticipant(req, res) {
  const {
    participantfirstname,
    participantlastname,
    participantemail,
    participantphone,
    participantcity,
    participantstate,
    participantzip,
    participantschooloremployer,
    participantfieldofinterest,
    participantdob
  } = req.body;

  await db.query(
    `UPDATE participant
     SET participantfirstname = $1,
         participantlastname = $2,
         participantemail = $3,
         participantphone = $4,
         participantcity = $5,
         participantstate = $6,
         participantzip = $7,
         participantschooloremployer = $8,
         participantfieldofinterest = $9,
         participantdob = $10
     WHERE participantid = $11`,
    [
      participantfirstname,
      participantlastname,
      participantemail,
      participantphone,
      participantcity,
      participantstate,
      participantzip || null,
      participantschooloremployer || null,
      participantfieldofinterest || null,
      participantdob || null,
      req.params.id
    ]
  );

  req.flash("success", "Participant updated.");
  res.redirect("/participants");
}

// DELETE /participants/:id
async function deleteParticipant(req, res) {
  await db.query(
    `DELETE FROM participant WHERE participantid = $1`,
    [req.params.id]
  );

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
