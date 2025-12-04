const express = require("express");
const router = express.Router();
const db = require("../db");
const { requireLogin, requireManager } = require("../middleware/authMiddleware");


// ============================================================
// GET /events — list all event occurrences
// ============================================================
router.get("/", requireLogin, async (req, res) => {
  try {
    const eventsResult = await db.query(`
      SELECT
        eo.*,
        et.eventname AS template_eventname,
        et.eventtype,
        et.eventdescription,
        (
          SELECT COUNT(*) 
          FROM registration r 
          WHERE r.eventoccurrenceid = eo.eventoccurrenceid
        ) AS registrationcount
      FROM eventoccurrence eo
      JOIN eventtemplate et ON eo.eventtemplateid = et.eventtemplateid
      ORDER BY eo.eventdatetimestart DESC
    `);

    // ⭐ ADDED — get all registrations for THIS user
    let userRegistrations = [];
    if (req.session.user && req.session.user.participantid) {
      const regResult = await db.query(`
        SELECT eventoccurrenceid
        FROM registration
        WHERE participantid = $1
      `, [req.session.user.participantid]);

      userRegistrations = regResult.rows;
    }

    res.render("events/index", { 
      title: "Events",
      events: eventsResult.rows,
      registrations: userRegistrations,   // ⭐ ADDED
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


// ============================================================
// GET /events/new — create form
// ============================================================
router.get("/new", requireManager, async (req, res) => {
  try {
    const templates = await db.query(`
      SELECT * FROM eventtemplate ORDER BY eventname
    `);

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


// ============================================================
// POST /events — create event occurrence
// ============================================================
router.post("/", requireManager, async (req, res) => {
  const { 
    eventtemplateid,
    eventdatetimestart,
    eventdatetimeend,
    eventlocation,
    eventcapacity,
    eventregistrationdeadline 
  } = req.body;

  try {
    await db.query(
      `INSERT INTO eventoccurrence (
        eventoccurrenceid,
        eventtemplateid,
        eventdatetimestart,
        eventdatetimeend,
        eventlocation,
        eventcapacity,
        eventregistrationdeadline
      ) VALUES (
        (SELECT COALESCE(MAX(eventoccurrenceid), 0) + 1 FROM eventoccurrence),
        $1, $2, $3, $4, $5, $6
      )`,
      [
        eventtemplateid,
        eventdatetimestart,
        eventdatetimeend || null,
        eventlocation,
        eventcapacity || null,
        eventregistrationdeadline || null
      ]
    );

    req.flash("success", "Event created successfully");
    res.redirect("/events");

  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to create event");
    res.redirect("/events/new");
  }
});


// ============================================================
// GET /events/:id — event details page
// ============================================================
router.get("/:id", requireLogin, async (req, res) => {
  try {
    const eventResult = await db.query(`
      SELECT eo.*, et.eventname AS template_eventname, et.eventtype, et.eventdescription
      FROM eventoccurrence eo
      JOIN eventtemplate et ON eo.eventtemplateid = et.eventtemplateid
      WHERE eo.eventoccurrenceid = $1
    `, [req.params.id]);

    if (eventResult.rows.length === 0) {
      req.flash("error", "Event not found");
      return res.redirect("/events");
    }

    const templatesResult = await db.query(`
      SELECT eventtemplateid, eventname, eventtype
      FROM eventtemplate
      ORDER BY eventname
    `);

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
      event: eventResult.rows[0],
      templates: templatesResult.rows,
      registrations: registrations.rows,
      surveys: surveys.rows,
      currentUser: req.session.user,
      success: req.flash("success"),
      error: req.flash("error")
    });

  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to load event");
    res.redirect("/events");
  }
});


// ============================================================
// POST /events/:id/register — user signup
// ============================================================
router.post("/:id/register", requireLogin, async (req, res) => {
  console.log("REGISTER SESSION USER:", req.session.user);

  try {
    const user = req.session.user;

    if (user.role === "Manager") {
      req.flash("error", "Managers cannot sign up for events.");
      return res.redirect(`/events/${req.params.id}`);
    }

    // Load event details
    const eventResult = await db.query(`
      SELECT eventcapacity, eventregistrationdeadline
      FROM eventoccurrence
      WHERE eventoccurrenceid = $1
    `, [req.params.id]);

    if (eventResult.rows.length === 0) {
      req.flash("error", "Event not found.");
      return res.redirect("/events");
    }

    const event = eventResult.rows[0];

    // Deadline check
    if (event.eventregistrationdeadline && new Date() > new Date(event.eventregistrationdeadline)) {
      req.flash("error", "Registration deadline has passed.");
      return res.redirect(`/events/${req.params.id}`);
    }

    // Capacity check
    const countResult = await db.query(`
      SELECT COUNT(*) AS count
      FROM registration
      WHERE eventoccurrenceid = $1
    `, [req.params.id]);

    if (event.eventcapacity && Number(countResult.rows[0].count) >= event.eventcapacity) {
      req.flash("error", "This event is already full.");
      return res.redirect(`/events/${req.params.id}`);
    }

    // Create registration
    await db.query(`
      INSERT INTO registration (
        registrationid,
        participantid,
        eventoccurrenceid,
        registrationcreatedat
      ) VALUES (
        (SELECT COALESCE(MAX(registrationid), 0) + 1 FROM registration),
        $1, $2, NOW()
      )
    `, [user.participantid, req.params.id]);

    req.flash("success", "Successfully registered for this event!");

    // ⭐ UPDATED — redirect to event list
    return res.redirect("/events");

  } catch (err) {
    console.error("Signup ERROR:", err);
    req.flash("error", "You are already registered for this event.");
    return res.redirect(`/events/${req.params.id}`);
  }
});

// ============================================================
// POST /events/:id/unregister — remove user signup
// ============================================================
router.post("/:id/unregister", requireLogin, async (req, res) => {
  try {
    const user = req.session.user;

    if (!user.participantid) {
      req.flash("error", "You do not have a participant profile.");
      return res.redirect("/events");
    }

    await db.query(`
      DELETE FROM registration
      WHERE participantid = $1
      AND eventoccurrenceid = $2
    `, [user.participantid, req.params.id]);

    req.flash("success", "You have been unregistered from the event.");
    return res.redirect("/events");

  } catch (err) {
    console.error("Unregister ERROR:", err);
    req.flash("error", "Unable to unregister from this event.");
    return res.redirect("/events");
  }
});


// ============================================================
// GET /events/:id/edit — edit form
// ============================================================
router.get("/:id/edit", requireManager, async (req, res) => {
  try {
    const event = await db.query(`
      SELECT eo.*, et.eventname AS template_eventname
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


// ============================================================
// PUT /events/:id — update event occurrence
// ============================================================
router.put("/:id", requireManager, async (req, res) => {
  const { 
    eventtemplateid,
    eventdatetimestart,
    eventdatetimeend,
    eventlocation,
    eventcapacity,
    eventregistrationdeadline 
  } = req.body;

  try {
    await db.query(`
      UPDATE eventoccurrence
      SET 
        eventtemplateid = $1,
        eventdatetimestart = $2,
        eventdatetimeend = $3,
        eventlocation = $4,
        eventcapacity = $5,
        eventregistrationdeadline = $6
      WHERE eventoccurrenceid = $7
    `, [
      eventtemplateid,
      eventdatetimestart,
      eventdatetimeend || null,
      eventlocation,
      eventcapacity || null,
      eventregistrationdeadline || null,
      req.params.id
    ]);

    req.flash("success", "Event updated successfully");
    res.redirect("/events/" + req.params.id);

  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to update event");
    res.redirect("/events/" + req.params.id);
  }
});


// ============================================================
// DELETE /events/:id — delete event
// ============================================================
router.delete("/:id", requireManager, async (req, res) => {
  try {
    await db.query(`
      DELETE FROM eventoccurrence
      WHERE eventoccurrenceid = $1
    `, [req.params.id]);

    req.flash("success", "Event deleted successfully");
    res.redirect("/events");

  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to delete event");
    res.redirect("/events");
  }
});

module.exports = router;