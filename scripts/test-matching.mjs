import { scoreProgrammes, matchesCountry } from "../lib/matching.js";
import { PROGRAMME_CATALOGUE } from "../lib/universities.js";

console.log("=== Testing UK Strict Country Filter ===");

const ukProfile = {
  field: "Computer Science",
  degree: "Master's",
  countries: ["United Kingdom"],
  budgetUSD: 50000,
  intakeTerm: "Fall 2026",
  gpaPercent: 85,
  ielts: 7.5,
};

const results = scoreProgrammes(ukProfile, PROGRAMME_CATALOGUE);

console.log(`Results count: ${results.length}`);
results.forEach((r, idx) => {
  console.log(`${idx + 1}. [${r.country}] ${r.name} - ${r.program} (Score: ${r.score}%)`);
});

const nonUkResults = results.filter((r) => r.country !== "United Kingdom");
if (nonUkResults.length === 0) {
  console.log("✓ SUCCESS: 100% of returned universities are exclusively from the United Kingdom!");
} else {
  console.error("✗ FAILURE: Found non-UK universities in result:", nonUkResults.map(r => r.name));
}
