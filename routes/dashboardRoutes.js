const express = require("express");
const router = express.Router();
const db = require("../db");
const { requireLogin } = require("../middleware/authMiddleware");

/* ---------------------------------------------------------
   GET /dashboard — redirect based on role
--------------------------------------------------------- */
router.get("/", requireLogin, (req, res) => {
  if (req.session.user.role === "Manager") {
    return res.redirect("/dashboard/admin");
  } else {
    return res.redirect("/dashboard/user");
  }
});

/* ---------------------------------------------------------
   GET /dashboard/user — User Dashboard
--------------------------------------------------------- */
router.get("/user", requireLogin, async (req, res) => {
  if (req.session.user.role === "Manager") {
    return res.redirect("/dashboard/admin");
  }

  try {
    // Always visible
    const participants = await db.query(`
      SELECT participantid, participantfirstname, participantlastname, participantschooloremployer
      FROM participant
      ORDER BY participantid DESC
      LIMIT 3;
    `);

    const upcomingEvents = await db.query(`
      SELECT eo.*, et.eventname, et.eventtype
      FROM eventoccurrence eo
      JOIN eventtemplate et ON eo.eventtemplateid = et.eventtemplateid
      WHERE eo.eventdatetimestart > NOW()
      ORDER BY eo.eventdatetimestart ASC
      LIMIT 3;
    `);

    // Conditional sections
    let postSurveyEvents = [];
    let milestones = [];
    let donations = [];

    if (req.session.user.participantid) {

      postSurveyEvents = (await db.query(`
        SELECT eo.eventoccurrenceid, et.eventname, eo.eventdatetimestart
        FROM registration r
        JOIN eventoccurrence eo ON r.eventoccurrenceid = eo.eventoccurrenceid
        JOIN eventtemplate et ON eo.eventtemplateid = et.eventtemplateid
        WHERE r.participantid = $1
          AND eo.eventdatetimestart < NOW()
          AND NOT EXISTS (
            SELECT 1 FROM survey s
            WHERE s.participantid = r.participantid
              AND s.eventoccurrenceid = eo.eventoccurrenceid
          )
        ORDER BY eo.eventdatetimestart DESC
        LIMIT 3;
      `, [req.session.user.participantid])).rows;

      milestones = (await db.query(`
        SELECT milestoneid, milestonetitle, milestonedate,
          CASE WHEN milestonedate IS NULL THEN false ELSE true END AS completed
        FROM milestone
        WHERE participantid = $1
        ORDER BY milestonedate DESC NULLS LAST
        LIMIT 3;
      `, [req.session.user.participantid])).rows;

      donations = (await db.query(`
        SELECT donationid, donationamount, donationdate,
               p.participantfirstname || ' ' || p.participantlastname AS donorname
        FROM donation d
        JOIN participant p ON d.participantid = p.participantid
        WHERE d.participantid = $1
        ORDER BY donationdate DESC
        LIMIT 3;
      `, [req.session.user.participantid])).rows;
    }

    res.render("dashboard/user", {
      title: "Dashboard",
      currentUser: req.session.user,
      participants: participants.rows,
      upcomingEvents: upcomingEvents.rows,
      postSurveyEvents,
      milestones,
      donations
    });

  } catch (err) {
    console.error(err);
    res.redirect("/");
  }
});

/* ---------------------------------------------------------
   GET /dashboard/admin — Manager Dashboard (Option D)
--------------------------------------------------------- */
router.get("/admin", requireLogin, async (req, res) => {
  if (req.session.user.role !== "Manager") {
    return res.redirect("/dashboard/user");
  }

  try {
    // Stats
    const participantCount = await db.query("SELECT COUNT(*) FROM participant");
    const eventCount = await db.query("SELECT COUNT(*) FROM eventoccurrence");
    const surveyCount = await db.query("SELECT COUNT(*) FROM survey");

    // Recent participants
    const recentParticipants = await db.query(`
      SELECT * FROM participant
      ORDER BY participantid DESC
      LIMIT 3;
    `);

    // Upcoming events
    const upcomingEvents = await db.query(`
      SELECT eo.*, et.eventname
      FROM eventoccurrence eo
      JOIN eventtemplate et ON eo.eventtemplateid = et.eventtemplateid
      WHERE eo.eventdatetimestart > NOW()
      ORDER BY eo.eventdatetimestart ASC
      LIMIT 3;
    `);

    // Recent surveys
    const recentSurveys = await db.query(`
      SELECT s.*, p.participantfirstname, p.participantlastname, et.eventname
      FROM survey s
      JOIN participant p ON s.participantid = p.participantid
      JOIN eventoccurrence eo ON s.eventoccurrenceid = eo.eventoccurrenceid
      JOIN eventtemplate et ON eo.eventtemplateid = et.eventtemplateid
      ORDER BY s.surveysubmissiondate DESC
      LIMIT 3;
    `);

    // Milestone leaders
    const milestoneLeaders = await db.query(`
      SELECT p.participantfirstname, p.participantlastname, COUNT(m.milestoneid) AS total
      FROM milestone m
      JOIN participant p ON m.participantid = p.participantid
      GROUP BY p.participantfirstname, p.participantlastname
      ORDER BY total DESC
      LIMIT 3;
    `);

    // Donations
    const donations = await db.query(`
      SELECT d.*, 
             p.participantfirstname || ' ' || p.participantlastname AS donorname
      FROM donation d
      JOIN participant p ON p.participantid = d.participantid
      ORDER BY donationdate DESC
      LIMIT 3;
    `);

    res.render("dashboard/admin", {
      title: "Manager Dashboard",
      currentUser: req.session.user,
      stats: {
        participants: participantCount.rows[0].count,
        events: eventCount.rows[0].count,
        surveys: surveyCount.rows[0].count
      },
      recentParticipants: recentParticipants.rows,
      upcomingEvents: upcomingEvents.rows,
      recentSurveys: recentSurveys.rows,
      milestoneLeaders: milestoneLeaders.rows,
      donations: donations.rows
    });

  } catch (err) {
    console.error(err);
    res.redirect("/");
  }
});

module.exports = router;
