const express = require("express");
const router = express.Router();
const db = require("../db");
const { requireLogin, requireManager } = require("../middleware/authMiddleware");

// GET /donations - list all
router.get("/", requireLogin, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT d.*, p.participantfirstname, p.participantlastname
      FROM donation d
      JOIN participant p ON d.participantid = p.participantid
      ORDER BY d.donationdate DESC
    `);
    res.render("donations/index", { 
      title: "Donations", 
      donations: result.rows,
      currentUser: req.session.user,
      success: req.flash("success"),
      error: req.flash("error")
    });
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to load donations");
    res.redirect("/");
  }
});

// GET /donations/new - show create form
router.get("/new", requireManager, async (req, res) => {
  try {
    const participants = await db.query("SELECT participantid, participantfirstname, participantlastname FROM participant ORDER BY participantlastname");
    res.render("donations/new", { 
      title: "Add Donation", 
      participants: participants.rows,
      currentUser: req.session.user,
      error: req.flash("error")
    });
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to load form");
    res.redirect("/donations");
  }
});

// POST /donations - create
router.post("/", requireManager, async (req, res) => {
  const { participantid, donationdate, donationamount } = req.body;
  
  try {
    await db.query(
      "INSERT INTO donation (participantid, donationdate, donationamount) VALUES ($1, $2, $3)",
      [participantid, donationdate, donationamount]
    );
    req.flash("success", "Donation created successfully");
    res.redirect("/donations");
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to create donation");
    res.redirect("/donations/new");
  }
});

// GET /donations/:id - show single donation
router.get("/:id", requireLogin, async (req, res) => {
  try {
    const donationResult = await db.query(`
      SELECT d.*, p.participantfirstname, p.participantlastname, p.participantid
      FROM donation d
      JOIN participant p ON d.participantid = p.participantid
      WHERE d.donationid = $1
    `, [req.params.id]);

    if (donationResult.rows.length === 0) {
      req.flash("error", "Donation not found");
      return res.redirect("/donations");
    }

    // Fetch all participants for the dropdown
    const participantsResult = await db.query(`
      SELECT participantid, participantfirstname, participantlastname, participantdob
      FROM participant
      ORDER BY participantlastname, participantfirstname
    `);

    res.render("donations/show", {
      title: "Donation Details",
      donation: donationResult.rows[0],
      participants: participantsResult.rows,   // <-- key line
      currentUser: req.session.user,
      success: req.flash("success"),
      error: req.flash("error")
    });
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to load donation");
    res.redirect("/donations");
  }
});


// GET /donations/:id/edit - show edit form
router.get("/:id/edit", requireManager, async (req, res) => {
  try {
    const donation = await db.query("SELECT * FROM donation WHERE donationid = $1", [req.params.id]);
    if (donation.rows.length === 0) {
      req.flash("error", "Donation not found");
      return res.redirect("/donations");
    }
    
    const participants = await db.query("SELECT participantid, participantfirstname, participantlastname FROM participant ORDER BY participantlastname");
    
    res.render("donations/edit", { 
      title: "Edit Donation", 
      donation: donation.rows[0],
      participants: participants.rows,
      currentUser: req.session.user,
      error: req.flash("error")
    });
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to load donation");
    res.redirect("/donations");
  }
});

// PUT /donations/:id - update
router.put("/:id", requireManager, async (req, res) => {
  const { participantid, donationdate, donationamount } = req.body;
  
  try {
    await db.query(
      "UPDATE donation SET participantid = $1, donationdate = $2, donationamount = $3 WHERE donationid = $4",
      [participantid, donationdate, donationamount, req.params.id]
    );
    req.flash("success", "Donation updated successfully");
    res.redirect("/donations/" + req.params.id);
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to update donation");
    res.redirect("/donations/" + req.params.id + "/edit");
  }
});

// DELETE /donations/:id - delete
router.delete("/:id", requireManager, async (req, res) => {
  try {
    await db.query("DELETE FROM donation WHERE donationid = $1", [req.params.id]);
    req.flash("success", "Donation deleted successfully");
    res.redirect("/donations");
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to delete donation");
    res.redirect("/donations");
  }
});

module.exports = router;
