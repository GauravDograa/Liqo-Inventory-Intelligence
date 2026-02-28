const fs = require("fs");

const transactions = require("./data/transactions.json");

const reduced = transactions.slice(0, 1800);

fs.writeFileSync(
  "./data/transactions.json",
  JSON.stringify(reduced, null, 2)
);

console.log("Reduced to:", reduced.length);
