const db = require("../db/knex");

async function getImpactPage(req, res) {
  // satisfaction metric
  const avgSatisfactionRow = await db("survey")
    .avg("surveysatisfactionscore as avg")
    .first();

  // recommendation metric
  const avgRecommendRow = await db("survey")
    .avg("surveyrecommendationscore as avg")
    .first();

  // milestones
  const totalMilestonesRow = await db("milestone")
    .count("milestoneid as count")
    .first();

  // donations
  const totalDonationsRow = await db("donation")
    .sum("donationamount as total")
    .first();

  const avgSatisfaction = Number(avgSatisfactionRow.avg || 0).toFixed(1);
  const avgRecommend = Number(avgRecommendRow.avg || 0).toFixed(1);
  const totalMilestones = totalMilestonesRow.count || 0;
  const totalDonations = Number(totalDonationsRow.total || 0).toFixed(2);

  res.render("impact/index", {
    title: "Impact",
    metrics: {
      avgSatisfaction,
      avgRecommend,
      totalMilestones,
      totalDonations
    }
  });
}

module.exports = {
  getImpactPage
};