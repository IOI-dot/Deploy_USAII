const USE_REAL_API = true;
const BACKEND_URL  = "https://launchlensbackend-production.up.railway.app";

function mapToFrontend(data) {
  const risks = (data.risks || []).map(r => ({
    label: r.risk_name,
    level: r.severity?.toLowerCase() === "high" ? "high"
         : r.severity?.toLowerCase() === "medium" ? "medium" : "low",
    note: r.mitigation
  }));

  const milestones = (data.milestones || []).slice(0, 4).map((m, i) => ({
    title: m,
    timeframe: i === 0 ? "Week 1–2" : i === 1 ? "Week 3–4"
             : i === 2 ? "Month 2" : "Month 3",
    detail: ""
  }));

  const rec = data.recommendation || {};

  return {
    clarifiedIdea:   data.clarified_idea || data.idea_summary,
    projectType:     data.project_type   || "startup",
    assumptions:     data.assumptions    || [],
    risks,
    milestones,
    executionPaths:  data.execution_paths || {},
    tradeoffs:       data.tradeoffs       || {},
    recommendedPath: rec.recommended_path || "balanced",
    reasoning:       rec.reasoning        || "",
    plan30:          data.plan_30         || [],
    plan60:          data.plan_60         || [],
    plan90:          data.plan_90         || [],
    firstStep:       data.first_action,
    firstStepTime:  `Confidence: ${data.confidence || "—"}`
  };
}

export async function getClarifyingQuestions(idea) {
  if (USE_REAL_API) {
    const res = await fetch(`${BACKEND_URL}/api/clarify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_input: idea })
    });
    if (!res.ok) throw new Error("Clarify endpoint error");
    return await res.json();   // { questions: [...] }
  }

  await delay(900);
  return {
    questions: [
      { id: "q1", question: "What is your budget for this?",          options: ["None or very limited", "Small budget available", "Funded or flexible"] },
      { id: "q2", question: "How much time can you commit per week?", options: ["Under 5 hours", "5 to 15 hours", "15 or more hours"] },
      { id: "q3", question: "What is your technical background?",     options: ["Non-technical", "Some experience", "Developer"] },
      { id: "q4", question: "What is your target timeline?",          options: ["Under a month", "1 to 3 months", "3 to 6 months", "Flexible"] }
    ]
  };
}

export async function getExecutionPlan(idea, context = {}) {
  if (USE_REAL_API) {
    const res = await fetch(`${BACKEND_URL}/api/plan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_input: idea, context })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Backend error");
    }
    const raw = await res.json();
    return mapToFrontend(raw);
  }

  await delay(1800000);
  return {
    clarifiedIdea: "A focused tool that helps your target user solve a specific problem.",
    projectType: "university project",
    assumptions: [
      "Users have the problem you think they have",
      "You can build the core feature",
      "People will use it regularly"
    ],
    risks: [
      { label: "No real demand",   level: "high",   note: "Needs user validation before building" },
      { label: "Scope creep",      level: "medium", note: "Stay focused on the core feature only" },
      { label: "Time constraints", level: "medium", note: "Set strict weekly deadlines" }
    ],
    executionPaths: {
      conservative: "Build slowly, validate every step, minimal cost.",
      balanced:     "Move steadily, test with real users at each milestone.",
      aggressive:   "Ship fast, iterate based on live feedback."
    },
    tradeoffs: {
      conservative: { speed: "Slow",   cost: "Low",    risk: "Low"    },
      balanced:     { speed: "Medium", cost: "Medium", risk: "Medium" },
      aggressive:   { speed: "Fast",   cost: "High",   risk: "High"   }
    },
    recommendedPath: "balanced",
    reasoning: "The balanced path gives you enough speed to hit deadlines while reducing the risk of building the wrong thing.",
    milestones: [
      { title: "Validate the problem",       timeframe: "Week 1–2", detail: "Talk to 5 real users before building anything." },
      { title: "Build the simplest version", timeframe: "Week 3–4", detail: "One core feature only. Working beats pretty." },
      { title: "Get first 10 users",         timeframe: "Month 2",  detail: "Share with people you know. Collect feedback." },
      { title: "Iterate and stabilize",      timeframe: "Month 3",  detail: "Fix the top 3 problems your early users report." }
    ],
    plan30: ["Define core user persona", "Conduct 5 user interviews", "Sketch wireframes", "Set up dev environment"],
    plan60: ["Build MVP feature", "Launch to 10 beta users", "Collect structured feedback", "Fix critical bugs"],
    plan90: ["Iterate on feedback", "Expand to 50 users", "Add second core feature", "Prepare public launch"],
    firstStep: "Message one real person who has this problem today and ask for 15 minutes of their time.",
    firstStepTime: "Confidence: 80%"
  };
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }