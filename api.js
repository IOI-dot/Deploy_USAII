// ============================================
// api.js — AI placeholder
// When backend is ready, set BACKEND_URL and
// flip USE_REAL_API to true. Nothing else changes.
// ============================================

const USE_REAL_API = false;
const BACKEND_URL = "https://your-backend-url.com"; // they give you this later

// ---- Clarifying questions ----
export async function getClarifyingQuestions(idea) {
  if (USE_REAL_API) {
    const res = await fetch(`${BACKEND_URL}/api/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idea })
    });
    return res.json();
  }

  // Placeholder — fake delay + dummy data
  await delay(1200);
  return [
    { id: "q1", question: "Who is the main person this idea helps, and what problem does it solve for them?" },
    { id: "q2", question: "What resources do you currently have — time, money, skills, or people?" },
    { id: "q3", question: "What does success look like for you in 3 months?" }
  ];
}

// ---- Execution plan ----
export async function getExecutionPlan(idea, answers) {
  if (USE_REAL_API) {
    const res = await fetch(`${BACKEND_URL}/api/plan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idea, answers })
    });
    return res.json();
  }

  // Placeholder — fake delay + dummy data
  await delay(1800);
  return {
    clarifiedIdea: `A focused tool that helps your target user solve a specific problem — built with the resources you have now and designed to reach a working prototype within 3 months.`,
    assumptions: [
      "Users have the problem you think they have — needs validation with real people",
      "You can build or find someone to build the core feature",
      "People will use it regularly once they discover it"
    ],
    risks: [
      { label: "No real demand",   level: "high",   note: "Idea not validated with actual users yet" },
      { label: "Scope creep",      level: "medium", note: "Easy to keep adding features and delay launch" },
      { label: "Time constraints", level: "medium", note: "Competing priorities could slow progress" }
    ],
    milestones: [
      { title: "Validate the problem",      timeframe: "Week 1–2", detail: "Talk to 5 real users. Confirm the pain point exists before building anything." },
      { title: "Build the simplest version", timeframe: "Week 3–4", detail: "One core feature only. It should work, not be pretty." },
      { title: "Get first 10 users",         timeframe: "Month 2",  detail: "Share with people you know. Collect feedback, not compliments." },
      { title: "Iterate and stabilize",      timeframe: "Month 3",  detail: "Fix the top 3 problems your early users report. Prepare for wider launch." }
    ],
    firstStep: "Write down the name of one real person who has this problem, then message them today asking for 15 minutes to talk about it.",
    firstStepTime: "Takes 10 minutes"
  };
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}