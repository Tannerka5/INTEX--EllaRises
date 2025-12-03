const express = require("express");
const router = express.Router();
const db = require("../db");
const { requireLogin, requireManager } = require("../middleware/authMiddleware");

// GET /events - list all event occurrences
router.get("/", requireLogin, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT eo.*, et.eventname, et.eventtype, et.eventdescription
      FROM eventoccurrence eo
      JOIN eventtemplate et ON eo.eventtemplateid = et.eventtemplateid
      ORDER BY eo.eventdatetimestart DESC
    `);
    res.render("events/index", { 
      title: "Events", 
      events: result.rows,
      currentUser: req.session.user,
      success: req.flash("success"),
      error: req.flash("error")
    });
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to load events");
    res.redirect("/");
  }
});

// GET /events/new - show create form
router.get("/new", requireManager, async (req, res) => {
  try {
    const templates = await db.query("SELECT * FROM eventtemplate ORDER BY eventname");
    res.render("events/new", { 
      title: "Add Event", 
      templates: templates.rows,
      currentUser: req.session.user,
      error: req.flash("error")
    });
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to load form");
    res.redirect("/events");
  }
});

// POST /events - create event occurrence
router.post("/", requireManager, async (req, res) => {
  const { 
    eventtemplateid, eventdatetimestart, eventdatetimeend,
    eventlocation, eventcapacity, eventregistrationdeadline 
  } = req.body;
  
  try {
    await db.query(
      `INSERT INTO eventoccurrence (
        eventtemplateid, eventdatetimestart, eventdatetimeend,
        eventlocation, eventcapacity, eventregistrationdeadline
      ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [eventtemplateid, eventdatetimestart, eventdatetimeend || null,
       eventlocation, eventcapacity || null, eventregistrationdeadline || null]
    );
    req.flash("success", "Event created successfully");
    res.redirect("/events");
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to create event");
    res.redirect("/events/new");
  }
});

// GET /events/:id - show single event with registrations
router.get("/:id", requireLogin, async (req, res) => {
  try {
    const event = await db.query(`
      SELECT eo.*, et.eventname, et.eventtype, et.eventdescription
      FROM eventoccurrence eo
      JOIN eventtemplate et ON eo.eventtemplateid = et.eventtemplateid
      WHERE eo.eventoccurrenceid = $1
    `, [req.params.id]);
    
    if (event.rows.length === 0) {
      req.flash("error", "Event not found");
      return res.redirect("/events");
    }
    
    const registrations = await db.query(`
      SELECT r.*, p.participantfirstname, p.participantlastname, p.participantemail
      FROM registration r
      JOIN participant p ON r.participantid = p.participantid
      WHERE r.eventoccurrenceid = $1
      ORDER BY r.registrationcreatedat DESC
    `, [req.params.id]);
    
    const surveys = await db.query(`
      SELECT s.*, p.participantfirstname, p.participantlastname
      FROM survey s
      JOIN participant p ON s.participantid = p.participantid
      WHERE s.eventoccurrenceid = $1
      ORDER BY s.surveysubmissiondate DESC
    `, [req.params.id]);
    
    res.render("events/show", { 
      title: "Event Details",
      event: event.rows[0],
      registrations: registrations.rows,
      surveys: surveys.rows,
      currentUser: req.session.user
    });
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to load event");
    res.redirect("/events");
  }
});

// GET /events/:id/edit - show edit form
router.get("/:id/edit", requireManager, async (req, res) => {
  try {
    const event = await db.query(`
      SELECT eo.*, et.eventname
      FROM eventoccurrence eo
      JOIN eventtemplate et ON eo.eventtemplateid = et.eventtemplateid
      WHERE eo.eventoccurrenceid = $1
    `, [req.params.id]);
    
    if (event.rows.length === 0) {
      req.flash("error", "Event not found");
      return res.redirect("/events");
    }
    
    const templates = await db.query("SELECT * FROM eventtemplate ORDER BY eventname");
    
    res.render("events/edit", { 
      title: "Edit Event", 
      event: event.rows[0],
      templates: templates.rows,
      currentUser: req.session.user,
      error: req.flash("error")
    });
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to load event");
    res.redirect("/events");
  }
});

// PUT /events/:id - update
router.put("/:id", requireManager, async (req, res) => {
  const { 
    eventtemplateid, eventdatetimestart, eventdatetimeend,
    eventlocation, eventcapacity, eventregistrationdeadline 
  } = req.body;
  
  try {
    await db.query(
      `UPDATE eventoccurrence SET 
        eventtemplateid = $1, eventdatetimestart = $2, eventdatetimeend = $3,
        eventlocation = $4, eventcapacity = $5, eventregistrationdeadline = $6
      WHERE eventoccurrenceid = $7`,
      [eventtemplateid, eventdatetimestart, eventdatetimeend || null,
       eventlocation, eventcapacity || null, eventregistrationdeadline || null, req.params.id]
    );
    req.flash("success", "Event updated successfully");
    res.redirect("/events/" + req.params.id);
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to update event");
    res.redirect("/events/" + req.params.id + "/edit");
  }
});

// DELETE /events/:id - delete
router.delete("/:id", requireManager, async (req, res) => {
  try {
    await db.query("DELETE FROM eventoccurrence WHERE eventoccurrenceid = $1", [req.params.id]);
    req.flash("success", "Event deleted successfully");
    res.redirect("/events");
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to delete event");
    res.redirect("/events");
  }
});

module.exports = router;
