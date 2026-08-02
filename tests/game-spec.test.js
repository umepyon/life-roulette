const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const online = fs.readFileSync(path.join(root, "online.js"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

const resetBlock = app.match(/function resetPlayerToStart\(player\) \{([\s\S]*?)\n\}/)?.[1] || "";
const goalBonusBlock = app.match(/function rollGoalBonus\(\) \{([\s\S]*?)\n\}/)?.[1] || "";
for (const field of ["player.salary = 30000", "player.job =", "player.career = null", "player.partner = false", "player.children = 0", "player.familyMilestones = []", "player.routes = {}"]) {
  assert.match(resetBlock, new RegExp(field.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `reset must clear ${field}`);
}

assert.match(app, /const CPU_SPEEDS = \{[\s\S]*?standard:[\s\S]*?fast:[\s\S]*?instant:/, "CPU speed presets must exist");
assert.match(goalBonusBlock, /cpuTiming\("result", 520, bonus\.playerId\)/, "goal bonus timing must use the pending player's id");
assert.match(app, /gift\.payments\.push\(/, "gift payments must be collected for the summary");
assert.match(app, /const CAREER_OPTIONS = Object\.freeze\(\[/, "career branch must expose occupation cards");
for (const title of ["スポーツ選手", "研究者", "IT起業", "動画配信者"]) {
  assert.match(app, new RegExp(title), `${title} career card must exist`);
}
assert.match(app, /pending\.type === "career"/, "career card selection must be a separate choice state");
assert.match(app, /careerSelection: true/, "the pro branch must open career cards");
assert.match(online, /data-online-start/, "online waiting room must expose a host start action");
assert.match(online, /session\.started && session\.localPlayerId === playerId/, "online controls must stay disabled before start");
assert.match(online, /canStartGame:\s*\(\) => session\.connected && session\.role === "host"/, "only an online host may start human multiplayer");
assert.match(app, /state\.playerCount > 1 && !onlineHostCanStart/, "human multiplayer must be blocked outside an online host room");
assert.match(html, /id="mobile-help-button"/, "mobile menu must include help");
assert.match(html, /id="gift-summary"/, "gift modal must include a payment summary");
assert.match(html, /id="local-mode-notice"/, "local multiplayer restriction must be explained in setup");

console.log("game-spec: reset, CPU speed, online waiting, help, and gift summary checks passed");
