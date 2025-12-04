const express = require("express");
const router = express.Router();
const db = require("../db");
const { requireLogin } = require("../middleware/authMiddleware");

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

router.get("/admin", requireLogin, async (req, res) => {
  try {
    if (req.session.user.role !== "Manager") {
      return res.redirect("/dashboard/user");
    }

    // Global counts + total donation dollars
    const [pCountRes, eCountRes, sCountRes, mCountRes, dSumRes] = await Promise.all([
      db.query("SELECT COUNT(*) AS count FROM participant"),
      db.query("SELECT COUNT(*) AS count FROM eventoccurrence"),
      db.query("SELECT COUNT(*) AS count FROM survey"),
      db.query("SELECT COUNT(*) AS count FROM milestone"),
      db.query("SELECT COALESCE(SUM(donationamount), 0) AS total FROM donation")
    ]);

    const participantCount = Number(pCountRes.rows[0].count);
    const eventCount = Number(eCountRes.rows[0].count);
    const surveyCount = Number(sCountRes.rows[0].count);
    const milestoneTotal = Number(mCountRes.rows[0].count);
    const donationTotal = Number(dSumRes.rows[0].total);

    // Recent / summary lists
    const [
      recentParticipantsRes,
      upcomingEventsRes,
      recentSurveysRes,
      milestoneLeadersRes,
      donationsRes
    ] = await Promise.all([
      db.query(`
        SELECT participantfirstname, participantlastname, participantschooloremployer
        FROM participant
        ORDER BY participantid DESC
        LIMIT 5;
      `),
      db.query(`
        SELECT eo.eventdatetimestart, et.eventname
        FROM eventoccurrence eo
        JOIN eventtemplate et ON eo.eventtemplateid = et.eventtemplateid
        WHERE eo.eventdatetimestart > NOW()
        ORDER BY eo.eventdatetimestart ASC
        LIMIT 5;
      `),
      db.query(`
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
        LIMIT 5;
      `),
      db.query(`
        SELECT
          p.participantfirstname,
          p.participantlastname,
          COUNT(m.milestoneid) AS total
        FROM milestone m
        JOIN participant p ON m.participantid = p.participantid
        GROUP BY p.participantfirstname, p.participantlastname
        ORDER BY total DESC
        LIMIT 5;
      `),
      db.query(`
        SELECT
          d.donationamount,
          d.donationdate,
          p.participantfirstname || ' ' || p.participantlastname AS donorname
        FROM donation d
        JOIN participant p ON p.participantid = d.participantid
        ORDER BY donationdate DESC
        LIMIT 5;
      `)
    ]);

    res.render("dashboard/admin", {
      title: "Manager Dashboard",
      currentUser: req.session.user,
      participantCount,
      eventCount,
      surveyCount,
      milestoneTotal,
      donationTotal,
      recentParticipants: recentParticipantsRes.rows,
      upcomingEvents: upcomingEventsRes.rows,
      recentSurveys: recentSurveysRes.rows,
      milestoneLeaders: milestoneLeadersRes.rows,
      donations: donationsRes.rows
    });
  } catch (err) {
    console.error(err);
    req.flash("error", "Unable to load manager dashboard.");
    res.redirect("/");
  }
});

module.exports = router;
