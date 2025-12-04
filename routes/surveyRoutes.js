const express = require("express");
const router = express.Router();
const db = require("../db");
const { requireLogin, requireManager } = require("../middleware/authMiddleware");


// ==========================================
// GET /surveys  – Survey Index (grouped by event)
// ==========================================
router.get("/", requireLogin, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        eo.eventoccurrenceid,
        et.eventtemplateid,
        et.eventname,
        ROUND(AVG(s.surveysatisfactionscore)::numeric, 2) AS avg_satisfaction,
        ROUND(AVG(s.surveyusefulnessscore)::numeric, 2) AS avg_usefulness,
        ROUND(AVG(s.surveyinstructorscore)::numeric, 2) AS avg_instructor,
        ROUND(AVG(s.surveyrecommendationscore)::numeric, 2) AS avg_recommendation,
        ROUND(AVG(s.surveyoverallscore)::numeric, 2) AS avg_overall
      FROM survey s
      JOIN eventoccurrence eo ON s.eventoccurrenceid = eo.eventoccurrenceid
      JOIN eventtemplate et ON eo.eventtemplateid = et.eventtemplateid
      GROUP BY eo.eventoccurrenceid, et.eventname, et.eventtemplateid
      ORDER BY et.eventname
    `);

    res.render("surveys/index", {
      title: "Surveys",
      events: result.rows,
      currentUser: req.session.user,
      success: req.flash("success"),
      error: req.flash("error")
    });
  } catch (err) {
    console.error("ERROR loading /surveys:", err);
    req.flash("error", "Failed to load surveys");
    res.redirect("/");
  }
});


// ==========================================
// GET /surveys/event/:id  – Surveys for one event
// ==========================================
router.get("/event/:id", requireLogin, async (req, res) => {
  try {
    // STEP 1 FIX — eventtemplate lookup instead of eventoccurrence lookup
    const eventResult = await db.query(`
    SELECT eventtemplateid, eventname
    FROM eventtemplate
    WHERE eventtemplateid = $1
`,  [req.params.id]);

    if (eventResult.rows.length === 0) {
      req.flash("error", "Event not found");
      return res.redirect("/surveys");
    }

    const surveysResult = await db.query(`
      SELECT
        s.surveyid,
        s.surveyoverallscore,
        s.surveycomments,
        s.surveysubmissiondate,
        p.participantfirstname,
        p.participantlastname
      FROM survey s
      JOIN participant p ON s.participantid = p.participantid
      JOIN eventoccurrence eo ON s.eventoccurrenceid = eo.eventoccurrenceid
      JOIN eventtemplate et ON eo.eventtemplateid = et.eventtemplateid
      WHERE et.eventtemplateid = $1
      ORDER BY s.surveysubmissiondate DESC
    `, [req.params.id]);

    res.render("surveys/event", {
      title: "Event Surveys",
      event: eventResult.rows[0],
      surveys: surveysResult.rows,
      currentUser: req.session.user,
      success: req.flash("success"),
      error: req.flash("error")
    });
  } catch (err) {
    console.error("ERROR loading event surveys:", err);
    req.flash("error", "Failed to load event surveys");
    res.redirect("/surveys");
  }
});


// ==========================================
// GET /surveys/new  – New Survey Form
// ==========================================
router.get("/new", requireLogin, async (req, res) => {
  try {
    const participantsResult = await db.query(`
      SELECT participantid, participantfirstname, participantlastname, participantdob
      FROM participant
      ORDER BY participantlastname, participantfirstname
    `);

    const eventsResult = await db.query(`
      SELECT 
        eo.eventtemplateid, 
        et.eventname, 
        eo.eventdatetimestart
      FROM eventoccurrence eo
      JOIN eventtemplate et ON eo.eventtemplateid = et.eventtemplateid
      ORDER BY eo.eventdatetimestart DESC
    `);

    res.render("surveys/new", {
      title: "New Survey",
      participants: participantsResult.rows,
      events: eventsResult.rows,
      currentUser: req.session.user,
      error: req.flash("error")
    });
  } catch (err) {
    console.error("ERROR loading new survey form:", err);
    req.flash("error", "Failed to load form");
    res.redirect("/surveys");
  }
});


// ==========================================
// POST /surveys  – Submit a Survey
// ==========================================
router.post("/", requireLogin, async (req, res) => {
  try {
    const {
      participantid,
      eventoccurrenceid,
      surveysatisfactionscore,
      surveyusefulnessscore,
      surveyinstructorscore,
      surveyrecommendationscore,
      surveyoverallscore,
      surveynpsbucket,
      surveycomments
    } = req.body;

    await db.query(`
      INSERT INTO survey (
        participantid,
        eventoccurrenceid,
        surveysatisfactionscore,
        surveyusefulnessscore,
        surveyinstructorscore,
        surveyrecommendationscore,
        surveyoverallscore,
        surveynpsbucket,
        surveycomments,
        surveysubmissiondate
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
    `, [
      participantid,
      eventoccurrenceid,
      surveysatisfactionscore,
      surveyusefulnessscore,
      surveyinstructorscore,
      surveyrecommendationscore,
      surveyoverallscore,
      surveynpsbucket,
      surveycomments
    ]);

    req.flash("success", "Survey saved successfully");
    res.redirect("/surveys");

  } catch (err) {
    console.error("ERROR saving survey:", err);
    req.flash("error", "Failed to save survey");
    res.redirect("/surveys/new");
  }
});


// ==========================================
// PUT /surveys/:id – Update survey
// ==========================================
router.put("/:id", requireLogin, requireManager, async (req, res) => {
  try {
    const {
      surveysatisfactionscore,
      surveyusefulnessscore,
      surveyinstructorscore,
      surveyrecommendationscore,
      surveynpsbucket,
      surveycomments
    } = req.body;

    const avgOverall = (
      (Number(surveysatisfactionscore) +
        Number(surveyusefulnessscore) +
        Number(surveyinstructorscore) +
        Number(surveyrecommendationscore)) / 4
    ).toFixed(2);

    await db.query(`
      UPDATE survey SET
        surveysatisfactionscore = $1,
        surveyusefulnessscore = $2,
        surveyinstructorscore = $3,
        surveyrecommendationscore = $4,
        surveyoverallscore = $5,
        surveynpsbucket = $6,
        surveycomments = $7
      WHERE surveyid = $8
    `, [
      surveysatisfactionscore,
      surveyusefulnessscore,
      surveyinstructorscore,
      surveyrecommendationscore,
      avgOverall,
      surveynpsbucket,
      surveycomments,
      req.params.id
    ]);

    req.flash("success", "Survey updated");
    res.redirect(`/surveys/${req.params.id}`);

  } catch (err) {
    console.error("ERROR updating survey:", err);
    req.flash("error", "Failed to update survey");
    res.redirect(`/surveys/${req.params.id}`);
  }
});


// ==========================================
// DELETE /surveys/:id – Delete survey
// ==========================================
router.delete("/:id", requireLogin, requireManager, async (req, res) => {
  try {
    await db.query("DELETE FROM survey WHERE surveyid = $1", [req.params.id]);
    req.flash("success", "Survey deleted");
    res.redirect("/surveys");

  } catch (err) {
    console.error("ERROR deleting survey:", err);
    req.flash("error", "Failed to delete survey");
    res.redirect(`/surveys/${req.params.id}`);
  }
});


// ==========================================
// GET /surveys/:id – View single survey
// ==========================================
router.get("/:id", requireLogin, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        s.*,
        p.participantfirstname,
        p.participantlastname,
        et.eventname
      FROM survey s
      JOIN participant p ON s.participantid = p.participantid
      JOIN eventoccurrence eo ON s.eventoccurrenceid = eo.eventoccurrenceid
      JOIN eventtemplate et ON eo.eventtemplateid = et.eventtemplateid
      WHERE s.surveyid = $1
    `, [req.params.id]);

    if (result.rows.length === 0) {
      req.flash("error", "Survey not found");
      return res.redirect("/surveys");
    }

    res.render("surveys/show", {
      title: "Survey Details",
      survey: result.rows[0],
      currentUser: req.session.user,
      success: req.flash("success"),
      error: req.flash("error")
    });
  } catch (err) {
    console.error("ERROR loading survey details:", err);
    req.flash("error", "Failed to load survey");
    res.redirect("/surveys");
  }
});

module.exports = router;