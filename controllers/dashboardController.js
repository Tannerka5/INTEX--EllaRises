const db = require("../db");

async function adminDashboard(req, res) {
  // participants
  const totalParticipants = Number(
    (await db.query("SELECT COUNT(*) FROM participant")).rows[0].count
  );

  // events
  const totalEvents = Number(
    (await db.query("SELECT COUNT(*) FROM eventoccurrence")).rows[0].count
  );

  // surveys
  const totalSurveys = Number(
    (await db.query("SELECT COUNT(*) FROM survey")).rows[0].count
  );

  // donations
  const donationRow = (await db.query("SELECT COALESCE(SUM(donationamount),0) AS total FROM donation")).rows[0];
  const totalDonations = Number(donationRow.total).toFixed(2);

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

const db = require("../db");

async function userDashboard(req, res) {
  const totalEvents = Number(
    (await db.query("SELECT COUNT(*) FROM eventoccurrence")).rows[0].count
  );

  const totalSurveys = Number(
    (await db.query("SELECT COUNT(*) FROM survey")).rows[0].count
  );

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
