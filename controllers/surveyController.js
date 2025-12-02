const db = require("../db/knex");

async function listSurveys(req, res) {
  const surveys = await db("surveys as s")
    .leftJoin("participants as p", "s.participant_id", "p.id")
    .leftJoin("events as e", "s.event_id", "e.id")
    .select(
      "s.*",
      "p.first_name",
      "p.last_name",
      "e.name as event_name",
      "e.event_date"
    )
    .orderBy("s.created_at", "desc");
  res.render("surveys/index", { title: "Surveys", surveys });
}

async function getNewSurvey(req, res) {
  const participants = await db("participants").select().orderBy("last_name");
  const events = await db("events").select().orderBy("event_date", "desc");
  res.render("surveys/new", {
    title: "New Survey",
    participants,
    events
  });
}

async function createSurvey(req, res) {
  const {
    participant_id,
    event_id,
    satisfaction,
    usefulness,
    recommendation_score,
    comments
  } = req.body;
  await db("surveys").insert({
    participant_id,
    event_id,
    satisfaction,
    usefulness,
    recommendation_score,
    comments
  });
  req.flash("success", "Survey submitted.");
  res.redirect("/surveys");
}

module.exports = {
  listSurveys,
  getNewSurvey,
  createSurvey
};
