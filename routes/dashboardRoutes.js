const express = require("express");
const router = express.Router();
const db = require("../db");
const { requireLogin } = require("../middleware/authMiddleware");

// GET /dashboard - redirect based on role
router.get("/", requireLogin, (req, res) => {
  if (req.session.user.role === "Manager") {
    return res.redirect("/dashboard/admin");
  } else {
    return res.redirect("/dashboard/user");
  }
});

// GET /dashboard/admin - manager dashboard
router.get("/admin", requireLogin, async (req, res) => {
  if (req.session.user.role !== "Manager") {
    return res.redirect("/dashboard/user");
  }
  
  try {
    const participantCount = await db.query("SELECT COUNT(*) FROM participant");
    const eventCount = await db.query("SELECT COUNT(*) FROM eventoccurrence");
    const surveyCount = await db.query("SELECT COUNT(*) FROM survey");
    const donationTotal = await db.query("SELECT COALESCE(SUM(donationamount), 0) as total FROM donation");
    
    const recentSurveys = await db.query(`
      SELECT s.*, p.participantfirstname, p.participantlastname, et.eventname
      FROM survey s
      JOIN participant p ON s.participantid = p.participantid
      JOIN eventoccurrence eo ON s.eventoccurrenceid = eo.eventoccurrenceid
      JOIN eventtemplate et ON eo.eventtemplateid = et.eventtemplateid
      ORDER BY s.surveysubmissiondate DESC
      LIMIT 10
    `);
    
    const avgScores = await db.query(`
      SELECT 
        ROUND(AVG(surveysatisfactionscore), 2) as avg_satisfaction,
        ROUND(AVG(surveyusefulnessscore), 2) as avg_usefulness,
        ROUND(AVG(surveyrecommendationscore), 2) as avg_recommendation,
        ROUND(AVG(surveyoverallscore), 2) as avg_overall
      FROM survey
    `);
    
    res.render("dashboard/admin", { 
      title: "Admin Dashboard", 
      currentUser: req.session.user,
      stats: {
        participants: participantCount.rows[0].count,
        events: eventCount.rows[0].count,
        surveys: surveyCount.rows[0].count,
        donationTotal: donationTotal.rows[0].total
      },
      recentSurveys: recentSurveys.rows,
      avgScores: avgScores.rows[0]
    });
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to load dashboard");
    res.redirect("/");
  }
});

// GET /dashboard/user - common user dashboard
router.get("/user", requireLogin, async (req, res) => {
  if (req.session.user.role === "Manager") {
    return res.redirect("/dashboard/admin");
  }
  
  try {
    const participantCount = await db.query("SELECT COUNT(*) FROM participant");
    const eventCount = await db.query("SELECT COUNT(*) FROM eventoccurrence");
    
    const upcomingEvents = await db.query(`
      SELECT eo.*, et.eventname, et.eventtype
      FROM eventoccurrence eo
      JOIN eventtemplate et ON eo.eventtemplateid = et.eventtemplateid
      WHERE eo.eventdatetimestart > NOW()
      ORDER BY eo.eventdatetimestart ASC
      LIMIT 5
    `);
    
    res.render("dashboard/user", { 
      title: "Dashboard", 
      currentUser: req.session.user,
      stats: {
        participants: participantCount.rows[0].count,
        events: eventCount.rows[0].count
      },
      upcomingEvents: upcomingEvents.rows
    });
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to load dashboard");
    res.redirect("/");
  }
});

module.exports = router;
