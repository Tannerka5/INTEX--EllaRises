const db = require("../db/knex");

async function adminDashboard(req, res) {
  // participants
  const totalParticipants =
    (await db("participant").count("participantid as count").first()).count || 0;

  // events (count event occurrences, not templates)
  const totalEvents =
    (await db("eventoccurrence").count("eventoccurrenceid as count").first()).count || 0;

  // surveys
  const totalSurveys =
    (await db("survey").count("surveyid as count").first()).count || 0;

  // donations
  const totalDonations =
    Number(
      (await db("donation").sum("donationamount as total").first()).total || 0
    ).toFixed(2);

  res.render("dashboard/admin", {
    title: "Admin Dashboard",
    stats: {
      totalParticipants,
      totalEvents,
      totalSurveys,
      totalDonations
    }
  });
}

async function userDashboard(req, res) {
  const totalEvents =
    (await db("eventoccurrence").count("eventoccurrenceid as count").first()).count || 0;

  const totalSurveys =
    (await db("survey").count("surveyid as count").first()).count || 0;

  res.render("dashboard/user", {
    title: "User Dashboard",
    stats: {
      totalEvents,
      totalSurveys
    }
  });
}

module.exports = {
  adminDashboard,
  userDashboard
};