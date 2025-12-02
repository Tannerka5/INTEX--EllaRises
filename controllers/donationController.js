const db = require("../db/knex");

async function listDonations(req, res) {
  const donations = await db("donations").select().orderBy("created_at", "desc");
  res.render("donations/index", { title: "Donations", donations });
}

function getNewDonation(req, res) {
  res.render("donations/new", { title: "Record Donation" });
}

async function createDonation(req, res) {
  const { donor_name, donor_email, amount, notes } = req.body;
  await db("donations").insert({
    donor_name,
    donor_email,
    amount,
    notes
  });
  req.flash("success", "Donation recorded.");
  res.redirect("/donations");
}

module.exports = {
  listDonations,
  getNewDonation,
  createDonation
};
