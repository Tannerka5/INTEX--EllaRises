const db = require("../db");

// GET /donations — list all donations
async function listDonations(req, res) {
  const result = await db.query(
    `SELECT d.donationid, d.donationamount, d.donationdate,
            p.participantfirstname || ' ' || p.participantlastname AS donorname
     FROM donation d
     JOIN participant p ON p.participantid = d.participantid
     ORDER BY d.donationdate DESC`
  );

  res.render("donations/index", {
    title: "Donations",
    donations: result.rows
  });
}

// GET /donations/new — form
function getNewDonation(req, res) {
  res.render("donations/new", { title: "Record Donation" });
}

// POST /donations — create donation
async function createDonation(req, res) {
  const { participantid, donationamount } = req.body;

  await db.query(
    `INSERT INTO donation (participantid, donationdate, donationamount)
     VALUES ($1, CURRENT_DATE, $2)`,
    [participantid, donationamount]
  );

  req.flash("success", "Donation recorded.");
  res.redirect("/donations");
}

module.exports = {
  listDonations,
  getNewDonation,
  createDonation
};
