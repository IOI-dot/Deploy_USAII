import { getClarifyingQuestions, getExecutionPlan } from './api.js';

const examples = [
  "I want to build an app that helps college students find study partners based on their courses and availability.",
  "I want to launch an AI tutoring startup that helps high school students prep for exams with personalized practice.",
  "I want to start a project at my university that rescues leftover cafeteria food and gives it to students who need it.",
  "I want to build a freelance design portfolio and land my first three paying clients within 2 months."
];

let currentIdea = "";
let phaseQuestions = [];

// ---- Navigation ----
function goPhase(n) {
  [1, 2, 3].forEach(i => {
    document.getElementById(`phase-${i}`).classList.add("hidden");
    const tab = document.getElementById(`tab-${i}`);
    tab.classList.remove("active", "done");
    if (i < n) tab.classList.add("done");
  });
  document.getElementById(`phase-${n}`).classList.remove("hidden");
  document.getElementById(`tab-${n}`).classList.add("active");
}
window.goPhase = goPhase;

// ---- Examples ----
window.fillExample = (i) => {
  document.getElementById("idea-input").value = examples[i];
};

// ---- Phase 1 → 2 ----
window.startClarify = async () => {
  const idea = document.getElementById("idea-input").value.trim();
  if (!idea) return;
  currentIdea = idea;
  goPhase(2);
  show("p2-loading"); hide("p2-content");

  try {
    const questions = await getClarifyingQuestions(idea);
    phaseQuestions = questions;
    const list = document.getElementById("questions-list");
    list.innerHTML = questions.map(q => `
      <div class="q-block">
        <p>${q.question}</p>
        <input type="text" data-qid="${q.id}" placeholder="Your answer..." />
      </div>`).join("");
    hide("p2-loading"); show("p2-content");
  } catch (e) {
    document.getElementById("p2-loading").innerHTML =
      `<p style="color:#F87171;font-size:14px;">Failed to load questions. Check your connection.</p>`;
  }
};

// ---- Phase 2 → 3 ----
window.buildPlan = async () => {
  const inputs = document.querySelectorAll("#questions-list input");
  const answers = Array.from(inputs).map(inp => inp.value || "(not answered)");
  goPhase(3);
  show("p3-loading"); hide("p3-content");

  try {
    const plan = await getExecutionPlan(currentIdea, answers);
    renderPlan(plan);
    hide("p3-loading"); show("p3-content");
  } catch (e) {
    document.getElementById("p3-loading").innerHTML =
      `<p style="color:#F87171;font-size:14px;">Failed to build plan. Please try again.</p>`;
  }
};

// ---- Render plan ----
function renderPlan(plan) {
  document.getElementById("clarified-idea").textContent = plan.clarifiedIdea;

  document.getElementById("assumptions-list").innerHTML =
    plan.assumptions.map(a => `<div class="assumption">${a}</div>`).join("");

  document.getElementById("risks-list").innerHTML = plan.risks.map(r => {
    const cls = r.level === "high" ? "risk-h" : r.level === "medium" ? "risk-m" : "risk-l";
    const icon = r.level === "high" ? "⚠" : r.level === "medium" ? "●" : "✓";
    return `<span class="risk-badge ${cls}">${icon} ${r.label}</span>
            <p class="risk-note">${r.note}</p>`;
  }).join("");

  document.getElementById("milestones-list").innerHTML = plan.milestones.map((m, i) => `
    <div class="milestone">
      <div class="m-num">${i + 1}</div>
      <div>
        <div class="m-title">${m.title} <span class="m-time">${m.timeframe}</span></div>
        <div class="m-detail">${m.detail}</div>
      </div>
    </div>`).join("");

  document.getElementById("first-step-text").textContent = plan.firstStep;
  document.getElementById("first-step-time").textContent = plan.firstStepTime;
}

// ---- Reset ----
window.reset = () => {
  document.getElementById("idea-input").value = "";
  phaseQuestions = [];
  currentIdea = "";
  goPhase(1);
};

// ---- Helpers ----
function show(id) { document.getElementById(id).classList.remove("hidden"); }
function hide(id) { document.getElementById(id).classList.add("hidden"); }