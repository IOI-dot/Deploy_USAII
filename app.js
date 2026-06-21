import { getExecutionPlan } from './api.js';

const examples = [
  "I want to build an app that helps college students find study partners based on their courses and availability.",
  "I want to launch an AI tutoring startup that helps high school students prep for exams with personalized practice.",
  "I want to start a project at my university that rescues leftover cafeteria food and gives it to students who need it.",
  "I want to build a freelance design portfolio and land my first three paying clients within 2 months."
];

window.fillExample = (i) => {
  document.getElementById("idea-input").value = examples[i];
};

const BLOCKED_KEYWORDS = [
  "cocaine","heroin","meth","drug","weed","marijuana","fentanyl",
  "weapon","gun","bomb","kill","murder","hack","exploit",
  "porn","sex","naked","nude","rape","steal"
];

window.startPlan = async () => {
  const idea = document.getElementById("idea-input").value.trim();
  if (!idea) return;
  const lower = idea.toLowerCase();
  const blocked = BLOCKED_KEYWORDS.some(w => lower.includes(w));
  if (blocked) {
    alert("Mapstone is designed for project and startup ideas. Please describe a genuine idea you want to build.");
    return;
  }
  goPhase(3);
  show("p3-loading");
  hide("p3-content");
  try {
    const plan = await getExecutionPlan(idea);
    renderPlan(plan);
    hide("p3-loading");
    show("p3-content");
  } catch (e) {
    document.getElementById("p3-loading").innerHTML = `
      <div style="text-align:center;padding:2rem 0;">
        <p style="color:#C2692A;font-size:14px;margin-bottom:1.2rem;">
          Something went wrong. Please try again.
        </p>
        <button class="btn-ghost" onclick="goBack()">← Try a different idea</button>
      </div>`;
  }
};

window.goBack = () => goPhase(1);

function renderPlan(plan) {
  // Summary bar
  document.getElementById("summary-type").textContent =
    "Type: " + capitalize(plan.projectType || "Startup");
  document.getElementById("summary-path").textContent =
    "Recommended: " + capitalize(plan.recommendedPath || "Balanced");
  document.getElementById("summary-confidence").textContent =
    plan.firstStepTime || "Confidence: —";

  // Clarified idea
  document.getElementById("clarified-idea").textContent = plan.clarifiedIdea;

  // Assumptions
  document.getElementById("assumptions-list").innerHTML =
    plan.assumptions.map(a =>
      `<div class="assumption">${a}</div>`
    ).join("");

  // Risks — now uses risk-item wrapper for better spacing
  document.getElementById("risks-list").innerHTML = plan.risks.map(r => {
    const cls  = r.level === "high" ? "risk-h" : r.level === "medium" ? "risk-m" : "risk-l";
    const icon = r.level === "high" ? "⚠" : r.level === "medium" ? "●" : "✓";
    return `
      <div class="risk-item">
        <span class="risk-badge ${cls}">${icon} ${r.label}</span>
        <p class="risk-note">${r.note}</p>
      </div>`;
  }).join("");

  // Execution paths
  renderPaths(plan);

  // Milestones
  document.getElementById("milestones-list").innerHTML =
    plan.milestones.map((m, i) => `
      <div class="milestone">
        <div class="m-num">${i + 1}</div>
        <div>
          <div class="m-title">${m.title}<span class="m-time">${m.timeframe}</span></div>
          <div class="m-detail">${m.detail}</div>
        </div>
      </div>`).join("");

  // 30/60/90
  renderDayPlan("plan-30", plan.plan30);
  renderDayPlan("plan-60", plan.plan60);
  renderDayPlan("plan-90", plan.plan90);

  // First step
  document.getElementById("first-step-text").textContent = plan.firstStep;
  document.getElementById("first-step-time").textContent = plan.firstStepTime;
}

function renderPaths(plan) {
  const paths      = plan.executionPaths  || {};
  const recommended = plan.recommendedPath || "balanced";
  const reasoning  = plan.reasoning       || "";
  const tradeoffs  = plan.tradeoffs       || {};

  const pathOrder  = ["conservative", "balanced", "aggressive"];
  const pathLabels = {
    conservative: { speed: "Slow",   cost: "Low",    risk: "Low"    },
    balanced:     { speed: "Medium", cost: "Medium", risk: "Medium" },
    aggressive:   { speed: "Fast",   cost: "High",   risk: "High"   }
  };

  const cards = pathOrder.map(key => {
    const desc  = paths[key] || "";
    const isRec = key === recommended;
    const tags  = pathLabels[key];
    const t     = tradeoffs[key] || {};
    return `
      <div class="path-card ${isRec ? "recommended" : ""}">
        ${isRec ? `<div class="path-rec-badge">Recommended</div>` : ""}
        <div class="path-name">${key}</div>
        <div class="path-desc">${typeof desc === "string" ? desc : desc.description || JSON.stringify(desc)}</div>
        <div class="path-tags">
          <span class="path-tag ${isRec ? "accent" : ""}">Speed: ${t.speed || tags.speed}</span>
          <span class="path-tag ${isRec ? "accent" : ""}">Cost: ${t.cost  || tags.cost}</span>
          <span class="path-tag ${isRec ? "accent" : ""}">Risk: ${t.risk  || tags.risk}</span>
        </div>
      </div>`;
  }).join("");

  document.getElementById("paths-list").innerHTML = `
    <div class="paths-grid">${cards}</div>
    ${reasoning ? `<div class="path-reasoning">${reasoning}</div>` : ""}
  `;
}

function renderDayPlan(id, items) {
  if (!items || items.length === 0) {
    document.getElementById(id).innerHTML =
      `<p style="font-size:13px;color:#AAAAAA;padding:8px 0;">No items for this period.</p>`;
    return;
  }
  document.getElementById(id).innerHTML =
    items.map(item => `<div class="plan-item">${item}</div>`).join("");
}

window.showPlan = (period) => {
  ["30","60","90"].forEach((p, i) => {
    document.getElementById(`plan-${p}`).classList.add("hidden");
    const tabs = document.querySelectorAll(".plan-tab");
    if (tabs[i]) {
      if (p === period) tabs[i].classList.add("active");
      else tabs[i].classList.remove("active");
    }
  });
  document.getElementById(`plan-${period}`).classList.remove("hidden");
};

window.reset = () => {
  document.getElementById("idea-input").value = "";
  goPhase(1);
};

function goPhase(n) {
  [1,3].forEach(i => {
    document.getElementById(`phase-${i}`).classList.add("hidden");
    const t = document.getElementById(`tab-${i}`);
    t.classList.remove("active","done");
    if (i < n) t.classList.add("done");
  });
  document.getElementById(`phase-${n}`).classList.remove("hidden");
  document.getElementById(`tab-${n}`).classList.add("active");
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function show(id) { document.getElementById(id).classList.remove("hidden"); }
function hide(id) { document.getElementById(id).classList.add("hidden"); }