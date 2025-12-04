const db = require("../db");

async function getImpactPage(req, res) {
  // Avg satisfaction
  const satisfactionResult = await db.query(
    `SELECT ROUND(AVG(surveysatisfactionscore), 1) AS avg
     FROM survey`
  );
  const avgSatisfaction = satisfactionResult.rows[0].avg || 0;

  // Avg recommendation
  const recommendResult = await db.query(
    `SELECT ROUND(AVG(surveyrecommendationscore), 1) AS avg
     FROM survey`
  );
  const avgRecommend = recommendResult.rows[0].avg || 0;

  // Total milestones completed
  const milestoneResult = await db.query(
    `SELECT COUNT(*) AS count FROM milestone`
  );
  const totalMilestones = milestoneResult.rows[0].count || 0;

  // Total donations $ amount
  const donationResult = await db.query(
    `SELECT COALESCE(SUM(donationamount), 0) AS total FROM donation`
  );
  const totalDonations = Number(donationResult.rows[0].total).toFixed(2);

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
