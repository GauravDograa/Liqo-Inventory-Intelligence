require("dotenv").config()

const express = require("express")
const cors = require("cors")

const app = express()

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
)

app.use(express.json())
app.get("/api/test", (req, res) => {
  res.json({ ok: true });
});
 // Routes
// app.use("/api/stores", require("./routes/store.routes"))
// app.use("/api/category", require("./routes/category.routes"))
// app.use("/api/deadstock", require("./routes/deadstock.routes"))
// app.use("/api/recommendations", require("./routes/recommendation.routes"))
// app.use("/api/dashboard", require("./routes/dashboard.routes"))
// app.use("/api/insights", require("./routes/insight.routes"))  // ✅ FIXED
// app.use("/api/simulation", require("./routes/simulation.routes"))
console.log("Mounting v2 store route...");

app.use("/api/v2/dashboard", require("./src/modules/dashboard/dashboard.routes"));
app.use("/api/v2/transactions", require("./src/modules/transaction/transaction.routes"));
app.use("/api/v2/inventory", require("./src/modules/inventory/inventory.routes"));
app.use(
  "/api/v2/store-performance",
  require("./src/modules/storePerformance/storePerformance.routes")
);
app.use("/api/v2/stores", require("./src/modules/store/store.routes"));
app.use("/api/v2/categories", require("./src/modules/category/category.routes"));
app.use("/api/v2/deadstock", require("./src/modules/deadstock/deadstock.routes"));
app.use("/api/v2/dashboard", require("./src/modules/dashboard/dashboard.routes"));
app.use(
  "/api/v2/insights",
  require("./src/modules/insights/insights.routes")
);
app.use(
  "/api/v2/recommendations",
  require("./src/modules/recommendation/recommendation.routes")
);
app.use(
  "/api/v2/velocity",
  require("./src/modules/velocity/velocity.routes")
);
app.use("/api/v2/simulation", require("./src/modules/simulation/simulation.routes"));
app.use("/api/v2/sku", require("./src/modules/sku/sku.routes"));


// Health Check
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK" })
})

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("ERROR:", err);  // 👈 full error

  res.status(500).json({
    success: false,
    message: err.message,  // 👈 show actual error
  });
});


const PORT = 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
