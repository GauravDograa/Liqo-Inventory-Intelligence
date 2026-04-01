const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

async function main() {
  const outputPath =
    process.argv[2] ||
    path.resolve(
      __dirname,
      "../../ml-forecast-service/training_dataset.json"
    );
  const organizationId =
    process.argv[3] ||
    process.env.DEFAULT_ORGANIZATION_ID ||
    "default-org-001";
  const historyWindowDays = Number(process.argv[4] || 180);
  const horizonDays = Number(process.argv[5] || 30);
  const stepDays = Number(process.argv[6] || 30);

  const service = require("../dist/modules/mlForecast/mlForecast.service.js");
  const dataset = await service.getTrainingDataset({
    organizationId,
    historyWindowDays,
    horizonDays,
    stepDays,
  });

  const enriched = {
    ...dataset,
    metadata: {
      ...dataset.metadata,
      generatedAt: new Date().toISOString(),
      outputPath,
    },
  };

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(enriched, null, 2));

  console.log(
    JSON.stringify(
      {
        outputPath,
        rowCount: enriched.metadata.rowCount,
        historyWindowDays,
        horizonDays,
        stepDays,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
