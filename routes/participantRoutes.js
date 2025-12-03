const express = require("express");
const router = express.Router();
const db = require("../db");
const { requireLogin, requireManager } = require("../middleware/authMiddleware");

// GET /participants - list all
router.get("/", requireLogin, async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM participant ORDER BY participantlastname, participantfirstname");
    res.render("participants/index", { 
      title: "Participants", 
      participants: result.rows,
      currentUser: req.session.user,
      success: req.flash("success"),
      error: req.flash("error")
    });
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to load participants");
    res.redirect("/");
  }
});

// GET /participants/new - show create form
router.get("/new", requireManager, (req, res) => {
  res.render("participants/new", { 
    title: "Add Participant", 
    currentUser: req.session.user,
    error: req.flash("error")
  });
});

// POST /participants - create
router.post("/", requireManager, async (req, res) => {
  const { 
    participantemail, participantfirstname, participantlastname, participantdob,
    participantrole, participantphone, participantcity, participantstate,
    participantzip, participantschooloremployer, participantfieldofinterest 
  } = req.body;
  
  try {
    await db.query(
      `INSERT INTO participant (
        participantemail, participantfirstname, participantlastname, participantdob,
        participantrole, participantphone, participantcity, participantstate,
        participantzip, participantschooloremployer, participantfieldofinterest
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [participantemail, participantfirstname, participantlastname, participantdob || null,
       participantrole, participantphone, participantcity, participantstate,
       participantzip, participantschooloremployer, participantfieldofinterest]
    );
    req.flash("success", "Participant created successfully");
    res.redirect("/participants");
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to create participant");
    res.redirect("/participants/new");
  }
});

// GET /participants/:id - show single
router.get("/:id", requireLogin, async (req, res) => {
  try {
    const participant = await db.query("SELECT * FROM participant WHERE participantid = $1", [req.params.id]);
    if (participant.rows.length === 0) {
      req.flash("error", "Participant not found");
      return res.redirect("/participants");
    }
    
    const milestones = await db.query("SELECT * FROM milestone WHERE participantid = $1 ORDER BY milestonedate DESC", [req.params.id]);
    const registrations = await db.query(`
      SELECT r.*, eo.eventdatetimestart, eo.eventlocation, et.eventname, et.eventtype
      FROM registration r
      JOIN eventoccurrence eo ON r.eventoccurrenceid = eo.eventoccurrenceid
      JOIN eventtemplate et ON eo.eventtemplateid = et.eventtemplateid
      WHERE r.participantid = $1
      ORDER BY eo.eventdatetimestart DESC
    `, [req.params.id]);
    const donations = await db.query("SELECT * FROM donation WHERE participantid = $1 ORDER BY donationdate DESC", [req.params.id]);
    
    res.render("participants/show", { 
      title: "Participant Details",
      participant: participant.rows[0],
      milestones: milestones.rows,
      registrations: registrations.rows,
      donations: donations.rows,
      currentUser: req.session.user
    });
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to load participant");
    res.redirect("/participants");
  }
});

// GET /participants/:id/edit - show edit form
router.get("/:id/edit", requireManager, async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM participant WHERE participantid = $1", [req.params.id]);
    if (result.rows.length === 0) {
      req.flash("error", "Participant not found");
      return res.redirect("/participants");
    }
    res.render("participants/edit", { 
      title: "Edit Participant", 
      participant: result.rows[0],
      currentUser: req.session.user,
      error: req.flash("error")
    });
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to load participant");
    res.redirect("/participants");
  }
});

// PUT /participants/:id - update
router.put("/:id", requireManager, async (req, res) => {
  const { 
    participantemail, participantfirstname, participantlastname, participantdob,
    participantrole, participantphone, participantcity, participantstate,
    participantzip, participantschooloremployer, participantfieldofinterest 
  } = req.body;
  
  try {
    await db.query(
      `UPDATE participant SET 
        participantemail = $1, participantfirstname = $2, participantlastname = $3, 
        participantdob = $4, participantrole = $5, participantphone = $6, 
        participantcity = $7, participantstate = $8, participantzip = $9,
        participantschooloremployer = $10, participantfieldofinterest = $11
      WHERE participantid = $12`,
      [participantemail, participantfirstname, participantlastname, participantdob || null,
       participantrole, participantphone, participantcity, participantstate,
       participantzip, participantschooloremployer, participantfieldofinterest, req.params.id]
    );
    req.flash("success", "Participant updated successfully");
    res.redirect("/participants/" + req.params.id);
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to update participant");
    res.redirect("/participants/" + req.params.id + "/edit");
  }
});

// DELETE /participants/:id - delete
router.delete("/:id", requireManager, async (req, res) => {
  try {
    await db.query("DELETE FROM participant WHERE participantid = $1", [req.params.id]);
    req.flash("success", "Participant deleted successfully");
    res.redirect("/participants");
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to delete participant");
    res.redirect("/participants");
  }
});

module.exports = router;
