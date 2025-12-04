const db = require("../db");

/* ---------------------------------------------------------
   GET /surveys — list all submitted surveys
--------------------------------------------------------- */
async function listSurveys(req, res) {
  const result = await db.query(
    `
    SELECT 
      s.surveyid,
      s.participantid,
      s.eventoccurrenceid,
      s.surveysatisfactionscore,
      s.surveyusefulnessscore,
      s.surveyrecommendationscore,
      s.surveyoverallscore,
      s.surveycomments,
      s.surveysubmissiondate,

      p.participantfirstname,
      p.participantlastname,

      et.eventname,
      eo.eventdatetimestart

    FROM survey s
    JOIN participant p ON s.participantid = p.participantid
    JOIN eventoccurrence eo ON s.eventoccurrenceid = eo.eventoccurrenceid
    JOIN eventtemplate et ON eo.eventtemplateid = et.eventtemplateid
    ORDER BY s.surveysubmissiondate DESC;
    `
  );

  res.render("surveys/index", {
    title: "Surveys",
    surveys: result.rows
  });
}

/* ---------------------------------------------------------
   GET /surveys/new — render new survey form
--------------------------------------------------------- */
async function getNewSurvey(req, res) {
  const participants = await db.query(`
    SELECT participantid, participantfirstname, participantlastname
    FROM participant
    ORDER BY participantlastname, participantfirstname
  `);

  const events = await db.query(`
    SELECT eo.eventoccurrenceid,
           et.eventname,
           eo.eventdatetimestart
    FROM eventoccurrence eo
    JOIN eventtemplate et ON eo.eventtemplateid = et.eventtemplateid
    ORDER BY eo.eventdatetimestart DESC
  `);

  res.render("surveys/new", {
    title: "New Survey",
    participants: participants.rows,
    events: events.rows
  });
}

/* ---------------------------------------------------------
   POST /surveys — create survey
--------------------------------------------------------- */
async function createSurvey(req, res) {
  const {
    participantid,
    eventoccurrenceid,
    surveysatisfactionscore,
    surveyusefulnessscore,
    surveyrecommendationscore,
    surveyoverallscore,
    surveycomments
  } = req.body;

  await db.query(
    `
    INSERT INTO survey 
      (participantid, eventoccurrenceid, 
       surveysatisfactionscore, surveyusefulnessscore, 
       surveyrecommendationscore, surveyoverallscore, surveycomments,
       surveysubmissiondate)
    VALUES ($1,$2,$3,$4,$5,$6,$7, NOW())
    `,
    [
      participantid,
      eventoccurrenceid,
      surveysatisfactionscore || null,
      surveyusefulnessscore || null,
      surveyrecommendationscore || null,
      surveyoverallscore || null,
      surveycomments || null
    ]
  );

  req.flash("success", "Survey submitted.");
  res.redirect("/surveys");
}

module.exports = {
  listSurveys,
  getNewSurvey,
  createSurvey
};
