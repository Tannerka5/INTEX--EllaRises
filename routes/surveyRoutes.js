const express = require("express");
const router = express.Router();
const db = require("../db");
const { requireLogin, requireManager } = require("../middleware/authMiddleware");

// GET /surveys - list all
router.get("/", requireLogin, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT s.*, p.participantfirstname, p.participantlastname, et.eventname
      FROM survey s
      JOIN participant p ON s.participantid = p.participantid
      JOIN eventoccurrence eo ON s.eventoccurrenceid = eo.eventoccurrenceid
      JOIN eventtemplate et ON eo.eventtemplateid = et.eventtemplateid
      ORDER BY s.surveysubmissiondate DESC
    `);
    res.render("surveys/index", { 
      title: "Surveys", 
      surveys: result.rows,
      currentUser: req.session.user,
      success: req.flash("success"),
      error: req.flash("error")
    });
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to load surveys");
    res.redirect("/");
  }
});

// GET /surveys/new - show create form
router.get("/new", requireManager, async (req, res) => {
  try {
    const participants = await db.query("SELECT participantid, participantfirstname, participantlastname FROM participant ORDER BY participantlastname");
    const events = await db.query(`
      SELECT eo.eventoccurrenceid, et.eventname, eo.eventdatetimestart
      FROM eventoccurrence eo
      JOIN eventtemplate et ON eo.eventtemplateid = et.eventtemplateid
      ORDER BY eo.eventdatetimestart DESC
    `);
    
    res.render("surveys/new", { 
      title: "Add Survey", 
      participants: participants.rows,
      events: events.rows,
      currentUser: req.session.user,
      error: req.flash("error")
    });
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to load form");
    res.redirect("/surveys");
  }
});

// POST /surveys - create
router.post("/", requireManager, async (req, res) => {
  const { 
    participantid, eventoccurrenceid, surveysatisfactionscore, surveyusefulnessscore,
    surveyinstructorscore, surveyrecommendationscore, surveyoverallscore,
    surveynpsbucket, surveycomments 
  } = req.body;
  
  try {
    await db.query(
      `INSERT INTO survey (
        participantid, eventoccurrenceid, surveysatisfactionscore, surveyusefulnessscore,
        surveyinstructorscore, surveyrecommendationscore, surveyoverallscore,
        surveynpsbucket, surveycomments, surveysubmissiondate
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
      [participantid, eventoccurrenceid, surveysatisfactionscore || null, surveyusefulnessscore || null,
       surveyinstructorscore || null, surveyrecommendationscore || null, surveyoverallscore || null,
       surveynpsbucket, surveycomments]
    );
    req.flash("success", "Survey created successfully");
    res.redirect("/surveys");
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to create survey");
    res.redirect("/surveys/new");
  }
});

// GET /surveys/:id - show single survey
router.get("/:id", requireLogin, async (req, res) => {
  try {
    const survey = await db.query(`
      SELECT s.*, p.participantfirstname, p.participantlastname, p.participantemail,
             et.eventname, eo.eventdatetimestart, eo.eventlocation
      FROM survey s
      JOIN participant p ON s.participantid = p.participantid
      JOIN eventoccurrence eo ON s.eventoccurrenceid = eo.eventoccurrenceid
      JOIN eventtemplate et ON eo.eventtemplateid = et.eventtemplateid
      WHERE s.surveyid = $1
    `, [req.params.id]);
    
    if (survey.rows.length === 0) {
      req.flash("error", "Survey not found");
      return res.redirect("/surveys");
    }
    
    res.render("surveys/show", { 
      title: "Survey Details",
      survey: survey.rows[0],
      currentUser: req.session.user
    });
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to load survey");
    res.redirect("/surveys");
  }
});

// GET /surveys/:id/edit - show edit form
router.get("/:id/edit", requireManager, async (req, res) => {
  try {
    const survey = await db.query("SELECT * FROM survey WHERE surveyid = $1", [req.params.id]);
    if (survey.rows.length === 0) {
      req.flash("error", "Survey not found");
      return res.redirect("/surveys");
    }
    
    const participants = await db.query("SELECT participantid, participantfirstname, participantlastname FROM participant ORDER BY participantlastname");
    const events = await db.query(`
      SELECT eo.eventoccurrenceid, et.eventname, eo.eventdatetimestart
      FROM eventoccurrence eo
      JOIN eventtemplate et ON eo.eventtemplateid = et.eventtemplateid
      ORDER BY eo.eventdatetimestart DESC
    `);
    
    res.render("surveys/edit", { 
      title: "Edit Survey", 
      survey: survey.rows[0],
      participants: participants.rows,
      events: events.rows,
      currentUser: req.session.user,
      error: req.flash("error")
    });
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to load survey");
    res.redirect("/surveys");
  }
});

// PUT /surveys/:id - update
router.put("/:id", requireManager, async (req, res) => {
  const { 
    participantid, eventoccurrenceid, surveysatisfactionscore, surveyusefulnessscore,
    surveyinstructorscore, surveyrecommendationscore, surveyoverallscore,
    surveynpsbucket, surveycomments 
  } = req.body;
  
  try {
    await db.query(
      `UPDATE survey SET 
        participantid = $1, eventoccurrenceid = $2, surveysatisfactionscore = $3,
        surveyusefulnessscore = $4, surveyinstructorscore = $5, surveyrecommendationscore = $6,
        surveyoverallscore = $7, surveynpsbucket = $8, surveycomments = $9
      WHERE surveyid = $10`,
      [participantid, eventoccurrenceid, surveysatisfactionscore || null, surveyusefulnessscore || null,
       surveyinstructorscore || null, surveyrecommendationscore || null, surveyoverallscore || null,
       surveynpsbucket, surveycomments, req.params.id]
    );
    req.flash("success", "Survey updated successfully");
    res.redirect("/surveys/" + req.params.id);
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to update survey");
    res.redirect("/surveys/" + req.params.id + "/edit");
  }
});

// DELETE /surveys/:id - delete
router.delete("/:id", requireManager, async (req, res) => {
  try {
    await db.query("DELETE FROM survey WHERE surveyid = $1", [req.params.id]);
    req.flash("success", "Survey deleted successfully");
    res.redirect("/surveys");
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to delete survey");
    res.redirect("/surveys");
  }
});

module.exports = router;
