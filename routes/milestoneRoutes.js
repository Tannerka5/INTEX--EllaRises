const express = require("express");
const router = express.Router();
const db = require("../db");
const { requireLogin, requireManager } = require("../middleware/authMiddleware");

// GET /milestones - list all
router.get("/", requireLogin, async (req, res) => {
  try {
    let milestones;

    if (req.session.user.role === "Manager") {
      // Managers see ALL milestones
      const result = await db.query(`
        SELECT
          m.milestoneid,
          m.milestonetitle,
          m.milestonedate,
          p.participantid,
          p.participantfirstname,
          p.participantlastname
        FROM milestone m
        JOIN participant p ON m.participantid = p.participantid
        ORDER BY m.milestonedate DESC NULLS LAST,
                 p.participantlastname,
                 p.participantfirstname;
      `);
      milestones = result.rows;
    } else {
      // Users see ONLY their own milestones
      const result = await db.query(`
        SELECT
          m.milestoneid,
          m.milestonetitle,
          m.milestonedate,
          p.participantid,
          p.participantfirstname,
          p.participantlastname
        FROM milestone m
        JOIN participant p ON m.participantid = p.participantid
        WHERE m.participantid = $1
        ORDER BY m.milestonedate DESC NULLS LAST;
      `, [req.session.user.participantid]);
      milestones = result.rows;
    }

    res.render("milestones/index", {
      title: "Milestones",
      currentUser: req.session.user,
      milestones
    });
  } catch (err) {
    console.error(err);
    req.flash("error", "Unable to load milestones.");
    res.redirect("/");
  }
});

// GET /milestones/new - show create form
router.get("/new", requireManager, async (req, res) => {
  try {
    const participants = await db.query("SELECT participantid, participantfirstname, participantlastname FROM participant ORDER BY participantlastname");
    res.render("milestones/new", { 
      title: "Add Milestone", 
      participants: participants.rows,
      currentUser: req.session.user,
      error: req.flash("error")
    });
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to load form");
    res.redirect("/milestones");
  }
});

// POST /milestones - create
router.post("/", requireManager, async (req, res) => {
  const { participantid, milestonetitle, milestonedate } = req.body;
  
  try {
    await db.query(
      "INSERT INTO milestone (participantid, milestonetitle, milestonedate) VALUES ($1, $2, $3)",
      [participantid, milestonetitle, milestonedate]
    );
    req.flash("success", "Milestone created successfully");
    res.redirect("/milestones");
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to create milestone");
    res.redirect("/milestones/new");
  }
});

// GET /milestones/:id - show single milestone
// routes/milestoneRoutes.js
router.get("/:id", requireLogin, async (req, res) => {
  try {
    const milestoneResult = await db.query(`
      SELECT m.*, p.participantfirstname, p.participantlastname
      FROM milestone m
      JOIN participant p ON m.participantid = p.participantid
      WHERE m.milestoneid = $1
    `, [req.params.id]);

    if (milestoneResult.rows.length === 0) {
      req.flash("error", "Milestone not found");
      return res.redirect("/milestones");
    }

    const participantsResult = await db.query(`
      SELECT participantid, participantfirstname, participantlastname, participantdob
      FROM participant
      ORDER BY participantlastname, participantfirstname
    `);

    res.render("milestones/show", {
      title: "Milestone Details",
      milestone: milestoneResult.rows[0],
      participants: participantsResult.rows,   // <-- key line
      currentUser: req.session.user,
      success: req.flash("success"),
      error: req.flash("error")
    });
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to load milestone");
    res.redirect("/milestones");
  }
});


// GET /milestones/:id/edit - show edit form
router.get("/:id/edit", requireManager, async (req, res) => {
  try {
    const milestone = await db.query("SELECT * FROM milestone WHERE milestoneid = $1", [req.params.id]);
    if (milestone.rows.length === 0) {
      req.flash("error", "Milestone not found");
      return res.redirect("/milestones");
    }
    
    const participants = await db.query("SELECT participantid, participantfirstname, participantlastname FROM participant ORDER BY participantlastname");
    
    res.render("milestones/edit", { 
      title: "Edit Milestone", 
      milestone: milestone.rows[0],
      participants: participants.rows,
      currentUser: req.session.user,
      error: req.flash("error")
    });
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to load milestone");
    res.redirect("/milestones");
  }
});

// PUT /milestones/:id - update
router.put("/:id", requireManager, async (req, res) => {
  const { participantid, milestonetitle, milestonedate } = req.body;
  
  try {
    await db.query(
      "UPDATE milestone SET participantid = $1, milestonetitle = $2, milestonedate = $3 WHERE milestoneid = $4",
      [participantid, milestonetitle, milestonedate, req.params.id]
    );
    req.flash("success", "Milestone updated successfully");
    res.redirect("/milestones");
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to update milestone");
    res.redirect("/milestones/" + req.params.id + "/edit");
  }
});

// DELETE /milestones/:id - delete
router.delete("/:id", requireManager, async (req, res) => {
  try {
    await db.query("DELETE FROM milestone WHERE milestoneid = $1", [req.params.id]);
    req.flash("success", "Milestone deleted successfully");
    res.redirect("/milestones");
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to delete milestone");
    res.redirect("/milestones");
  }
});

module.exports = router;
