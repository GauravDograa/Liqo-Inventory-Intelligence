const express = require("express")
const OpenAI = require("openai")

const { getStorePerformance } = require("../services/store.service")
const { getDeadStockAnalytics } = require("../services/deadstock.service")
const { getTransferRecommendations } = require("../services/recommendation.service")
const { simulateImpact } = require("../services/simulation.service")

const router = express.Router()

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

router.post("/generate", async (req, res) => {
  try {

    // 🔹 Correct service calls
    const storesResult = getStorePerformance()
    const deadstockResult = getDeadStockAnalytics()
    const recommendationResult = getTransferRecommendations()
    const simulationResult = simulateImpact()

    // 🔹 Extract data safely
    const stores = storesResult?.data || []
    const deadstock = deadstockResult?.data || {}
    const recommendations = recommendationResult?.data || {}
    const simulation = simulationResult?.data || {}

    const totalRevenue = Array.isArray(stores)
      ? stores.reduce((sum, s) => sum + (s.totalRevenue || 0), 0)
      : 0

    const prompt = `
You are an enterprise inventory intelligence AI.

Total revenue: ${totalRevenue}
Dead stock percent: ${deadstock.deadStockPercent || 0}
Worst category: ${deadstock.deadStockByCategory?.[0]?.category || "N/A"}
Worst store: ${deadstock.deadStockByStore?.[0]?.storeName || "N/A"}

Total recommendations: ${recommendations.summary?.totalRecommendations || 0}
Projected improvement: ${simulation.improvement || 0}%

Generate:
1. Executive summary
2. Risk alerts
3. Strategic actions
4. Financial outlook

Keep tone executive and concise.
`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    })

    const output = completion.choices[0].message.content

    res.json({
      success: true,
      data: output,
    })

  } catch (error) {
    console.error("AI Error:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
})

module.exports = router
