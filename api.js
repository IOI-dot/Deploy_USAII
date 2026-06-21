// ─────────────────────────────────────────────
// FLIP THIS TO true WHEN BACKEND IS READY
const USE_REAL_API = true;
const BACKEND_URL  = "https://launchlensbackend-production.up.railway.app";
// ─────────────────────────────────────────────

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

  return {
    clarifiedIdea:  data.clarified_idea || data.idea_summary,
    assumptions:    data.assumptions || [],
    risks,
    milestones,
    firstStep:      data.first_action,
    firstStepTime: `Confidence: ${data.confidence || "—"}`
  };
}

export async function getExecutionPlan(idea) {
  if (USE_REAL_API) {
    const res = await fetch(`${BACKEND_URL}/api/plan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_input: idea })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Backend error");
    }
    const raw = await res.json();
    return mapToFrontend(raw);
  }

  // ── Placeholder until backend is live ──
  await delay(1800);
  return {
    clarifiedIdea: "A focused tool that helps your target user solve a specific problem — built with the resources you have now.",
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
      { title: "Validate the problem",       timeframe: "Week 1–2", detail: "Talk to 5 real users before building anything." },
      { title: "Build the simplest version", timeframe: "Week 3–4", detail: "One core feature only. Working beats pretty." },
      { title: "Get first 10 users",         timeframe: "Month 2",  detail: "Share with people you know. Collect feedback." },
      { title: "Iterate and stabilize",      timeframe: "Month 3",  detail: "Fix the top 3 problems your early users report." }
    ],
    firstStep: "Write down the name of one real person who has this problem, then message them today asking for 15 minutes to talk.",
    firstStepTime: "Takes 10 minutes"
  };
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }