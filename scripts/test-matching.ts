import { scoreProgrammes } from "../lib/matching";
import { PROGRAMME_CATALOGUE } from "../lib/universities";
import { StudentProfile } from "../lib/types";

console.log("=== Testing Matching Logic ===");

const testProfile1: StudentProfile = {
  field: "Computer Science",
  degree: "Master's",
  countries: ["United States", "United Kingdom"],
  budgetUSD: 50000,
  intakeTerm: "Fall 2026",
  gpaPercent: 88,
  ielts: 7.5,
};

const matches1 = scoreProgrammes(testProfile1, PROGRAMME_CATALOGUE);
console.log(`\nTest 1: CS Master's in US/UK (GPA: 88%, IELTS: 7.5)`);
console.log(`Top match: ${matches1[0]?.name} - ${matches1[0]?.program}`);
console.log(`Score: ${matches1[0]?.score}`);
console.log(`Reasons:`, matches1[0]?.reasons);

// Assert top match has high score
if (matches1[0]?.score >= 70) {
  console.log("✓ Test 1 Passed: Strong match scored high");
} else {
  console.error("✗ Test 1 Failed: Expected high score");
}

const testProfile2: StudentProfile = {
  field: "Mechanical Engineering",
  degree: "Master's",
  countries: ["Germany"],
  budgetUSD: 15000,
  intakeTerm: "Winter 2026",
  gpaPercent: 75,
  ielts: 6.5,
};

const matches2 = scoreProgrammes(testProfile2, PROGRAMME_CATALOGUE);
console.log(`\nTest 2: Mechanical Eng Master's in Germany`);
console.log(`Top match: ${matches2[0]?.name} - ${matches2[0]?.program}`);
console.log(`Score: ${matches2[0]?.score}`);
console.log(`Reasons:`, matches2[0]?.reasons);

if (matches2[0]?.country === "Germany") {
  console.log("✓ Test 2 Passed: German university matched top");
} else {
  console.error("✗ Test 2 Failed");
}

console.log("\n=== Matching Logic Tests Complete ===");
