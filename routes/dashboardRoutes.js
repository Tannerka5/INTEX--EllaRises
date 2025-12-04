const express = require("express");
const router = express.Router();
const db = require("../db");
const { requireLogin, requireManager } = require("../middleware/authMiddleware");


/* ---------------------------------------------------------
   GET /dashboard  — redirect based on role
--------------------------------------------------------- */

router.get("/", requireLogin, (req, res) => {
  if (req.session.user.role === "Manager") {
    return res.redirect("/dashboard/admin");
  }
  return res.redirect("/dashboard/user");
});

/* ---------------------------------------------------------
   GET /dashboard/user  — Participant dashboard
--------------------------------------------------------- */

router.get("/user", requireLogin, async (req, res) => {
  try {
    // If a manager hits this route, send them to admin dashboard
    if (req.session.user.role === "Manager") {
      return res.redirect("/dashboard/admin");
    }

    const participantId = req.session.user.participantid;

    // Upcoming events for this participant
    const upcomingEventsRes = await db.query(
      `
      SELECT eo.eventdatetimestart, et.eventname
      FROM eventoccurrence eo
      JOIN eventtemplate et ON eo.eventtemplateid = et.eventtemplateid
      JOIN registration r ON r.eventoccurrenceid = eo.eventoccurrenceid
      WHERE r.participantid = $1
        AND eo.eventdatetimestart > NOW()
      ORDER BY eo.eventdatetimestart ASC
      LIMIT 5;
      `,
      [participantId]
    );

    // Events that need post‑event surveys from this participant
    const postSurveyEventsRes = await db.query(
      `
      SELECT eo.eventoccurrenceid, et.eventname, eo.eventdatetimestart
      FROM registration r
      JOIN eventoccurrence eo ON r.eventoccurrenceid = eo.eventoccurrenceid
      JOIN eventtemplate et ON eo.eventtemplateid = et.eventtemplateid
      WHERE r.participantid = $1
        AND eo.eventdatetimestart < NOW()
        AND NOT EXISTS (
          SELECT 1
          FROM survey s
          WHERE s.participantid = r.participantid
            AND s.eventoccurrenceid = eo.eventoccurrenceid
        )
      ORDER BY eo.eventdatetimestart DESC
      LIMIT 5;
      `,
      [participantId]
    );

    // Participant milestones
    const milestonesRes = await db.query(
      `
      SELECT milestoneid, milestonetitle, milestonedate
      FROM milestone
      WHERE participantid = $1
      ORDER BY milestonedate DESC NULLS LAST
      LIMIT 5;
      `,
      [participantId]
    );

    // Participant total donations (dollar amount)
    const donationsSumRes = await db.query(
      `
      SELECT COALESCE(SUM(donationamount), 0) AS total
      FROM donation
      WHERE participantid = $1;
      `,
      [participantId]
    );
    const userDonationTotal = Number(donationsSumRes.rows[0].total);

    res.render("dashboard/user", {
      title: "Dashboard",
      currentUser: req.session.user,
      upcomingEvents: upcomingEventsRes.rows,
      postSurveyEvents: postSurveyEventsRes.rows,
      milestones: milestonesRes.rows,
      userDonationTotal
    });
  } catch (err) {
    console.error(err);
    req.flash("error", "Unable to load your dashboard.");
    res.redirect("/");
  }
});

/* ---------------------------------------------------------
   GET /dashboard/admin  — Manager dashboard
--------------------------------------------------------- */

router.get("/admin", requireManager, async (req, res) => {
  const stats = {};

  // total participants
  const totalParticipants = await db.query(`SELECT COUNT(*) FROM participant`);
  stats.participants = totalParticipants.rows[0].count;

  // total events
  const totalEvents = await db.query(`SELECT COUNT(*) FROM eventoccurrence`);
  stats.events = totalEvents.rows[0].count;

  // total surveys
  const totalSurveys = await db.query(`SELECT COUNT(*) FROM survey`);
  stats.surveys = totalSurveys.rows[0].count;

  // recent participants
  const recentParticipants = await db.query(`
    SELECT participantfirstname, participantlastname, participantschooloremployer
    FROM participant
    ORDER BY participantid DESC
    LIMIT 4
  `);

  // upcoming events
  const upcomingEvents = await db.query(`
    SELECT et.eventname, eo.eventdatetimestart
    FROM eventoccurrence eo
    JOIN eventtemplate et ON eo.eventtemplateid = et.eventtemplateid
    WHERE eo.eventdatetimestart >= NOW()
    ORDER BY eo.eventdatetimestart ASC
    LIMIT 4
  `);

  // recent surveys
  const recentSurveys = await db.query(`
    SELECT 
      s.surveysubmissiondate,
      p.participantfirstname,
      p.participantlastname,
      et.eventname
    FROM survey s
    JOIN participant p ON s.participantid = p.participantid
    JOIN eventoccurrence eo ON s.eventoccurrenceid = eo.eventoccurrenceid
    JOIN eventtemplate et ON eo.eventtemplateid = et.eventtemplateid
    ORDER BY s.surveysubmissiondate DESC
    LIMIT 4;
  `);

  // milestone leaders
  const milestoneLeaders = await db.query(`
    SELECT 
      p.participantfirstname,
      p.participantlastname,
      COUNT(m.milestoneid) AS total
    FROM milestone m
    JOIN participant p ON m.participantid = p.participantid
    GROUP BY p.participantfirstname, p.participantlastname
    ORDER BY total DESC
    LIMIT 4;
  `);


  // donations
  const donations = await db.query(`
    SELECT 
      d.donationamount,
      d.donationdate,
      p.participantfirstname,
      p.participantlastname
    FROM donation d
    JOIN participant p 
      ON d.participantid = p.participantid
    ORDER BY d.donationid DESC
    LIMIT 4;
  `);


  res.render("dashboard/admin", {
    currentUser: req.session.user,
    stats,
    recentParticipants: recentParticipants.rows,
    upcomingEvents: upcomingEvents.rows,
    recentSurveys: recentSurveys.rows,
    milestoneLeaders: milestoneLeaders.rows,
    donations: donations.rows,
    success: req.flash("success"),
    error: req.flash("error")
  });
});


module.exports = router;
